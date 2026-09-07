import { sendNotification } from './notificationController';
import { Response } from 'express';
import crypto from 'crypto';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

// Helper: Resolve provider details from User ID and Role
const getProviderDetails = async (userId: string, role: string) => {
  if (role === 'ACADEMICIAN') {
    const profile = await prisma.academicianProfile.findUnique({ where: { userId } });
    return {
      name: profile?.fullName || 'Academician Faculty',
      institution: profile?.institutionName,
      department: profile?.department,
    };
  } else if (role === 'INSTITUTION') {
    const profile = await prisma.institutionProfile.findUnique({ where: { userId } });
    return {
      name: profile?.institutionName || 'Educational Institution',
      institution: profile?.institutionName,
      department: profile?.institutionType,
    };
  } else if (role === 'INDUSTRY') {
    const profile = await prisma.industryProfile.findUnique({ where: { userId } });
    return {
      name: profile?.companyName || 'Industry Partner',
      institution: profile?.industrySector,
      department: profile?.location,
    };
  }
  return { name: 'Course Provider', institution: undefined, department: undefined };
};

// 1. Browse Published Courses (Public / Student with Live Filters)
export const getCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { search, providerRole, category, skillLevel, mode, skillId } = req.query;

    const whereClause: any = {
      status: 'PUBLISHED',
    };

    if (providerRole && typeof providerRole === 'string' && providerRole !== 'ALL') {
      whereClause.providerRole = providerRole.toUpperCase();
    }

    if (category && typeof category === 'string' && category !== 'ALL') {
      whereClause.category = { equals: category, mode: 'insensitive' };
    }

    if (skillLevel && typeof skillLevel === 'string' && skillLevel !== 'ALL') {
      whereClause.skillLevel = skillLevel.toUpperCase();
    }

    if (mode && typeof mode === 'string' && mode !== 'ALL') {
      whereClause.mode = mode.toUpperCase();
    }

    if (skillId && typeof skillId === 'string' && skillId !== 'ALL') {
      whereClause.skills = {
        some: { skillId },
      };
    }

    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { providerName: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } },
        {
          skills: {
            some: {
              skill: { name: { contains: q, mode: 'insensitive' } },
            },
          },
        },
      ];
    }

    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
        skills: {
          include: {
            skill: {
              include: { category: true },
            },
          },
        },
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
        },
        _count: {
          select: {
            enrollments: true,
            modules: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If user is a student, attach enrollment status
    let studentEnrollments: Map<string, any> = new Map();
    if (req.user && req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (student) {
        const enrollments = await prisma.courseEnrollment.findMany({
          where: { studentId: student.id },
        });
        for (const enr of enrollments) {
          studentEnrollments.set(enr.courseId, enr);
        }
      }
    }

    const formatted = courses.map((course) => {
      let totalLessons = 0;
      for (const m of course.modules) {
        totalLessons += m.lessons.length;
      }

      const enr = studentEnrollments.get(course.id);

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        providerId: course.providerId,
        providerRole: course.providerRole,
        providerName: course.providerName,
        category: course.category,
        skillLevel: course.skillLevel,
        duration: course.duration,
        mode: course.mode,
        prerequisites: course.prerequisites,
        learningOutcomes: course.learningOutcomes,
        startDate: course.startDate,
        endDate: course.endDate,
        enrollmentDeadline: course.enrollmentDeadline,
        maxParticipants: course.maxParticipants,
        certificateAvailable: course.certificateAvailable,
        status: course.status,
        thumbnailUrl: course.thumbnailUrl,
        materialsUrl: course.materialsUrl,
        skills: course.skills.map((s) => s.skill),
        totalModules: course._count.modules,
        totalLessons,
        enrollmentCount: course._count.enrollments,
        createdAt: course.createdAt,
        isEnrolled: Boolean(enr),
        enrollmentProgress: enr?.progressPercentage || 0,
        enrollmentStatus: enr?.status || null,
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch courses.' });
  }
};

// 2. Get Course By ID (Comprehensive Detail)
export const getCourseById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const course: any = await prisma.course.findUnique({
      where: { id },
      include: {
        skills: {
          include: {
            skill: {
              include: { category: true },
            },
          },
        },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
        _count: {
          select: { enrollments: true },
        },
      },
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    let enrollment: any = null;
    let completedLessonIds: string[] = [];

    if (req.user && req.user.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (student) {
        const enr: any = await prisma.courseEnrollment.findUnique({
          where: {
            studentId_courseId: {
              studentId: student.id,
              courseId: id,
            },
          },
          include: {
            lessonProgress: true,
            certificate: true,
          },
        });

        if (enr) {
          enrollment = {
            id: enr.id,
            status: enr.status,
            progressPercentage: enr.progressPercentage,
            enrolledAt: enr.enrolledAt,
            completedAt: enr.completedAt,
            certificateStatus: enr.certificateStatus,
            certificate: enr.certificate,
          };
          completedLessonIds = (enr.lessonProgress || [])
            .filter((p: any) => p.isCompleted)
            .map((p: any) => p.lessonId);
        }
      }
    }

    res.json({
      ...course,
      skills: (course.skills || []).map((s: any) => s.skill),
      enrollmentCount: course._count?.enrollments || 0,
      enrollment,
      completedLessonIds,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch course detail.' });
  }
};

// 3. Create Course (Provider: ACADEMICIAN, INSTITUTION, INDUSTRY)
export const createCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      title,
      description,
      category,
      skillLevel,
      duration,
      durationHours,
      mode,
      prerequisites,
      learningOutcomes,
      startDate,
      endDate,
      enrollmentDeadline,
      maxParticipants,
      certificateAvailable,
      status,
      thumbnailUrl,
      materialsUrl,
      skillIds,
      skillsTaught,
    } = req.body;

    const resolvedDuration =
      (duration && String(duration).trim()) ||
      (durationHours ? `${durationHours} Hours` : null);

    if (!title || !description || !category || !resolvedDuration) {
      res.status(400).json({ message: 'Title, description, category, and duration are required.' });
      return;
    }

    const providerRole = req.user!.role;
    const providerDetails = await getProviderDetails(req.user!.id, providerRole);

    const validStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'COMPLETED'];
    const courseStatus = status && validStatuses.includes(status) ? status : 'PUBLISHED';

    const resolvedOutcomes = Array.isArray(learningOutcomes)
      ? learningOutcomes.join('\n')
      : learningOutcomes || null;

    // Collect skill IDs
    const resolvedSkillIds: string[] = [];
    if (Array.isArray(skillIds)) {
      for (const s of skillIds) {
        if (typeof s === 'string') resolvedSkillIds.push(s);
      }
    }
    if (Array.isArray(skillsTaught)) {
      for (const st of skillsTaught) {
        const found = await prisma.skill.findFirst({
          where: { name: { equals: st, mode: 'insensitive' } },
        });
        if (found && !resolvedSkillIds.includes(found.id)) {
          resolvedSkillIds.push(found.id);
        }
      }
    }

    const course = await prisma.$transaction(async (tx) => {
      const created = await tx.course.create({
        data: {
          title: title.trim(),
          description: description.trim(),
          providerId: req.user!.id,
          providerRole,
          providerName: providerDetails.name,
          category: category.trim(),
          skillLevel: skillLevel || 'ALL_LEVELS',
          duration: resolvedDuration,
          mode: mode || 'ONLINE',
          prerequisites: prerequisites || null,
          learningOutcomes: resolvedOutcomes,
          startDate: startDate || null,
          endDate: endDate || null,
          enrollmentDeadline: enrollmentDeadline || null,
          maxParticipants: maxParticipants ? parseInt(maxParticipants, 10) : null,
          certificateAvailable: certificateAvailable !== undefined ? Boolean(certificateAvailable) : true,
          status: courseStatus,
          thumbnailUrl: thumbnailUrl || null,
          materialsUrl: materialsUrl || null,
        },
      });

      for (const skillId of resolvedSkillIds) {
        await tx.courseSkill.create({
          data: {
            courseId: created.id,
            skillId,
          },
        });
      }

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'COURSE_CREATED',
          entityType: 'Course',
          entityId: created.id,
          details: JSON.stringify({ title, status: courseStatus, providerRole }),
        },
      });

      return created;
    });

    res.status(201).json({ message: 'Course created successfully.', course });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create course.' });
  }
};

// 4. Update Course (Provider Only)
export const updateCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const {
      title,
      description,
      category,
      skillLevel,
      duration,
      mode,
      prerequisites,
      learningOutcomes,
      startDate,
      endDate,
      enrollmentDeadline,
      maxParticipants,
      certificateAvailable,
      thumbnailUrl,
      materialsUrl,
      skillIds,
    } = req.body;

    const existing = await prisma.course.findUnique({ where: { id } });
    if (!existing || existing.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to modify this course.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const course = await tx.course.update({
        where: { id },
        data: {
          title: title !== undefined ? title.trim() : existing.title,
          description: description !== undefined ? description.trim() : existing.description,
          category: category !== undefined ? category.trim() : existing.category,
          skillLevel: skillLevel !== undefined ? skillLevel : existing.skillLevel,
          duration: duration !== undefined ? duration.trim() : existing.duration,
          mode: mode !== undefined ? mode : existing.mode,
          prerequisites: prerequisites !== undefined ? prerequisites : existing.prerequisites,
          learningOutcomes: learningOutcomes !== undefined ? learningOutcomes : existing.learningOutcomes,
          startDate: startDate !== undefined ? startDate : existing.startDate,
          endDate: endDate !== undefined ? endDate : existing.endDate,
          enrollmentDeadline: enrollmentDeadline !== undefined ? enrollmentDeadline : existing.enrollmentDeadline,
          maxParticipants: maxParticipants !== undefined ? parseInt(maxParticipants, 10) : existing.maxParticipants,
          certificateAvailable: certificateAvailable !== undefined ? Boolean(certificateAvailable) : existing.certificateAvailable,
          thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : existing.thumbnailUrl,
          materialsUrl: materialsUrl !== undefined ? materialsUrl : existing.materialsUrl,
        },
      });

      if (Array.isArray(skillIds)) {
        await tx.courseSkill.deleteMany({ where: { courseId: id } });
        for (const skillId of skillIds) {
          await tx.courseSkill.create({
            data: { courseId: id, skillId },
          });
        }
      }

      return course;
    });

    res.json({ message: 'Course updated successfully.', course: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update course.' });
  }
};

// 5. Update Course Status (Publish / Unpublish / Close / Complete)
export const updateCourseStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    const validStatuses = ['DRAFT', 'PUBLISHED', 'CLOSED', 'COMPLETED'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to update this course status.' });
      return;
    }

    const updated = await prisma.course.update({
      where: { id },
      data: { status },
    });

    res.json({ message: `Course status changed to ${status}.`, course: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update course status.' });
  }
};

// 6. Delete Course
export const deleteCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to delete this course.' });
      return;
    }

    await prisma.course.delete({ where: { id } });
    res.json({ message: 'Course deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete course.' });
  }
};

// 7. Provider's Created Courses Dashboard
export const getMyCreatedCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const courses = await prisma.course.findMany({
      where: { providerId: req.user!.id },
      include: {
        skills: {
          include: { skill: true },
        },
        modules: {
          include: {
            lessons: { select: { id: true } },
          },
        },
        enrollments: {
          include: {
            student: true,
            certificate: true,
          },
        },
        _count: {
          select: {
            enrollments: true,
            certificates: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = courses.map((course) => {
      let totalLessons = 0;
      for (const m of course.modules) {
        totalLessons += m.lessons.length;
      }

      const completedCount = course.enrollments.filter((e) => e.status === 'COMPLETED').length;
      const inProgressCount = course.enrollments.filter((e) => e.status === 'IN_PROGRESS' || (e.status === 'ENROLLED' && e.progressPercentage > 0)).length;
      const verifiedCertificatesCount = course.enrollments.filter((e) => e.certificate?.verificationStatus === 'VERIFIED').length;
      const pendingCertificatesCount = course.enrollments.filter((e) => e.certificate?.verificationStatus === 'PENDING').length;

      return {
        ...course,
        skills: course.skills.map((s) => s.skill),
        totalModules: course.modules.length,
        totalLessons,
        stats: {
          totalEnrolled: course._count.enrollments,
          completedCount,
          inProgressCount,
          verifiedCertificatesCount,
          pendingCertificatesCount,
        },
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch created courses.' });
  }
};

// 8. Module Management (Add / Update / Delete)
export const addModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId
    const { title, description, orderIndex } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Module title is required.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to modify curriculum for this course.' });
      return;
    }

    const count = await prisma.courseModule.count({ where: { courseId: id } });

    const newModule = await prisma.courseModule.create({
      data: {
        courseId: id,
        title: title.trim(),
        description: description || null,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : count + 1,
      },
      include: { lessons: true },
    });

    res.status(201).json({ message: 'Module added.', module: newModule });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add module.' });
  }
};

export const updateModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const moduleId = req.params.moduleId as string;
    const { title, description, orderIndex } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to modify this module.' });
      return;
    }

    const updated = await prisma.courseModule.update({
      where: { id: moduleId },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description : undefined,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : undefined,
      },
    });

    res.json({ message: 'Module updated.', module: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update module.' });
  }
};

export const deleteModule = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const moduleId = req.params.moduleId as string;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to delete this module.' });
      return;
    }

    await prisma.courseModule.delete({ where: { id: moduleId } });
    res.json({ message: 'Module deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete module.' });
  }
};

// 9. Lesson Management (Add / Update / Delete)
export const addLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const moduleId = req.params.moduleId as string;
    const { title, content, videoUrl, durationMinutes, orderIndex } = req.body;

    if (!title) {
      res.status(400).json({ message: 'Lesson title is required.' });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to modify curriculum for this course.' });
      return;
    }

    const count = await prisma.courseLesson.count({ where: { moduleId } });

    const lesson = await prisma.courseLesson.create({
      data: {
        moduleId,
        title: title.trim(),
        content: content || null,
        videoUrl: videoUrl || null,
        durationMinutes: durationMinutes ? parseInt(durationMinutes, 10) : null,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : count + 1,
      },
    });

    res.status(201).json({ message: 'Lesson added.', lesson });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add lesson.' });
  }
};

export const updateLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const lessonId = req.params.lessonId as string;
    const { title, content, videoUrl, durationMinutes, orderIndex } = req.body;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to modify this lesson.' });
      return;
    }

    const updated = await prisma.courseLesson.update({
      where: { id: lessonId },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        content: content !== undefined ? content : undefined,
        videoUrl: videoUrl !== undefined ? videoUrl : undefined,
        durationMinutes: durationMinutes !== undefined ? parseInt(durationMinutes, 10) : undefined,
        orderIndex: orderIndex !== undefined ? parseInt(orderIndex, 10) : undefined,
      },
    });

    res.json({ message: 'Lesson updated.', lesson: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update lesson.' });
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const lessonId = req.params.lessonId as string;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to delete this lesson.' });
      return;
    }

    await prisma.courseLesson.delete({ where: { id: lessonId } });
    res.json({ message: 'Lesson deleted.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete lesson.' });
  }
};

// 10. Student: Enroll in Course
export const enrollInCourse = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const course: any = await prisma.course.findUnique({
      where: { id },
      include: { _count: { select: { enrollments: true } } },
    });

    if (!course || course.status !== 'PUBLISHED') {
      res.status(400).json({ message: 'Course is not currently open for enrollment.' });
      return;
    }

    if (course.maxParticipants && course._count?.enrollments >= course.maxParticipants) {
      res.status(400).json({ message: 'Course capacity has been reached.' });
      return;
    }

    const existing = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: id,
        },
      },
    });

    if (existing) {
      res.status(400).json({ message: 'You are already enrolled in this course.' });
      return;
    }

    const enrollment = await prisma.courseEnrollment.create({
      data: {
        studentId: student.id,
        courseId: id,
        status: 'ENROLLED',
        progressPercentage: 0,
      },
      include: { course: true },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'COURSE_ENROLLED',
        entityType: 'CourseEnrollment',
        entityId: enrollment.id,
        details: JSON.stringify({ courseId: id, courseTitle: course.title }),
      },
    });

    res.status(201).json({ message: 'Successfully enrolled in course.', enrollment });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to enroll in course.' });
  }
};

// 11. Student: My Enrolled Courses
export const getMyEnrolledCourses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { studentId: student.id },
      include: {
        course: {
          include: {
            skills: { include: { skill: true } },
            modules: {
              include: {
                lessons: { select: { id: true } },
              },
            },
          },
        },
        certificate: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });

    const formatted = enrollments.map((enr) => {
      let totalLessons = 0;
      for (const m of enr.course.modules) {
        totalLessons += m.lessons.length;
      }

      return {
        enrollmentId: enr.id,
        enrolledAt: enr.enrolledAt,
        completedAt: enr.completedAt,
        progressPercentage: enr.progressPercentage,
        status: enr.status,
        certificateStatus: enr.certificateStatus,
        certificate: enr.certificate,
        course: {
          id: enr.course.id,
          title: enr.course.title,
          description: enr.course.description,
          providerName: enr.course.providerName,
          providerRole: enr.course.providerRole,
          category: enr.course.category,
          skillLevel: enr.course.skillLevel,
          duration: enr.course.duration,
          mode: enr.course.mode,
          thumbnailUrl: enr.course.thumbnailUrl,
          skills: enr.course.skills.map((s) => s.skill),
          totalModules: enr.course.modules.length,
          totalLessons,
        },
      };
    });

    res.json(formatted);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch enrolled courses.' });
  }
};

// 12. Student: Interactive Study Room
export const getCourseStudyRoom = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const enrollment: any = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: id,
        },
      },
      include: {
        lessonProgress: true,
        certificate: true,
      },
    });

    if (!enrollment) {
      res.status(403).json({ message: 'You are not enrolled in this course.' });
      return;
    }

    const course: any = await prisma.course.findUnique({
      where: { id },
      include: {
        skills: { include: { skill: true } },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            lessons: {
              orderBy: { orderIndex: 'asc' },
            },
          },
        },
      },
    });

    if (!course) {
      res.status(404).json({ message: 'Course not found.' });
      return;
    }

    const progressMap = new Map<string, boolean>();
    if (enrollment.lessonProgress) {
      for (const p of enrollment.lessonProgress) {
        progressMap.set(p.lessonId, p.isCompleted);
      }
    }

    let totalLessons = 0;
    let completedLessons = 0;

    const modulesWithProgress = (course.modules || []).map((m: any) => {
      const lessonsWithProgress = (m.lessons || []).map((l: any) => {
        totalLessons++;
        const isCompleted = Boolean(progressMap.get(l.id));
        if (isCompleted) completedLessons++;
        return {
          ...l,
          isCompleted,
        };
      });
      return {
        ...m,
        lessons: lessonsWithProgress,
      };
    });

    res.json({
      course: {
        ...course,
        modules: modulesWithProgress,
        skills: (course.skills || []).map((s: any) => s.skill),
      },
      enrollment: {
        id: enrollment.id,
        progressPercentage: enrollment.progressPercentage,
        status: enrollment.status,
        enrolledAt: enrollment.enrolledAt,
        completedAt: enrollment.completedAt,
        certificateStatus: enrollment.certificateStatus,
        certificate: enrollment.certificate,
      },
      stats: {
        totalLessons,
        completedLessons,
        progressPercentage: totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0,
      },
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch study room.' });
  }
};

// 13. Student: Mark Lesson Complete / Incomplete (Recalculates Progress %)
export const toggleLessonProgress = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const lessonId = req.params.lessonId as string;
    const { isCompleted } = req.body; // boolean

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: id,
        },
      },
    });

    if (!enrollment) {
      res.status(403).json({ message: 'You are not enrolled in this course.' });
      return;
    }

    // Toggle or set lesson progress
    const markCompleted = isCompleted !== undefined ? Boolean(isCompleted) : true;

    await prisma.courseLessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId: enrollment.id,
          lessonId,
        },
      },
      create: {
        enrollmentId: enrollment.id,
        lessonId,
        isCompleted: markCompleted,
        completedAt: markCompleted ? new Date() : null,
      },
      update: {
        isCompleted: markCompleted,
        completedAt: markCompleted ? new Date() : null,
      },
    });

    // Recalculate overall progress
    const allCourseLessons = await prisma.courseLesson.findMany({
      where: {
        module: { courseId: id },
      },
      select: { id: true },
    });

    const totalLessons = allCourseLessons.length;
    const completedRecords = await prisma.courseLessonProgress.count({
      where: {
        enrollmentId: enrollment.id,
        isCompleted: true,
        lessonId: { in: allCourseLessons.map((l) => l.id) },
      },
    });

    const progressPercentage = totalLessons > 0 ? Math.round((completedRecords / totalLessons) * 100) : 0;
    const isFinished = progressPercentage === 100 && totalLessons > 0;

    const updatedEnrollment = await prisma.courseEnrollment.update({
      where: { id: enrollment.id },
      data: {
        progressPercentage,
        status: isFinished ? 'COMPLETED' : progressPercentage > 0 ? 'IN_PROGRESS' : 'ENROLLED',
        completedAt: isFinished ? new Date() : null,
      },
    });

    res.json({
      message: markCompleted ? 'Lesson marked as completed.' : 'Lesson marked as incomplete.',
      progressPercentage,
      completedLessons: completedRecords,
      totalLessons,
      isCompleted: isFinished,
      enrollment: updatedEnrollment,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update lesson progress.' });
  }
};

// 14. Student: Request Certificate (Upon 100% completion)
export const requestCourseCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const enrollment: any = await prisma.courseEnrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: student.id,
          courseId: id,
        },
      },
      include: {
        course: true,
        certificate: true,
      },
    });

    if (!enrollment) {
      res.status(403).json({ message: 'Enrollment record not found.' });
      return;
    }

    if (enrollment.progressPercentage < 100) {
      res.status(400).json({
        message: `You have completed ${enrollment.progressPercentage}% of this course. All lessons must be completed to claim a certificate.`,
      });
      return;
    }

    if (enrollment.certificate) {
      res.json({
        message: 'Certificate already issued/requested.',
        certificate: enrollment.certificate,
      });
      return;
    }

    const cryptoModule = await import('crypto');
    const certificateCode = `SB-CERT-${cryptoModule.randomBytes(4).toString('hex').toUpperCase()}-${new Date().getFullYear()}`;

    const cert = await prisma.$transaction(async (tx: any) => {
      const createdCert = await tx.courseCertificate.create({
        data: {
          enrollmentId: enrollment.id,
          studentId: student.id,
          courseId: id,
          certificateCode,
          studentName: student.fullName,
          courseTitle: enrollment.course?.title || 'Course',
          providerName: enrollment.course?.providerName || 'Provider',
          issueDate: new Date(),
          verificationStatus: 'PENDING',
        },
      });

      await tx.courseEnrollment.update({
        where: { id: enrollment.id },
        data: { certificateStatus: 'PENDING' },
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'CERTIFICATE_REQUESTED',
          entityType: 'CourseCertificate',
          entityId: createdCert.id,
          details: JSON.stringify({ certificateCode, courseId: id }),
        },
      });

      return createdCert;
    });

    res.status(201).json({
      message: 'Certificate request generated and sent for provider verification.',
      certificate: cert,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to request certificate.' });
  }
};

// 15. Provider: View Enrolled Participants & Stats
export const getCourseParticipants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const course = await prisma.course.findUnique({ where: { id } });
    if (!course || course.providerId !== req.user!.id) {
      res.status(403).json({ message: 'Unauthorized to view participants for this course.' });
      return;
    }

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { courseId: id },
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            institutionName: true,
            department: true,
            degree: true,
            cgpa: true,
          },
        },
        certificate: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });

    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch course participants.' });
  }
};

// 16. Provider / Institution: Verify & Approve Certificate
export const approveCourseCertificate = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // courseId
    const certId = req.params.certId as string; // certId
    const { status, remarks } = req.body; // VERIFIED, REJECTED

    const validStatuses = ['VERIFIED', 'REJECTED', 'PENDING'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ message: `Status must be one of: ${validStatuses.join(', ')}` });
      return;
    }

    const course = await prisma.course.findUnique({ where: { id } });
    // Check if creator or institution authority
    if (!course || (course.providerId !== req.user!.id && req.user!.role !== 'INSTITUTION')) {
      res.status(403).json({ message: 'Unauthorized to verify certificates for this course.' });
      return;
    }

    const cert = await prisma.courseCertificate.findUnique({ where: { id: certId } });
    if (!cert || cert.courseId !== id) {
      res.status(404).json({ message: 'Certificate not found.' });
      return;
    }

    const updated = await prisma.$transaction(async (tx: any) => {
      const updatedCert = await tx.courseCertificate.update({
        where: { id: certId },
        data: {
          verificationStatus: status,
          verifiedById: req.user!.id,
          verifiedAt: status === 'VERIFIED' ? new Date() : null,
          remarks: remarks || null,
        },
      });

      await tx.courseEnrollment.update({
        where: { id: cert.enrollmentId },
        data: {
          certificateStatus: status === 'VERIFIED' ? 'ISSUED' : status,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: req.user!.id,
          action: 'CERTIFICATE_VERIFIED',
          entityType: 'CourseCertificate',
          entityId: certId,
          details: JSON.stringify({ status, certificateCode: cert.certificateCode }),
        },
      });

      return updatedCert;
    });

    res.json({ message: `Certificate ${status.toLowerCase()} successfully.`, certificate: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve certificate.' });
  }
};

// 17. MOST IMPORTANT: Course Recommendations based on Student Skill Gaps
export const getCourseRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        skillProfiles: {
          include: { skill: true },
        },
        courseEnrollments: { select: { courseId: true } },
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    // 1. Identify student's assessed skill scores and gaps
    const existingSkillScores = new Map<string, number>();
    for (const sp of student.skillProfiles) {
      existingSkillScores.set(sp.skillId, sp.scorePercentage);
    }

    // Gaps: skills where score < 60%
    const weakSkillIds = new Set<string>();
    for (const sp of student.skillProfiles) {
      if (sp.scorePercentage < 60) {
        weakSkillIds.add(sp.skillId);
      }
    }

    // Also identify high-demand skills missing from student's profile
    const publishedOpportunities = await prisma.opportunity.findMany({
      where: { isPublished: true },
      include: {
        skills: { include: { skill: true } },
      },
      take: 25,
    });

    const missingDemandedSkillIds = new Set<string>();
    const skillNameMap = new Map<string, string>();

    for (const sp of student.skillProfiles) {
      skillNameMap.set(sp.skillId, sp.skill.name);
    }

    for (const opp of publishedOpportunities) {
      for (const os of opp.skills) {
        skillNameMap.set(os.skillId, os.skill.name);
        if (!existingSkillScores.has(os.skillId)) {
          missingDemandedSkillIds.add(os.skillId);
        }
      }
    }

    const allGapSkillIds = new Set([...Array.from(weakSkillIds), ...Array.from(missingDemandedSkillIds)]);

    // Exclude already enrolled courses
    const enrolledCourseIds = new Set(student.courseEnrollments.map((e) => e.courseId));

    // 2. Fetch published courses
    const publishedCourses = await prisma.course.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: Array.from(enrolledCourseIds) },
      },
      include: {
        skills: {
          include: { skill: true },
        },
        _count: { select: { enrollments: true, modules: true } },
      },
    });

    if (publishedCourses.length === 0) {
      res.json({
        recommendations: [],
        totalGapsIdentified: allGapSkillIds.size,
        message: 'No courses available yet.',
      });
      return;
    }

    // 3. Score courses based on how many student gaps they address
    const recommendations: Array<{
      course: any;
      matchPercentage: number;
      addressedGaps: string[];
      reason: string;
    }> = [];

    for (const course of publishedCourses) {
      const courseSkillIds = course.skills.map((s) => {
        skillNameMap.set(s.skillId, s.skill.name);
        return s.skillId;
      });

      const addressedGapNames: string[] = [];

      for (const sId of courseSkillIds) {
        if (allGapSkillIds.has(sId)) {
          addressedGapNames.push(skillNameMap.get(sId) || 'Target Skill');
        }
      }

      if (addressedGapNames.length > 0) {
        // Match calculation: proportion of course skills that address gaps + bonus for addressing multiple gaps
        const coverageRatio = courseSkillIds.length > 0 ? addressedGapNames.length / courseSkillIds.length : 0;
        const gapRatio = allGapSkillIds.size > 0 ? addressedGapNames.length / allGapSkillIds.size : 1;
        const matchPercentage = Math.min(
          99,
          Math.max(50, Math.round(coverageRatio * 50 + gapRatio * 40 + 10))
        );

        recommendations.push({
          course: {
            id: course.id,
            title: course.title,
            description: course.description,
            providerName: course.providerName,
            providerRole: course.providerRole,
            category: course.category,
            skillLevel: course.skillLevel,
            duration: course.duration,
            mode: course.mode,
            thumbnailUrl: course.thumbnailUrl,
            skills: course.skills.map((s) => s.skill),
            totalModules: course._count.modules,
            enrollmentCount: course._count.enrollments,
          },
          matchPercentage,
          addressedGaps: addressedGapNames,
          reason: `Recommended because this course addresses: ${addressedGapNames.join(', ')}`,
        });
      }
    }

    // Sort by match percentage descending
    recommendations.sort((a, b) => b.matchPercentage - a.matchPercentage);

    res.json({
      recommendations,
      totalGapsIdentified: allGapSkillIds.size,
      identifiedGaps: Array.from(allGapSkillIds).map((id) => skillNameMap.get(id) || id),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to generate recommendations.' });
  }
};
