import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import {
  calculateGranularAssessmentScores,
  convertScoreToProficiency,
  generateSkillRoadmap,
} from '../services/granularSkillEngine';
import { recordAssessmentEvidence } from '../services/evidenceService';

// List All Assessments
export const getAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        category: true,
        questions: {
          select: {
            id: true,
            skillId: true,
            subSkillId: true,
            topicName: true,
            difficulty: true,
            subSkill: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If student, attach their latest attempt
    let studentId: string | null = null;
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      studentId = student?.id || null;
    }

    const enhanced = await Promise.all(
      assessments.map(async (ass) => {
        let latestAttempt = null;
        if (studentId) {
          latestAttempt = await prisma.assessmentAttempt.findFirst({
            where: { assessmentId: ass.id, studentId },
            orderBy: { startedAt: 'desc' },
          });
        }
        return {
          id: ass.id,
          title: ass.title,
          description: ass.description,
          category: ass.category?.name || 'General',
          durationMinutes: ass.durationMinutes,
          passingScore: ass.passingScore,
          questionsCount: ass.questions.length,
          latestAttempt,
        };
      })
    );

    res.json(enhanced);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch assessments.' });
  }
};

// Get Single Assessment to Take (hide isCorrect from students)
export const getAssessmentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const isStudent = req.user?.role === 'STUDENT';

    const assessment = await prisma.assessment.findUnique({
      where: { id },
      include: {
        category: true,
        questions: {
          include: {
            skill: true,
            subSkill: {
              include: { topics: true },
            },
            options: {
              select: {
                id: true,
                questionId: true,
                optionText: true,
                isCorrect: !isStudent, // Only reveal isCorrect to staff/admins
              },
            },
          },
        },
      },
    });

    if (!assessment) {
      res.status(404).json({ message: 'Assessment not found.' });
      return;
    }

    res.json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch assessment.' });
  }
};

// Submit Assessment Attempt & Calculate Granular Skill Scores
export const submitAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assessmentId = req.params.id as string;
    const { responses } = req.body; // Array of { questionId, selectedOptionId }

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        opportunity: { include: { industry: true } },
        questions: {
          include: {
            options: true,
            skill: { include: { category: true } },
            subSkill: true,
          },
        },
      },
    });

    if (!assessment) {
      res.status(404).json({ message: 'Assessment not found.' });
      return;
    }

    // 1. Calculate granular breakdown using granularSkillEngine
    const granularAnalysis = await calculateGranularAssessmentScores(assessmentId, responses || []);

    const responseRecords: Array<{
      questionId: string;
      selectedOptionId: string | null;
      isCorrect: boolean;
      scoreEarned: number;
    }> = [];

    const submittedMap = new Map<string, string>();
    if (Array.isArray(responses)) {
      for (const r of responses) {
        if (r.questionId && r.selectedOptionId) {
          submittedMap.set(r.questionId, r.selectedOptionId);
        }
      }
    }

    let totalScore = 0;
    let earnedScore = 0;

    for (const q of assessment.questions) {
      const selectedOptionId = submittedMap.get(q.id) || null;
      const weight = q.weightage || 1;
      totalScore += weight;
      let isCorrect = false;

      if (selectedOptionId) {
        const correctOpt = q.options.find((o: any) => o.isCorrect);
        if (correctOpt && correctOpt.id === selectedOptionId) {
          isCorrect = true;
          earnedScore += weight;
        }
      }

      responseRecords.push({
        questionId: q.id,
        selectedOptionId,
        isCorrect,
        scoreEarned: isCorrect ? weight : 0,
      });
    }

    const percentage = totalScore > 0 ? Math.round((earnedScore / totalScore) * 100) : 0;
    const passed = percentage >= assessment.passingScore;

    // 2. Persist in database in a transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.assessmentAttempt.create({
        data: {
          studentId: student.id,
          assessmentId,
          opportunityId: assessment.opportunityId || null,
          score: earnedScore,
          totalScore,
          percentage,
          passed,
          skillBreakdown: JSON.stringify(granularAnalysis.skillScores),
          granularBreakdown: JSON.stringify(granularAnalysis),
          completedAt: new Date(),
          responses: {
            create: responseRecords,
          },
        },
      });

      // Update / create granular StudentSubSkillScores & SkillProgressSnapshots
      for (const sub of granularAnalysis.subSkillScores) {
        const existingSubScore = await tx.studentSubSkillScore.findUnique({
          where: {
            studentId_subSkillId: {
              studentId: student.id,
              subSkillId: sub.subSkillId,
            },
          },
        });

        const prevScore = existingSubScore ? existingSubScore.scorePercentage : sub.scorePercentage;
        const deltaPercentage = Math.round(sub.scorePercentage - prevScore);

        if (existingSubScore) {
          await tx.studentSubSkillScore.update({
            where: { id: existingSubScore.id },
            data: {
              scorePercentage: sub.scorePercentage,
              proficiencyLevel: sub.proficiencyLevel,
              questionsAttempted: existingSubScore.questionsAttempted + sub.questionsTotal,
              questionsCorrect: existingSubScore.questionsCorrect + sub.questionsCorrect,
              lastAssessedAt: new Date(),
            },
          });
        } else {
          await tx.studentSubSkillScore.create({
            data: {
              studentId: student.id,
              subSkillId: sub.subSkillId,
              scorePercentage: sub.scorePercentage,
              proficiencyLevel: sub.proficiencyLevel,
              questionsAttempted: sub.questionsTotal,
              questionsCorrect: sub.questionsCorrect,
              lastAssessedAt: new Date(),
            },
          });
        }

        // Record historical progress snapshot
        await tx.skillProgressSnapshot.create({
          data: {
            studentId: student.id,
            subSkillId: sub.subSkillId,
            assessmentAttemptId: newAttempt.id,
            scorePercentage: sub.scorePercentage,
            proficiencyLevel: sub.proficiencyLevel,
            deltaPercentage,
            recordedAt: new Date(),
          },
        });
      }

      // Update / create high-level StudentSkillProfile
      for (const sk of granularAnalysis.skillScores) {
        const existingSkill = await tx.studentSkillProfile.findUnique({
          where: {
            studentId_skillId: {
              studentId: student.id,
              skillId: sk.skillId,
            },
          },
        });

        if (existingSkill) {
          await tx.studentSkillProfile.update({
            where: { id: existingSkill.id },
            data: {
              scorePercentage: sk.scorePercentage,
              proficiencyLevel: sk.proficiencyLevel,
              lastAssessedAt: new Date(),
            },
          });
        } else {
          await tx.studentSkillProfile.create({
            data: {
              studentId: student.id,
              skillId: sk.skillId,
              proficiencyLevel: sk.proficiencyLevel,
              scorePercentage: sk.scorePercentage,
              lastAssessedAt: new Date(),
              verified: sk.scorePercentage >= 80,
              verificationStatus: sk.scorePercentage >= 80 ? 'VERIFIED' : 'PENDING',
            },
          });
        }
      }

      // Record Audit Log
      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'ASSESSMENT_COMPLETED',
          entityType: 'AssessmentAttempt',
          entityId: newAttempt.id,
          details: JSON.stringify({ score: earnedScore, percentage, passed, granular: granularAnalysis.subSkillScores.length }),
        },
      });

      return newAttempt;
    });

    // 3. Record 5-Level Evidence-Based Skill Verification
    await recordAssessmentEvidence({
      studentId: student.id,
      attemptId: attempt.id,
      assessmentId,
      overallScore: percentage,
      granularBreakdown: granularAnalysis,
      opportunityId: assessment.opportunityId || null,
      companyName: assessment.opportunity?.industry?.companyName || null,
      assessmentTitle: assessment.title,
    }).catch((err) => console.error('Error recording assessment evidence:', err));

    // 4. Strengths and Critical Gaps
    const strongSkills = granularAnalysis.subSkillScores.filter((s) => s.scorePercentage >= 75);
    const improvementAreas = granularAnalysis.subSkillScores.filter((s) => s.scorePercentage >= 60 && s.scorePercentage < 75);
    const criticalGaps = granularAnalysis.subSkillScores.filter((s) => s.scorePercentage < 60);

    // 5. Generate instant AI roadmap based on updated student profile
    const roadmap = await generateSkillRoadmap(student.id, assessment.opportunityId || undefined);

    res.status(201).json({
      message: 'Assessment submitted and granular skill intelligence calculated successfully.',
      attemptId: attempt.id,
      score: earnedScore,
      totalScore,
      percentage,
      passed,
      granularScores: granularAnalysis,
      granularAnalysis,
      strengths: strongSkills.map((s) => s.subSkillName),
      weaknesses: criticalGaps.map((c) => c.subSkillName),
      strongSkills,
      improvementAreas,
      criticalGaps,
      skillBreakdown: granularAnalysis.skillScores.map((s) => ({
        skill: s.skillName,
        percentage: s.scorePercentage,
        level: s.proficiencyLevel,
      })),
      roadmap,
      roadmapRecommendation: roadmap,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit assessment.' });
  }
};

// Create Assessment (Institution / Academician)
export const createAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, categoryId, durationMinutes, passingScore, questions } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Title is required.' });
      return;
    }

    const assessment = await prisma.assessment.create({
      data: {
        title,
        description,
        categoryId: categoryId || null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : 30,
        passingScore: passingScore ? parseFloat(passingScore) : 60.0,
      },
    });

    if (Array.isArray(questions) && questions.length > 0) {
      for (const q of questions) {
        await prisma.question.create({
          data: {
            assessmentId: assessment.id,
            skillId: q.skillId || null,
            questionText: q.questionText,
            difficulty: q.difficulty || 'MEDIUM',
            weightage: q.weightage || 1,
            options: {
              create: q.options.map((opt: any) => ({
                optionText: opt.optionText,
                isCorrect: Boolean(opt.isCorrect),
              })),
            },
          },
        });
      }
    }

    res.status(201).json(assessment);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create assessment.' });
  }
};

// Add Question to Assessment
export const addQuestionToAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assessmentId = req.params.id as string;
    const { questionText, skillId, difficulty, weightage, options } = req.body;

    if (!questionText || !Array.isArray(options) || options.length < 2) {
      res.status(400).json({ message: 'Question text and at least 2 options are required.' });
      return;
    }

    const question = await prisma.question.create({
      data: {
        assessmentId,
        skillId: skillId || null,
        questionText,
        difficulty: difficulty || 'MEDIUM',
        weightage: weightage ? parseInt(weightage, 10) : 1,
        options: {
          create: options.map((opt: any) => ({
            optionText: opt.optionText,
            isCorrect: Boolean(opt.isCorrect),
          })),
        },
      },
      include: { options: true },
    });

    res.status(201).json(question);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add question.' });
  }
};

// Skill Categories & Skills
export const getSkillCategories = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const categories = await prisma.skillCategory.findMany({
      include: { skills: true },
      orderBy: { name: 'asc' },
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skill categories.' });
  }
};

export const createSkillCategory = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;
    if (!name) {
      res.status(400).json({ message: 'Category name is required.' });
      return;
    }

    const cat = await prisma.skillCategory.create({
      data: { name, description },
    });
    res.status(201).json(cat);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create category.' });
  }
};

export const createSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { categoryId, name, description } = req.body;
    if (!categoryId || !name) {
      res.status(400).json({ message: 'Category ID and skill name are required.' });
      return;
    }

    const skill = await prisma.skill.create({
      data: { categoryId, name, description },
    });
    res.status(201).json(skill);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create skill.' });
  }
};

export const getSkills = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const skills = await prisma.skill.findMany({
      include: { category: true },
      orderBy: { name: 'asc' },
    });
    res.json(skills);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skills.' });
  }
};
