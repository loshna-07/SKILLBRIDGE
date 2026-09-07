import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateLearningProgramMatch } from '../services/matchingEngine';

const VALID_PROGRAM_TYPES = [
  'TRAINING',
  'CERTIFICATION',
  'WORKSHOP',
  'BOOTCAMP',
  'MENTORSHIP',
  'FDP',
];

// Browse Learning Programs (with Skill Gap & Recommendation Filters)
export const getLearningPrograms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, search, mode, recommendations, onlyGaps } = req.query;

    const whereClause: any = { isPublished: true };

    if (type && typeof type === 'string' && type !== 'ALL' && type !== 'RECOMMENDED') {
      whereClause.type = type.toUpperCase();
    }

    if (mode && typeof mode === 'string' && mode !== 'ALL') {
      whereClause.mode = mode.toUpperCase();
    }

    if (search && typeof search === 'string' && search.trim()) {
      const q = search.trim();
      whereClause.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { skills: { some: { skill: { name: { contains: q } } } } },
      ];
    }

    let studentWeakSkills = new Set<string>();
    let studentMarketGapSkills = new Set<string>();
    let allGapSkillIds = new Set<string>();
    let enrolledProgramIds = new Set<string>();
    let studentId: string | null = null;

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
        include: {
          skillProfiles: true,
          learningEnrollments: true,
        },
      });

      if (student) {
        studentId = student.id;
        student.learningEnrollments.forEach((e) => enrolledProgramIds.add(e.programId));

        // 1. Performance Gaps (< 60% or BEGINNER)
        student.skillProfiles
          .filter((sp) => sp.scorePercentage < 60 || sp.proficiencyLevel === 'BEGINNER')
          .forEach((sp) => {
            studentWeakSkills.add(sp.skillId);
            allGapSkillIds.add(sp.skillId);
          });

        // 2. Market Demand Gaps from active opportunities
        const studentExistingSkillIds = new Set(student.skillProfiles.map((s) => s.skillId));
        const publishedOpportunities = await prisma.opportunity.findMany({
          where: { isPublished: true },
          include: { skills: true },
        });

        for (const opp of publishedOpportunities) {
          for (const os of opp.skills) {
            if (!studentExistingSkillIds.has(os.skillId)) {
              studentMarketGapSkills.add(os.skillId);
              allGapSkillIds.add(os.skillId);
            }
          }
        }
      }
    }

    // If filtering strictly for recommended / gap-addressing programs
    const isRecommendedFilter =
      recommendations === 'true' ||
      onlyGaps === 'true' ||
      (type && typeof type === 'string' && type.toUpperCase() === 'RECOMMENDED');

    if (isRecommendedFilter && allGapSkillIds.size > 0) {
      whereClause.skills = {
        some: {
          skillId: { in: Array.from(allGapSkillIds) },
        },
      };
    }

    const programs = await prisma.learningProgram.findMany({
      where: whereClause,
      include: {
        skills: {
          include: {
            skill: {
              include: { category: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const enhanced = await Promise.all(
      programs.map(async (p) => {
        const gapSkillsCovered = p.skills
          .filter((s) => allGapSkillIds.has(s.skillId))
          .map((s) => s.skill.name);

        const addressesGap = gapSkillsCovered.length > 0;
        const isEnrolled = enrolledProgramIds.has(p.id);
        let matchResult = null;

        if (studentId) {
          matchResult = await calculateLearningProgramMatch(studentId, p.id);
        }

        return {
          ...p,
          addressesGap,
          gapSkillsCovered,
          isEnrolled,
          matchResult,
        };
      })
    );

    // If student, sort by match percentage / relevance descending
    if (studentId) {
      enhanced.sort(
        (a, b) =>
          (b.matchResult?.matchPercentage || 0) - (a.matchResult?.matchPercentage || 0) ||
          b.gapSkillsCovered.length - a.gapSkillsCovered.length
      );
    }

    res.json(enhanced);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch learning programs.' });
  }
};

// Single Learning Program Details
export const getLearningProgramById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const program = await prisma.learningProgram.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: {
              include: { category: true },
            },
          },
        },
        _count: { select: { enrollments: true } },
      },
    });

    if (!program) {
      res.status(404).json({ message: 'Learning program not found.' });
      return;
    }

    let isEnrolled = false;
    let enrollment = null;
    let matchResult = null;

    if (req.user?.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (student) {
        matchResult = await calculateLearningProgramMatch(student.id, program.id);
        enrollment = await prisma.learningEnrollment.findUnique({
          where: {
            studentId_programId: {
              studentId: student.id,
              programId: program.id,
            },
          },
        });
        isEnrolled = !!enrollment;
      }
    }

    res.json({
      ...program,
      isEnrolled,
      enrollment,
      matchResult,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch program details.' });
  }
};

// Create Learning Program (Industry / Institution / Academician)
export const createLearningProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, type, description, duration, url, mode, price, startDate, skillIds } = req.body;

    if (!title || !type || !description) {
      res.status(400).json({ message: 'Title, program type, and description are required.' });
      return;
    }

    const normalizedType = type.toUpperCase().trim();
    if (!VALID_PROGRAM_TYPES.includes(normalizedType)) {
      res.status(400).json({
        message: `Invalid program type. Must be one of: ${VALID_PROGRAM_TYPES.join(', ')}`,
      });
      return;
    }

    const program = await prisma.$transaction(async (tx) => {
      const created = await tx.learningProgram.create({
        data: {
          providerId: req.user!.id,
          providerRole: req.user!.role,
          title: title.trim(),
          type: normalizedType,
          description: description.trim(),
          duration,
          url,
          mode: mode ? mode.toUpperCase() : 'ONLINE',
          price: price || 'Free',
          startDate,
          isPublished: true,
        },
      });

      if (Array.isArray(skillIds) && skillIds.length > 0) {
        for (const s of skillIds) {
          const sId = typeof s === 'string' ? s : s.skillId;
          if (sId) {
            await tx.learningProgramSkill.create({
              data: {
                programId: created.id,
                skillId: sId,
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'LEARNING_PROGRAM_CREATED',
          entityType: 'LearningProgram',
          entityId: created.id,
          details: JSON.stringify({ title: created.title, type: created.type }),
        },
      });

      return created;
    });

    const fullProgram = await prisma.learningProgram.findUnique({
      where: { id: program.id },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { enrollments: true } },
      },
    });

    res.status(201).json(fullProgram);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create learning program.' });
  }
};

// Update Learning Program
export const updateLearningProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { title, type, description, duration, url, mode, price, startDate, isPublished, skillIds } = req.body;

    const existing = await prisma.learningProgram.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Learning program not found.' });
      return;
    }

    if (existing.providerId !== req.user!.id && req.user!.role !== 'INSTITUTION') {
      res.status(403).json({ message: 'Unauthorized to modify this learning program.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const prog = await tx.learningProgram.update({
        where: { id },
        data: {
          title: title !== undefined ? title.trim() : undefined,
          type: type !== undefined ? type.toUpperCase().trim() : undefined,
          description: description !== undefined ? description.trim() : undefined,
          duration: duration !== undefined ? duration : undefined,
          url: url !== undefined ? url : undefined,
          mode: mode !== undefined ? mode.toUpperCase() : undefined,
          price: price !== undefined ? price : undefined,
          startDate: startDate !== undefined ? startDate : undefined,
          isPublished: isPublished !== undefined ? Boolean(isPublished) : undefined,
        },
      });

      if (Array.isArray(skillIds)) {
        await tx.learningProgramSkill.deleteMany({ where: { programId: id } });
        for (const s of skillIds) {
          const sId = typeof s === 'string' ? s : s.skillId;
          if (sId) {
            await tx.learningProgramSkill.create({
              data: {
                programId: id,
                skillId: sId,
              },
            });
          }
        }
      }

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'LEARNING_PROGRAM_UPDATED',
          entityType: 'LearningProgram',
          entityId: id,
          details: JSON.stringify({ title: prog.title }),
        },
      });

      return prog;
    });

    const fullProgram = await prisma.learningProgram.findUnique({
      where: { id: updated.id },
      include: {
        skills: { include: { skill: true } },
        _count: { select: { enrollments: true } },
      },
    });

    res.json(fullProgram);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update learning program.' });
  }
};

// Delete Learning Program
export const deleteLearningProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const existing = await prisma.learningProgram.findUnique({ where: { id } });
    if (!existing) {
      res.status(404).json({ message: 'Learning program not found.' });
      return;
    }

    if (existing.providerId !== req.user!.id && req.user!.role !== 'INSTITUTION') {
      res.status(403).json({ message: 'Unauthorized to delete this learning program.' });
      return;
    }

    await prisma.learningProgram.delete({ where: { id } });
    res.json({ message: 'Learning program successfully deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete learning program.' });
  }
};

// Toggle Publish / Unpublish
export const togglePublishProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.learningProgram.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: 'Learning program not found.' });
      return;
    }

    if (existing.providerId !== req.user!.id && req.user!.role !== 'INSTITUTION') {
      res.status(403).json({ message: 'Unauthorized.' });
      return;
    }

    const updated = await prisma.learningProgram.update({
      where: { id },
      data: { isPublished: !existing.isPublished },
    });

    res.json({ message: `Program ${updated.isPublished ? 'published' : 'unpublished'}.`, program: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to toggle publish state.' });
  }
};

// Get My Created Learning Programs (Industry / Provider)
export const getMyLearningPrograms = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const programs = await prisma.learningProgram.findMany({
      where: { providerId: req.user!.id },
      include: {
        skills: { include: { skill: true } },
        enrollments: {
          include: {
            student: {
              select: { id: true, fullName: true, degree: true, department: true, cgpa: true },
            },
          },
          orderBy: { enrolledAt: 'desc' },
        },
        _count: { select: { enrollments: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(programs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch your learning programs.' });
  }
};

// Student Registration / Enrollment
export const enrollInProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const programId = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const program = await prisma.learningProgram.findUnique({
      where: { id: programId },
    });

    if (!program || !program.isPublished) {
      res.status(404).json({ message: 'Learning program is not available for registration.' });
      return;
    }

    const existing = await prisma.learningEnrollment.findUnique({
      where: {
        studentId_programId: {
          studentId: student.id,
          programId,
        },
      },
    });

    if (existing) {
      res.status(400).json({ message: 'You are already registered for this learning program.' });
      return;
    }

    const enrollment = await prisma.$transaction(async (tx) => {
      const created = await tx.learningEnrollment.create({
        data: {
          studentId: student.id,
          programId,
          status: 'ENROLLED',
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'LEARNING_ENROLLMENT_CREATED',
          entityType: 'LearningEnrollment',
          entityId: created.id,
          details: JSON.stringify({ programId, programTitle: program.title }),
        },
      });

      return created;
    });

    res.status(201).json({ message: 'Registered for learning program successfully.', enrollment });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to register for learning program.' });
  }
};

// Student's Registered Programs
export const getMyEnrollments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const enrollments = await prisma.learningEnrollment.findMany({
      where: { studentId: student.id },
      include: {
        program: {
          include: {
            skills: { include: { skill: true } },
          },
        },
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch enrollments.' });
  }
};
