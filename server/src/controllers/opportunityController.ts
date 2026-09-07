export const ASSESSMENT_PASSING_SCORE = 75.0;
import { sendNotification } from './notificationController';
import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateOpportunityMatch } from '../services/matchingEngine';
import { resolveDomain, isKeywordMatch, parseKeywordList } from '../services/personalizationService';

const PROFICIENCY_RANK: Record<string, number> = {
  BEGINNER: 1,
  DEVELOPING: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

// Map percentage to standardized proficiency tier
const mapPercentageToProficiency = (percentage: number): string => {
  if (percentage >= 90) return 'EXPERT';
  if (percentage >= 75) return 'ADVANCED';
  if (percentage >= 60) return 'INTERMEDIATE';
  if (percentage >= 40) return 'DEVELOPING';
  return 'BEGINNER';
};

// Browse Opportunities (with live matching score if Student)
export const getOpportunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, department, search } = req.query;

    const whereClause: any = { isPublished: true };

    if (type && typeof type === 'string' && type !== 'ALL') {
      whereClause.type = type;
    }

    if (department && typeof department === 'string') {
      whereClause.department = { contains: department };
    }

    if (search && typeof search === 'string') {
      whereClause.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
        { location: { contains: search } },
        { industry: { companyName: { contains: search } } },
      ];
    }

    const opportunities = await prisma.opportunity.findMany({
      where: whereClause,
      include: {
        industry: {
          select: {
            id: true,
            companyName: true,
            industrySector: true,
            location: true,
            logoUrl: true,
          },
        },
        skills: {
          include: { skill: true },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            description: true,
            durationMinutes: true,
            passingScore: true,
            instructions: true,
            isLocked: true,
            _count: { select: { questions: true } },
          },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    let studentId: string | null = null;
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      studentId = student?.id || null;
    }

    // Attach match result if student
    const enhanced = await Promise.all(
      opportunities.map(async (opp) => {
        let matchResult = null;
        let hasApplied = false;
        let applicationStatus = null;
        let latestAssessmentAttempt = null;

        if (studentId) {
          matchResult = await calculateOpportunityMatch(studentId, opp.id);
          const application = await prisma.application.findUnique({
            where: {
              studentId_opportunityId: {
                studentId,
                opportunityId: opp.id,
              },
            },
            select: {
              id: true,
              status: true,
              assessmentScore: true,
              assessmentPassed: true,
              assessmentAttemptId: true,
              assessmentBreakdown: true,
            },
          });
          if (application) {
            hasApplied = true;
            applicationStatus = application.status;
          }

          if (opp.assessment) {
            latestAssessmentAttempt = await prisma.assessmentAttempt.findFirst({
              where: {
                studentId,
                assessmentId: opp.assessment.id,
              },
              orderBy: { startedAt: 'desc' },
            });
          }
        }

        return {
          ...opp,
          matchResult,
          hasApplied,
          applicationStatus,
          hasAssessment: Boolean(opp.assessment),
          latestAssessmentAttempt,
        };
      })
    );

    // If student, sort by match score descending
    if (studentId) {
      enhanced.sort((a, b) => (b.matchResult?.matchScore || 0) - (a.matchResult?.matchScore || 0));
    }

    res.json(enhanced);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch opportunities.' });
  }
};

// Single Opportunity Details
export const getOpportunityById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const isStudent = req.user?.role === 'STUDENT';

    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: {
        industry: true,
        skills: {
          include: { skill: true },
        },
        assessment: {
          include: {
            questions: {
              include: {
                skill: true,
                options: {
                  select: {
                    id: true,
                    questionId: true,
                    optionText: true,
                    isCorrect: !isStudent, // Only show isCorrect to recruiters/staff
                  },
                },
              },
            },
          },
        },
        _count: { select: { applications: true } },
      },
    });

    if (!opp) {
      res.status(404).json({ message: 'Opportunity not found.' });
      return;
    }

    let matchResult = null;
    let hasApplied = false;
    let applicationStatus = null;
    let latestAssessmentAttempt = null;

    if (isStudent) {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user!.id },
      });
      if (student) {
        matchResult = await calculateOpportunityMatch(student.id, opp.id);
        const application = await prisma.application.findUnique({
          where: {
            studentId_opportunityId: {
              studentId: student.id,
              opportunityId: opp.id,
            },
          },
        });
        if (application) {
          hasApplied = true;
          applicationStatus = application.status;
        }

        if (opp.assessment) {
          latestAssessmentAttempt = await prisma.assessmentAttempt.findFirst({
            where: {
              studentId: student.id,
              assessmentId: opp.assessment.id,
            },
            orderBy: { startedAt: 'desc' },
          });
        }
      }
    }

    res.json({
      ...opp,
      matchResult,
      hasApplied,
      applicationStatus,
      hasAssessment: Boolean(opp.assessment),
      latestAssessmentAttempt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch opportunity.' });
  }
};

// Create Opportunity with Optional Industry Assessment
export const createOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!industry) {
      res.status(403).json({ message: 'Only industry accounts can post opportunities.' });
      return;
    }

    const {
      title,
      type,
      description,
      degree,
      department,
      minCgpa,
      experience,
      location,
      workMode,
      stipendOrSalary,
      applicationDeadline,
      numberOfOpenings,
      duration,
      startDate,
      responsibilities,
      selectionProcess,
      eligibleDepartments,
      eligibleDegrees,
      skillIds,
      requiredSkills,
      preferredSkills,
      assessmentRequired,
      assessmentData,
      assessment,
    } = req.body;

    if (!title || !type || !description) {
      res.status(400).json({ message: 'Title, type, and description are required.' });
      return;
    }

    const resolvedDept =
      department ||
      (Array.isArray(eligibleDepartments)
        ? eligibleDepartments.join(', ')
        : eligibleDepartments) ||
      null;

    const resolvedDegree =
      degree ||
      (Array.isArray(eligibleDegrees)
        ? eligibleDegrees.join(', ')
        : eligibleDegrees) ||
      null;

    // Collect skills to link
    const skillsToLink: Array<{ skillId: string; isRequired: boolean }> = [];

    if (Array.isArray(skillIds) && skillIds.length > 0) {
      for (const s of skillIds) {
        if (typeof s === 'string') {
          skillsToLink.push({ skillId: s, isRequired: true });
        } else if (typeof s === 'object' && s.skillId) {
          skillsToLink.push({ skillId: s.skillId, isRequired: s.isRequired !== undefined ? Boolean(s.isRequired) : true });
        }
      }
    }

    if (Array.isArray(requiredSkills) && requiredSkills.length > 0) {
      for (const reqSkill of requiredSkills) {
        const found = await prisma.skill.findFirst({
          where: { name: { equals: reqSkill, mode: 'insensitive' } },
        });
        if (found && !skillsToLink.some((x) => x.skillId === found.id)) {
          skillsToLink.push({ skillId: found.id, isRequired: true });
        }
      }
    }

    if (Array.isArray(preferredSkills) && preferredSkills.length > 0) {
      for (const prefSkill of preferredSkills) {
        const found = await prisma.skill.findFirst({
          where: { name: { equals: prefSkill, mode: 'insensitive' } },
        });
        if (found && !skillsToLink.some((x) => x.skillId === found.id)) {
          skillsToLink.push({ skillId: found.id, isRequired: false });
        }
      }
    }

    // Validate assessmentData if assessmentRequired
    const rawAssessment = assessmentData || assessment;
    const isAssessmentRequired = assessmentRequired !== undefined ? Boolean(assessmentRequired) : Boolean(rawAssessment);

    if (isAssessmentRequired && rawAssessment) {
      if (!Array.isArray(rawAssessment.questions) || rawAssessment.questions.length === 0) {
        res.status(400).json({ message: 'At least one assessment question is required when "Assessment Required" is enabled.' });
        return;
      }

      for (let i = 0; i < rawAssessment.questions.length; i++) {
        const q = rawAssessment.questions[i];
        if (!q.questionText || !q.skillId) {
          res.status(400).json({ message: `Question #${i + 1} must include question text and a linked skill.` });
          return;
        }
        if (!Array.isArray(q.options) || q.options.length < 2) {
          res.status(400).json({ message: `Question #${i + 1} must have at least 2 options.` });
          return;
        }
        const hasCorrect = q.options.some((opt: any) => Boolean(opt.isCorrect));
        if (!hasCorrect) {
          res.status(400).json({ message: `Question #${i + 1} must have a correct answer selected.` });
          return;
        }
      }
    }

    const opp = await prisma.$transaction(async (tx) => {
      const created = await tx.opportunity.create({
        data: {
          industryId: industry.id,
          title,
          type,
          description,
          degree: resolvedDegree,
          department: resolvedDept,
          minCgpa: minCgpa ? parseFloat(minCgpa) : null,
          experience,
          location,
          workMode: workMode || 'ON_SITE',
          stipendOrSalary,
          applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
          numberOfOpenings: numberOfOpenings ? parseInt(numberOfOpenings, 10) : 1,
          duration,
          startDate,
          responsibilities,
          selectionProcess,
          assessmentRequired: isAssessmentRequired,
          isPublished: true,
        },
      });

      for (const s of skillsToLink) {
        await tx.opportunitySkill.create({
          data: {
            opportunityId: created.id,
            skillId: s.skillId,
            isRequired: s.isRequired,
          },
        });
      }

      // Create linked Assessment if configured
      if (isAssessmentRequired && rawAssessment) {
        const durationMinutes = rawAssessment.durationMinutes
          ? parseInt(rawAssessment.durationMinutes, 10)
          : (rawAssessment.duration ? parseInt(rawAssessment.duration, 10) : 30);

        const createdAssessment = await tx.assessment.create({
          data: {
            opportunityId: created.id,
            industryId: industry.id,
            title: rawAssessment.title || `Skill Assessment: ${title}`,
            description: rawAssessment.description || `Standardized skill assessment for ${title} at ${industry.companyName}.`,
            instructions: rawAssessment.instructions || 'Answer all questions carefully. Time limit applies upon start.',
            durationMinutes,
            passingScore: ASSESSMENT_PASSING_SCORE,
            isLocked: false,
          },
        });

        for (const q of rawAssessment.questions) {
          const weightage = q.weightage
            ? parseInt(q.weightage, 10)
            : (q.marks ? parseInt(q.marks, 10) : 1);

          await tx.question.create({
            data: {
              assessmentId: createdAssessment.id,
              skillId: q.skillId,
              questionText: q.questionText,
              difficulty: q.difficulty || 'MEDIUM',
              weightage,
              options: {
                create: q.options.map((opt: any) => ({
                  optionText: opt.optionText || opt.text || '',
                  isCorrect: Boolean(opt.isCorrect),
                })),
              },
            },
          });
        }
      }

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'OPPORTUNITY_CREATED',
          entityType: 'Opportunity',
          entityId: created.id,
          details: JSON.stringify({ title, type, hasAssessment: Boolean(rawAssessment) }),
        },
      });

      return created;
    });

    const fullOpp = await prisma.opportunity.findUnique({
      where: { id: opp.id },
      include: {
        skills: { include: { skill: true } },
        assessment: { include: { questions: { include: { options: true } } } },
      },
    });

    res.status(201).json(fullOpp || opp);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create opportunity.' });
  }
};

// Edit Opportunity & Assessment
export const updateOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const opp = await prisma.opportunity.findUnique({
      where: { id },
      include: { assessment: { include: { attempts: true } } },
    });

    if (!opp || opp.industryId !== industry?.id) {
      res.status(403).json({ message: 'Unauthorized to edit this opportunity.' });
      return;
    }

    const {
      title,
      type,
      description,
      degree,
      department,
      minCgpa,
      experience,
      location,
      workMode,
      stipendOrSalary,
      applicationDeadline,
      numberOfOpenings,
      duration,
      startDate,
      responsibilities,
      selectionProcess,
      isPublished,
      skillIds,
      assessmentRequired,
      assessmentData,
      assessment,
    } = req.body;

    const rawAssessment = assessmentData || assessment;
    const hasAttempts = opp.assessment?.attempts && opp.assessment.attempts.length > 0;

    const updated = await prisma.$transaction(async (tx) => {
      const oppUpdated = await tx.opportunity.update({
        where: { id },
        data: {
          title,
          type,
          description,
          degree,
          department,
          minCgpa: minCgpa !== undefined ? (minCgpa ? parseFloat(minCgpa) : null) : undefined,
          experience,
          location,
          workMode,
          stipendOrSalary,
          applicationDeadline: applicationDeadline !== undefined ? (applicationDeadline ? new Date(applicationDeadline) : null) : undefined,
          numberOfOpenings: numberOfOpenings !== undefined ? parseInt(numberOfOpenings, 10) : undefined,
          duration,
          startDate,
          responsibilities,
          selectionProcess,
          assessmentRequired: assessmentRequired !== undefined ? Boolean(assessmentRequired) : undefined,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
        },
      });

      if (Array.isArray(skillIds)) {
        await tx.opportunitySkill.deleteMany({ where: { opportunityId: id } });
        for (const s of skillIds) {
          const sId = typeof s === 'string' ? s : s.skillId;
          const req = typeof s === 'object' && s.isRequired !== undefined ? Boolean(s.isRequired) : true;
          if (sId) {
            await tx.opportunitySkill.create({
              data: {
                opportunityId: id,
                skillId: sId,
                isRequired: req,
              },
            });
          }
        }
      }

      // Handle assessment update
      if (rawAssessment) {
        const durationMinutes = rawAssessment.durationMinutes
          ? parseInt(rawAssessment.durationMinutes, 10)
          : (rawAssessment.duration ? parseInt(rawAssessment.duration, 10) : 30);

        if (hasAttempts) {
          // Assessment is locked from question changes to maintain historical attempt validity
          await tx.assessment.update({
            where: { opportunityId: id },
            data: {
              isLocked: true,
              instructions: rawAssessment.instructions,
              durationMinutes,
            },
          });
        } else {
          // Recreate or update questions cleanly
          const existingAssessment = await tx.assessment.findUnique({ where: { opportunityId: id } });
          let assessmentId = existingAssessment?.id;

          if (existingAssessment) {
            await tx.assessment.update({
              where: { id: existingAssessment.id },
              data: {
                title: rawAssessment.title || `Skill Assessment: ${title}`,
                description: rawAssessment.description,
                instructions: rawAssessment.instructions,
                durationMinutes,
                passingScore: ASSESSMENT_PASSING_SCORE,
              },
            });

            if (Array.isArray(rawAssessment.questions)) {
              await tx.questionOption.deleteMany({ where: { question: { assessmentId: existingAssessment.id } } });
              await tx.question.deleteMany({ where: { assessmentId: existingAssessment.id } });
            }
          } else {
            const createdAss = await tx.assessment.create({
              data: {
                opportunityId: id,
                industryId: industry.id,
                title: rawAssessment.title || `Skill Assessment: ${title}`,
                description: rawAssessment.description,
                instructions: rawAssessment.instructions,
                durationMinutes,
                passingScore: ASSESSMENT_PASSING_SCORE,
              },
            });
            assessmentId = createdAss.id;
          }

          if (Array.isArray(rawAssessment.questions) && assessmentId) {
            for (const q of rawAssessment.questions) {
              const weightage = q.weightage
                ? parseInt(q.weightage, 10)
                : (q.marks ? parseInt(q.marks, 10) : 1);

              await tx.question.create({
                data: {
                  assessmentId,
                  skillId: q.skillId,
                  questionText: q.questionText,
                  difficulty: q.difficulty || 'MEDIUM',
                  weightage,
                  options: {
                    create: q.options.map((opt: any) => ({
                      optionText: opt.optionText || opt.text || '',
                      isCorrect: Boolean(opt.isCorrect),
                    })),
                  },
                },
              });
            }
          }
        }
      }

      return oppUpdated;
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update opportunity.' });
  }
};

// Delete Opportunity
export const deleteOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const opp = await prisma.opportunity.findUnique({ where: { id } });
    if (!opp || opp.industryId !== industry?.id) {
      res.status(403).json({ message: 'Unauthorized to delete this opportunity.' });
      return;
    }

    await prisma.opportunity.delete({ where: { id } });
    res.json({ message: 'Opportunity successfully deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete opportunity.' });
  }
};

// Get My Created Opportunities (Industry)
export const getMyOpportunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!industry) {
      res.status(404).json({ message: 'Industry profile not found.' });
      return;
    }

    const opportunities = await prisma.opportunity.findMany({
      where: { industryId: industry.id },
      include: {
        skills: { include: { skill: true } },
        assessment: {
          select: {
            id: true,
            title: true,
            durationMinutes: true,
            passingScore: true,
            isLocked: true,
            _count: { select: { questions: true, attempts: true } },
          },
        },
        _count: { select: { applications: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(opportunities);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch opportunities.' });
  }
};

// Fetch Single Opportunity's Assessment (Student/Staff view, hides isCorrect for students)
export const getOpportunityAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const opportunityId = req.params.id as string;
    const isStudent = req.user?.role === 'STUDENT';

    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        industry: { select: { companyName: true, industrySector: true, logoUrl: true } },
        skills: { include: { skill: true } },
        assessment: {
          include: {
            questions: {
              include: {
                skill: true,
                options: {
                  select: {
                    id: true,
                    questionId: true,
                    optionText: true,
                    isCorrect: !isStudent,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!opp || !opp.assessment) {
      res.status(404).json({ message: 'Assessment not found for this opportunity.' });
      return;
    }

    // Check if student already has a completed attempt
    let studentAttempt = null;
    if (isStudent) {
      const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
      if (student) {
        studentAttempt = await prisma.assessmentAttempt.findFirst({
          where: { studentId: student.id, assessmentId: opp.assessment.id },
          orderBy: { startedAt: 'desc' },
        });
      }
    }

    const mappedQuestions = opp.assessment.questions.map((q) => ({
      id: q.id,
      skillId: q.skillId,
      skillName: q.skill?.name,
      questionText: q.questionText,
      difficulty: q.difficulty,
      weightage: q.weightage,
      marks: q.weightage,
      options: q.options.map((opt) => ({
        id: opt.id,
        questionId: opt.questionId,
        optionText: opt.optionText,
        text: opt.optionText,
        ...(isStudent ? {} : { isCorrect: opt.isCorrect }),
      })),
    }));

    const assessmentPayload = {
      id: opp.assessment.id,
      title: opp.assessment.title,
      description: opp.assessment.description,
      instructions: opp.assessment.instructions,
      durationMinutes: opp.assessment.durationMinutes,
      duration: opp.assessment.durationMinutes,
      passingScore: opp.assessment.passingScore,
      isLocked: opp.assessment.isLocked,
      questions: mappedQuestions,
    };

    res.json({
      ...assessmentPayload,
      opportunityId: opp.id,
      opportunityTitle: opp.title,
      companyName: opp.industry.companyName,
      assessment: assessmentPayload,
      requiredSkills: opp.skills.map((s) => s.skill.name),
      existingAttempt: studentAttempt,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch opportunity assessment.' });
  }
};

// Student Submits Opportunity-Specific Assessment Attempt
export const submitOpportunityAssessment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const opportunityId = req.params.id as string;
    const { responses, answers, resumeUrl, coverLetter, timeSpentSeconds } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        skillProfiles: { include: { skill: true } },
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        industry: true,
        skills: { include: { skill: true } },
        assessment: {
          include: {
            questions: {
              include: {
                skill: true,
                options: true,
              },
            },
          },
        },
      },
    });

    if (!opp || !opp.isPublished) {
      res.status(404).json({ message: 'Opportunity is not active or not found.' });
      return;
    }

    if (!opp.assessment) {
      res.status(400).json({ message: 'This opportunity does not require an assessment.' });
      return;
    }

    const assessment = opp.assessment;

    // Check academic eligibility
    const match = await calculateOpportunityMatch(student.id, opportunityId);
    if (!match.eligibility.isEligible) {
      res.status(403).json({
        message: 'You are not academically eligible to apply for this opportunity.',
        ineligibleReasons: match.eligibility.ineligibleReasons,
      });
      return;
    }

    // Evaluate answers server-side
    let totalPossibleWeight = 0;
    let earnedWeight = 0;
    const responseRecords: Array<{
      questionId: string;
      selectedOptionId: string | null;
      isCorrect: boolean;
      scoreEarned: number;
    }> = [];

    // Map: skillId -> { total: number, earned: number, name: string }
    const skillScoreMap = new Map<string, { total: number; earned: number; name: string }>();

    for (const q of assessment.questions) {
      const weight = q.weightage || 1;
      totalPossibleWeight += weight;

      if (q.skillId && q.skill) {
        if (!skillScoreMap.has(q.skillId)) {
          skillScoreMap.set(q.skillId, { total: 0, earned: 0, name: q.skill.name });
        }
        skillScoreMap.get(q.skillId)!.total += weight;
      }
    }

    const submittedAnswerList = Array.isArray(responses) ? responses : (Array.isArray(answers) ? answers : []);
    const submittedAnswerMap = new Map<string, string>();
    submittedAnswerList.forEach((r: any) => {
      if (r.questionId) {
        submittedAnswerMap.set(r.questionId, r.selectedOptionId || r.optionId);
      }
    });

    for (const q of assessment.questions) {
      const selectedOptionId = submittedAnswerMap.get(q.id) || null;
      const weight = q.weightage || 1;
      let isCorrect = false;

      if (selectedOptionId) {
        const correctOpt = q.options.find((o) => o.isCorrect);
        if (correctOpt && correctOpt.id === selectedOptionId) {
          isCorrect = true;
          earnedWeight += weight;
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

    const percentage = totalPossibleWeight > 0 ? Math.round((earnedWeight / totalPossibleWeight) * 100) : 0;
    const passed = percentage >= (assessment.passingScore || ASSESSMENT_PASSING_SCORE);

    // Per-Skill Breakdown & Proficiency Levels
    const skillBreakdown: Array<{
      skillId: string;
      skillName: string;
      percentage: number;
      scorePercentage: number;
      proficiencyLevel: string;
      isStrength: boolean;
      isGap: boolean;
    }> = [];

    const strengths: string[] = [];
    const developingSkills: string[] = [];
    const skillGaps: string[] = [];

    for (const [sId, stats] of skillScoreMap.entries()) {
      const skillPct = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0;
      const profLevel = mapPercentageToProficiency(skillPct);
      const isStr = skillPct >= 75;
      const isGap = skillPct < 60;

      skillBreakdown.push({
        skillId: sId,
        skillName: stats.name,
        percentage: skillPct,
        scorePercentage: skillPct,
        proficiencyLevel: profLevel,
        isStrength: isStr,
        isGap,
      });

      if (isStr) strengths.push(stats.name);
      else if (skillPct >= 40) developingSkills.push(stats.name);
      else skillGaps.push(stats.name);
    }

    // Also check required vacancy skills that were NOT tested or scored low
    opp.skills.forEach((os) => {
      if (!strengths.includes(os.skill.name) && !skillGaps.includes(os.skill.name)) {
        const studentSkill = student.skillProfiles.find((sp) => sp.skillId === os.skillId);
        if (!studentSkill || studentSkill.proficiencyLevel === 'BEGINNER') {
          if (!skillGaps.includes(os.skill.name)) skillGaps.push(os.skill.name);
        }
      }
    });

    // Calculate Comprehensive Compatibility Score
    const careerInterestsList = parseKeywordList(student.careerInterests);
    const isCareerMatch = careerInterestsList.some((ci) => isKeywordMatch(ci, opp.title + ' ' + opp.description));
    
    let compatibilityScore = Math.round(
      percentage * 0.6 +
      (isCareerMatch ? 25 : 10) +
      (match.eligibility.isEligible ? 15 : 0)
    );
    compatibilityScore = Math.min(99, Math.max(30, compatibilityScore));

    const breakdownJson = JSON.stringify({
      overallScore: percentage,
      passed,
      skillBreakdown,
      strengths,
      demonstratedStrengths: strengths,
      developingSkills,
      skillGaps,
      compatibilityScore,
    });

    // Execute database persistence transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Assessment Attempt
      const attempt = await tx.assessmentAttempt.create({
        data: {
          studentId: student.id,
          assessmentId: assessment.id,
          opportunityId: opp.id,
          score: earnedWeight,
          totalScore: totalPossibleWeight,
          percentage,
          passed,
          skillBreakdown: breakdownJson,
          completedAt: new Date(),
          responses: {
            create: responseRecords,
          },
        },
      });

      // 2. Lock assessment from structural changes now that attempts exist
      await tx.assessment.update({
        where: { id: assessment.id },
        data: { isLocked: true },
      });

      // 3. Update StudentSkillProfile for each evaluated skill
      for (const [skillId, stats] of skillScoreMap.entries()) {
        const skillPercentage = stats.total > 0 ? Math.round((stats.earned / stats.total) * 100) : 0;
        const proficiencyLevel = mapPercentageToProficiency(skillPercentage);

        const existingSkillProfile = await tx.studentSkillProfile.findUnique({
          where: { studentId_skillId: { studentId: student.id, skillId } },
        });

        if (existingSkillProfile) {
          const newAvg = Math.round((existingSkillProfile.scorePercentage + skillPercentage) / 2);
          await tx.studentSkillProfile.update({
            where: { id: existingSkillProfile.id },
            data: {
              scorePercentage: newAvg,
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

      // 4. Create or Update Application
      const applicationStatus = passed ? 'APPLIED' : 'ASSESSMENT_FAILED';

      const existingApp = await tx.application.findUnique({
        where: { studentId_opportunityId: { studentId: student.id, opportunityId: opp.id } },
      });

      let application;
      if (existingApp) {
        application = await tx.application.update({
          where: { id: existingApp.id },
          data: {
            status: applicationStatus,
            matchScore: compatibilityScore,
            assessmentScore: percentage,
            assessmentPassed: passed,
            assessmentAttemptId: attempt.id,
            assessmentBreakdown: breakdownJson,
            resumeUrl: resumeUrl || existingApp.resumeUrl,
            coverLetter: coverLetter || existingApp.coverLetter,
          },
        });
      } else {
        application = await tx.application.create({
          data: {
            studentId: student.id,
            opportunityId: opp.id,
            status: applicationStatus,
            matchScore: compatibilityScore,
            assessmentScore: percentage,
            assessmentPassed: passed,
            assessmentAttemptId: attempt.id,
            assessmentBreakdown: breakdownJson,
            resumeUrl: resumeUrl || student.resumeUrl,
            coverLetter,
          },
        });
      }

      // Update attempt with applicationId
      await tx.assessmentAttempt.update({
        where: { id: attempt.id },
        data: { applicationId: application.id },
      });

      // Record status history
      await tx.applicationStatusHistory.create({
        data: {
          applicationId: application.id,
          status: applicationStatus,
          notes: `Assessment completed with score ${percentage}% (${passed ? 'PASSED' : 'FAILED'}). Compatibility: ${compatibilityScore}%.`,
          changedById: req.user!.id,
        },
      });

      return { attempt, application };
    });

    // Notify Recruiter
    const indProfile = await prisma.industryProfile.findUnique({
      where: { id: opp.industryId },
      select: { userId: true },
    });
    if (indProfile) {
      await sendNotification({
        userId: indProfile.userId,
        title: `Candidate Assessment ${passed ? 'Passed' : 'Failed'}`,
        message: `${student.fullName} completed the skill assessment for '${opp.title}' (${percentage}%, ${passed ? 'PASSED' : 'FAILED'}). Compatibility: ${compatibilityScore}%.`,
        link: `/industry/applicants?opportunityId=${opp.id}`,
      });
    }

    // Skills to Learn Next
    const skillsToLearnNext = skillGaps.map((g) => ({
      skill: g,
      reason: `Identified as a competency gap during '${opp.title}' assessment. Focus on elevating this skill for future software/clinical roles.`,
    }));

    res.status(201).json({
      message: passed
        ? 'Assessment passed! Your application has been officially submitted.'
        : 'Assessment completed. You did not meet the passing threshold for this vacancy.',
      score: earnedWeight,
      totalScore: totalPossibleWeight,
      scorePercentage: percentage,
      percentage,
      earnedMarks: earnedWeight,
      totalMarks: totalPossibleWeight,
      passed,
      isPassed: passed,
      status: result.application.status,
      passingScore: assessment.passingScore || ASSESSMENT_PASSING_SCORE,
      compatibilityScore,
      matchScore: compatibilityScore,
      strengths,
      demonstratedStrengths: strengths,
      developingSkills,
      skillGaps,
      skillsToLearnNext,
      skillBreakdown,
      applicationId: result.application.id,
      attemptId: result.attempt.id,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit opportunity assessment.' });
  }
};

// Direct Apply to Opportunity (for opportunities with NO assessment required)
export const applyToOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const opportunityId = req.params.id as string;
    const { resumeUrl, coverLetter } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const opp = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: { assessment: true },
    });

    if (!opp || !opp.isPublished) {
      res.status(404).json({ message: 'Opportunity is closed or not available.' });
      return;
    }

    // If assessment is required and exists, instruct student to take assessment
    if (opp.assessmentRequired && opp.assessment) {
      const attempt = await prisma.assessmentAttempt.findFirst({
        where: { studentId: student.id, assessmentId: opp.assessment.id },
        orderBy: { startedAt: 'desc' },
      });

      if (!attempt || !attempt.passed) {
        res.status(400).json({
          message: 'This opportunity requires completing a skill assessment before submission.',
          assessmentRequired: true,
          assessmentId: opp.assessment.id,
        });
        return;
      }
    }

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        studentId_opportunityId: {
          studentId: student.id,
          opportunityId,
        },
      },
    });

    if (existing && existing.status !== 'ASSESSMENT_FAILED') {
      res.status(400).json({ message: 'You have already applied for this opportunity.' });
      return;
    }

    // Check eligibility
    const match = await calculateOpportunityMatch(student.id, opportunityId);
    if (!match.eligibility.isEligible) {
      res.status(403).json({
        message: 'You are not eligible to apply for this opportunity.',
        ineligibleReasons: match.eligibility.ineligibleReasons,
        eligibility: match.eligibility,
      });
      return;
    }

    const application = await prisma.$transaction(async (tx) => {
      const created = await tx.application.upsert({
        where: {
          studentId_opportunityId: {
            studentId: student.id,
            opportunityId,
          },
        },
        update: {
          status: 'APPLIED',
          matchScore: match.matchScore,
          resumeUrl: resumeUrl || student.resumeUrl,
          coverLetter,
        },
        create: {
          studentId: student.id,
          opportunityId,
          resumeUrl: resumeUrl || student.resumeUrl,
          coverLetter,
          matchScore: match.matchScore,
          status: 'APPLIED',
        },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: created.id,
          status: 'APPLIED',
          notes: `Application submitted with match score of ${match.matchScore}%.`,
          changedById: req.user!.id,
        },
      });

      return created;
    });

    res.status(201).json({
      message: 'Application submitted successfully.',
      application,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit application.' });
  }
};

// Recruiter Screening: View Applicants with Assessment Deep-Dive and Filters
export const getOpportunityApplicants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { opportunityId, minScore, minCompatibility, minCgpa, status, skillId } = req.query;
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!industry) {
      res.status(404).json({ message: 'Industry profile not found.' });
      return;
    }

    const whereClause: any = {
      opportunity: { industryId: industry.id },
    };

    if (opportunityId && typeof opportunityId === 'string' && opportunityId !== 'ALL') {
      whereClause.opportunityId = opportunityId;
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }

    if (minScore) {
      whereClause.assessmentScore = { gte: parseFloat(minScore as string) };
    }

    if (minCompatibility) {
      whereClause.matchScore = { gte: parseFloat(minCompatibility as string) };
    }

    let applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: {
          include: {
            skillProfiles: { include: { skill: true } },
            assessmentAttempts: {
              include: { assessment: true },
              orderBy: { completedAt: 'desc' },
            },
          },
        },
        opportunity: {
          include: {
            skills: { include: { skill: true } },
            assessment: true,
          },
        },
        history: { orderBy: { createdAt: 'desc' } },
        interviews: { orderBy: { scheduledAt: 'desc' } },
      },
      orderBy: { matchScore: 'desc' },
    });

    if (minCgpa) {
      const cgpaThreshold = parseFloat(minCgpa as string);
      applications = applications.filter((app) => (app.student?.cgpa || 0) >= cgpaThreshold);
    }

    if (skillId && typeof skillId === 'string' && skillId !== 'ALL') {
      applications = applications.filter((app) =>
        app.student?.skillProfiles?.some((sp) => sp.skillId === skillId)
      );
    }

    // Enhance each applicant with parsed breakdown and strengths vs gaps
    const enhanced = applications.map((app) => {
      let parsedBreakdown: any = null;
      if (app.assessmentBreakdown) {
        try {
          parsedBreakdown = JSON.parse(app.assessmentBreakdown);
        } catch {
          parsedBreakdown = null;
        }
      }

      // Compute strengths and gaps against opportunity's required skills
      const studentSkillMap = new Map<string, number>();
      app.student?.skillProfiles?.forEach((sp) => {
        studentSkillMap.set(sp.skill.name.toLowerCase(), sp.scorePercentage || 60);
      });

      const matchedSkills: string[] = [];
      const skillGaps: string[] = [];

      app.opportunity?.skills?.forEach((os) => {
        const score = studentSkillMap.get(os.skill.name.toLowerCase());
        if (score !== undefined && score >= 60) {
          matchedSkills.push(os.skill.name);
        } else {
          skillGaps.push(os.skill.name);
        }
      });

      return {
        ...app,
        parsedBreakdown,
        matchedSkills,
        demonstratedStrengths: parsedBreakdown?.strengths || parsedBreakdown?.demonstratedStrengths || matchedSkills,
        skillGaps: parsedBreakdown?.skillGaps || skillGaps,
        assessmentScore: app.assessmentScore ?? parsedBreakdown?.overallScore ?? null,
        assessmentPassed: app.assessmentPassed ?? parsedBreakdown?.passed ?? null,
      };
    });

    res.json(enhanced);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch applicants.' });
  }
};

// Recruiter: Update Application Status
export const updateApplicationStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    const validStatuses = [
      'APPLIED',
      'ASSESSMENT_FAILED',
      'UNDER_REVIEW',
      'SHORTLISTED',
      'INTERVIEW',
      'SELECTED',
      'REJECTED',
      'WITHDRAWN',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const application = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: true },
    });

    if (!application || application.opportunity.industryId !== industry?.id) {
      res.status(403).json({ message: 'Unauthorized to modify this application.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status,
          notes: notes || `Status updated to ${status} by recruiter.`,
          changedById: req.user!.id,
        },
      });

      return app;
    });

    res.json({ message: `Application status updated to ${status}.`, application: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update application status.' });
  }
};

// Recruiter: Schedule Interview
export const scheduleInterview = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { scheduledAt, meetingLink, notes } = req.body;

    if (!scheduledAt) {
      res.status(400).json({ message: 'Scheduled date and time is required.' });
      return;
    }

    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const application = await prisma.application.findUnique({
      where: { id },
      include: { opportunity: true },
    });

    if (!application || application.opportunity.industryId !== industry?.id) {
      res.status(403).json({ message: 'Unauthorized to schedule interview for this application.' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      const interview = await tx.interview.create({
        data: {
          applicationId: id,
          scheduledAt: new Date(scheduledAt),
          meetingLink,
          notes,
          status: 'SCHEDULED',
        },
      });

      await tx.application.update({
        where: { id },
        data: { status: 'INTERVIEW' },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status: 'INTERVIEW',
          notes: `Interview scheduled for ${new Date(scheduledAt).toLocaleString()}`,
          changedById: req.user!.id,
        },
      });

      return interview;
    });

    res.status(201).json({ message: 'Interview scheduled successfully.', interview: result });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to schedule interview.' });
  }
};
