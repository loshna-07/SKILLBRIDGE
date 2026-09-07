import { Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { calculateOpportunityMatch } from '../services/matchingEngine';
import {
  getStudentLearningRecommendations,
  getPersonalizedSkillRecommendations,
  getPersonalizedCourseRecommendations,
} from '../services/recommendationEngine';
import {
  getStudentRecommendations,
  getStudentSkillProfile,
  getRecommendedIndustries,
  getRecommendedJobRoles,
  getStudentSkillMapping,
  resolveDomain,
  DOMAIN_DISPLAY_NAMES,
} from '../services/personalizationService';

// Calculate student profile completion %
const calculateProfileCompletion = (profile: any): number => {
  if (!profile) return 0;
  const fields = [
    profile.fullName,
    profile.institutionName,
    profile.department,
    profile.degree,
    profile.phone,
    profile.dob,
    profile.gender,
    profile.cgpa,
    profile.currentYear,
    profile.graduationYear,
    profile.location,
    profile.bio,
    profile.resumeUrl,
    profile.careerInterests,
    profile.preferredRoles,
  ];
  const filled = fields.filter((f) => f !== null && f !== undefined && f !== '').length;
  return Math.round((filled / fields.length) * 100);
};

// Student Dashboard Summary
export const getStudentDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        skillProfiles: {
          include: {
            skill: {
              include: { category: true },
            },
          },
        },
        assessmentAttempts: {
          orderBy: { startedAt: 'desc' },
          take: 5,
          include: { assessment: true },
        },
        applications: {
          orderBy: { appliedAt: 'desc' },
          include: {
            opportunity: {
              include: { industry: true, skills: { include: { skill: true } }, assessment: true },
            },
          },
        },
        educations: true,
        certificates: {
          orderBy: { createdAt: 'desc' },
        },
        projects: true,
        internships: true,
        achievements: true,
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const profileCompletion = calculateProfileCompletion(student);

    // Calculate average skill score
    const avgSkillScore =
      student.skillProfiles.length > 0
        ? Math.round(
            student.skillProfiles.reduce((sum, s) => sum + s.scorePercentage, 0) /
              student.skillProfiles.length
          )
        : 0;

    // Career interests list
    const careerInterests = student.careerInterests
      ? student.careerInterests.split(',').map((s) => s.trim()).filter(Boolean)
      : [];

    // Strong skills vs Skills to improve
    const strongSkills = student.skillProfiles
      .filter((s) => s.proficiencyLevel === 'ADVANCED' || s.proficiencyLevel === 'EXPERT' || s.scorePercentage >= 70)
      .map((s) => ({
        id: s.id,
        skillId: s.skillId,
        name: s.skill.name,
        category: s.skill.category?.name || 'General',
        proficiencyLevel: s.proficiencyLevel,
        scorePercentage: s.scorePercentage,
        verificationStatus: s.verificationStatus,
      }));

    const skillsToImprove = student.skillProfiles
      .filter((s) => s.proficiencyLevel === 'BEGINNER' || (s.scorePercentage > 0 && s.scorePercentage < 60))
      .map((s) => ({
        id: s.id,
        skillId: s.skillId,
        name: s.skill.name,
        category: s.skill.category?.name || 'General',
        proficiencyLevel: s.proficiencyLevel,
        scorePercentage: s.scorePercentage,
        verificationStatus: s.verificationStatus,
      }));

    // Domain-scoped personalized recommendations & meaningful skill gaps
    const personalization = await getStudentRecommendations(student.id);

    const [collabApplications, activeCollaborationsCount] = await Promise.all([
      prisma.collaborationApplication.findMany({
        where: { studentId: student.id },
        include: { collaboration: true },
        orderBy: { appliedAt: 'desc' },
        take: 5,
      }),
      prisma.collaborationApplication.count({
        where: { studentId: student.id },
      }),
    ]);

    res.json({
      student: {
        id: student.id,
        fullName: student.fullName,
        department: student.department,
        institutionName: student.institutionName,
        degree: student.degree,
        currentYear: student.currentYear,
        graduationYear: student.graduationYear,
        cgpa: student.cgpa,
        careerInterests: student.careerInterests,
        preferredRoles: student.preferredRoles,
      },
      domain: personalization.domain,
      domainDisplayName: personalization.domainDisplayName,
      profileCompletion,
      avgSkillScore,
      skills: student.skillProfiles.map((s) => ({
        id: s.id,
        skillId: s.skillId,
        name: s.skill.name,
        category: s.skill.category?.name || 'General',
        proficiencyLevel: s.proficiencyLevel,
        scorePercentage: s.scorePercentage,
        verificationStatus: s.verificationStatus,
      })),
      careerInterests,
      certifications: student.certificates,
      skillAnalysis: {
        strongSkills,
        skillsToImprove,
        skillGaps: personalization.skillGaps.map((g) => g.skillName),
        skillGapItems: personalization.skillGaps,
        recommendedSkills: personalization.recommendedSkills,
      },
      primaryCareerInterest: personalization.primaryCareerInterest,
      secondaryCareerInterests: personalization.secondaryCareerInterests,
      skillsToLearnNext: personalization.skillsToLearnNext,
      recommendedSkills: personalization.recommendedSkills,
      recommendedCourses: personalization.recommendedCourses,
      recommendedInternships: personalization.recommendedInternships,
      recommendedJobs: personalization.recommendedJobs,
      recommendedMentors: personalization.recommendedMentors,
      recommendedCollaborations: personalization.recommendedCollaborations,
      recommendedOpportunities: [
        ...personalization.recommendedInternships.map((i) => ({
          ...i.opportunity,
          matchResult: i.matchResult,
          isEligible: i.isEligible,
          ineligibleReasons: i.ineligibleReasons,
          goodMatchReasons: i.goodMatchReasons,
          matchedSkills: i.matchedSkills,
          unmatchedSkills: i.unmatchedSkills,
          hasApplied: i.hasApplied,
          applicationStatus: i.applicationStatus,
          recommendationReason: i.recommendationReason,
        })),
        ...personalization.recommendedJobs.map((j) => ({
          ...j.opportunity,
          matchResult: j.matchResult,
          isEligible: j.isEligible,
          ineligibleReasons: j.ineligibleReasons,
          goodMatchReasons: j.goodMatchReasons,
          matchedSkills: j.matchedSkills,
          unmatchedSkills: j.unmatchedSkills,
          hasApplied: j.hasApplied,
          applicationStatus: j.applicationStatus,
          recommendationReason: j.recommendationReason,
        })),
      ].slice(0, 8),
      applications: student.applications,
      stats: {
        skillsCount: student.skillProfiles.length,
        assessmentsCount: student.assessmentAttempts.length,
        applicationsCount: student.applications.length,
        collaborationsCount: activeCollaborationsCount,
        certificationsCount: student.certificates.length,
      },
      recentCollaborations: collabApplications,
      recentAssessments: student.assessmentAttempts,
      recentApplications: student.applications,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch student dashboard.' });
  }
};

// Get Full Profile
export const getStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
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

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch student profile.' });
  }
};

// Update Profile
export const updateStudentProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      fullName,
      phone,
      dob,
      gender,
      institutionName,
      department,
      degree,
      currentYear,
      cgpa,
      graduationYear,
      location,
      bio,
      careerInterests,
      preferredRoles,
      preferredLocations,
      resumeUrl,
    } = req.body;

    const updated = await prisma.studentProfile.update({
      where: { userId: req.user!.id },
      data: {
        fullName,
        phone,
        dob,
        gender,
        institutionName,
        department,
        degree,
        currentYear: currentYear ? parseInt(currentYear, 10) : undefined,
        cgpa: cgpa ? parseFloat(cgpa) : undefined,
        graduationYear: graduationYear ? parseInt(graduationYear, 10) : undefined,
        location,
        bio,
        careerInterests,
        preferredRoles,
        preferredLocations,
        resumeUrl,
      },
    });

    res.json({ message: 'Profile updated successfully.', profile: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update profile.' });
  }
};

// Get Student Skills
export const getStudentSkills = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        skillProfiles: {
          include: { skill: { include: { category: true } } },
        },
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    res.json(student.skillProfiles);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skills.' });
  }
};

// Get Student Skill Gap Analysis
export const getStudentSkillGapAnalysis = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        skillProfiles: {
          include: { skill: { include: { category: true } } },
        },
        assessmentAttempts: {
          orderBy: { startedAt: 'desc' },
          include: { assessment: true },
        },
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const totalSkills = student.skillProfiles.length;
    const overallSkillScore =
      totalSkills > 0
        ? Math.round(student.skillProfiles.reduce((sum, s) => sum + s.scorePercentage, 0) / totalSkills)
        : 0;

    // Strengths: skills with score >= 70%
    const strengths = student.skillProfiles
      .filter((s) => s.scorePercentage >= 70)
      .map((s) => ({
        id: s.id,
        skillId: s.skillId,
        name: s.skill.name,
        category: s.skill.category?.name || 'General',
        scorePercentage: s.scorePercentage,
        proficiencyLevel: s.proficiencyLevel,
        verified: s.verified,
        lastAssessedAt: s.lastAssessedAt,
      }));

    // Weaknesses: skills with score < 60%
    const weaknesses = student.skillProfiles
      .filter((s) => s.scorePercentage < 60)
      .map((s) => ({
        id: s.id,
        skillId: s.skillId,
        name: s.skill.name,
        category: s.skill.category?.name || 'General',
        scorePercentage: s.scorePercentage,
        proficiencyLevel: s.proficiencyLevel,
        verified: s.verified,
        lastAssessedAt: s.lastAssessedAt,
      }));

    // Find industry demand to detect missing market skills
    const existingSkillIds = new Set(student.skillProfiles.map((s) => s.skillId));
    const publishedOpportunities = await prisma.opportunity.findMany({
      where: { isPublished: true },
      include: {
        skills: { include: { skill: { include: { category: true } } } },
      },
    });

    const marketDemandMap = new Map<string, { skill: any; count: number; isRequired: boolean }>();
    for (const opp of publishedOpportunities) {
      for (const os of opp.skills) {
        if (!existingSkillIds.has(os.skillId)) {
          if (!marketDemandMap.has(os.skillId)) {
            marketDemandMap.set(os.skillId, { skill: os.skill, count: 0, isRequired: false });
          }
          const entry = marketDemandMap.get(os.skillId)!;
          entry.count += 1;
          if (os.isRequired) entry.isRequired = true;
        }
      }
    }

    // Build skill gaps:
    // 1. Performance gaps: assessed skills with score < 60%
    // 2. Market demand gaps: skills demanded by opportunities that student hasn't assessed
    const skillGaps: Array<{
      skillId: string;
      skillName: string;
      category: string;
      gapType: 'PERFORMANCE_GAP' | 'MARKET_DEMAND_GAP';
      severity: 'HIGH' | 'MEDIUM';
      currentScore: number;
      targetScore: number;
      explanation: string;
      actionRecommendation: string;
    }> = [];

    // Add performance gaps
    for (const weak of weaknesses) {
      skillGaps.push({
        skillId: weak.skillId,
        skillName: weak.name,
        category: weak.category,
        gapType: 'PERFORMANCE_GAP',
        severity: weak.scorePercentage < 40 ? 'HIGH' : 'MEDIUM',
        currentScore: weak.scorePercentage,
        targetScore: 70,
        explanation: `Assessed score of ${weak.scorePercentage}% is below the proficiency benchmark (60%).`,
        actionRecommendation: `Retake assessment or complete specialized modules to elevate proficiency.`,
      });
    }

    // Add market demand gaps
    for (const [sId, demand] of marketDemandMap.entries()) {
      skillGaps.push({
        skillId: sId,
        skillName: demand.skill.name,
        category: demand.skill.category?.name || 'Industry Demand',
        gapType: 'MARKET_DEMAND_GAP',
        severity: demand.isRequired ? 'HIGH' : 'MEDIUM',
        currentScore: 0,
        targetScore: 70,
        explanation: `Required or preferred in ${demand.count} active industry opportunity posting(s) but not yet validated in your profile.`,
        actionRecommendation: `Take the ${demand.skill.name} assessment or enroll in an affiliated learning program.`,
      });
    }

    // Collect all gap skill IDs (performance deficits + market opportunity demands)
    const allGapSkillIds = new Set<string>();
    weaknesses.forEach((w) => allGapSkillIds.add(w.skillId));
    marketDemandMap.forEach((_val, sId) => allGapSkillIds.add(sId));

    // Query actual published Learning Programs from PostgreSQL that teach any of these gap skills
    const matchingPrograms = await prisma.learningProgram.findMany({
      where: {
        isPublished: true,
        skills: {
          some: {
            skillId: { in: Array.from(allGapSkillIds) },
          },
        },
      },
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

    // Attach targeted learning programs to each specific skill gap
    const enrichedSkillGaps = skillGaps.map((gap) => {
      const targetedPrograms = matchingPrograms.filter((p) =>
        p.skills.some((s) => s.skillId === gap.skillId)
      );
      return {
        ...gap,
        recommendedPrograms: targetedPrograms.map((p) => ({
          id: p.id,
          title: p.title,
          type: p.type,
          mode: p.mode,
          duration: p.duration,
          price: p.price,
          skills: p.skills.map((s) => s.skill.name),
        })),
      };
    });

    // Rank overall recommended learning programs by number of gaps addressed
    const rankedRecommendedPrograms = matchingPrograms
      .map((p) => {
        const addressedGaps = p.skills
          .filter((s) => allGapSkillIds.has(s.skillId))
          .map((s) => s.skill.name);
        return {
          id: p.id,
          title: p.title,
          type: p.type,
          description: p.description,
          duration: p.duration,
          mode: p.mode,
          price: p.price,
          startDate: p.startDate,
          addressedGaps,
          skills: p.skills.map((s) => ({
            id: s.skillId,
            name: s.skill.name,
            category: s.skill.category?.name,
          })),
          enrollmentsCount: p._count.enrollments,
        };
      })
      .sort((a, b) => b.addressedGaps.length - a.addressedGaps.length);

    res.json({
      overallSkillScore,
      skillsCount: totalSkills,
      strengths,
      weaknesses,
      skillGaps: enrichedSkillGaps,
      recommendedPrograms: rankedRecommendedPrograms,
      skillProfiles: student.skillProfiles,
      recentAttempts: student.assessmentAttempts.slice(0, 5),
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skill gap analysis.' });
  }
};

// Get Student Applications
export const getStudentApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!student) {
      res.status(404).json({ message: 'Student not found.' });
      return;
    }

    const applications = await prisma.application.findMany({
      where: { studentId: student.id },
      include: {
        opportunity: {
          include: {
            industry: true,
            skills: { include: { skill: true } },
          },
        },
        history: { orderBy: { createdAt: 'desc' } },
        interviews: { orderBy: { scheduledAt: 'asc' } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch applications.' });
  }
};

// Withdraw Application
export const withdrawApplication = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const application = await prisma.application.findUnique({
      where: { id },
    });

    if (!application || application.studentId !== student?.id) {
      res.status(404).json({ message: 'Application not found or unauthorized.' });
      return;
    }

    if (['SELECTED', 'REJECTED', 'WITHDRAWN'].includes(application.status)) {
      res.status(400).json({ message: `Cannot withdraw application in '${application.status}' state.` });
      return;
    }

    const updated = await prisma.$transaction(async (tx) => {
      const app = await tx.application.update({
        where: { id },
        data: { status: 'WITHDRAWN' },
      });

      await tx.applicationStatusHistory.create({
        data: {
          applicationId: id,
          status: 'WITHDRAWN',
          notes: 'Withdrawn by student.',
          changedById: req.user!.id,
        },
      });

      return app;
    });

    res.json({ message: 'Application successfully withdrawn.', application: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to withdraw application.' });
  }
};

// Full Digital Portfolio
export const getStudentPortfolio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
      include: {
        educations: { orderBy: { startYear: 'desc' } },
        certificates: { orderBy: { createdAt: 'desc' } },
        projects: { orderBy: { createdAt: 'desc' } },
        internships: { orderBy: { createdAt: 'desc' } },
        achievements: { orderBy: { createdAt: 'desc' } },
        trainings: { orderBy: { createdAt: 'desc' } },
        skillProfiles: {
          include: { skill: { include: { category: true } } },
          orderBy: { createdAt: 'desc' },
        },
        assessmentAttempts: {
          include: { assessment: true },
          orderBy: { completedAt: 'desc' },
        },
        courseCertificates: {
          include: { course: true },
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch portfolio.' });
  }
};

// Portfolio Item Mutators
export const addProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const { title, description, technologies, projectUrl, repoUrl } = req.body;
    if (!title || !description) {
      res.status(400).json({ message: 'Title and description are required.' });
      return;
    }

    const project = await prisma.studentProject.create({
      data: {
        studentId: student.id,
        title,
        description,
        technologies,
        projectUrl,
        repoUrl,
        verificationStatus: 'PENDING',
      },
    });

    res.status(201).json(project);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add project.' });
  }
};

export const deleteProject = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.studentProject.delete({ where: { id } });
    res.json({ message: 'Project removed.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete project.' });
  }
};

// Student Certifications Management
export const getStudentCertifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const certs = await prisma.studentCertification.findMany({
      where: { studentId: student.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json(certs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch certifications.' });
  }
};

export const addCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const {
      title,
      name,
      issuingOrganization,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      certificateDocUrl,
      skillsCovered,
    } = req.body;

    const certTitle = title || name;
    if (!certTitle || !issuingOrganization) {
      res.status(400).json({ message: 'Certification title and issuing organization are required.' });
      return;
    }

    const cert = await prisma.studentCertification.create({
      data: {
        studentId: student.id,
        title: certTitle,
        issuingOrganization,
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        credentialId: credentialId || null,
        credentialUrl: credentialUrl || null,
        certificateDocUrl: certificateDocUrl || null,
        skillsCovered: Array.isArray(skillsCovered) ? skillsCovered.join(', ') : skillsCovered || null,
        verificationStatus: 'PENDING',
      },
    });

    res.status(201).json(cert);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add certification.' });
  }
};

export const updateCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const {
      title,
      name,
      issuingOrganization,
      issueDate,
      expiryDate,
      credentialId,
      credentialUrl,
      certificateDocUrl,
      skillsCovered,
    } = req.body;

    const updated = await prisma.studentCertification.update({
      where: { id },
      data: {
        title: title || name,
        issuingOrganization,
        issueDate: issueDate || null,
        expiryDate: expiryDate || null,
        credentialId: credentialId || null,
        credentialUrl: credentialUrl || null,
        certificateDocUrl: certificateDocUrl || null,
        skillsCovered: Array.isArray(skillsCovered) ? skillsCovered.join(', ') : skillsCovered || null,
        verificationStatus: 'PENDING',
        verifiedById: null,
        verifiedAt: null,
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update certification.' });
  }
};

export const deleteCertification = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    await prisma.studentCertification.deleteMany({
      where: {
        id,
        studentId: student.id,
      },
    });

    res.json({ message: 'Certification removed.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete certification.' });
  }
};


export const addInternshipExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const { companyName, role, startDate, endDate, description, certificateUrl } = req.body;
    if (!companyName || !role || !startDate) {
      res.status(400).json({ message: 'Company name, role, and start date are required.' });
      return;
    }

    const exp = await prisma.studentInternshipExperience.create({
      data: {
        studentId: student.id,
        companyName,
        role,
        startDate,
        endDate,
        description,
        certificateUrl,
        verificationStatus: 'PENDING',
      },
    });

    res.status(201).json(exp);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add internship experience.' });
  }
};

export const deleteInternshipExperience = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.studentInternshipExperience.delete({ where: { id } });
    res.json({ message: 'Internship experience removed.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete internship experience.' });
  }
};

export const addEducation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const { institution, degree, fieldOfStudy, startYear, endYear, grade } = req.body;
    if (!institution || !degree || !fieldOfStudy || !startYear) {
      res.status(400).json({ message: 'Institution, degree, field of study, and start year are required.' });
      return;
    }

    const edu = await prisma.studentEducation.create({
      data: {
        studentId: student.id,
        institution,
        degree,
        fieldOfStudy,
        startYear: parseInt(startYear, 10),
        endYear: endYear ? parseInt(endYear, 10) : null,
        grade,
        verificationStatus: 'PENDING',
      },
    });

    res.status(201).json(edu);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add education.' });
  }
};

export const deleteEducation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    await prisma.studentEducation.delete({ where: { id } });
    res.json({ message: 'Education removed.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete education.' });
  }
};

// Student Skills Management
export const addStudentSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const { skillId, skillName, categoryId, proficiencyLevel = 'BEGINNER' } = req.body;
    let targetSkillId = skillId;

    if (!targetSkillId && skillName) {
      let existingSkill = await prisma.skill.findUnique({ where: { name: skillName } });
      if (!existingSkill) {
        let catId = categoryId;
        if (!catId) {
          let defaultCat = await prisma.skillCategory.findFirst();
          if (!defaultCat) {
            defaultCat = await prisma.skillCategory.create({
              data: { name: 'General Skills', description: 'General skills category' },
            });
          }
          catId = defaultCat.id;
        }
        existingSkill = await prisma.skill.create({
          data: {
            name: skillName,
            categoryId: catId,
          },
        });
      }
      targetSkillId = existingSkill.id;
    }

    if (!targetSkillId) {
      res.status(400).json({ message: 'Skill ID or skill name is required.' });
      return;
    }

    // Upsert or create StudentSkillProfile with verificationStatus: 'PENDING', verified: false
    const skillProfile = await prisma.studentSkillProfile.upsert({
      where: {
        studentId_skillId: {
          studentId: student.id,
          skillId: targetSkillId,
        },
      },
      create: {
        studentId: student.id,
        skillId: targetSkillId,
        proficiencyLevel,
        scorePercentage: 0,
        verificationStatus: 'PENDING',
        verified: false,
      },
      update: {
        proficiencyLevel,
        verificationStatus: 'PENDING',
        verified: false,
        remarks: null,
      },
      include: {
        skill: { include: { category: true } },
      },
    });

    res.status(201).json(skillProfile);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add skill.' });
  }
};

export const updateStudentSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { proficiencyLevel } = req.body;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const updated = await prisma.studentSkillProfile.update({
      where: { id },
      data: {
        proficiencyLevel,
        verificationStatus: 'PENDING',
        verified: false,
      },
      include: {
        skill: { include: { category: true } },
      },
    });

    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update skill.' });
  }
};

export const deleteStudentSkill = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    await prisma.studentSkillProfile.deleteMany({
      where: {
        id,
        studentId: student.id,
      },
    });

    res.json({ message: 'Skill removed from profile.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete skill.' });
  }
};

// Achievements Management
export const addAchievement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const { title, category, date, description } = req.body;
    if (!title) {
      res.status(400).json({ message: 'Title is required.' });
      return;
    }

    const achievement = await prisma.studentAchievement.create({
      data: {
        studentId: student.id,
        title,
        category,
        date,
        description,
        verificationStatus: 'PENDING',
      },
    });

    res.status(201).json(achievement);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add achievement.' });
  }
};

export const deleteAchievement = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    await prisma.studentAchievement.deleteMany({
      where: { id, studentId: student.id },
    });

    res.json({ message: 'Achievement removed.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete achievement.' });
  }
};

// Training Management
export const addTraining = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const { title, provider, duration, certificateUrl } = req.body;
    if (!title || !provider) {
      res.status(400).json({ message: 'Title and provider are required.' });
      return;
    }

    const training = await prisma.studentTraining.create({
      data: {
        studentId: student.id,
        title,
        provider,
        duration,
        certificateUrl,
        verificationStatus: 'PENDING',
      },
    });

    res.status(201).json(training);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to add training.' });
  }
};

export const deleteTraining = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    await prisma.studentTraining.deleteMany({
      where: { id, studentId: student.id },
    });

    res.json({ message: 'Training removed.' });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete training.' });
  }
};

// Resume Management
export const updateResume = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({ where: { userId: req.user!.id } });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const { resumeUrl } = req.body;
    const updated = await prisma.studentProfile.update({
      where: { id: student.id },
      data: {
        resumeUrl,
        resumeVerificationStatus: 'PENDING',
        resumeRemarks: null,
      },
    });

    res.json({ message: 'Resume updated successfully.', profile: updated });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update resume.' });
  }
};

// Public Showcase Portfolio
export const getPublicPortfolio = async (req: any, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const student = await prisma.studentProfile.findFirst({
      where: {
        OR: [{ id }, { userId: id }],
      },
      include: {
        user: { select: { email: true, role: true } },
        educations: { orderBy: { startYear: 'desc' } },
        certificates: { orderBy: { createdAt: 'desc' } },
        projects: { orderBy: { createdAt: 'desc' } },
        internships: { orderBy: { createdAt: 'desc' } },
        achievements: { orderBy: { createdAt: 'desc' } },
        trainings: { orderBy: { createdAt: 'desc' } },
        skillProfiles: {
          include: { skill: { include: { category: true } } },
          orderBy: { createdAt: 'desc' },
        },
        assessmentAttempts: {
          include: { assessment: true },
          orderBy: { completedAt: 'desc' },
        },
        courseCertificates: {
          where: { verificationStatus: 'VERIFIED' },
          include: { course: true },
          orderBy: { issueDate: 'desc' },
        },
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student portfolio not found.' });
      return;
    }

    res.json(student);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch public portfolio.' });
  }
};

// --------------------------------------------------------------------------
// PERSONALIZATION & RECOMMENDATIONS HANDLERS
// --------------------------------------------------------------------------

export const getStudentPersonalizedRecommendations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommendations.' });
  }
};

export const getStudentRecommendedSkills = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.recommendedSkills);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended skills.' });
  }
};

export const getStudentRecommendedCourses = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.recommendedCourses);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended courses.' });
  }
};

export const getStudentRecommendedInternships = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.recommendedInternships);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended internships.' });
  }
};

export const getStudentRecommendedJobs = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.recommendedJobs);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended jobs.' });
  }
};

export const getStudentInterests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    res.json({
      careerInterests: student.careerInterests
        ? student.careerInterests.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      preferredRoles: student.preferredRoles
        ? student.preferredRoles.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      preferredLocations: student.preferredLocations
        ? student.preferredLocations.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch career interests.' });
  }
};

export const updateStudentInterests = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const { careerInterests, preferredRoles, preferredLocations } = req.body;
    const formattedInterests = Array.isArray(careerInterests)
      ? careerInterests.join(', ')
      : careerInterests;
    const formattedRoles = Array.isArray(preferredRoles)
      ? preferredRoles.join(', ')
      : preferredRoles;
    const formattedLocations = Array.isArray(preferredLocations)
      ? preferredLocations.join(', ')
      : preferredLocations;

    const student = await prisma.studentProfile.update({
      where: { userId: req.user!.id },
      data: {
        careerInterests: formattedInterests !== undefined ? formattedInterests : undefined,
        preferredRoles: formattedRoles !== undefined ? formattedRoles : undefined,
        preferredLocations: formattedLocations !== undefined ? formattedLocations : undefined,
      },
    });

    const recommendations = await getStudentRecommendations(student.id);

    res.json({
      message: 'Career interests updated successfully.',
      student,
      recommendations,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to update career interests.' });
  }
};

export const getStudentSkillsToLearn = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.skillsToLearnNext);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skills to learn next.' });
  }
};

export const getStudentSkillGaps = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.skillGaps);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skill gaps.' });
  }
};

export const getStudentRecommendedMentors = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.recommendedMentors);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended mentors.' });
  }
};

export const getStudentRecommendedCollaborations = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const payload = await getStudentRecommendations(student.id);
    res.json(payload.recommendedCollaborations);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended collaborations.' });
  }
};

export const getOpportunityMatchDetails = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const opportunityId = req.params.id as string;
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

    const opportunity: any = await prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        industry: true,
        skills: { include: { skill: true } },
      },
    });

    if (!opportunity) {
      res.status(404).json({ message: 'Opportunity not found.' });
      return;
    }

    const matchResult = await calculateOpportunityMatch(student.id, opportunity.id);

    const PROFICIENCY_RANK: Record<string, number> = {
      BEGINNER: 1,
      INTERMEDIATE: 2,
      ADVANCED: 3,
      EXPERT: 4,
    };

    const studentSkillMap = new Map<string, string>();
    student.skillProfiles.forEach((sp) => {
      studentSkillMap.set(sp.skillId, sp.proficiencyLevel || 'BEGINNER');
    });

    const matchedSkills: Array<{ name: string; requiredLevel: string; studentLevel: string; matchType: 'FULL' | 'PARTIAL' }> = [];
    const partiallyMatchedSkills: Array<{ name: string; requiredLevel: string; studentLevel: string }> = [];
    const unmatchedSkills: Array<{ name: string; requiredLevel: string; isRequired: boolean }> = [];

    for (const os of opportunity.skills) {
      const studentProficiency = studentSkillMap.get(os.skillId);
      const reqProf = os.minProficiency || 'INTERMEDIATE';
      const reqRank = PROFICIENCY_RANK[reqProf] || 2;

      if (studentProficiency) {
        const studentRank = PROFICIENCY_RANK[studentProficiency] || 1;
        if (studentRank >= reqRank) {
          matchedSkills.push({
            name: os.skill.name,
            requiredLevel: reqProf,
            studentLevel: studentProficiency,
            matchType: 'FULL',
          });
        } else {
          matchedSkills.push({
            name: os.skill.name,
            requiredLevel: reqProf,
            studentLevel: studentProficiency,
            matchType: 'PARTIAL',
          });
          partiallyMatchedSkills.push({
            name: os.skill.name,
            requiredLevel: reqProf,
            studentLevel: studentProficiency,
          });
        }
      } else {
        unmatchedSkills.push({
          name: os.skill.name,
          requiredLevel: reqProf,
          isRequired: os.isRequired,
        });
      }
    }

    res.json({
      opportunityId: opportunity.id,
      title: opportunity.title,
      companyName: opportunity.industry.companyName,
      type: opportunity.type,
      compatibilityPercentage: matchResult.matchScore,
      isEligible: matchResult.eligibility.isEligible,
      eligibility: matchResult.eligibility,
      ineligibleReasons: matchResult.eligibility.ineligibleReasons || [],
      goodMatchReasons: matchResult.eligibility.goodMatchReasons || [],
      matchedSkills,
      partiallyMatchedSkills,
      unmatchedSkills,
      breakdown: matchResult.breakdown,
      explanation: matchResult.explanation,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch match details.' });
  }
};

// --------------------------------------------------------------------------
// SKILL PROFILE, SKILL MAPPING, INDUSTRIES & JOB ROLES CONTROLLERS
// --------------------------------------------------------------------------

export const getStudentSkillProfileController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const profile = await getStudentSkillProfile(student.id);
    res.json(profile);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skill profile.' });
  }
};

export const getStudentSkillMappingController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const mapping = await getStudentSkillMapping(student.id);
    res.json(mapping);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch skill mapping.' });
  }
};

export const getStudentRecommendedIndustriesController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const industries = await getRecommendedIndustries(student.id);
    res.json(industries);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended industries.' });
  }
};

export const getStudentRecommendedJobRolesController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }
    const jobRoles = await getRecommendedJobRoles(student.id);
    res.json(jobRoles);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch recommended job roles.' });
  }
};

export const getStudentSkillAssessmentsController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const student = await prisma.studentProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!student) {
      res.status(404).json({ message: 'Student profile not found.' });
      return;
    }

    const studentDomain = resolveDomain({
      department: student.department,
      degree: student.degree,
      institutionName: student.institutionName,
      careerInterests: student.careerInterests,
    });

    const assessments = await prisma.assessment.findMany({
      include: {
        category: true,
        questions: { select: { id: true, skillId: true, difficulty: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const attempts = await prisma.assessmentAttempt.findMany({
      where: { studentId: student.id },
      orderBy: { startedAt: 'desc' },
    });

    const enhanced = assessments.map((ass) => {
      const latestAttempt = attempts.find((att) => att.assessmentId === ass.id) || null;
      
      const assDomain = resolveDomain({
        category: ass.category?.name,
        title: ass.title + ' ' + (ass.description || ''),
      });

      const isDomainMatch = assDomain === studentDomain || assDomain === 'GENERAL';

      return {
        id: ass.id,
        title: ass.title,
        description: ass.description,
        category: ass.category?.name || 'General',
        domain: assDomain,
        isDomainMatch,
        durationMinutes: ass.durationMinutes,
        passingScore: ass.passingScore,
        questionsCount: ass.questions.length,
        latestAttempt,
      };
    });

    // Sort domain-matching assessments first
    enhanced.sort((a, b) => (b.isDomainMatch ? 1 : 0) - (a.isDomainMatch ? 1 : 0));

    res.json(enhanced);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch student assessments.' });
  }
};
