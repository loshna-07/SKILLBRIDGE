import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// List All Assessments
export const getAssessments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const assessments = await prisma.assessment.findMany({
      include: {
        category: true,
        questions: { select: { id: true, skillId: true, difficulty: true } },
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

// Submit Assessment Attempt & Calculate Skill Scores
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
        questions: {
          include: {
            options: true,
            skill: true,
          },
        },
      },
    });

    if (!assessment) {
      res.status(404).json({ message: 'Assessment not found.' });
      return;
    }

    const questionMap = new Map<string, any>();
    for (const q of assessment.questions) {
      questionMap.set(q.id, q);
    }

    let totalScore = 0;
    let earnedScore = 0;
    const responseRecords: Array<{
      questionId: string;
      selectedOptionId: string | null;
      isCorrect: boolean;
      scoreEarned: number;
    }> = [];

    // Map to group scores by skill: skillId -> { totalWeight: number, earnedWeight: number, skillName: string }
    const skillScoreMap = new Map<string, { total: number; earned: number; name: string }>();

    for (const q of assessment.questions) {
      const weight = q.weightage || 1;
      totalScore += weight;

      if (q.skillId && q.skill) {
        if (!skillScoreMap.has(q.skillId)) {
          skillScoreMap.set(q.skillId, { total: 0, earned: 0, name: q.skill.name });
        }
        const sEntry = skillScoreMap.get(q.skillId)!;
        sEntry.total += weight;
      }
    }

    const submittedMap = new Map<string, string>();
    if (Array.isArray(responses)) {
      for (const r of responses) {
        submittedMap.set(r.questionId, r.selectedOptionId);
      }
    }

    for (const q of assessment.questions) {
      const selectedOptionId = submittedMap.get(q.id) || null;
      const weight = q.weightage || 1;
      let isCorrect = false;

      if (selectedOptionId) {
        const correctOpt = q.options.find((o: any) => o.isCorrect);
        if (correctOpt && correctOpt.id === selectedOptionId) {
          isCorrect = true;
          earnedScore += weight;

          if (q.skillId && skillScoreMap.has(q.skillId)) {
            skillScoreMap.get(q.skillId)!.earned += weight;
          }
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

    // Create attempt and responses in a transaction
    const attempt = await prisma.$transaction(async (tx) => {
      const newAttempt = await tx.assessmentAttempt.create({
        data: {
          studentId: student.id,
          assessmentId,
          score: earnedScore,
          totalScore,
          percentage,
          passed,
          completedAt: new Date(),
          responses: {
            create: responseRecords,
          },
        },
      });

      // Update or create StudentSkillProfile for each evaluated skill
      for (const [skillId, stats] of skillScoreMap.entries()) {
        const skillPercentage = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0;

        let proficiencyLevel = 'BEGINNER';
        if (skillPercentage >= 85) proficiencyLevel = 'ADVANCED';
        else if (skillPercentage >= 60) proficiencyLevel = 'INTERMEDIATE';

        const existingSkillProfile = await tx.studentSkillProfile.findUnique({
          where: {
            studentId_skillId: {
              studentId: student.id,
              skillId,
            },
          },
        });

        if (existingSkillProfile) {
          // Average with previous or take best
          const newAvgScore = Math.round((existingSkillProfile.scorePercentage + skillPercentage) / 2);
          await tx.studentSkillProfile.update({
            where: { id: existingSkillProfile.id },
            data: {
              scorePercentage: newAvgScore,
              proficiencyLevel,
              lastAssessedAt: new Date(),
            },
          });
        } else {
          await tx.studentSkillProfile.create({
            data: {
              studentId: student.id,
              skillId,
              proficiencyLevel,
              scorePercentage: skillPercentage,
              lastAssessedAt: new Date(),
              verified: false,
              verificationStatus: 'PENDING',
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
          details: JSON.stringify({ score: earnedScore, percentage, passed }),
        },
      });

      return newAttempt;
    });

    // Strengths and Weaknesses breakdown
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const skillBreakdown: Array<{ skill: string; percentage: number; level: string }> = [];

    for (const [_sId, stats] of skillScoreMap.entries()) {
      const pct = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0;
      let level = 'BEGINNER';
      if (pct >= 85) level = 'ADVANCED';
      else if (pct >= 60) level = 'INTERMEDIATE';

      skillBreakdown.push({ skill: stats.name, percentage: pct, level });

      if (pct >= 70) strengths.push(stats.name);
      else weaknesses.push(stats.name);
    }

    const skillGaps = weaknesses.map((w) => ({
      skill: w,
      gapType: 'PERFORMANCE_GAP',
      severity: 'HIGH',
      description: `Assessed score is below industry baseline (60%). Additional training or retake recommended.`,
    }));

    res.status(201).json({
      message: 'Assessment submitted successfully.',
      attemptId: attempt.id,
      score: earnedScore,
      totalScore,
      percentage,
      passed,
      strengths,
      weaknesses,
      skillGaps,
      skillBreakdown,
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
