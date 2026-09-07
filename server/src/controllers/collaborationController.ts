import { sendNotification } from './notificationController';
import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const VALID_COLLABORATION_TYPES = [
  'MENTORSHIP',
  'WORKSHOP',
  'GUEST_LECTURE',
  'LIVE_PROJECT',
  'INNOVATION_CHALLENGE',
  'RESEARCH_PROJECT',
  'RESEARCH', // alias
  'CONSULTANCY',
  'INDUSTRY_VISIT',
  // Legacy / Academician types for backward compatibility
  'FACULTY_INTERNSHIP',
  'INDUSTRIAL_TRAINING',
  'FDP',
];

// Helper to resolve initiator display name and details
export async function resolveInitiatorInfo(initiatorId: string, initiatorRole: string) {
  try {
    if (initiatorRole === 'INDUSTRY') {
      const ind = await prisma.industryProfile.findFirst({
        where: { OR: [{ userId: initiatorId }, { id: initiatorId }] },
      });
      if (ind) {
        return {
          name: ind.companyName,
          sector: ind.industrySector,
          location: ind.location,
          email: ind.officialEmail,
          contactPerson: ind.contactPerson,
          logoUrl: ind.logoUrl,
        };
      }
    } else if (initiatorRole === 'INSTITUTION') {
      const inst = await prisma.institutionProfile.findFirst({
        where: { OR: [{ userId: initiatorId }, { id: initiatorId }] },
      });
      if (inst) {
        return {
          name: inst.institutionName,
          type: inst.institutionType,
          location: inst.address,
          email: inst.officialEmail,
          contactPerson: inst.contactPerson,
          logoUrl: inst.logoUrl,
        };
      }
    } else if (initiatorRole === 'ACADEMICIAN') {
      const acad = await prisma.academicianProfile.findFirst({
        where: { OR: [{ userId: initiatorId }, { id: initiatorId }] },
      });
      if (acad) {
        return {
          name: acad.fullName,
          institution: acad.institutionName,
          department: acad.department,
          designation: acad.designation,
          email: '',
        };
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: initiatorId },
      select: { email: true, role: true },
    });
    return {
      name: user?.email || 'Authorized Partner',
      email: user?.email || '',
      role: user?.role,
    };
  } catch {
    return { name: 'SkillBridge Partner' };
  }
}

// 1. Browse & Search Collaborations (Universal)
export const getCollaborations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, mode, status = 'OPEN', search, initiatorRole } = req.query;

    const where: any = {};

    if (status && status !== 'ALL') {
      where.status = (status as string).toUpperCase();
    }

    if (type && type !== 'ALL') {
      const t = (type as string).toUpperCase();
      if (t === 'RESEARCH' || t === 'RESEARCH_PROJECT') {
        where.type = { in: ['RESEARCH', 'RESEARCH_PROJECT'] };
      } else {
        where.type = t;
      }
    }

    if (mode && mode !== 'ALL') {
      where.mode = (mode as string).toUpperCase();
    }

    if (initiatorRole && initiatorRole !== 'ALL') {
      where.initiatorRole = (initiatorRole as string).toUpperCase();
    }

    if (search) {
      const q = String(search).trim();
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { eligibilityCriteria: { contains: q, mode: 'insensitive' } },
        { targetAudience: { contains: q, mode: 'insensitive' } },
      ];
    }

    const collabs = await prisma.collaboration.findMany({
      where,
      include: {
        applications: {
          select: {
            id: true,
            status: true,
            applicantRole: true,
            academicianId: true,
            studentId: true,
            institutionId: true,
          },
        },
        feedbacks: {
          select: {
            id: true,
            rating: true,
            comments: true,
            userName: true,
            userRole: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Identify current user's profile ID if authenticated
    let userStudentId: string | null = null;
    let userAcademicianId: string | null = null;
    let userInstitutionId: string | null = null;

    if (req.user) {
      if (req.user.role === 'STUDENT') {
        const s = await prisma.studentProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });
        userStudentId = s?.id || null;
      } else if (req.user.role === 'ACADEMICIAN') {
        const a = await prisma.academicianProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });
        userAcademicianId = a?.id || null;
      } else if (req.user.role === 'INSTITUTION') {
        const i = await prisma.institutionProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });
        userInstitutionId = i?.id || null;
      }
    }

    const enriched = await Promise.all(
      collabs.map(async (collab) => {
        const initiatorInfo = await resolveInitiatorInfo(collab.initiatorId, collab.initiatorRole);

        let myApp: any = null;
        if (userStudentId) {
          myApp = collab.applications.find((a) => a.studentId === userStudentId);
        } else if (userAcademicianId) {
          myApp = collab.applications.find((a) => a.academicianId === userAcademicianId);
        } else if (userInstitutionId) {
          myApp = collab.applications.find((a) => a.institutionId === userInstitutionId);
        }

        const avgRating =
          collab.feedbacks.length > 0
            ? Number(
                (
                  collab.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                  collab.feedbacks.length
                ).toFixed(1)
              )
            : null;

        return {
          id: collab.id,
          initiatorId: collab.initiatorId,
          initiatorRole: collab.initiatorRole,
          title: collab.title,
          type: collab.type,
          description: collab.description,
          targetAudience: collab.targetAudience,
          location: collab.location,
          mode: collab.mode,
          duration: collab.duration,
          remunerationOrStipend: collab.remunerationOrStipend,
          eligibilityCriteria: collab.eligibilityCriteria,
          status: collab.status,
          budget: collab.budget,
          startDate: collab.startDate,
          endDate: collab.endDate,
          createdAt: collab.createdAt,
          updatedAt: collab.updatedAt,
          initiatorInfo,
          applicantCount: collab.applications.length,
          averageRating: avgRating,
          feedbackCount: collab.feedbacks.length,
          hasApplied: Boolean(myApp),
          applicationStatus: myApp?.status || null,
          applicationId: myApp?.id || null,
          isInitiator: req.user?.id === collab.initiatorId,
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch collaborations.' });
  }
};

// 2. Get Single Collaboration Details
export const getCollaborationById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const collab = await prisma.collaboration.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                department: true,
                degree: true,
                institutionName: true,
                cgpa: true,
              },
            },
            academician: {
              select: {
                id: true,
                fullName: true,
                institutionName: true,
                department: true,
                designation: true,
                areasOfExpertise: true,
              },
            },
            institution: {
              select: {
                id: true,
                institutionName: true,
                institutionType: true,
                affiliatedUniversity: true,
                address: true,
              },
            },
          },
        },
        feedbacks: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!collab) {
      res.status(404).json({ message: 'Collaboration initiative not found.' });
      return;
    }

    const typedCollab: any = collab;
    const initiatorInfo = await resolveInitiatorInfo(typedCollab.initiatorId, typedCollab.initiatorRole);

    let myApp: any = null;
    if (req.user) {
      if (req.user.role === 'STUDENT') {
        const s = await prisma.studentProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });
        if (s) myApp = (typedCollab.applications || []).find((a: any) => a.studentId === s.id);
      } else if (req.user.role === 'ACADEMICIAN') {
        const a = await prisma.academicianProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });
        if (a) myApp = (typedCollab.applications || []).find((a: any) => a.academicianId === a.id);
      } else if (req.user.role === 'INSTITUTION') {
        const i = await prisma.institutionProfile.findUnique({
          where: { userId: req.user.id },
          select: { id: true },
        });
        if (i) myApp = (typedCollab.applications || []).find((a: any) => a.institutionId === i.id);
      }
    }

    const avgRating =
      (typedCollab.feedbacks || []).length > 0
        ? Number(
            (
              typedCollab.feedbacks.reduce((sum: number, f: any) => sum + f.rating, 0) /
              typedCollab.feedbacks.length
            ).toFixed(1)
          )
        : null;

    res.json({
      ...typedCollab,
      initiatorInfo,
      applicantCount: (typedCollab.applications || []).length,
      averageRating: avgRating,
      hasApplied: Boolean(myApp),
      applicationStatus: myApp?.status || null,
      applicationId: myApp?.id || null,
      myApplication: myApp,
      isInitiator: req.user?.id === typedCollab.initiatorId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch collaboration details.' });
  }
};

// 3. Create Collaboration
export const createCollaboration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowedRoles = ['INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'];
    if (!allowedRoles.includes(req.user!.role)) {
      res.status(403).json({ message: 'You are not authorized to create collaboration initiatives.' });
      return;
    }

    const {
      title,
      type,
      description,
      targetAudience,
      location,
      mode = 'HYBRID',
      duration,
      remunerationOrStipend,
      eligibilityCriteria,
      budget,
      startDate,
      endDate,
    } = req.body;

    if (!title || !type || !description) {
      res.status(400).json({ message: 'Title, type, and description are required.' });
      return;
    }

    const normalizedType = type.toUpperCase();
    if (!VALID_COLLABORATION_TYPES.includes(normalizedType)) {
      res.status(400).json({
        message: `Invalid collaboration type. Must be one of: ${VALID_COLLABORATION_TYPES.join(', ')}`,
      });
      return;
    }

    const collab = await prisma.collaboration.create({
      data: {
        initiatorId: req.user!.id,
        initiatorRole: req.user!.role,
        title,
        type: normalizedType,
        description,
        targetAudience: targetAudience || 'ALL',
        location,
        mode: mode.toUpperCase(),
        duration,
        remunerationOrStipend,
        eligibilityCriteria,
        budget,
        startDate,
        endDate,
        status: 'OPEN',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'CREATE_COLLABORATION',
        entityType: 'Collaboration',
        entityId: collab.id,
        details: JSON.stringify({ title, type: normalizedType, role: req.user!.role }),
      },
    });

    res.status(201).json({
      message: 'Collaboration initiative created successfully.',
      collaboration: collab,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create collaboration.' });
  }
};

// 4. Update Collaboration
export const updateCollaboration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.collaboration.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: 'Collaboration not found.' });
      return;
    }

    if (existing.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the initiator can update this collaboration.' });
      return;
    }

    const {
      title,
      type,
      description,
      targetAudience,
      location,
      mode,
      duration,
      remunerationOrStipend,
      eligibilityCriteria,
      budget,
      startDate,
      endDate,
      status,
    } = req.body;

    const updated = await prisma.collaboration.update({
      where: { id },
      data: {
        title,
        type: type ? type.toUpperCase() : undefined,
        description,
        targetAudience,
        location,
        mode: mode ? mode.toUpperCase() : undefined,
        duration,
        remunerationOrStipend,
        eligibilityCriteria,
        budget,
        startDate,
        endDate,
        status: status ? status.toUpperCase() : undefined,
      },
    });

    res.json({
      message: 'Collaboration updated successfully.',
      collaboration: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update collaboration.' });
  }
};

// 5. Delete Collaboration
export const deleteCollaboration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.collaboration.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: 'Collaboration not found.' });
      return;
    }

    if (existing.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the initiator can delete this collaboration.' });
      return;
    }

    await prisma.collaboration.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_COLLABORATION',
        entityType: 'Collaboration',
        entityId: id,
        details: JSON.stringify({ title: existing.title }),
      },
    });

    res.json({ message: 'Collaboration deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete collaboration.' });
  }
};

// 6. Apply to Collaboration (Universal for Students, Academicians, Institutions)
export const applyToCollaboration = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { proposal } = req.body;

    const collab = await prisma.collaboration.findUnique({ where: { id } });
    if (!collab) {
      res.status(404).json({ message: 'Collaboration initiative not found.' });
      return;
    }

    if (collab.status !== 'OPEN') {
      res.status(400).json({ message: `This initiative is currently ${collab.status.toLowerCase()}.` });
      return;
    }

    let applicantRole = req.user!.role;
    let studentId: string | null = null;
    let academicianId: string | null = null;
    let institutionId: string | null = null;

    if (req.user!.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
      if (!student) {
        res.status(404).json({ message: 'Student profile not found. Please complete your profile.' });
        return;
      }
      studentId = student.id;

      const existing = await prisma.collaborationApplication.findFirst({
        where: { collaborationId: id, studentId: student.id },
      });
      if (existing) {
        res.status(400).json({ message: `You have already applied (Status: ${existing.status}).` });
        return;
      }
    } else if (req.user!.role === 'ACADEMICIAN') {
      const academician = await prisma.academicianProfile.findUnique({ where: { userId: req.user!.id } });
      if (!academician) {
        res.status(404).json({ message: 'Academician profile not found. Please complete your profile.' });
        return;
      }
      academicianId = academician.id;

      const existing = await prisma.collaborationApplication.findFirst({
        where: { collaborationId: id, academicianId: academician.id },
      });
      if (existing) {
        res.status(400).json({ message: `You have already applied (Status: ${existing.status}).` });
        return;
      }
    } else if (req.user!.role === 'INSTITUTION') {
      const institution = await prisma.institutionProfile.findUnique({ where: { userId: req.user!.id } });
      if (!institution) {
        res.status(404).json({ message: 'Institution profile not found.' });
        return;
      }
      institutionId = institution.id;

      const existing = await prisma.collaborationApplication.findFirst({
        where: { collaborationId: id, institutionId: institution.id },
      });
      if (existing) {
        res.status(400).json({ message: `Your institution has already applied (Status: ${existing.status}).` });
        return;
      }
    } else {
      res.status(403).json({ message: 'Industry partners cannot apply to collaboration initiatives.' });
      return;
    }

    const application = await prisma.collaborationApplication.create({
      data: {
        collaborationId: id,
        applicantRole,
        studentId,
        academicianId,
        institutionId,
        proposal,
        status: 'APPLIED',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'APPLY_COLLABORATION',
        entityType: 'CollaborationApplication',
        entityId: application.id,
        details: JSON.stringify({ collaborationId: id, role: applicantRole, title: collab.title }),
      },
    });

    // Notify applicant and initiator
    await sendNotification({
      userId: req.user!.id,
      title: 'Initiative Application Submitted',
      message: `Your application for '${collab.title}' has been submitted successfully.`,
      link: '/student/collaboration',
    });

    await sendNotification({
      userId: collab.initiatorId,
      title: 'New Initiative Application',
      message: `New participant proposal received for '${collab.title}'.`,
      link: '/academician/opportunities',
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit application.' });
  }
};

// 7. Get Applicants for Collaboration (Initiator only)
export const getCollaborationApplicants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const collab = await prisma.collaboration.findUnique({ where: { id } });

    if (!collab) {
      res.status(404).json({ message: 'Collaboration not found.' });
      return;
    }

    if (collab.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the initiator can view applicants.' });
      return;
    }

    const applicants = await prisma.collaborationApplication.findMany({
      where: { collaborationId: id },
      include: {
        student: {
          include: {
            user: { select: { email: true } },
          },
        },
        academician: {
          include: {
            user: { select: { email: true } },
          },
        },
        institution: {
          include: {
            user: { select: { email: true } },
          },
        },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applicants);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch applicants.' });
  }
};

// 8. Accept / Reject Applicant Status (Initiator only)
export const updateApplicantStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // Application ID
    const { status } = req.body;

    const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'WITHDRAWN'];
    const normalizedStatus = status?.toUpperCase();

    if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
      res.status(400).json({
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
      return;
    }

    const application: any = await prisma.collaborationApplication.findUnique({
      where: { id },
      include: { collaboration: true },
    });

    if (!application) {
      res.status(404).json({ message: 'Application not found.' });
      return;
    }

    if (application.collaboration?.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the initiator can update applicant status.' });
      return;
    }

    const updated = await prisma.collaborationApplication.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_COLLABORATION_APPLICATION_STATUS',
        entityType: 'CollaborationApplication',
        entityId: id,
        details: JSON.stringify({ status: normalizedStatus, collaborationId: application.collaborationId }),
      },
    });

    // Find target applicant userId to notify
    let applicantUserId: string | null = null;
    if (application.studentId) {
      const st = await prisma.studentProfile.findUnique({ where: { id: application.studentId }, select: { userId: true } });
      applicantUserId = st?.userId || null;
    } else if (application.academicianId) {
      const ac = await prisma.academicianProfile.findUnique({ where: { id: application.academicianId }, select: { userId: true } });
      applicantUserId = ac?.userId || null;
    } else if (application.institutionId) {
      const ins = await prisma.institutionProfile.findUnique({ where: { id: application.institutionId }, select: { userId: true } });
      applicantUserId = ins?.userId || null;
    }

    if (applicantUserId) {
      await sendNotification({
        userId: applicantUserId,
        title: `Participation Status: ${normalizedStatus}`,
        message: `Your participation status for '${application.collaboration.title}' was updated to ${normalizedStatus}.`,
        link: '/student/collaboration',
      });
    }

    res.json({
      message: `Applicant status updated to ${normalizedStatus}.`,
      application: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update applicant status.' });
  }
};

// 9. Track My Applications (Student, Academician, Institution)
export const getMyApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    let whereClause: any = {};
    if (req.user!.role === 'STUDENT') {
      const s = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
      if (!s) {
        res.status(404).json({ message: 'Student profile not found.' });
        return;
      }
      whereClause = { studentId: s.id };
    } else if (req.user!.role === 'ACADEMICIAN') {
      const a = await prisma.academicianProfile.findUnique({ where: { userId: req.user!.id } });
      if (!a) {
        res.status(404).json({ message: 'Academician profile not found.' });
        return;
      }
      whereClause = { academicianId: a.id };
    } else if (req.user!.role === 'INSTITUTION') {
      const inst = await prisma.institutionProfile.findUnique({ where: { userId: req.user!.id } });
      if (!inst) {
        res.status(404).json({ message: 'Institution profile not found.' });
        return;
      }
      whereClause = { institutionId: inst.id };
    } else {
      res.status(403).json({ message: 'Only applicants can view their applied collaborations.' });
      return;
    }

    const applications = await prisma.collaborationApplication.findMany({
      where: whereClause,
      include: {
        collaboration: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch your applications.' });
  }
};

// 10. Track My Created Initiatives (Initiator only)
export const getMyCreatedCollaborations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const collaborations = await prisma.collaboration.findMany({
      where: { initiatorId: req.user!.id },
      include: {
        _count: { select: { applications: true, feedbacks: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(collaborations);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch created initiatives.' });
  }
};

// 11. Submit Collaboration Feedback / Review
export const submitCollaborationFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // collaborationId
    const { rating, comments, applicationId } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
      return;
    }

    if (!comments || !comments.trim()) {
      res.status(400).json({ message: 'Comments are required.' });
      return;
    }

    const collab = await prisma.collaboration.findUnique({
      where: { id },
      include: { applications: true },
    });

    if (!collab) {
      res.status(404).json({ message: 'Collaboration initiative not found.' });
      return;
    }

    // Resolve user display name
    let userName = req.user!.email;
    if (req.user!.role === 'STUDENT') {
      const s = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
      if (s) userName = s.fullName;
    } else if (req.user!.role === 'ACADEMICIAN') {
      const a = await prisma.academicianProfile.findUnique({ where: { userId: req.user!.id } });
      if (a) userName = a.fullName;
    } else if (req.user!.role === 'INDUSTRY') {
      const ind = await prisma.industryProfile.findUnique({ where: { userId: req.user!.id } });
      if (ind) userName = ind.companyName;
    } else if (req.user!.role === 'INSTITUTION') {
      const inst = await prisma.institutionProfile.findUnique({ where: { userId: req.user!.id } });
      if (inst) userName = inst.institutionName;
    }

    const feedback = await prisma.collaborationFeedback.create({
      data: {
        collaborationId: id,
        applicationId: applicationId || null,
        userId: req.user!.id,
        userRole: req.user!.role,
        userName,
        rating: Math.round(Number(rating)),
        comments: comments.trim(),
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'SUBMIT_COLLABORATION_FEEDBACK',
        entityType: 'CollaborationFeedback',
        entityId: feedback.id,
        details: JSON.stringify({ collaborationId: id, rating, role: req.user!.role }),
      },
    });

    res.status(201).json({
      message: 'Feedback submitted successfully!',
      feedback,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit feedback.' });
  }
};

// 12. Get Collaboration Feedback List
export const getCollaborationFeedback = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const feedbacks = await prisma.collaborationFeedback.findMany({
      where: { collaborationId: id },
      orderBy: { createdAt: 'desc' },
    });

    const avgRating =
      feedbacks.length > 0
        ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1))
        : null;

    res.json({
      collaborationId: id,
      count: feedbacks.length,
      averageRating: avgRating,
      feedbacks,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch feedback.' });
  }
};

// -------------------------------------------------------------
// Existing Mentorship Program Endpoints (Preserved for compatibility)
// -------------------------------------------------------------

export const getMentorshipPrograms = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const programs = await prisma.mentorshipProgram.findMany({
      where: { isAccepting: true },
      include: {
        mentor: {
          select: {
            id: true,
            companyName: true,
            industrySector: true,
            contactPerson: true,
            logoUrl: true,
          },
        },
        _count: { select: { requests: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(programs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch mentorship programs.' });
  }
};

export const createMentorshipProgram = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const industry = await prisma.industryProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!industry) {
      res.status(404).json({ message: 'Industry profile not found.' });
      return;
    }

    const { title, description, maxMentees, expertiseAreas } = req.body;
    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required.' });
      return;
    }

    const program = await prisma.mentorshipProgram.create({
      data: {
        mentorId: industry.id,
        title,
        description,
        maxMentees: maxMentees ? parseInt(maxMentees, 10) : 5,
        expertiseAreas,
        isAccepting: true,
      },
    });

    res.status(201).json(program);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to create mentorship program.' });
  }
};

export const requestMentorship = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const programId = req.params.id as string;
    const { message } = req.body;

    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const existing = await prisma.mentorshipRequest.findUnique({
      where: {
        programId_studentId: {
          programId,
          studentId: student.id,
        },
      },
    });

    if (existing) {
      res.status(400).json({ message: 'Mentorship request already submitted.' });
      return;
    }

    const request = await prisma.mentorshipRequest.create({
      data: {
        programId,
        studentId: student.id,
        message,
        status: 'PENDING',
      },
    });

    res.status(201).json({ message: 'Mentorship request sent.', request });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to submit mentorship request.' });
  }
};

export const getMentorshipRequests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user?.role === 'STUDENT') {
      const student = await prisma.studentProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!student) {
        res.status(404).json({ message: 'Student not found.' });
        return;
      }
      const requests = await prisma.mentorshipRequest.findMany({
        where: { studentId: student.id },
        include: {
          program: { include: { mentor: true } },
          sessions: true,
        },
        orderBy: { requestedAt: 'desc' },
      });
      res.json(requests);
      return;
    }

    if (req.user?.role === 'INDUSTRY') {
      const industry = await prisma.industryProfile.findUnique({
        where: { userId: req.user.id },
      });
      if (!industry) {
        res.status(404).json({ message: 'Industry not found.' });
        return;
      }
      const requests = await prisma.mentorshipRequest.findMany({
        where: {
          program: { mentorId: industry.id },
        },
        include: {
          student: true,
          program: true,
          sessions: true,
        },
        orderBy: { requestedAt: 'desc' },
      });
      res.json(requests);
      return;
    }

    res.status(403).json({ message: 'Unauthorized.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch mentorship requests.' });
  }
};

export const respondMentorshipRequest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;

    if (!['ACCEPTED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: "Status must be 'ACCEPTED' or 'REJECTED'." });
      return;
    }

    const updated = await prisma.mentorshipRequest.update({
      where: { id },
      data: {
        status,
        respondedAt: new Date(),
      },
    });

    res.json({ message: `Mentorship request ${status.toLowerCase()}.`, updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to respond to mentorship request.' });
  }
};
