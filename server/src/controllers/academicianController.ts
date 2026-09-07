import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';

export const VALID_COLLABORATION_TYPES = [
  'FACULTY_INTERNSHIP',
  'INDUSTRIAL_TRAINING',
  'FDP',
  'CONSULTANCY',
  'RESEARCH',
  'RESEARCH_PROJECT',
  'WORKSHOP',
  'GUEST_LECTURE',
  'MENTORSHIP',
  'LIVE_PROJECT',
  'INNOVATION_CHALLENGE',
  'INDUSTRY_VISIT',
];

// Helper to resolve initiator display name and details
async function resolveInitiatorInfo(initiatorId: string, initiatorRole: string) {
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
        };
      }
    }

    const user = await prisma.user.findUnique({
      where: { id: initiatorId },
      select: { email: true },
    });
    return {
      name: user?.email || 'Authorized Partner',
      email: user?.email || '',
    };
  } catch {
    return { name: 'SkillBridge Partner' };
  }
}

// 1. Dashboard Metrics for Academician
export const getAcademicianDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!academician) {
      res.status(404).json({ message: 'Academician profile not found.' });
      return;
    }

    // Live counts for all modules from database
    const [
      facultyInternships,
      industrialTraining,
      fdpCount,
      consultancyCount,
      researchCount,
      workshopCount,
      guestLectureCount,
      mentorshipCount,
      liveProjectCount,
      innovationChallengeCount,
      industryVisitCount,
      totalOpportunities,
      myParticipationsCount,
      acceptedParticipationsCount,
    ] = await Promise.all([
      prisma.collaboration.count({ where: { type: 'FACULTY_INTERNSHIP', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'INDUSTRIAL_TRAINING', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'FDP', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'CONSULTANCY', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: { in: ['RESEARCH', 'RESEARCH_PROJECT'] }, status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'WORKSHOP', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'GUEST_LECTURE', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'MENTORSHIP', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'LIVE_PROJECT', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'INNOVATION_CHALLENGE', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { type: 'INDUSTRY_VISIT', status: 'OPEN' } }),
      prisma.collaboration.count({ where: { status: 'OPEN' } }),
      prisma.collaborationApplication.count({ where: { academicianId: academician.id } }),
      prisma.collaborationApplication.count({
        where: { academicianId: academician.id, status: { in: ['ACCEPTED', 'COMPLETED'] } },
      }),
    ]);

    // Recent opportunities
    const recentOpportunities = await prisma.collaboration.findMany({
      where: { status: 'OPEN' },
      orderBy: { createdAt: 'desc' },
      take: 5,
    });

    // Recent applications/participations
    const recentParticipations = await prisma.collaborationApplication.findMany({
      where: { academicianId: academician.id },
      include: {
        collaboration: true,
      },
      orderBy: { appliedAt: 'desc' },
      take: 5,
    });

    res.json({
      academician,
      stats: {
        totalOpportunities,
        myParticipationsCount,
        acceptedParticipationsCount,
        facultyInternships,
        industrialTraining,
        fdpCount,
        consultancyCount,
        researchCount,
        workshopCount,
        guestLectureCount,
        mentorshipCount,
        liveProjectCount,
        innovationChallengeCount,
        industryVisitCount,
      },
      recentOpportunities,
      recentParticipations,
    });
  } catch (error: any) {
    console.error('getAcademicianDashboard error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch academician dashboard.' });
  }
};

// 2. Academician Profile
export const getAcademicianProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const profile = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!profile) {
      res.status(404).json({ message: 'Profile not found.' });
      return;
    }

    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch profile.' });
  }
};

export const updateAcademicianProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      phone,
      institutionName,
      department,
      designation,
      yearsOfExperience,
      areasOfExpertise,
      location,
      bio,
    } = req.body;

    const updated = await prisma.academicianProfile.update({
      where: { userId: req.user!.id },
      data: {
        fullName,
        phone,
        institutionName,
        department,
        designation,
        yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined,
        areasOfExpertise,
        location,
        bio,
      },
    });

    res.json({ message: 'Profile updated successfully.', profile: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
};

// 3. Browse & Filter Opportunities (Supports all 9 types, search keyword, mode, and application status)
export const getAcademicianOpportunities = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, search, mode, status } = req.query;

    const whereClause: any = {};

    if (type && typeof type === 'string' && type !== 'ALL') {
      const t = type.toUpperCase();
      if (t === 'RESEARCH' || t === 'RESEARCH_PROJECT') {
        whereClause.type = { in: ['RESEARCH', 'RESEARCH_PROJECT'] };
      } else {
        whereClause.type = t;
      }
    }

    if (mode && typeof mode === 'string' && mode !== 'ALL') {
      whereClause.mode = mode.toUpperCase();
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status.toUpperCase();
    } else if (!status) {
      whereClause.status = 'OPEN';
    }

    if (search && typeof search === 'string' && search.trim() !== '') {
      const q = search.trim();
      whereClause.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { location: { contains: q, mode: 'insensitive' } },
        { targetAudience: { contains: q, mode: 'insensitive' } },
        { eligibilityCriteria: { contains: q, mode: 'insensitive' } },
      ];
    }

    const opportunities = await prisma.collaboration.findMany({
      where: whereClause,
      include: {
        applications: {
          select: {
            id: true,
            academicianId: true,
            status: true,
            appliedAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Check if the current user is an academician
    let userAcademicianProfileId: string | null = null;
    if (req.user?.role === 'ACADEMICIAN') {
      const acad = await prisma.academicianProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      userAcademicianProfileId = acad?.id || null;
    }

    // Enrich with initiator details and academician application status
    const enriched = await Promise.all(
      opportunities.map(async (opp) => {
        const initiatorInfo = await resolveInitiatorInfo(opp.initiatorId, opp.initiatorRole);
        const myApp = userAcademicianProfileId
          ? opp.applications.find((a) => a.academicianId === userAcademicianProfileId)
          : null;

        return {
          id: opp.id,
          initiatorId: opp.initiatorId,
          initiatorRole: opp.initiatorRole,
          initiatorInfo,
          title: opp.title,
          type: opp.type,
          description: opp.description,
          targetAudience: opp.targetAudience,
          location: opp.location,
          mode: opp.mode || 'HYBRID',
          duration: opp.duration,
          remunerationOrStipend: opp.remunerationOrStipend,
          eligibilityCriteria: opp.eligibilityCriteria,
          status: opp.status,
          budget: opp.budget,
          startDate: opp.startDate,
          endDate: opp.endDate,
          applicantCount: opp.applications.length,
          hasApplied: Boolean(myApp),
          applicationStatus: myApp?.status || null,
          applicationId: myApp?.id || null,
          isInitiator: req.user?.id === opp.initiatorId,
          createdAt: opp.createdAt,
          updatedAt: opp.updatedAt,
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    console.error('getAcademicianOpportunities error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch opportunities.' });
  }
};

// 4. Get Opportunity By ID
export const getAcademicianOpportunityById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const opp: any = await prisma.collaboration.findUnique({
      where: { id },
      include: {
        applications: {
          include: {
            academician: {
              select: {
                id: true,
                fullName: true,
                institutionName: true,
                department: true,
                designation: true,
                areasOfExpertise: true,
                yearsOfExperience: true,
              },
            },
          },
        },
      },
    });

    if (!opp) {
      res.status(404).json({ message: 'Opportunity not found.' });
      return;
    }

    const initiatorInfo = await resolveInitiatorInfo(opp.initiatorId, opp.initiatorRole);

    let myApp: any = null;
    if (req.user?.role === 'ACADEMICIAN') {
      const acad = await prisma.academicianProfile.findUnique({
        where: { userId: req.user.id },
        select: { id: true },
      });
      if (acad) {
        myApp = opp.applications.find((a: any) => a.academicianId === acad.id) || null;
      }
    }

    res.json({
      ...opp,
      initiatorInfo,
      applicantCount: opp.applications.length,
      hasApplied: Boolean(myApp),
      applicationStatus: myApp?.status || null,
      applicationId: myApp?.id || null,
      myApplication: myApp,
      isInitiator: req.user?.id === opp.initiatorId,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch opportunity.' });
  }
};

// 5. Create Opportunity (Authorized: INDUSTRY, INSTITUTION, ACADEMICIAN)
export const createAcademicianOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const allowedRoles = ['INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'];
    if (!allowedRoles.includes(req.user!.role)) {
      res.status(403).json({ message: 'You are not authorized to post collaboration opportunities.' });
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
        message: `Invalid opportunity type. Must be one of: ${VALID_COLLABORATION_TYPES.join(', ')}`,
      });
      return;
    }

    const collaboration = await prisma.collaboration.create({
      data: {
        initiatorId: req.user!.id,
        initiatorRole: req.user!.role,
        title,
        type: normalizedType,
        description,
        targetAudience,
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
        action: 'CREATE_ACADEMICIAN_OPPORTUNITY',
        entityType: 'Collaboration',
        entityId: collaboration.id,
        details: JSON.stringify({ title, type: normalizedType, role: req.user!.role }),
      },
    });

    res.status(201).json({
      message: 'Opportunity created successfully.',
      opportunity: collaboration,
    });
  } catch (error: any) {
    console.error('createAcademicianOpportunity error:', error);
    res.status(500).json({ message: error.message || 'Failed to create opportunity.' });
  }
};

// 6. Update Opportunity (Creator only)
export const updateAcademicianOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.collaboration.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: 'Opportunity not found.' });
      return;
    }

    if (existing.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the creator can edit this opportunity.' });
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
      message: 'Opportunity updated successfully.',
      opportunity: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update opportunity.' });
  }
};

// 7. Delete Opportunity (Creator only)
export const deleteAcademicianOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const existing = await prisma.collaboration.findUnique({ where: { id } });

    if (!existing) {
      res.status(404).json({ message: 'Opportunity not found.' });
      return;
    }

    if (existing.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the creator can delete this opportunity.' });
      return;
    }

    await prisma.collaboration.delete({ where: { id } });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'DELETE_ACADEMICIAN_OPPORTUNITY',
        entityType: 'Collaboration',
        entityId: id,
        details: JSON.stringify({ title: existing.title }),
      },
    });

    res.json({ message: 'Opportunity deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete opportunity.' });
  }
};

// 8. Academician Apply / Register for an Opportunity
export const applyToAcademicianOpportunity = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { proposal } = req.body;

    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!academician) {
      res.status(404).json({ message: 'Academician profile not found. Please complete your profile.' });
      return;
    }

    const opportunity = await prisma.collaboration.findUnique({
      where: { id },
    });

    if (!opportunity) {
      res.status(404).json({ message: 'Opportunity not found.' });
      return;
    }

    if (opportunity.status !== 'OPEN') {
      res.status(400).json({ message: `This opportunity is currently ${opportunity.status.toLowerCase()}.` });
      return;
    }

    // Check if already applied
    const existingApplication = await prisma.collaborationApplication.findFirst({
      where: {
        collaborationId: id,
        academicianId: academician.id,
      },
    });

    if (existingApplication) {
      res.status(400).json({
        message: `You have already applied/registered for this opportunity (Status: ${existingApplication.status}).`,
      });
      return;
    }

    const application = await prisma.collaborationApplication.create({
      data: {
        collaborationId: id,
        academicianId: academician.id,
        proposal,
        status: 'APPLIED',
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'APPLY_ACADEMICIAN_OPPORTUNITY',
        entityType: 'CollaborationApplication',
        entityId: application.id,
        details: JSON.stringify({
          collaborationId: id,
          title: opportunity.title,
          academicianId: academician.id,
        }),
      },
    });

    res.status(201).json({
      message: 'Application submitted successfully!',
      application,
    });
  } catch (error: any) {
    console.error('applyToAcademicianOpportunity error:', error);
    res.status(500).json({ message: error.message || 'Failed to apply for opportunity.' });
  }
};

// 9. Track Participations (Academician's registered/applied programs)
export const getMyParticipations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!academician) {
      res.status(404).json({ message: 'Academician profile not found.' });
      return;
    }

    const participations = await prisma.collaborationApplication.findMany({
      where: { academicianId: academician.id },
      include: {
        collaboration: true,
      },
      orderBy: { appliedAt: 'desc' },
    });

    const enriched = await Promise.all(
      participations.map(async (part) => {
        const initiatorInfo = await resolveInitiatorInfo(
          part.collaboration.initiatorId,
          part.collaboration.initiatorRole
        );
        return {
          ...part,
          collaboration: {
            ...part.collaboration,
            initiatorInfo,
          },
        };
      })
    );

    res.json(enriched);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch participations.' });
  }
};

// 10. Withdraw Participation
export const withdrawParticipation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string; // Application ID or Opportunity ID

    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!academician) {
      res.status(404).json({ message: 'Academician profile not found.' });
      return;
    }

    // Try finding by application ID first, then by collaborationId + academicianId
    let application = await prisma.collaborationApplication.findUnique({
      where: { id },
    });

    if (!application) {
      application = await prisma.collaborationApplication.findFirst({
        where: {
          collaborationId: id,
          academicianId: academician.id,
        },
      });
    }

    if (!application || application.academicianId !== academician.id) {
      res.status(404).json({ message: 'Application record not found.' });
      return;
    }

    const updated = await prisma.collaborationApplication.update({
      where: { id: application.id },
      data: { status: 'WITHDRAWN' },
    });

    res.json({
      message: 'Participation withdrawn successfully.',
      application: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to withdraw participation.' });
  }
};

// 11. View Opportunity Applicants (Creator only)
export const getOpportunityApplicants = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;

    const opportunity = await prisma.collaboration.findUnique({
      where: { id },
    });

    if (!opportunity) {
      res.status(404).json({ message: 'Opportunity not found.' });
      return;
    }

    if (opportunity.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the creator can view applicants.' });
      return;
    }

    const applicants = await prisma.collaborationApplication.findMany({
      where: { collaborationId: id },
      include: {
        academician: {
          include: {
            user: {
              select: { email: true },
            },
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

// 12. Update Applicant Status (Creator only)
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

    if (application.collaboration.initiatorId !== req.user!.id) {
      res.status(403).json({ message: 'Only the creator can update applicant status.' });
      return;
    }

    const updated = await prisma.collaborationApplication.update({
      where: { id },
      data: { status: normalizedStatus },
    });

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: 'UPDATE_ACADEMICIAN_APPLICATION_STATUS',
        entityType: 'CollaborationApplication',
        entityId: id,
        details: JSON.stringify({ status: normalizedStatus, collaborationId: application.collaborationId }),
      },
    });

    res.json({
      message: `Applicant status updated to ${normalizedStatus}.`,
      application: updated,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update status.' });
  }
};

// Compatibility aliases for previous collaboration endpoints
export const createCollaboration = createAcademicianOpportunity;
export const getCollaborations = getAcademicianOpportunities;

// Personalized Recommendations for Academician
export const getAcademicianRecommendationsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const academician = await prisma.academicianProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!academician) {
      res.status(404).json({ message: 'Academician profile not found.' });
      return;
    }

    const { getAcademicianRecommendations } = await import('../services/personalizationService');
    const recs = await getAcademicianRecommendations(academician.id);

    res.json(recs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch academician recommendations.' });
  }
};
