import prisma from '../config/db';
import { convertScoreToProficiency } from './granularSkillEngine';

export interface RoleReadinessAnalysis {
  careerRoleId: string;
  roleName: string;
  domain: string;
  description: string | null;
  targetReadiness: number;
  currentReadiness: number;
  isReady: boolean;
  mandatoryTotal: number;
  mandatoryMet: number;
  preferredTotal: number;
  preferredMet: number;
  evidenceConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
  verifiedEvidenceCount: number;
  skillsChecklist: Array<{
    subSkillId: string;
    subSkillName: string;
    skillName: string;
    isRequired: boolean;
    targetScore: number;
    currentScore: number;
    gap: number;
    weight: number;
    status: 'TARGET_ACHIEVED' | 'DEVELOPING' | 'CRITICAL_GAP' | 'UNASSESSED';
    prerequisitesMet: boolean;
    missingPrerequisites: string[];
    topics: string[];
    evidenceStrength: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
    evidenceType?: string | null;
    evidenceSource?: string | null;
  }>;
}

/**
 * Calculate precise weighted role readiness percentage and gap analysis against a CareerRole
 */
export async function calculateRoleReadiness(studentId: string, careerRoleId: string): Promise<RoleReadinessAnalysis> {
  const [student, role, dependencies, studentEvidence] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        subSkillScores: {
          include: {
            subSkill: { include: { skill: true, topics: true } },
          },
        },
      },
    }),
    prisma.careerRole.findUnique({
      where: { id: careerRoleId },
      include: {
        roleSkills: {
          include: {
            subSkill: {
              include: { skill: true, topics: true },
            },
          },
          orderBy: { importanceOrder: 'asc' },
        },
      },
    }),
    prisma.skillDependency.findMany({
      include: {
        subSkill: true,
        prerequisite: true,
      },
    }),
    prisma.skillEvidence.findMany({
      where: { studentId },
      include: { skill: true },
      orderBy: { evidenceDate: 'desc' },
    }),
  ]);

  if (!student) throw new Error(`Student with ID "${studentId}" not found`);
  if (!role) throw new Error(`Career role with ID "${careerRoleId}" not found`);

  // Build map of student's current sub-skill scores
  const scoreMap = new Map<string, number>();
  student.subSkillScores.forEach((s) => scoreMap.set(s.subSkillId, s.scorePercentage));

  // Group evidence by skill name or skill ID
  const evidenceBySkillName = new Map<string, any[]>();
  studentEvidence.forEach((ev) => {
    const sName = ev.skill?.name?.toLowerCase() || '';
    const list = evidenceBySkillName.get(sName) || [];
    list.push(ev);
    evidenceBySkillName.set(sName, list);
  });

  // Build dependency lookup: subSkillId -> Array of prerequisites
  const prereqMap = new Map<string, Array<{ prereqId: string; prereqName: string; minScore: number }>>();
  dependencies.forEach((d) => {
    const list = prereqMap.get(d.subSkillId) || [];
    list.push({
      prereqId: d.prerequisiteSubSkillId,
      prereqName: d.prerequisite.name,
      minScore: d.minPrerequisiteScore,
    });
    prereqMap.set(d.subSkillId, list);
  });

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let mandatoryTotal = 0;
  let mandatoryMet = 0;
  let preferredTotal = 0;
  let preferredMet = 0;
  let verifiedEvidenceCount = 0;

  const checklist = role.roleSkills.map((rs) => {
    const currentScore = scoreMap.get(rs.subSkillId) || 0;
    const targetScore = rs.minScore;
    const gap = Math.max(0, targetScore - currentScore);
    const weight = rs.weight || 1.0;

    totalWeight += weight;
    // Capped at 100% per competency so exceeding target doesn't over-inflate readiness
    const normalizedRatio = Math.min(1.0, currentScore / targetScore);
    totalWeightedScore += normalizedRatio * 100 * weight;

    const isMet = currentScore >= targetScore;
    if (rs.isRequired) {
      mandatoryTotal += 1;
      if (isMet) mandatoryMet += 1;
    } else {
      preferredTotal += 1;
      if (isMet) preferredMet += 1;
    }

    // Check prerequisite readiness
    const requiredPrereqs = prereqMap.get(rs.subSkillId) || [];
    const missingPrereqs: string[] = [];
    let prereqsMet = true;

    for (const p of requiredPrereqs) {
      const pScore = scoreMap.get(p.prereqId) || 0;
      if (pScore < p.minScore) {
        prereqsMet = false;
        missingPrereqs.push(`${p.prereqName} (${pScore}% vs ${p.minScore}% required)`);
      }
    }

    let status: 'TARGET_ACHIEVED' | 'DEVELOPING' | 'CRITICAL_GAP' | 'UNASSESSED';
    if (currentScore === 0) status = 'UNASSESSED';
    else if (isMet) status = 'TARGET_ACHIEVED';
    else if (currentScore >= 60) status = 'DEVELOPING';
    else status = 'CRITICAL_GAP';

    // Evidence resolution for this skill
    const skillEvList = evidenceBySkillName.get(rs.subSkill.skill.name.toLowerCase()) || [];
    let evidenceStrength: 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE' = 'NONE';
    let topEv: any = null;

    if (skillEvList.length > 0) {
      const hasIndustry = skillEvList.find((e) => e.evidenceType === 'INDUSTRY_VALIDATED');
      const hasSkillAssessed = skillEvList.find((e) => e.evidenceType === 'SKILL_ASSESSED');
      const hasCredVerified = skillEvList.find((e) => e.evidenceType === 'CREDENTIAL_VERIFIED' || e.status === 'VERIFIED');
      const hasEvidenceProvided = skillEvList.find((e) => e.evidenceType === 'EVIDENCE_PROVIDED');

      if (hasIndustry || (hasSkillAssessed && hasCredVerified)) {
        evidenceStrength = 'HIGH';
        topEv = hasIndustry || hasSkillAssessed;
      } else if (hasSkillAssessed || hasCredVerified) {
        evidenceStrength = 'MEDIUM';
        topEv = hasSkillAssessed || hasCredVerified;
      } else if (hasEvidenceProvided) {
        evidenceStrength = 'LOW';
        topEv = hasEvidenceProvided;
      } else {
        evidenceStrength = 'LOW';
        topEv = skillEvList[0];
      }

      if (hasCredVerified || hasIndustry) {
        verifiedEvidenceCount++;
      }
    }

    return {
      subSkillId: rs.subSkillId,
      subSkillName: rs.subSkill.name,
      skillName: rs.subSkill.skill.name,
      isRequired: rs.isRequired,
      targetScore,
      currentScore,
      gap,
      weight,
      status,
      prerequisitesMet: prereqsMet,
      missingPrerequisites: missingPrereqs,
      topics: rs.subSkill.topics.map((t) => t.name),
      evidenceStrength,
      evidenceType: topEv?.evidenceType || (currentScore > 0 ? 'SELF_DECLARED' : null),
      evidenceSource: topEv?.sourceName || null,
    };
  });

  const currentReadiness = totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
  const isReady = currentReadiness >= role.targetReadiness && mandatoryMet === mandatoryTotal;

  const highCount = checklist.filter((c) => c.evidenceStrength === 'HIGH').length;
  const medCount = checklist.filter((c) => c.evidenceStrength === 'MEDIUM').length;
  let overallEvidenceConfidence: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  if (highCount >= 2 || (highCount >= 1 && medCount >= 2)) overallEvidenceConfidence = 'HIGH';
  else if (medCount >= 1 || highCount >= 1) overallEvidenceConfidence = 'MEDIUM';

  return {
    careerRoleId: role.id,
    roleName: role.name,
    domain: role.domain,
    description: role.description,
    targetReadiness: role.targetReadiness,
    currentReadiness,
    isReady,
    mandatoryTotal,
    mandatoryMet,
    preferredTotal,
    preferredMet,
    evidenceConfidence: overallEvidenceConfidence,
    verifiedEvidenceCount,
    skillsChecklist: checklist,
  };
}

/**
 * Generate a dynamic, sequenced learning roadmap for a student targeting a CareerRole
 */
export async function generateRoleRoadmap(studentId: string, careerRoleId: string) {
  const [analysis, courses] = await Promise.all([
    calculateRoleReadiness(studentId, careerRoleId),
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        skills: { include: { skill: true } },
        subSkills: { include: { subSkill: { include: { skill: true, topics: true } } } },
        modules: { include: { lessons: true } },
      },
    }),
  ]);

  // Determine priority score for sequencing phases:
  // Priority = (isMandatory * 50) + (gap * 1.2) + (weight * 20) + (prerequisitesMet ? 30 : -40)
  const prioritizedSteps = analysis.skillsChecklist.map((item) => {
    let priorityScore = 0;
    if (item.isRequired) priorityScore += 50;
    priorityScore += item.gap * 1.2;
    priorityScore += item.weight * 20;

    // Prerequisite sequencing: unfulfilled prerequisites push dependent skills later
    if (item.prerequisitesMet) {
      priorityScore += 30;
    } else {
      priorityScore -= 40;
    }

    // Already achieved skills receive lowest priority
    if (item.status === 'TARGET_ACHIEVED') {
      priorityScore = -100 + item.currentScore;
    }

    // Generate tailored AI Rationale with Evidence Intelligence
    let aiRationale = '';
    const evContext = item.evidenceType === 'INDUSTRY_VALIDATED'
      ? ` [Validated by Industry: ${item.evidenceSource || 'Enterprise Assessor'}]`
      : item.evidenceType === 'SKILL_ASSESSED'
      ? ` [Assessed via SkillBridge Engine]`
      : item.evidenceType === 'CREDENTIAL_VERIFIED'
      ? ` [Institution Verified Credential: ${item.evidenceSource || 'Authorized Body'}]`
      : item.evidenceType === 'EVIDENCE_PROVIDED'
      ? ` [Certificate Submitted - Pending Verification]`
      : item.currentScore > 0
      ? ` [Self-Declared Proficiency]`
      : '';

    if (item.status === 'TARGET_ACHIEVED') {
      aiRationale = `Mastery benchmark achieved (${item.currentScore}% vs ${item.targetScore}% required).${evContext} Competency ready for industry verification.`;
    } else if (!item.prerequisitesMet) {
      aiRationale = `Sequenced after prerequisites: Complete ${item.missingPrerequisites.join(', ')} before advancing to this competency.`;
    } else if (item.isRequired) {
      aiRationale = `Critical mandatory competency for ${analysis.roleName}. Current score of ${item.currentScore}% leaves a ${item.gap}% gap to the required benchmark (${item.targetScore}%).${evContext}`;
    } else {
      aiRationale = `Recommended specialization capability that strengthens competitive advantage for ${analysis.roleName} positions.${evContext}`;
    }

    // Project Suggestions based on skill name
    let suggestedProject = `Hands-on practical implementation and case study on ${item.subSkillName}.`;
    if (item.subSkillName.includes('Register') || item.subSkillName.includes('Peripherals')) {
      suggestedProject = 'ESP32/ARM Cortex Bare-Metal Peripheral Driver & PWM Timer Controller';
    } else if (item.subSkillName.includes('Pointers') || item.subSkillName.includes('Data Structures')) {
      suggestedProject = 'Dynamic Memory Allocator & Cache-Optimized Linked Buffer in C';
    } else if (item.subSkillName.includes('IoT') || item.subSkillName.includes('Telemetry')) {
      suggestedProject = 'Industrial MQTT Telemetry Gateway with Edge Filtering & Cloud Ingestion';
    } else if (item.subSkillName.includes('Hooks') || item.subSkillName.includes('Architecture')) {
      suggestedProject = 'Enterprise React State Architecture with Custom Context & Optimistic Updates';
    } else if (item.subSkillName.includes('REST') || item.subSkillName.includes('Runtime')) {
      suggestedProject = 'High-Throughput Microservice API with JWT Auth, Rate Limiting & Prisma ORM';
    } else if (item.subSkillName.includes('Research') || item.subSkillName.includes('GCP')) {
      suggestedProject = 'CTRI-compliant AYUSH Clinical Trial Protocol & Ethics Submission Dossier';
    } else if (item.subSkillName.includes('Biostatistics') || item.subSkillName.includes('Analytics')) {
      suggestedProject = 'Clinical Efficacy Biostatistical Analysis Pipeline (t-Tests, ANOVA, 95% CI)';
    } else if (item.subSkillName.includes('Panchakarma') || item.subSkillName.includes('Purvakarma')) {
      suggestedProject = 'Standard Operating Procedure (SOP) & Clinical Protocol for Hospital Panchakarma Ward';
    } else if (item.subSkillName.includes('Valuation') || item.subSkillName.includes('Ratio')) {
      suggestedProject = 'Three-Statement DCF Valuation Model with WACC & Sensitivity Analysis';
    } else if (item.subSkillName.includes('SEO') || item.subSkillName.includes('Paid Campaigns')) {
      suggestedProject = 'Comprehensive Multi-Channel Growth Engine with SEO Audit & Funnel Attribution';
    }

    // Find best matched course
    let matchedCourse = courses.find((c) =>
      c.subSkills.some((cs) => cs.subSkill.name.toLowerCase() === item.subSkillName.toLowerCase())
    );
    if (!matchedCourse) {
      matchedCourse = courses.find((c) =>
        c.skills.some((s) => s.skill.name.toLowerCase() === item.skillName.toLowerCase())
      );
    }
    if (!matchedCourse && courses.length > 0) {
      matchedCourse = courses[0];
    }

    return {
      ...item,
      priorityScore,
      aiRationale,
      suggestedProject,
      matchedCourse: matchedCourse
        ? {
            id: matchedCourse.id,
            title: matchedCourse.title,
            providerName: matchedCourse.providerName,
            providerRole: matchedCourse.providerRole,
            duration: matchedCourse.duration,
            mode: matchedCourse.mode,
            modulesCount: matchedCourse.modules.length,
          }
        : null,
    };
  });

  // Sort steps by priority descending (actionable gaps first, achieved last)
  prioritizedSteps.sort((a, b) => b.priorityScore - a.priorityScore);

  // Assign phase numbers and statuses
  let firstUnachievedAssigned = false;
  const sequencedPhases = prioritizedSteps.map((step, idx) => {
    let phaseStatus: string;
    if (step.status === 'TARGET_ACHIEVED') {
      phaseStatus = 'TARGET_ACHIEVED';
    } else if (!firstUnachievedAssigned) {
      phaseStatus = 'CURRENT_PHASE';
      firstUnachievedAssigned = true;
    } else {
      phaseStatus = 'UPCOMING';
    }

    return {
      phaseNumber: idx + 1,
      phaseTitle: `Phase ${idx + 1}: ${step.subSkillName}`,
      subSkillId: step.subSkillId,
      subSkillName: step.subSkillName,
      skillName: step.skillName,
      currentScore: step.currentScore,
      targetScore: step.targetScore,
      gap: step.gap,
      isMandatory: step.isRequired,
      priorityScore: step.priorityScore,
      status: phaseStatus,
      aiRationale: step.aiRationale,
      topicsToMaster: step.topics,
      suggestedProject: step.suggestedProject,
      recommendedCourse: step.matchedCourse,
      practiceQuestionsCount: 10,
    };
  });

  const nextActionableSkill = sequencedPhases.find((p) => p.status === 'CURRENT_PHASE') || sequencedPhases[0] || null;
  const completedPhases = sequencedPhases.filter((p) => p.status === 'TARGET_ACHIEVED').length;

  // Archive previous active roadmaps for this student and create new version
  const previousActive = await prisma.learningRoadmap.findFirst({
    where: { studentId, status: 'ACTIVE' },
    orderBy: { version: 'desc' },
  });

  const nextVersion = (previousActive?.version || 0) + 1;

  if (previousActive) {
    await prisma.learningRoadmap.update({
      where: { id: previousActive.id },
      data: { status: 'ARCHIVED' },
    });
  }

  const summaryText = `Personalized career roadmap dynamically tailored for "${analysis.roleName}". Current role readiness is ${analysis.currentReadiness}% against the ${analysis.targetReadiness}% benchmark. ${analysis.mandatoryMet}/${analysis.mandatoryTotal} mandatory competencies met.`;

  // Persist new active roadmap in PostgreSQL
  const savedRoadmap = await prisma.learningRoadmap.create({
    data: {
      studentId,
      careerRoleId,
      targetTitle: analysis.roleName,
      targetType: 'ROLE',
      version: nextVersion,
      status: 'ACTIVE',
      currentReadiness: analysis.currentReadiness,
      targetReadiness: analysis.targetReadiness,
      totalPhases: sequencedPhases.length,
      completedPhases,
      summaryText,
      steps: {
        create: sequencedPhases.map((phase) => ({
          phaseNumber: phase.phaseNumber,
          phaseTitle: phase.phaseTitle,
          subSkillId: phase.subSkillId,
          currentScore: phase.currentScore,
          targetScore: phase.targetScore,
          gap: phase.gap,
          isMandatory: phase.isMandatory,
          priorityScore: phase.priorityScore,
          status: phase.status,
          aiRationale: phase.aiRationale,
          topicsList: JSON.stringify(phase.topicsToMaster),
          recommendedCourseId: phase.recommendedCourse?.id || null,
          practiceQuestionsCount: phase.practiceQuestionsCount,
          suggestedProject: phase.suggestedProject,
          resources: {
            create: [
              ...(phase.recommendedCourse
                ? [
                    {
                      type: 'COURSE',
                      title: phase.recommendedCourse.title,
                      description: `Structured course by ${phase.recommendedCourse.providerName} (${phase.recommendedCourse.duration}, ${phase.recommendedCourse.mode})`,
                      providerName: phase.recommendedCourse.providerName,
                      duration: phase.recommendedCourse.duration,
                    },
                  ]
                : []),
              {
                type: 'PROJECT',
                title: phase.suggestedProject,
                description: `Capstone project demonstrating practical mastery in ${phase.subSkillName}.`,
              },
              {
                type: 'PRACTICE',
                title: `${phase.subSkillName} Diagnostic Practice Assessment`,
                description: `${phase.practiceQuestionsCount} granular adaptive assessment questions to achieve >=${phase.targetScore}%.`,
              },
            ],
          },
        })),
      },
    },
    include: {
      steps: {
        include: {
          subSkill: { include: { skill: true } },
          course: true,
          resources: true,
        },
      },
      careerRole: true,
    },
  });

  // Also update student profile targetRoleId and targetCareer
  await prisma.studentProfile.update({
    where: { id: studentId },
    data: {
      targetRoleId: careerRoleId,
      targetCareer: analysis.roleName,
    },
  });

  return {
    roadmapId: savedRoadmap.id,
    version: savedRoadmap.version,
    studentId,
    targetRole: {
      id: analysis.careerRoleId,
      name: analysis.roleName,
      domain: analysis.domain,
      description: analysis.description,
      targetReadiness: analysis.targetReadiness,
    },
    currentReadiness: analysis.currentReadiness,
    targetReadiness: analysis.targetReadiness,
    isReady: analysis.isReady,
    mandatoryTotal: analysis.mandatoryTotal,
    mandatoryMet: analysis.mandatoryMet,
    totalPhases: sequencedPhases.length,
    completedPhases,
    activePhaseNumber: nextActionableSkill ? nextActionableSkill.phaseNumber : 1,
    nextActionableSkill,
    phases: sequencedPhases,
    summaryText,
    createdAt: savedRoadmap.createdAt,
  };
}

/**
 * Generate an Opportunity-driven dynamic roadmap
 */
export async function generateOpportunityRoadmap(studentId: string, opportunityId: string) {
  const [student, opp, courses] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        subSkillScores: {
          include: {
            subSkill: { include: { skill: true, topics: true } },
          },
        },
      },
    }),
    prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        industry: true,
        subSkillRequirements: {
          include: {
            subSkill: { include: { skill: true, topics: true } },
          },
        },
        skills: { include: { skill: true } },
      },
    }),
    prisma.course.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        skills: { include: { skill: true } },
        subSkills: { include: { subSkill: { include: { skill: true, topics: true } } } },
        modules: { include: { lessons: true } },
      },
    }),
  ]);

  if (!student) throw new Error('Student not found');
  if (!opp) throw new Error('Opportunity not found');

  const scoreMap = new Map<string, number>();
  student.subSkillScores.forEach((s) => scoreMap.set(s.subSkillId, s.scorePercentage));

  let requirements: any[] = opp.subSkillRequirements;
  if (requirements.length === 0 && opp.skills.length > 0) {
    const skillIds = opp.skills.map((s) => s.skillId);
    const subSkills = await prisma.skillSubSkill.findMany({
      where: { skillId: { in: skillIds } },
      include: { skill: true, topics: true },
    });
    requirements = subSkills.map((sub, idx) => ({
      id: sub.id,
      opportunityId: opp.id,
      subSkillId: sub.id,
      subSkill: sub,
      isRequired: idx < 3,
      minScore: 75.0,
      minProficiency: 'ADVANCED',
    }));
  }

  let totalWeight = 0;
  let weightedScoreSum = 0;
  let mandatoryTotal = 0;
  let mandatoryMet = 0;

  const rawGaps = requirements.map((req: any) => {
    const currentScore = scoreMap.get(req.subSkillId) || 0;
    const targetScore = req.minScore || 75.0;
    const gap = Math.max(0, targetScore - currentScore);
    const weight = req.isRequired ? 2.0 : 1.0;

    totalWeight += weight;
    weightedScoreSum += Math.min(1.0, currentScore / targetScore) * 100 * weight;

    const isMet = currentScore >= targetScore;
    if (req.isRequired) {
      mandatoryTotal += 1;
      if (isMet) mandatoryMet += 1;
    }

    let priorityScore = (req.isRequired ? 60 : 20) + gap * 1.5;
    if (isMet) priorityScore = -100 + currentScore;

    const aiRationale = req.isRequired
      ? `Mandatory requirement for "${opp.title}" at ${opp.industry.companyName}. Score of ${currentScore}% is below required ${targetScore}%.`
      : `Preferred skill for "${opp.title}". Elevating proficiency boosts candidate ranking.`;

    let matchedCourse = courses.find((c) =>
      c.subSkills.some((cs) => cs.subSkill.name.toLowerCase() === req.subSkill.name.toLowerCase())
    );
    if (!matchedCourse && courses.length > 0) matchedCourse = courses[0];

    return {
      subSkillId: req.subSkillId,
      subSkillName: req.subSkill.name,
      skillName: req.subSkill.skill.name,
      isRequired: req.isRequired,
      currentScore,
      targetScore,
      gap,
      priorityScore,
      isMet,
      aiRationale,
      topics: req.subSkill?.topics ? req.subSkill.topics.map((t: any) => t.name) : [],
      matchedCourse: matchedCourse
        ? {
            id: matchedCourse.id,
            title: matchedCourse.title,
            providerName: matchedCourse.providerName,
            providerRole: matchedCourse.providerRole,
            duration: matchedCourse.duration,
            mode: matchedCourse.mode,
            modulesCount: matchedCourse.modules.length,
          }
        : null,
    };
  });

  rawGaps.sort((a, b) => b.priorityScore - a.priorityScore);

  let firstUnachievedAssigned = false;
  const sequencedPhases = rawGaps.map((step, idx) => {
    let phaseStatus: string;
    if (step.isMet) {
      phaseStatus = 'TARGET_ACHIEVED';
    } else if (!firstUnachievedAssigned) {
      phaseStatus = 'CURRENT_PHASE';
      firstUnachievedAssigned = true;
    } else {
      phaseStatus = 'UPCOMING';
    }

    return {
      phaseNumber: idx + 1,
      phaseTitle: `Phase ${idx + 1}: ${step.subSkillName}`,
      subSkillId: step.subSkillId,
      subSkillName: step.subSkillName,
      skillName: step.skillName,
      currentScore: step.currentScore,
      targetScore: step.targetScore,
      gap: step.gap,
      isMandatory: step.isRequired,
      priorityScore: step.priorityScore,
      status: phaseStatus,
      aiRationale: step.aiRationale,
      topicsToMaster: step.topics,
      suggestedProject: `Targeted industry capstone for ${step.subSkillName} relevant to ${opp.industry.companyName}.`,
      recommendedCourse: step.matchedCourse,
      practiceQuestionsCount: 10,
    };
  });

  const currentReadiness = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 75;
  const isReady = currentReadiness >= 75 && mandatoryMet === mandatoryTotal;
  const nextActionableSkill = sequencedPhases.find((p) => p.status === 'CURRENT_PHASE') || sequencedPhases[0] || null;

  // Persist roadmap
  await prisma.learningRoadmap.updateMany({
    where: { studentId, status: 'ACTIVE' },
    data: { status: 'ARCHIVED' },
  });

  const savedRoadmap = await prisma.learningRoadmap.create({
    data: {
      studentId,
      opportunityId,
      targetTitle: opp.title,
      targetType: 'OPPORTUNITY',
      version: 1,
      status: 'ACTIVE',
      currentReadiness,
      targetReadiness: 75.0,
      totalPhases: sequencedPhases.length,
      completedPhases: sequencedPhases.filter((p) => p.status === 'TARGET_ACHIEVED').length,
      summaryText: `Roadmap targeted for opportunity "${opp.title}" at ${opp.industry.companyName}. Role match readiness: ${currentReadiness}%.`,
      steps: {
        create: sequencedPhases.map((phase) => ({
          phaseNumber: phase.phaseNumber,
          phaseTitle: phase.phaseTitle,
          subSkillId: phase.subSkillId,
          currentScore: phase.currentScore,
          targetScore: phase.targetScore,
          gap: phase.gap,
          isMandatory: phase.isMandatory,
          priorityScore: phase.priorityScore,
          status: phase.status,
          aiRationale: phase.aiRationale,
          topicsList: JSON.stringify(phase.topicsToMaster),
          recommendedCourseId: phase.recommendedCourse?.id || null,
          practiceQuestionsCount: phase.practiceQuestionsCount,
          suggestedProject: phase.suggestedProject,
        })),
      },
    },
    include: {
      steps: true,
      opportunity: { include: { industry: true } },
    },
  });

  return {
    roadmapId: savedRoadmap.id,
    targetOpportunity: {
      id: opp.id,
      title: opp.title,
      companyName: opp.industry.companyName,
      type: opp.type,
      location: opp.location,
    },
    currentReadiness,
    targetReadiness: 75.0,
    isReady,
    mandatoryTotal,
    mandatoryMet,
    totalPhases: sequencedPhases.length,
    activePhaseNumber: nextActionableSkill ? nextActionableSkill.phaseNumber : 1,
    nextActionableSkill,
    phases: sequencedPhases,
    summaryText: savedRoadmap.summaryText,
  };
}

/**
 * Fetch the active roadmap or auto-generate one if target career exists
 */
export async function getActiveRoadmap(studentId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      targetCareerRole: true,
    },
  });

  if (!student) throw new Error('Student not found');

  // If student has a targetRoleId, generate/retrieve the role roadmap
  if (student.targetRoleId) {
    return generateRoleRoadmap(studentId, student.targetRoleId);
  }

  // Fallback: find career role matching targetCareer or first role in system
  const defaultRole = await prisma.careerRole.findFirst({
    where: student.targetCareer
      ? { name: { contains: student.targetCareer, mode: 'insensitive' } }
      : undefined,
  });

  if (defaultRole) {
    return generateRoleRoadmap(studentId, defaultRole.id);
  }

  // If no career role found, fall back to first career role in db
  const anyRole = await prisma.careerRole.findFirst();
  if (anyRole) {
    return generateRoleRoadmap(studentId, anyRole.id);
  }

  throw new Error('No career roles configured in the system.');
}

/**
 * Fetch historical roadmaps for a student
 */
export async function getRoadmapHistory(studentId: string) {
  const roadmaps = await prisma.learningRoadmap.findMany({
    where: { studentId },
    orderBy: { createdAt: 'desc' },
    include: {
      careerRole: true,
      opportunity: { include: { industry: true } },
      steps: {
        include: {
          subSkill: true,
        },
        orderBy: { phaseNumber: 'asc' },
      },
    },
  });

  return roadmaps.map((r) => ({
    id: r.id,
    targetTitle: r.targetTitle,
    targetType: r.targetType,
    version: r.version,
    status: r.status,
    currentReadiness: r.currentReadiness,
    targetReadiness: r.targetReadiness,
    totalPhases: r.totalPhases,
    completedPhases: r.completedPhases,
    summaryText: r.summaryText,
    createdAt: r.createdAt,
    careerRole: r.careerRole ? { id: r.careerRole.id, name: r.careerRole.name, domain: r.careerRole.domain } : null,
    opportunity: r.opportunity ? { id: r.opportunity.id, title: r.opportunity.title, companyName: r.opportunity.industry.companyName } : null,
  }));
}

/**
 * Handle Reassessment feedback loop and dynamic roadmap transition
 */
export async function updateRoadmapAfterReassessment(params: {
  studentId: string;
  subSkillId: string;
  newScore: number;
}) {
  const { studentId, subSkillId, newScore } = params;

  // 1. Record score in StudentSubSkillScore & SkillProgressSnapshot
  const existing = await prisma.studentSubSkillScore.findUnique({
    where: {
      studentId_subSkillId: { studentId, subSkillId },
    },
    include: { subSkill: { include: { skill: true } } },
  });

  const prevScore = existing ? existing.scorePercentage : newScore;
  const delta = Math.round(newScore - prevScore);
  const profLevel = convertScoreToProficiency(newScore);

  await prisma.studentSubSkillScore.upsert({
    where: { studentId_subSkillId: { studentId, subSkillId } },
    update: {
      scorePercentage: newScore,
      proficiencyLevel: profLevel,
      questionsAttempted: (existing?.questionsAttempted || 0) + 1,
      questionsCorrect: (existing?.questionsCorrect || 0) + (newScore >= 60 ? 1 : 0),
      lastAssessedAt: new Date(),
    },
    create: {
      studentId,
      subSkillId,
      scorePercentage: newScore,
      proficiencyLevel: profLevel,
      questionsAttempted: 1,
      questionsCorrect: newScore >= 60 ? 1 : 0,
      lastAssessedAt: new Date(),
    },
  });

  await prisma.skillProgressSnapshot.create({
    data: {
      studentId,
      subSkillId,
      scorePercentage: newScore,
      proficiencyLevel: profLevel,
      deltaPercentage: delta,
      recordedAt: new Date(),
    },
  });

  // 2. Regenerate active roadmap to reflect recalculated role readiness and advance phases
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
  });

  let updatedRoadmap: any = null;
  if (student?.targetRoleId) {
    updatedRoadmap = await generateRoleRoadmap(studentId, student.targetRoleId);
  } else {
    updatedRoadmap = await getActiveRoadmap(studentId);
  }

  return {
    subSkillId,
    subSkillName: existing?.subSkill.name || 'Sub-skill',
    skillName: existing?.subSkill.skill.name || 'Skill',
    previousScore: prevScore,
    newScore,
    growthDelta: delta,
    targetAchieved: newScore >= 75,
    updatedRoadmap,
  };
}
