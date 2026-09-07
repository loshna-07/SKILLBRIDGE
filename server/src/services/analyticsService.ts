import prisma from '../config/db';

export const getPublicPlatformStats = async () => {
  const [
    totalStudents,
    totalAcademicians,
    totalCompanies,
    totalInstitutions,
    totalCourses,
    totalInternships,
    totalJobs,
    totalCollaborations,
    totalOpportunities,
  ] = await Promise.all([
    prisma.studentProfile.count(),
    prisma.academicianProfile.count(),
    prisma.industryProfile.count(),
    prisma.institutionProfile.count(),
    prisma.course.count({ where: { status: 'PUBLISHED' } }),
    prisma.opportunity.count({ where: { isPublished: true, type: 'INTERNSHIP' } }),
    prisma.opportunity.count({ where: { isPublished: true, type: 'JOB' } }),
    prisma.collaboration.count(),
    prisma.opportunity.count({ where: { isPublished: true } }),
  ]);

  return {
    totalStudents,
    totalAcademicians,
    totalCompanies,
    totalInstitutions,
    totalCourses,
    totalInternships,
    totalJobs,
    totalCollaborations,
    totalOpportunities,
  };
};

export interface IntelligenceFilters {
  department?: string;
  cohort?: string;
  opportunityType?: string;
}

export const getInstitutionIntelligence = async (
  filters: IntelligenceFilters = {},
  institutionName?: string
) => {
  const { department, cohort, opportunityType } = filters;

  // Build student scope filter
  const studentWhere: any = {};
  if (institutionName) {
    studentWhere.institutionName = { contains: institutionName, mode: 'insensitive' };
  }
  if (department && department !== 'ALL') {
    studentWhere.department = { equals: department, mode: 'insensitive' };
  }
  if (cohort && cohort !== 'ALL') {
    const gradYear = parseInt(cohort, 10);
    if (!isNaN(gradYear)) {
      studentWhere.graduationYear = gradYear;
    }
  }

  // Opportunity scope filter
  const oppWhere: any = { isPublished: true };
  if (opportunityType && opportunityType !== 'ALL') {
    oppWhere.type = opportunityType.toUpperCase();
  }

  // 1. Overall counts to determine hasData
  const [totalStudentsAll, totalOpportunitiesAll, totalCollaborationsAll, totalApplicationsAll] =
    await Promise.all([
      prisma.studentProfile.count({ where: institutionName ? { institutionName: { contains: institutionName, mode: 'insensitive' } } : {} }),
      prisma.opportunity.count({ where: { isPublished: true } }),
      prisma.collaboration.count(),
      prisma.application.count(),
    ]);

  const hasData =
    totalStudentsAll > 0 ||
    totalOpportunitiesAll > 0 ||
    totalCollaborationsAll > 0 ||
    totalApplicationsAll > 0;

  // Filter options for dynamic UI dropdowns
  const [distinctDepts, distinctGradYears] = await Promise.all([
    prisma.studentProfile.findMany({
      where: institutionName ? { institutionName: { contains: institutionName, mode: 'insensitive' } } : {},
      select: { department: true },
      distinct: ['department'],
    }),
    prisma.studentProfile.findMany({
      where: institutionName ? { institutionName: { contains: institutionName, mode: 'insensitive' } } : {},
      select: { graduationYear: true },
      distinct: ['graduationYear'],
    }),
  ]);

  const availableDepartments = distinctDepts
    .map((d) => d.department)
    .filter((d): d is string => Boolean(d && d.trim().length > 0))
    .sort();

  const availableCohorts = distinctGradYears
    .map((y) => y.graduationYear?.toString())
    .filter((y): y is string => Boolean(y))
    .sort();

  // Scoped Total Students
  const totalStudents = await prisma.studentProfile.count({ where: studentWhere });

  // 2. Dimension 1: Student Skill Distribution
  const studentSkillProfiles = await prisma.studentSkillProfile.findMany({
    where: { student: studentWhere },
    include: {
      skill: {
        include: { category: true },
      },
    },
  });

  const proficiencyCounts = {
    BEGINNER: 0,
    INTERMEDIATE: 0,
    ADVANCED: 0,
    EXPERT: 0,
  };
  const skillCountMap: Record<string, { count: number; verifiedCount: number; category: string }> = {};
  const categoryCountMap: Record<string, number> = {};

  for (const sp of studentSkillProfiles) {
    const prof = (sp.proficiencyLevel || 'BEGINNER').toUpperCase() as keyof typeof proficiencyCounts;
    if (proficiencyCounts[prof] !== undefined) {
      proficiencyCounts[prof]++;
    } else {
      proficiencyCounts.BEGINNER++;
    }

    const sName = sp.skill.name;
    const catName = sp.skill.category?.name || 'General';

    if (!skillCountMap[sName]) {
      skillCountMap[sName] = { count: 0, verifiedCount: 0, category: catName };
    }
    skillCountMap[sName].count++;
    if (sp.verified) skillCountMap[sName].verifiedCount++;

    categoryCountMap[catName] = (categoryCountMap[catName] || 0) + 1;
  }

  const totalSkillsTracked = studentSkillProfiles.length;
  const topStudentSkills = Object.entries(skillCountMap)
    .map(([skill, data]) => ({
      skill,
      count: data.count,
      verifiedCount: data.verifiedCount,
      category: data.category,
      percentage: totalStudents > 0 ? Math.round((data.count / totalStudents) * 100) : 0,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  const studentSkillDistribution = {
    totalSkillsTracked,
    proficiencyCounts,
    proficiencyPercentages: {
      BEGINNER: totalSkillsTracked > 0 ? Math.round((proficiencyCounts.BEGINNER / totalSkillsTracked) * 100) : 0,
      INTERMEDIATE: totalSkillsTracked > 0 ? Math.round((proficiencyCounts.INTERMEDIATE / totalSkillsTracked) * 100) : 0,
      ADVANCED: totalSkillsTracked > 0 ? Math.round((proficiencyCounts.ADVANCED / totalSkillsTracked) * 100) : 0,
      EXPERT: totalSkillsTracked > 0 ? Math.round((proficiencyCounts.EXPERT / totalSkillsTracked) * 100) : 0,
    },
    topStudentSkills,
    categoryDistribution: Object.entries(categoryCountMap).map(([category, count]) => ({
      category,
      count,
    })),
  };

  // 3. Dimension 2 & 3: Industry Skill Demand & Skill Gaps
  const opportunitySkills = await prisma.opportunitySkill.findMany({
    where: { opportunity: oppWhere },
    include: {
      skill: {
        include: { category: true },
      },
      opportunity: {
        select: { type: true, workMode: true },
      },
    },
  });

  const industryDemandMap: Record<string, { total: number; internship: number; job: number; category: string }> = {};
  const workModeDemandMap: Record<string, number> = { ON_SITE: 0, REMOTE: 0, HYBRID: 0 };

  for (const os of opportunitySkills) {
    const sName = os.skill.name;
    const catName = os.skill.category?.name || 'General';
    if (!industryDemandMap[sName]) {
      industryDemandMap[sName] = { total: 0, internship: 0, job: 0, category: catName };
    }
    industryDemandMap[sName].total++;
    if (os.opportunity.type === 'INTERNSHIP') industryDemandMap[sName].internship++;
    if (os.opportunity.type === 'JOB') industryDemandMap[sName].job++;

    const mode = os.opportunity.workMode || 'ON_SITE';
    workModeDemandMap[mode] = (workModeDemandMap[mode] || 0) + 1;
  }

  const topInDemandSkills = Object.entries(industryDemandMap)
    .map(([skill, d]) => ({
      skill,
      totalDemand: d.total,
      internshipDemand: d.internship,
      jobDemand: d.job,
      category: d.category,
    }))
    .sort((a, b) => b.totalDemand - a.totalDemand)
    .slice(0, 10);

  // Skill Gaps: compare student supply with industry demand
  const allUniqueSkills = Array.from(
    new Set([...Object.keys(skillCountMap), ...Object.keys(industryDemandMap)])
  );

  const skillGaps = allUniqueSkills
    .map((skill) => {
      const studentCount = skillCountMap[skill]?.count || 0;
      const industryDemand = industryDemandMap[skill]?.total || 0;
      const gap = industryDemand - studentCount; // positive = shortage/deficit, negative = surplus
      return {
        skill,
        studentCount,
        industryDemand,
        gap,
        isDeficit: gap > 0,
        isSurplus: gap < 0,
        balanceRatio: industryDemand > 0 ? Math.round((studentCount / industryDemand) * 100) : 100,
      };
    })
    .sort((a, b) => b.gap - a.gap);

  const criticalSkillGaps = skillGaps.filter((g) => g.isDeficit).slice(0, 8);

  const industrySkillDemand = {
    topInDemandSkills,
    workModeDemand: Object.entries(workModeDemandMap).map(([mode, count]) => ({ mode, count })),
    totalOpportunitySkills: opportunitySkills.length,
  };

  // 4. Dimension 4 & 5: Internship Applications & Internship Selection
  const internshipApplications = await prisma.application.findMany({
    where: {
      opportunity: { type: 'INTERNSHIP', isPublished: true },
      student: studentWhere,
    },
    include: {
      student: { select: { department: true } },
      opportunity: {
        select: {
          title: true,
          industry: { select: { companyName: true } },
        },
      },
    },
  });

  const totalInternshipApps = internshipApplications.length;
  const internshipStatusCounts = {
    APPLIED: 0,
    REVIEWING: 0,
    SHORTLISTED: 0,
    INTERVIEW: 0,
    SELECTED: 0,
    REJECTED: 0,
  };
  const internshipDeptMap: Record<string, { applied: number; selected: number }> = {};
  const hiringCompaniesMap: Record<string, number> = {};

  for (const app of internshipApplications) {
    const st = app.status.toUpperCase() as keyof typeof internshipStatusCounts;
    if (internshipStatusCounts[st] !== undefined) {
      internshipStatusCounts[st]++;
    } else {
      internshipStatusCounts.APPLIED++;
    }

    const dept = app.student.department || 'General';
    if (!internshipDeptMap[dept]) {
      internshipDeptMap[dept] = { applied: 0, selected: 0 };
    }
    internshipDeptMap[dept].applied++;
    if (app.status === 'SELECTED') {
      internshipDeptMap[dept].selected++;
    }

    if (app.status === 'SELECTED' && app.opportunity.industry?.companyName) {
      const cName = app.opportunity.industry.companyName;
      hiringCompaniesMap[cName] = (hiringCompaniesMap[cName] || 0) + 1;
    }
  }

  const selectedInternshipsCount = internshipStatusCounts.SELECTED;
  const internshipSelectionRate =
    totalInternshipApps > 0 ? Math.round((selectedInternshipsCount / totalInternshipApps) * 100) : 0;

  const internshipApplicationsData = {
    totalApplications: totalInternshipApps,
    statusBreakdown: internshipStatusCounts,
    departmentBreakdown: Object.entries(internshipDeptMap).map(([department, data]) => ({
      department,
      applied: data.applied,
      selected: data.selected,
    })),
  };

  const internshipSelectionData = {
    selectedCount: selectedInternshipsCount,
    selectionRate: internshipSelectionRate,
    selectionByDepartment: Object.entries(internshipDeptMap).map(([department, data]) => ({
      department,
      applied: data.applied,
      selected: data.selected,
      selectionRate: data.applied > 0 ? Math.round((data.selected / data.applied) * 100) : 0,
    })),
    topHiringCompanies: Object.entries(hiringCompaniesMap).map(([company, count]) => ({
      company,
      count,
    })),
  };

  // 5. Dimension 6: Placement Pipeline (Recruitment Funnel)
  const pipelineAppWhere: any = { student: studentWhere };
  if (opportunityType && opportunityType !== 'ALL') {
    pipelineAppWhere.opportunity = { type: opportunityType.toUpperCase() };
  }

  const allPipelineApps = await prisma.application.findMany({
    where: pipelineAppWhere,
    select: { status: true },
  });

  const totalPipelineApps = allPipelineApps.length;
  const shortlistedApps = allPipelineApps.filter((a) =>
    ['SHORTLISTED', 'INTERVIEW', 'SELECTED'].includes(a.status)
  ).length;
  const interviewApps = allPipelineApps.filter((a) =>
    ['INTERVIEW', 'SELECTED'].includes(a.status)
  ).length;
  const selectedApps = allPipelineApps.filter((a) => a.status === 'SELECTED').length;
  const rejectedApps = allPipelineApps.filter((a) => a.status === 'REJECTED').length;

  const placementPipeline = {
    totalApplications: totalPipelineApps,
    stages: [
      { stage: 'Applied', count: totalPipelineApps, percentage: 100 },
      {
        stage: 'Shortlisted',
        count: shortlistedApps,
        percentage: totalPipelineApps > 0 ? Math.round((shortlistedApps / totalPipelineApps) * 100) : 0,
      },
      {
        stage: 'Interview',
        count: interviewApps,
        percentage: totalPipelineApps > 0 ? Math.round((interviewApps / totalPipelineApps) * 100) : 0,
      },
      {
        stage: 'Selected',
        count: selectedApps,
        percentage: totalPipelineApps > 0 ? Math.round((selectedApps / totalPipelineApps) * 100) : 0,
      },
    ],
    conversionRates: {
      appToShortlist: totalPipelineApps > 0 ? Math.round((shortlistedApps / totalPipelineApps) * 100) : 0,
      shortlistToInterview: shortlistedApps > 0 ? Math.round((interviewApps / shortlistedApps) * 100) : 0,
      interviewToSelected: interviewApps > 0 ? Math.round((selectedApps / interviewApps) * 100) : 0,
      overallConversion: totalPipelineApps > 0 ? Math.round((selectedApps / totalPipelineApps) * 100) : 0,
    },
    rejectedCount: rejectedApps,
  };

  // 6. Dimension 7: Learning Participation
  const learningEnrollments = await prisma.learningEnrollment.findMany({
    where: { student: studentWhere },
    include: {
      program: { select: { type: true, title: true } },
    },
  });

  const totalEnrollments = learningEnrollments.length;
  const programTypeCounts: Record<string, number> = {
    TRAINING: 0,
    CERTIFICATION: 0,
    WORKSHOP: 0,
    BOOTCAMP: 0,
    MENTORSHIP: 0,
  };
  const enrollmentStatusCounts = {
    ENROLLED: 0,
    IN_PROGRESS: 0,
    COMPLETED: 0,
  };

  for (const enr of learningEnrollments) {
    const pType = enr.program?.type?.toUpperCase();
    if (pType && programTypeCounts[pType] !== undefined) {
      programTypeCounts[pType]++;
    }
    const eStatus = enr.status?.toUpperCase() as keyof typeof enrollmentStatusCounts;
    if (enrollmentStatusCounts[eStatus] !== undefined) {
      enrollmentStatusCounts[eStatus]++;
    }
  }

  const learningParticipation = {
    totalEnrollments,
    byType: Object.entries(programTypeCounts).map(([type, count]) => ({ type, count })),
    byStatus: enrollmentStatusCounts,
    completionRate:
      totalEnrollments > 0 ? Math.round((enrollmentStatusCounts.COMPLETED / totalEnrollments) * 100) : 0,
  };

  // 7. Dimension 8: Industry Collaboration
  const [collaborations, collaborationApplications] = await Promise.all([
    prisma.collaboration.findMany({
      select: { type: true, status: true, initiatorRole: true },
    }),
    prisma.collaborationApplication.findMany({
      select: { status: true },
    }),
  ]);

  const collabTypeCounts: Record<string, number> = {
    FACULTY_INTERNSHIP: 0,
    INDUSTRIAL_TRAINING: 0,
    FDP: 0,
    CONSULTANCY: 0,
    RESEARCH: 0,
    RESEARCH_PROJECT: 0,
    WORKSHOP: 0,
    GUEST_LECTURE: 0,
    MENTORSHIP: 0,
    LIVE_PROJECT: 0,
    INNOVATION_CHALLENGE: 0,
    INDUSTRY_VISIT: 0,
  };
  const collabStatusCounts: Record<string, number> = {};

  for (const c of collaborations) {
    const ct = c.type.toUpperCase();
    if (collabTypeCounts[ct] !== undefined) {
      collabTypeCounts[ct]++;
    } else if (ct === 'RESEARCH_PROJECT') {
      collabTypeCounts.RESEARCH = (collabTypeCounts.RESEARCH || 0) + 1;
    }
    const cs = c.status.toUpperCase();
    collabStatusCounts[cs] = (collabStatusCounts[cs] || 0) + 1;
  }

  const industryCollaboration = {
    totalCollaborations: collaborations.length,
    byType: Object.entries(collabTypeCounts).map(([type, count]) => ({ type, count })),
    byStatus: Object.entries(collabStatusCounts).map(([status, count]) => ({ status, count })),
    totalApplications: collaborationApplications.length,
    acceptedEngagements: collaborationApplications.filter((a) => a.status === 'ACCEPTED').length,
  };

  // 8. Dimension 9: Department-Wise Readiness
  const allStudents = await prisma.studentProfile.findMany({
    where: institutionName ? { institutionName: { contains: institutionName, mode: 'insensitive' } } : {},
    include: {
      skillProfiles: { select: { id: true } },
      assessmentAttempts: {
        where: { completedAt: { not: null } },
        select: { percentage: true },
      },
      applications: {
        select: { status: true },
      },
    },
  });

  const departmentMap: Record<
    string,
    {
      studentCount: number;
      assessedStudents: number;
      totalScoreSum: number;
      scoreCount: number;
      totalSkills: number;
      totalApps: number;
      selectedCount: number;
    }
  > = {};

  for (const s of allStudents) {
    const dept = s.department || 'General';
    if (!departmentMap[dept]) {
      departmentMap[dept] = {
        studentCount: 0,
        assessedStudents: 0,
        totalScoreSum: 0,
        scoreCount: 0,
        totalSkills: 0,
        totalApps: 0,
        selectedCount: 0,
      };
    }
    departmentMap[dept].studentCount++;
    departmentMap[dept].totalSkills += s.skillProfiles.length;
    departmentMap[dept].totalApps += s.applications.length;
    departmentMap[dept].selectedCount += s.applications.filter((a) => a.status === 'SELECTED').length;

    if (s.assessmentAttempts.length > 0) {
      departmentMap[dept].assessedStudents++;
      const avgStudentScore =
        s.assessmentAttempts.reduce((sum, a) => sum + a.percentage, 0) / s.assessmentAttempts.length;
      departmentMap[dept].totalScoreSum += avgStudentScore;
      departmentMap[dept].scoreCount++;
    }
  }

  const departmentReadiness = Object.entries(departmentMap)
    .map(([dept, d]) => {
      const assessmentRate = d.studentCount > 0 ? Math.round((d.assessedStudents / d.studentCount) * 100) : 0;
      const avgScore = d.scoreCount > 0 ? Math.round(d.totalScoreSum / d.scoreCount) : 0;
      const selectionRate = d.studentCount > 0 ? Math.round((d.selectedCount / d.studentCount) * 100) : 0;
      const avgSkillsPerStudent =
        d.studentCount > 0 ? Number((d.totalSkills / d.studentCount).toFixed(1)) : 0;

      // Composite Readiness Index: weighted 40% avgScore + 30% assessmentRate + 30% selectionRate
      const readinessIndex = Math.min(
        100,
        Math.max(0, Math.round(avgScore * 0.4 + assessmentRate * 0.3 + Math.min(100, selectionRate * 2) * 0.3))
      );

      return {
        department: dept,
        studentCount: d.studentCount,
        assessedStudents: d.assessedStudents,
        assessmentRate,
        avgScore,
        avgSkillsPerStudent,
        applicationsCount: d.totalApps,
        selectedCount: d.selectedCount,
        selectionRate,
        readinessIndex,
      };
    })
    .sort((a, b) => b.readinessIndex - a.readinessIndex);

  // Overall KPIs
  const overallAssessedStudents = allStudents.filter((s) => s.assessmentAttempts.length > 0).length;
  const overallAssessmentRate =
    totalStudents > 0 ? Math.round((overallAssessedStudents / totalStudents) * 100) : 0;
  const allCompletedAttempts = allStudents.flatMap((s) => s.assessmentAttempts);
  const overallAvgScore =
    allCompletedAttempts.length > 0
      ? Math.round(allCompletedAttempts.reduce((sum, a) => sum + a.percentage, 0) / allCompletedAttempts.length)
      : 0;

  return {
    hasData,
    filters: {
      applied: { department: department || 'ALL', cohort: cohort || 'ALL', opportunityType: opportunityType || 'ALL' },
      availableDepartments,
      availableCohorts,
    },
    summary: {
      totalStudents,
      overallAssessedStudents,
      overallAssessmentRate,
      overallAvgScore,
      totalSkillsTracked,
      totalApplications: totalPipelineApps,
      selectedCount: selectedApps,
      placementRate: totalStudents > 0 ? Math.round((selectedApps / totalStudents) * 100) : 0,
      totalOpportunities: totalOpportunitiesAll,
      totalCollaborations: totalCollaborationsAll,
    },
    dimensions: {
      studentSkillDistribution,
      skillGaps: {
        criticalSkillGaps,
        allSkillGaps: skillGaps.slice(0, 15),
      },
      industrySkillDemand,
      internshipApplications: internshipApplicationsData,
      internshipSelection: internshipSelectionData,
      placementPipeline,
      learningParticipation,
      industryCollaboration,
      departmentReadiness,
    },
    generatedAt: new Date().toISOString(),
  };
};

// Backward compatible helper for existing dashboard endpoint
export const getInstitutionAnalytics = async (institutionName?: string) => {
  const intel = await getInstitutionIntelligence({}, institutionName);
  return {
    totalStudents: intel.summary.totalStudents,
    assessedStudentsCount: intel.summary.overallAssessedStudents,
    assessmentCompletionRate: intel.summary.overallAssessmentRate,
    avgSkillScore: intel.summary.overallAvgScore,
    departmentDistribution: intel.dimensions.departmentReadiness.map((d) => ({
      department: d.department,
      count: d.studentCount,
    })),
    applicationMetrics: {
      totalApplications: intel.dimensions.placementPipeline.totalApplications,
      shortlistedCount: intel.dimensions.placementPipeline.stages[1].count,
      selectedCount: intel.summary.selectedCount,
      internshipPlaced: intel.dimensions.internshipSelection.selectedCount,
      jobPlaced: intel.dimensions.placementPipeline.stages[3].count - intel.dimensions.internshipSelection.selectedCount,
      placementRate: intel.summary.placementRate,
    },
    skillComparison: intel.dimensions.skillGaps.allSkillGaps,
  };
};

