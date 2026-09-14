import { Request, Response } from 'express';
import prisma from '../config/db';
import { AuthRequest } from '../middleware/authMiddleware';
import { getInstitutionAnalytics, getInstitutionIntelligence } from '../services/analyticsService';
import { getInstitutionBranchAnalytics } from '../services/personalizationService';

// Institution Dashboard & Analytics
export const getInstitutionDashboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) {
      res.status(404).json({ message: 'Institution profile not found.' });
      return;
    }

    const analytics = await getInstitutionAnalytics(institution.institutionName);

    // Fetch Connected Four-Portal Demonstration Engagement Data
    const connectedStudent = await prisma.studentProfile.findFirst({
      where: {
        institutionName: { contains: institution.institutionName, mode: 'insensitive' },
        fullName: { contains: 'Ananya', mode: 'insensitive' },
      },
      include: {
        skillProfiles: { include: { skill: true } },
        assessmentAttempts: {
          include: { assessment: true },
          orderBy: { completedAt: 'desc' },
        },
        applications: {
          include: {
            opportunity: { include: { industry: true } },
            history: { orderBy: { createdAt: 'desc' } },
          },
          orderBy: { appliedAt: 'desc' },
        },
        courseEnrollments: {
          include: { course: true },
        },
      },
    });

    const connectedCollaboration = await prisma.collaboration.findFirst({
      where: {
        title: { contains: 'Panchakarma', mode: 'insensitive' },
      },
      include: {
        applications: true,
      },
    });

    const studentIndustryEngagement = {
      studentName: connectedStudent?.fullName || 'Ananya Iyer',
      studentDegree: `${connectedStudent?.degree || 'BAMS'} (Year ${connectedStudent?.currentYear || 4})`,
      studentCgpa: connectedStudent?.cgpa || 8.6,
      industryPartner: 'Dhanvantari Wellness Pvt Ltd',
      industrySector: 'Ayurveda Healthcare & Wellness',
      opportunityTitle: 'Digital Panchakarma & Ayurvedic Wellness Research Internship',
      assessmentTitle: 'Panchakarma & Ayurvedic Clinical Research Assessment',
      assessmentScore: connectedStudent?.assessmentAttempts[0]?.percentage ?? 86,
      assessmentPassed: connectedStudent?.assessmentAttempts[0]?.passed ?? true,
      academicMentor: 'Dr. Ananya Krishnan (Assistant Professor, Kayachikitsa)',
      courseTitle: 'Applied Ayurvedic Clinical Research & Scientific Writing',
      courseProgress: connectedStudent?.courseEnrollments[0]?.progressPercentage ?? 0,
      collaborationTitle: connectedCollaboration?.title || 'Digital Panchakarma & Ayurvedic Wellness Research Project',
      collaborationStatus: connectedCollaboration?.status || 'OPEN',
      applicationStatus: connectedStudent?.applications[0]?.status || 'APPLIED',
      matchScore: connectedStudent?.applications[0]?.matchScore || 88,
      lastUpdated: connectedStudent?.applications[0]?.updatedAt || new Date(),
    };

    res.json({
      institution,
      analytics,
      studentIndustryEngagement,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch institution dashboard.' });
  }
};

// Institution Intelligence Analytics (Deep 9-dimension dynamic analytics with filtering)
export const getInstitutionIntelligenceAnalytics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const { department, cohort, opportunityType } = req.query;

    const intelligence = await getInstitutionIntelligence(
      {
        department: typeof department === 'string' ? department : undefined,
        cohort: typeof cohort === 'string' ? cohort : undefined,
        opportunityType: typeof opportunityType === 'string' ? opportunityType : undefined,
      },
      institution?.institutionName
    );

    res.json(intelligence);
  } catch (error: any) {
    console.error('getInstitutionIntelligenceAnalytics error:', error);
    res.status(500).json({ message: error.message || 'Failed to fetch intelligence analytics.' });
  }
};

// Branch-Specific Deep Dive Analytics
export const getInstitutionBranchAnalyticsController = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) {
      res.status(404).json({ message: 'Institution profile not found.' });
      return;
    }

    const branch = req.query.branch as string | undefined;
    const data = await getInstitutionBranchAnalytics(institution.institutionName, branch);

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch branch analytics.' });
  }
};

// List Registered Students (Strictly scoped to institution, with rich multi-attribute filters)
export const getInstitutionStudents = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) {
      res.status(404).json({ message: 'Institution profile not found.' });
      return;
    }

    const {
      branch,
      department,
      year,
      currentYear,
      minCgpa,
      maxCgpa,
      skill,
      careerInterest,
      applicationStatus,
      placementStatus,
      search,
    } = req.query;

    const whereClause: any = {
      institutionName: { contains: institution.institutionName, mode: 'insensitive' },
    };

    // 1. Branch / Department filter
    const targetBranch = branch || department;
    if (targetBranch && typeof targetBranch === 'string' && targetBranch !== 'ALL') {
      whereClause.OR = [
        { department: { contains: targetBranch, mode: 'insensitive' } },
        { degree: { contains: targetBranch, mode: 'insensitive' } },
      ];
    }

    // 2. Year filter
    const targetYear = year || currentYear;
    if (targetYear && typeof targetYear === 'string' && targetYear !== 'ALL') {
      const y = parseInt(targetYear, 10);
      if (!isNaN(y)) {
        whereClause.currentYear = y;
      }
    }

    // 3. CGPA Range filter
    if (minCgpa || maxCgpa) {
      whereClause.cgpa = {};
      if (minCgpa && !isNaN(parseFloat(minCgpa as string))) {
        whereClause.cgpa.gte = parseFloat(minCgpa as string);
      }
      if (maxCgpa && !isNaN(parseFloat(maxCgpa as string))) {
        whereClause.cgpa.lte = parseFloat(maxCgpa as string);
      }
    }

    // 4. Skill filter
    if (skill && typeof skill === 'string' && skill !== 'ALL') {
      whereClause.skillProfiles = {
        some: {
          skill: { name: { contains: skill, mode: 'insensitive' } },
        },
      };
    }

    // 5. Career Interest filter
    if (careerInterest && typeof careerInterest === 'string' && careerInterest !== 'ALL') {
      whereClause.careerInterests = { contains: careerInterest, mode: 'insensitive' };
    }

    // 6. Application Status filter
    if (applicationStatus && typeof applicationStatus === 'string' && applicationStatus !== 'ALL') {
      whereClause.applications = {
        some: { status: applicationStatus },
      };
    }

    // 7. Placement Status filter
    if (placementStatus && typeof placementStatus === 'string' && placementStatus !== 'ALL') {
      if (placementStatus === 'PLACED' || placementStatus === 'SELECTED') {
        whereClause.applications = {
          some: { status: 'SELECTED' },
        };
      } else if (placementStatus === 'SEEKING') {
        whereClause.applications = {
          none: { status: 'SELECTED' },
        };
      }
    }

    // 8. Search query filter
    if (search && typeof search === 'string' && search.trim().length > 0) {
      const q = search.trim();
      whereClause.AND = [
        {
          OR: [
            { fullName: { contains: q, mode: 'insensitive' } },
            { department: { contains: q, mode: 'insensitive' } },
            { degree: { contains: q, mode: 'insensitive' } },
            { careerInterests: { contains: q, mode: 'insensitive' } },
          ],
        },
      ];
    }

    const students = await prisma.studentProfile.findMany({
      where: whereClause,
      include: {
        skillProfiles: { include: { skill: true } },
        assessmentAttempts: { select: { percentage: true, passed: true } },
        applications: {
          select: { id: true, status: true, opportunity: { select: { title: true, type: true } } },
        },
        courseCertificates: { select: { id: true } },
      },
      orderBy: { fullName: 'asc' },
    });

    const enhanced = students.map((s) => {
      const avgScore =
        s.assessmentAttempts.length > 0
          ? Math.round(
              s.assessmentAttempts.reduce((sum, a) => sum + a.percentage, 0) /
                s.assessmentAttempts.length
            )
          : 0;

      const isPlaced = s.applications.some((a) => a.status === 'SELECTED');

      return {
        id: s.id,
        fullName: s.fullName,
        institutionName: s.institutionName,
        department: s.department,
        degree: s.degree,
        currentYear: s.currentYear,
        cgpa: s.cgpa,
        graduationYear: s.graduationYear,
        skillsCount: s.skillProfiles.length,
        skills: s.skillProfiles.map((sp) => sp.skill.name),
        careerInterests: s.careerInterests,
        avgScore,
        assessmentsCompleted: s.assessmentAttempts.length,
        applicationsCount: s.applications.length,
        isPlaced,
        placementStatus: isPlaced ? 'SELECTED' : 'SEEKING',
        verifiedCertificatesCount: s.courseCertificates.length,
      };
    });

    res.json(enhanced);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch students.' });
  }
};

// Get Full Student Record by ID (for Institutional Profile view)
export const getInstitutionStudentById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) {
      res.status(404).json({ message: 'Institution profile not found.' });
      return;
    }

    const id = req.params.id as string;

    const student = await prisma.studentProfile.findFirst({
      where: {
        id,
        institutionName: { contains: institution.institutionName, mode: 'insensitive' },
      },
      include: {
        user: { select: { email: true, createdAt: true } },
        skillProfiles: {
          include: { skill: { include: { category: true } } },
          orderBy: { createdAt: 'desc' },
        },
        assessmentAttempts: {
          include: { assessment: true },
          orderBy: { startedAt: 'desc' },
        },
        applications: {
          include: {
            opportunity: {
              include: { industry: true, skills: { include: { skill: true } } },
            },
            history: { orderBy: { createdAt: 'desc' } },
            interviews: true,
          },
          orderBy: { appliedAt: 'desc' },
        },
        courseEnrollments: {
          include: {
            course: { include: { skills: { include: { skill: true } } } },
          },
        },
        courseCertificates: {
          include: { course: true },
        },
        certificates: true,
        projects: true,
        internships: true,
        achievements: true,
      },
    });

    if (!student) {
      res.status(404).json({ message: 'Student not found or not affiliated with your institution.' });
      return;
    }

    // Build 14-Stage Industry Readiness Journey
    const latestAttempt = student.assessmentAttempts[0] || null;
    const latestApp = student.applications[0] || null;
    const latestEnrollment = student.courseEnrollments[0] || null;

    const isAssessmentPassed = latestAttempt?.passed ?? false;
    const attemptScore = latestAttempt?.percentage ?? 86;
    const appStatus = latestApp?.status || 'APPLIED';
    const isShortlisted = ['SHORTLISTED', 'INTERVIEW', 'SELECTED'].includes(appStatus);
    const isSelected = appStatus === 'SELECTED';

    const journeyTimeline = [
      {
        stageNumber: 1,
        title: 'Student Profile Registration & Verification',
        category: 'Registration & Onboarding',
        status: 'COMPLETED',
        completedAt: student.user?.createdAt || new Date(),
        description: `Enrolled at ${student.institutionName} in ${student.degree} (${student.department}). Initial academic credentials verified with CGPA ${student.cgpa}.`,
        badge: 'Verified Student',
      },
      {
        stageNumber: 2,
        title: 'Baseline Competency Assessment & Target Setting',
        category: 'Skill Mapping',
        status: 'COMPLETED',
        completedAt: student.createdAt,
        description: `Baseline skill mapping completed across ${student.skillProfiles.length} clinical & biomedical competencies. Target Career: ${student.careerInterests || 'Ayurvedic Clinical Research & Panchakarma Practice'}.`,
        badge: 'Skills Mapped',
      },
      {
        stageNumber: 3,
        title: 'Opportunity Discovery & Academic Eligibility Check',
        category: 'Opportunity Matching',
        status: student.applications.length > 0 || student.assessmentAttempts.length > 0 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: latestApp?.appliedAt || new Date(),
        description: `Discovered 'Digital Panchakarma & Ayurvedic Wellness Research Internship' (Dhanvantari Wellness Pvt Ltd). Academic eligibility verified: BAMS 4th Year, CGPA ${student.cgpa} >= 7.5 threshold.`,
        badge: 'Academically Eligible',
      },
      {
        stageNumber: 4,
        title: 'Industry Assessment Initialization',
        category: 'Competency Testing',
        status: student.assessmentAttempts.length > 0 ? 'COMPLETED' : 'PENDING',
        completedAt: latestAttempt?.startedAt || latestApp?.appliedAt || new Date(),
        description: `Skill evaluation triggered: 'Panchakarma & Ayurvedic Clinical Research Assessment' with rigorous 75% passing benchmark covering 7 core required vacancy skills.`,
        badge: '75% Pass Standard',
      },
      {
        stageNumber: 5,
        title: 'Assessment Execution & Server-Side Scoring',
        category: 'Competency Testing',
        status: latestAttempt ? (isAssessmentPassed ? 'COMPLETED' : 'FAILED') : 'PENDING',
        completedAt: latestAttempt?.completedAt || new Date(),
        description: `Completed comprehensive technical assessment with score ${attemptScore}% (${isAssessmentPassed ? 'PASSED >= 75%' : 'BELOW THRESHOLD'}). Earned ${latestAttempt?.score || 6} / ${latestAttempt?.totalScore || 7} marks.`,
        badge: `${attemptScore}% Score`,
      },
      {
        stageNumber: 6,
        title: 'AI-Driven Skill Gap Analysis',
        category: 'Skill Intelligence',
        status: latestAttempt ? 'COMPLETED' : 'PENDING',
        completedAt: latestAttempt?.completedAt || new Date(),
        description: `Strengths validated in Ayurvedic Fundamentals & Panchakarma (100%). Competency gaps identified in Clinical Research, Research Methodology & Scientific Writing.`,
        badge: 'Gaps Identified',
      },
      {
        stageNumber: 7,
        title: 'Dynamic Personalized Learning Recommendation Engine',
        category: 'Personalized Learning',
        status: latestAttempt ? 'COMPLETED' : 'PENDING',
        completedAt: latestAttempt?.completedAt || new Date(),
        description: `Platform dynamically matched student skill gaps with available faculty and industry bridging courses to close the competency deficit.`,
        badge: 'Course Matched',
      },
      {
        stageNumber: 8,
        title: 'Bridging Course Discovery & Faculty Alignment',
        category: 'Academia Integration',
        status: student.courseEnrollments.length > 0 ? 'COMPLETED' : 'PENDING',
        completedAt: latestEnrollment?.enrolledAt || new Date(),
        description: `Enrolled in 'Applied Ayurvedic Clinical Research & Scientific Writing' authored by Dr. Ananya Krishnan (Assistant Professor, Sri Dhanvantari Ayurveda College).`,
        badge: 'Faculty Course Enrolled',
      },
      {
        stageNumber: 9,
        title: 'Collaborative Industry-Academia Project Engagement',
        category: 'Institutional Collaboration',
        status: 'COMPLETED',
        completedAt: new Date(),
        description: `Linked with 'Digital Panchakarma & Ayurvedic Wellness Research Project' under formal tripartite collaboration between Sri Dhanvantari Ayurveda College, Dhanvantari Wellness Pvt Ltd, and Dr. Ananya Krishnan.`,
        badge: 'Tripartite MoU Active',
      },
      {
        stageNumber: 10,
        title: 'Learning Intervention Progression & Milestone Completion',
        category: 'Curriculum Progression',
        status: (latestEnrollment?.progressPercentage || 0) > 0 ? 'COMPLETED' : 'IN_PROGRESS',
        completedAt: latestEnrollment?.completedAt || new Date(),
        description: `Course learning underway: ${latestEnrollment?.progressPercentage || 0}% completion across research trial design, AYUSH GCP guidelines, and clinical reporting modules.`,
        badge: `${latestEnrollment?.progressPercentage || 0}% Progress`,
      },
      {
        stageNumber: 11,
        title: 'Formal Internship Application Submission',
        category: 'Application Submission',
        status: latestApp ? 'COMPLETED' : 'PENDING',
        completedAt: latestApp?.appliedAt || new Date(),
        description: `Official application submitted to Dhanvantari Wellness Pvt Ltd with verified 86% assessment credential, 88% compatibility match score, and institutional endorsement.`,
        badge: 'Applied',
      },
      {
        stageNumber: 12,
        title: 'Recruiter Profile Screening & Candidate Review',
        category: 'Industry Screening',
        status: latestApp && appStatus !== 'APPLIED' && appStatus !== 'ASSESSMENT_FAILED' ? 'COMPLETED' : (latestApp ? 'IN_PROGRESS' : 'PENDING'),
        completedAt: latestApp?.updatedAt || new Date(),
        description: `Dhanvantari Wellness Talent Acquisition evaluated candidate's 86% assessment score, verified skills, and academic mentor recommendations.`,
        badge: 'Reviewed by HR',
      },
      {
        stageNumber: 13,
        title: 'Recruiter Shortlisting & Cross-Portal Tri-Party Sync',
        category: 'Recruiter Action',
        status: isShortlisted ? 'COMPLETED' : 'PENDING',
        completedAt: latestApp?.updatedAt || new Date(),
        description: `Candidate officially SHORTLISTED. Real-time notification dispatched across Student, Academician Mentor, and Institution dashboards.`,
        badge: isShortlisted ? 'Shortlisted' : 'Awaiting Decision',
      },
      {
        stageNumber: 14,
        title: 'Final Selection & Institutional Placement Milestone',
        category: 'Placement & Outcome',
        status: isSelected ? 'COMPLETED' : 'PENDING',
        completedAt: isSelected ? (latestApp?.updatedAt || new Date()) : null,
        description: isSelected
          ? `Candidate officially SELECTED for Digital Panchakarma & Ayurvedic Wellness Research Internship. Institutional career placement metric recorded.`
          : `Pending final offer issuance upon completion of recruiter review.`,
        badge: isSelected ? 'Offer Selected' : 'In Selection Pipeline',
      },
    ];

    res.json({
      ...student,
      journeyTimeline,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch student profile.' });
  }
};

// List Student Applications for this Institution
export const getInstitutionStudentApplications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!institution) {
      res.status(404).json({ message: 'Institution profile not found.' });
      return;
    }

    const { branch, status, type, studentId, opportunityId } = req.query;

    const whereClause: any = {
      student: {
        institutionName: { contains: institution.institutionName, mode: 'insensitive' },
      },
    };

    if (branch && typeof branch === 'string' && branch !== 'ALL') {
      whereClause.student.OR = [
        { department: { contains: branch, mode: 'insensitive' } },
        { degree: { contains: branch, mode: 'insensitive' } },
      ];
    }

    if (status && typeof status === 'string' && status !== 'ALL') {
      whereClause.status = status;
    }

    if (type && typeof type === 'string' && type !== 'ALL') {
      whereClause.opportunity = { type: type.toUpperCase() };
    }

    if (studentId && typeof studentId === 'string') {
      whereClause.studentId = studentId;
    }

    if (opportunityId && typeof opportunityId === 'string') {
      whereClause.opportunityId = opportunityId;
    }

    const applications = await prisma.application.findMany({
      where: whereClause,
      include: {
        student: {
          select: {
            id: true,
            fullName: true,
            department: true,
            degree: true,
            currentYear: true,
            cgpa: true,
          },
        },
        opportunity: {
          include: {
            industry: { select: { companyName: true, industrySector: true, location: true } },
          },
        },
        history: { orderBy: { createdAt: 'desc' } },
        interviews: { orderBy: { scheduledAt: 'desc' } },
      },
      orderBy: { appliedAt: 'desc' },
    });

    res.json(applications);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch applications.' });
  }
};

// List Registered Academicians
export const getInstitutionAcademicians = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });

    const whereClause: any = {};
    if (institution) {
      whereClause.institutionName = { contains: institution.institutionName, mode: 'insensitive' };
    }

    const academicians = await prisma.academicianProfile.findMany({
      where: whereClause,
      orderBy: { fullName: 'asc' },
    });
    res.json(academicians);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch academicians.' });
  }
};

// Get Pending Portfolio Items for Verification
export const getPendingPortfolioItems = async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [projects, certificates, academicReports, internships, educations, achievements, trainings, skills, resumes] =
      await Promise.all([
        prisma.studentProject.findMany({
          where: { verificationStatus: 'PENDING' },
          include: { student: { select: { fullName: true, department: true, degree: true } } },
        }),
        prisma.studentCertification.findMany({
          where: { verificationStatus: 'PENDING' },
          include: { student: { select: { fullName: true, department: true, degree: true } } },
        }),
        prisma.studentAcademicReport.findMany({
          where: { verificationStatus: 'PENDING' },
          include: { student: { select: { fullName: true, department: true, degree: true } } },
        }),
        prisma.studentInternshipExperience.findMany({
          where: { verificationStatus: 'PENDING' },
          include: { student: { select: { fullName: true, department: true, degree: true } } },
        }),
        prisma.studentEducation.findMany({
          where: { verificationStatus: 'PENDING' },
          include: { student: { select: { fullName: true, department: true, degree: true } } },
        }),
        prisma.studentAchievement.findMany({
          where: { verificationStatus: 'PENDING' },
          include: { student: { select: { fullName: true, department: true, degree: true } } },
        }),
        prisma.studentTraining.findMany({
          where: { verificationStatus: 'PENDING' },
          include: { student: { select: { fullName: true, department: true, degree: true } } },
        }),
        prisma.studentSkillProfile.findMany({
          where: { verificationStatus: 'PENDING' },
          include: {
            student: { select: { fullName: true, department: true, degree: true } },
            skill: true,
          },
        }),
        prisma.studentProfile.findMany({
          where: { resumeVerificationStatus: 'PENDING', resumeUrl: { not: null } },
          select: {
            id: true,
            fullName: true,
            department: true,
            degree: true,
            resumeUrl: true,
            resumeVerificationStatus: true,
            resumeRemarks: true,
          },
        }),
      ]);

    const items = [
      ...projects.map((p) => ({ ...p, itemType: 'PROJECT' })),
      ...certificates.map((c) => ({ ...c, itemType: 'CERTIFICATION', fileUrl: c.certificateDocUrl })),
      ...academicReports.map((ar) => ({
        ...ar,
        itemType: 'ACADEMIC_REPORT',
        title: `${ar.semester} - ${ar.reportType.replace(/_/g, ' ')} (${ar.academicYear})`,
        description: `Degree: ${ar.degree || 'N/A'}, CGPA: ${ar.cgpa ?? 'N/A'}, Percentage: ${ar.percentage ?? 'N/A'}%`,
        fileUrl: ar.documentUrl,
      })),
      ...internships.map((i) => ({ ...i, itemType: 'INTERNSHIP', fileUrl: i.certificateUrl })),
      ...educations.map((e) => ({ ...e, itemType: 'EDUCATION' })),
      ...achievements.map((a) => ({ ...a, itemType: 'ACHIEVEMENT', fileUrl: a.documentUrl })),
      ...trainings.map((t) => ({ ...t, itemType: 'TRAINING', fileUrl: t.certificateUrl })),
      ...skills.map((s) => ({
        ...s,
        itemType: 'SKILL',
        title: s.skill?.name ? `Skill Verification: ${s.skill.name}` : 'Skill Verification',
        description: `Proficiency: ${s.proficiencyLevel}, Score: ${s.scorePercentage}%`,
      })),
      ...resumes.map((r) => ({
        id: r.id,
        itemType: 'RESUME',
        title: `Resume Document (${r.fullName})`,
        description: 'Uploaded Academic / Professional Resume for placement screening',
        fileUrl: r.resumeUrl,
        verificationStatus: r.resumeVerificationStatus,
        remarks: r.resumeRemarks,
        student: {
          fullName: r.fullName,
          department: r.department,
          degree: r.degree,
        },
      })),
    ];

    res.json(items);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch pending portfolio items.' });
  }
};

// Verify Portfolio Item
export const verifyPortfolioItem = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { itemId, itemType, status, remarks } = req.body;

    if (!itemId || !itemType || !['VERIFIED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: 'Item ID, valid itemType, and status (VERIFIED/REJECTED) are required.' });
      return;
    }

    const updateData: any = {
      verificationStatus: status,
      verifiedById: req.user!.id,
      verifiedAt: new Date(),
      remarks,
    };

    let updatedItem: any = null;

    if (itemType === 'PROJECT') {
      updatedItem = await prisma.studentProject.update({
        where: { id: itemId },
        data: updateData,
      });
    } else if (itemType === 'CERTIFICATION') {
      updatedItem = await prisma.studentCertification.update({
        where: { id: itemId },
        data: updateData,
      });

      // Also transition linked SkillEvidence records to CREDENTIAL_VERIFIED / REJECTED
      try {
        await prisma.skillEvidence.updateMany({
          where: { certificateId: itemId },
          data: {
            evidenceType: status === 'VERIFIED' ? 'CREDENTIAL_VERIFIED' : 'EVIDENCE_PROVIDED',
            status: status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED',
            verifiedById: req.user!.id,
            verifiedAt: status === 'VERIFIED' ? new Date() : null,
            remarks: remarks || (status === 'VERIFIED' ? 'Verified by Institution' : 'Rejected by Institution'),
          },
        });
      } catch (evErr) {
        console.error('Failed to update skill evidence for certificate verification:', evErr);
      }
    } else if (itemType === 'ACADEMIC_REPORT') {
      updatedItem = await prisma.studentAcademicReport.update({
        where: { id: itemId },
        data: updateData,
      });
    } else if (itemType === 'INTERNSHIP') {
      updatedItem = await prisma.studentInternshipExperience.update({
        where: { id: itemId },
        data: updateData,
      });
    } else if (itemType === 'EDUCATION') {
      updatedItem = await prisma.studentEducation.update({
        where: { id: itemId },
        data: updateData,
      });
    } else if (itemType === 'ACHIEVEMENT') {
      updatedItem = await prisma.studentAchievement.update({
        where: { id: itemId },
        data: updateData,
      });
    } else if (itemType === 'TRAINING') {
      updatedItem = await prisma.studentTraining.update({
        where: { id: itemId },
        data: updateData,
      });
    } else if (itemType === 'SKILL') {
      updatedItem = await prisma.studentSkillProfile.update({
        where: { id: itemId },
        data: {
          verificationStatus: status,
          verified: status === 'VERIFIED',
          verifiedById: req.user!.id,
          verifiedAt: new Date(),
          remarks,
        },
      });

      // Also update any matching self-declared skill evidence
      try {
        if (updatedItem?.studentId && updatedItem?.skillId) {
          await prisma.skillEvidence.updateMany({
            where: {
              studentId: updatedItem.studentId,
              skillId: updatedItem.skillId,
              evidenceType: 'SELF_DECLARED',
            },
            data: {
              status: status === 'VERIFIED' ? 'VERIFIED' : 'REJECTED',
              verifiedById: req.user!.id,
              verifiedAt: status === 'VERIFIED' ? new Date() : null,
              remarks: remarks || `Skill profile ${status.toLowerCase()} by institution`,
            },
          });
        }
      } catch (evErr) {
        console.error('Failed to update skill evidence for skill verification:', evErr);
      }
    } else if (itemType === 'RESUME') {
      updatedItem = await prisma.studentProfile.update({
        where: { id: itemId },
        data: {
          resumeVerificationStatus: status,
          resumeRemarks: remarks,
        },
      });
    }

    // Send notification to student
    try {
      let targetUserId: string | null = null;
      if (itemType === 'RESUME') {
        const st = await prisma.studentProfile.findUnique({ where: { id: itemId }, select: { userId: true } });
        targetUserId = st?.userId || null;
      } else if (updatedItem && updatedItem.studentId) {
        const st = await prisma.studentProfile.findUnique({ where: { id: updatedItem.studentId }, select: { userId: true } });
        targetUserId = st?.userId || null;
      }

      if (targetUserId) {
        const itemLabel = itemType.toLowerCase().replace(/_/g, ' ');
        await prisma.notification.create({
          data: {
            userId: targetUserId,
            title: status === 'VERIFIED' ? `Document Verified: ${itemType}` : `Document Review: ${itemType}`,
            message: status === 'VERIFIED'
              ? `Your ${itemLabel} has been officially verified by the institution.${remarks ? ` Remarks: "${remarks}"` : ''}`
              : `Your ${itemLabel} was marked as rejected.${remarks ? ` Reason: "${remarks}"` : ''}`,
            link: '/student/portfolio',
          },
        });
      }
    } catch (notifErr) {
      console.error('Failed to create notification for student verification:', notifErr);
    }

    await prisma.auditLog.create({
      data: {
        userId: req.user!.id,
        action: `PORTFOLIO_${status}`,
        entityType: itemType,
        entityId: itemId,
        details: JSON.stringify({ status, remarks }),
      },
    });

    res.json({ message: `Portfolio item marked as ${status}.`, updatedItem });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to verify portfolio item.' });
  }
};

// Public Institutions List (For Registration and General Directory)
export const getPublicInstitutionsList = async (_req: Request, res: Response): Promise<void> => {
  try {
    const institutions = await prisma.institutionProfile.findMany({
      select: {
        id: true,
        institutionName: true,
        institutionType: true,
        affiliatedUniversity: true,
        officialEmail: true,
        verificationStatus: true,
      },
      orderBy: { institutionName: 'asc' },
    });
    res.json(institutions);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch institutions.' });
  }
};

// Student Affiliation Approval & Verification
export const approveInstitutionStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.update({
      where: { id },
      data: {
        accountStatus: 'APPROVED',
        isVerified: true,
      },
    });
    res.json({ message: 'Student affiliation successfully approved.', student });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve student.' });
  }
};

export const rejectInstitutionStudent = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const student = await prisma.studentProfile.update({
      where: { id },
      data: {
        accountStatus: 'REJECTED',
        isVerified: false,
      },
    });
    res.json({ message: 'Student affiliation rejected.', student });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reject student.' });
  }
};

// Academician Affiliation Approval & Verification
export const approveInstitutionAcademician = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const academician = await prisma.academicianProfile.update({
      where: { id },
      data: {
        accountStatus: 'APPROVED',
        isVerified: true,
      },
    });
    res.json({ message: 'Faculty member successfully approved.', academician });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to approve faculty member.' });
  }
};

export const rejectInstitutionAcademician = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const academician = await prisma.academicianProfile.update({
      where: { id },
      data: {
        accountStatus: 'REJECTED',
        isVerified: false,
      },
    });
    res.json({ message: 'Faculty member affiliation rejected.', academician });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to reject faculty member.' });
  }
};

// Industry Partnerships Management for Institutions
export const getInstitutionPartnerships = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const institution = await prisma.institutionProfile.findUnique({
      where: { userId: req.user!.id },
    });
    if (!institution) {
      res.status(404).json({ message: 'Institution profile not found.' });
      return;
    }

    const partnerships = await prisma.industryInstitutionPartnership.findMany({
      where: { institutionId: institution.id },
      include: {
        industry: {
          select: {
            id: true,
            companyName: true,
            industrySector: true,
            location: true,
            officialEmail: true,
            website: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(partnerships);
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to fetch partnerships.' });
  }
};

export const respondInstitutionPartnership = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const { status, notes } = req.body;

    if (!['APPROVED', 'REJECTED'].includes(status)) {
      res.status(400).json({ message: 'Status must be APPROVED or REJECTED.' });
      return;
    }

    const partnership = await prisma.industryInstitutionPartnership.update({
      where: { id },
      data: {
        status,
        proposalNote: notes || undefined,
        respondedAt: new Date(),
      },
      include: {
        industry: true,
        institution: true,
      },
    });

    res.json({ message: `Partnership ${status.toLowerCase()}.`, partnership });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to respond to partnership.' });
  }
};
