import prisma from '../config/db';

export const PROFICIENCY_THRESHOLDS = {
  EXPERT: { min: 90, max: 100, label: 'EXPERT', color: 'emerald' },
  ADVANCED: { min: 75, max: 89, label: 'ADVANCED', color: 'blue' },
  INTERMEDIATE: { min: 60, max: 74, label: 'INTERMEDIATE', color: 'amber' },
  DEVELOPING: { min: 40, max: 59, label: 'DEVELOPING', color: 'orange' },
  BEGINNER: { min: 0, max: 39, label: 'BEGINNER', color: 'rose' },
} as const;

export type ProficiencyTier = keyof typeof PROFICIENCY_THRESHOLDS;

/**
 * Convert raw score percentage (0-100) to standard proficiency tier
 */
export function convertScoreToProficiency(score: number): ProficiencyTier {
  const rounded = Math.max(0, Math.min(100, Math.round(score)));
  if (rounded >= 90) return 'EXPERT';
  if (rounded >= 75) return 'ADVANCED';
  if (rounded >= 60) return 'INTERMEDIATE';
  if (rounded >= 40) return 'DEVELOPING';
  return 'BEGINNER';
}

export interface GranularScoreBreakdown {
  overallScore: number;
  overallProficiency: ProficiencyTier;
  skillScores: Array<{
    skillId: string;
    skillName: string;
    categoryName: string;
    scorePercentage: number;
    proficiencyLevel: ProficiencyTier;
    questionsTotal: number;
    questionsCorrect: number;
  }>;
  subSkillScores: Array<{
    subSkillId: string;
    subSkillName: string;
    skillId: string;
    skillName: string;
    scorePercentage: number;
    proficiencyLevel: ProficiencyTier;
    questionsTotal: number;
    questionsCorrect: number;
  }>;
  topicScores: Array<{
    topicName: string;
    subSkillName: string;
    scorePercentage: number;
    questionsTotal: number;
    questionsCorrect: number;
  }>;
}

/**
 * Calculate granular scores from assessment response items
 */
export async function calculateGranularAssessmentScores(
  assessmentId: string,
  responses: Array<{ questionId: string; selectedOptionId: string | null }>
): Promise<GranularScoreBreakdown> {
  const assessment = await prisma.assessment.findUnique({
    where: { id: assessmentId },
    include: {
      category: true,
      questions: {
        include: {
          options: true,
          skill: { include: { category: true } },
          subSkill: true,
        },
      },
    },
  });

  if (!assessment) {
    throw new Error('Assessment not found');
  }

  const responseMap = new Map<string, string | null>();
  responses.forEach((r) => responseMap.set(r.questionId, r.selectedOptionId));

  let totalAssessmentWeight = 0;
  let earnedAssessmentWeight = 0;

  // Tracking maps
  const skillMap = new Map<string, { name: string; category: string; total: number; earned: number; totalQ: number; correctQ: number }>();
  const subSkillMap = new Map<string, { name: string; skillId: string; skillName: string; total: number; earned: number; totalQ: number; correctQ: number }>();
  const topicMap = new Map<string, { subSkillName: string; total: number; earned: number; totalQ: number; correctQ: number }>();

  for (const q of assessment.questions) {
    const weight = q.weightage || 1;
    totalAssessmentWeight += weight;

    const selectedOptId = responseMap.get(q.id);
    const correctOpt = q.options.find((o) => o.isCorrect);
    const isCorrect = Boolean(selectedOptId && correctOpt && correctOpt.id === selectedOptId);
    const earned = isCorrect ? weight : 0;
    earnedAssessmentWeight += earned;

    // Track high-level skill
    if (q.skillId && q.skill) {
      if (!skillMap.has(q.skillId)) {
        skillMap.set(q.skillId, {
          name: q.skill.name,
          category: q.skill.category?.name || 'General',
          total: 0,
          earned: 0,
          totalQ: 0,
          correctQ: 0,
        });
      }
      const s = skillMap.get(q.skillId)!;
      s.total += weight;
      s.earned += earned;
      s.totalQ += 1;
      if (isCorrect) s.correctQ += 1;
    }

    // Track granular sub-skill
    if (q.subSkillId && q.subSkill) {
      if (!subSkillMap.has(q.subSkillId)) {
        subSkillMap.set(q.subSkillId, {
          name: q.subSkill.name,
          skillId: q.skillId || '',
          skillName: q.skill?.name || 'General',
          total: 0,
          earned: 0,
          totalQ: 0,
          correctQ: 0,
        });
      }
      const sub = subSkillMap.get(q.subSkillId)!;
      sub.total += weight;
      sub.earned += earned;
      sub.totalQ += 1;
      if (isCorrect) sub.correctQ += 1;
    }

    // Track granular topic if mapped
    if (q.topicName) {
      const tKey = q.topicName.trim();
      if (!topicMap.has(tKey)) {
        topicMap.set(tKey, {
          subSkillName: q.subSkill?.name || q.skill?.name || 'General',
          total: 0,
          earned: 0,
          totalQ: 0,
          correctQ: 0,
        });
      }
      const top = topicMap.get(tKey)!;
      top.total += weight;
      top.earned += earned;
      top.totalQ += 1;
      if (isCorrect) top.correctQ += 1;
    }
  }

  const overallScore = totalAssessmentWeight > 0 ? Math.round((earnedAssessmentWeight / totalAssessmentWeight) * 100) : 0;
  const overallProficiency = convertScoreToProficiency(overallScore);

  const skillScores = Array.from(skillMap.entries()).map(([skillId, s]) => {
    const pct = s.total > 0 ? Math.round((s.earned / s.total) * 100) : 0;
    return {
      skillId,
      skillName: s.name,
      categoryName: s.category,
      scorePercentage: pct,
      proficiencyLevel: convertScoreToProficiency(pct),
      questionsTotal: s.totalQ,
      questionsCorrect: s.correctQ,
    };
  });

  const subSkillScores = Array.from(subSkillMap.entries()).map(([subSkillId, sub]) => {
    const pct = sub.total > 0 ? Math.round((sub.earned / sub.total) * 100) : 0;
    return {
      subSkillId,
      subSkillName: sub.name,
      skillId: sub.skillId,
      skillName: sub.skillName,
      scorePercentage: pct,
      proficiencyLevel: convertScoreToProficiency(pct),
      questionsTotal: sub.totalQ,
      questionsCorrect: sub.correctQ,
    };
  });

  const topicScores = Array.from(topicMap.entries()).map(([topicName, t]) => {
    const pct = t.total > 0 ? Math.round((t.earned / t.total) * 100) : 0;
    return {
      topicName,
      subSkillName: t.subSkillName,
      scorePercentage: pct,
      questionsTotal: t.totalQ,
      questionsCorrect: t.correctQ,
    };
  });

  return {
    overallScore,
    overallProficiency,
    skillScores,
    subSkillScores,
    topicScores,
  };
}

/**
 * Analyze complete student skill profile, segregating into strong skills, improvement areas, and critical gaps
 */
export async function analyzeSkillProfile(studentId: string) {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      subSkillScores: {
        include: {
          subSkill: {
            include: {
              skill: { include: { category: true } },
              topics: true,
            },
          },
        },
        orderBy: { scorePercentage: 'desc' },
      },
      skillProfiles: {
        include: { skill: { include: { category: true } } },
      },
      skillProgressSnapshots: {
        orderBy: { recordedAt: 'asc' },
      },
    },
  });

  if (!student) {
    throw new Error('Student not found');
  }

  const subScores = student.subSkillScores.map((s) => ({
    id: s.id,
    subSkillId: s.subSkillId,
    subSkillName: s.subSkill.name,
    skillId: s.subSkill.skillId,
    skillName: s.subSkill.skill.name,
    categoryName: s.subSkill.skill.category.name,
    scorePercentage: s.scorePercentage,
    proficiencyLevel: s.proficiencyLevel,
    questionsAttempted: s.questionsAttempted,
    questionsCorrect: s.questionsCorrect,
    lastAssessedAt: s.lastAssessedAt,
    topics: s.subSkill.topics.map((t) => t.name),
  }));

  const strongSkills = subScores.filter((s) => s.scorePercentage >= 75);
  const improvementSkills = subScores.filter((s) => s.scorePercentage >= 60 && s.scorePercentage < 75);
  const criticalGaps = subScores.filter((s) => s.scorePercentage < 60);

  const avgSubSkillScore = subScores.length > 0
    ? Math.round(subScores.reduce((sum, s) => sum + s.scorePercentage, 0) / subScores.length)
    : student.cgpa ? Math.round(student.cgpa * 10) : 70;

  return {
    studentId: student.id,
    fullName: student.fullName,
    targetCareer: student.targetCareer || student.preferredRoles || 'Ayurvedic Clinical Specialist',
    overallSkillScore: avgSubSkillScore,
    overallProficiency: convertScoreToProficiency(avgSubSkillScore),
    totalSubSkillsAssessed: subScores.length,
    strongSkills,
    improvementSkills,
    criticalGaps,
    subSkillScores: subScores,
    highLevelSkills: student.skillProfiles.map((hp) => ({
      skillId: hp.skillId,
      skillName: hp.skill.name,
      scorePercentage: hp.scorePercentage,
      proficiencyLevel: hp.proficiencyLevel,
      verified: hp.verified,
    })),
  };
}

/**
 * Calculate precise industry readiness for a specific opportunity
 */
export async function calculateIndustryReadiness(studentId: string, opportunityId: string) {
  const [student, opp] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id: studentId },
      include: {
        subSkillScores: {
          include: { subSkill: true },
        },
        skillProfiles: true,
      },
    }),
    prisma.opportunity.findUnique({
      where: { id: opportunityId },
      include: {
        industry: true,
        subSkillRequirements: {
          include: {
            subSkill: {
              include: { skill: true, topics: true },
            },
          },
        },
        skills: {
          include: { skill: true },
        },
      },
    }),
  ]);

  if (!student || !opp) {
    throw new Error('Student or Opportunity not found');
  }

  const studentSubMap = new Map<string, number>();
  student.subSkillScores.forEach((s) => studentSubMap.set(s.subSkillId, s.scorePercentage));

  const requirements = opp.subSkillRequirements;
  
  let mandatoryTotal = 0;
  let mandatoryMet = 0;
  let preferredTotal = 0;
  let preferredMet = 0;
  let weightedScoreSum = 0;
  let totalWeight = 0;

  const missingMandatory: Array<{ subSkillName: string; currentScore: number; requiredScore: number; gap: number }> = [];
  const missingPreferred: Array<{ subSkillName: string; currentScore: number; requiredScore: number; gap: number }> = [];
  const readinessChecklist: Array<{
    subSkillId: string;
    subSkillName: string;
    skillName: string;
    isRequired: boolean;
    requiredScore: number;
    currentScore: number;
    status: 'MET' | 'BELOW_THRESHOLD' | 'UNASSESSED';
    topics: string[];
  }> = [];

  if (requirements.length > 0) {
    for (const req of requirements) {
      const weight = req.isRequired ? 3 : 1;
      totalWeight += weight;

      const currentScore = studentSubMap.get(req.subSkillId) ?? 0;
      const targetScore = req.minScore || 70.0;
      const isMet = currentScore >= targetScore;

      weightedScoreSum += Math.min(100, (currentScore / targetScore) * 100) * weight;

      if (req.isRequired) {
        mandatoryTotal += 1;
        if (isMet) mandatoryMet += 1;
        else {
          missingMandatory.push({
            subSkillName: req.subSkill.name,
            currentScore,
            requiredScore: targetScore,
            gap: Math.max(0, targetScore - currentScore),
          });
        }
      } else {
        preferredTotal += 1;
        if (isMet) preferredMet += 1;
        else {
          missingPreferred.push({
            subSkillName: req.subSkill.name,
            currentScore,
            requiredScore: targetScore,
            gap: Math.max(0, targetScore - currentScore),
          });
        }
      }

      readinessChecklist.push({
        subSkillId: req.subSkillId,
        subSkillName: req.subSkill.name,
        skillName: req.subSkill.skill.name,
        isRequired: req.isRequired,
        requiredScore: targetScore,
        currentScore,
        status: currentScore === 0 ? 'UNASSESSED' : isMet ? 'MET' : 'BELOW_THRESHOLD',
        topics: req.subSkill.topics.map((t) => t.name),
      });
    }
  } else {
    // Fallback if no granular requirements set on opportunity: check high-level skills
    const studentHighMap = new Map<string, number>();
    student.skillProfiles.forEach((p) => studentHighMap.set(p.skillId, p.scorePercentage));

    for (const req of opp.skills) {
      const weight = req.isRequired ? 3 : 1;
      totalWeight += weight;
      const currentScore = studentHighMap.get(req.skillId) ?? 0;
      const targetScore = 70.0;
      const isMet = currentScore >= targetScore;
      weightedScoreSum += Math.min(100, (currentScore / targetScore) * 100) * weight;

      if (req.isRequired) {
        mandatoryTotal += 1;
        if (isMet) mandatoryMet += 1;
        else missingMandatory.push({ subSkillName: req.skill.name, currentScore, requiredScore: targetScore, gap: targetScore - currentScore });
      }
    }
  }

  const compatibilityPercentage = totalWeight > 0 ? Math.round(weightedScoreSum / totalWeight) : 75;
  const isReady = mandatoryTotal === 0 ? compatibilityPercentage >= 70 : mandatoryMet === mandatoryTotal;

  const readinessReasons: string[] = [];
  if (isReady) {
    readinessReasons.push(`Candidate meets all ${mandatoryTotal} mandatory granular competency thresholds.`);
    if (preferredMet > 0) readinessReasons.push(`Satisfies ${preferredMet}/${preferredTotal} preferred specialization skills.`);
  } else {
    if (missingMandatory.length > 0) {
      readinessReasons.push(
        `Deficit in ${missingMandatory.length} mandatory capability areas: ${missingMandatory.map((m) => `${m.subSkillName} (${m.currentScore}% vs ${m.requiredScore}% required)`).join(', ')}.`
      );
    }
    if (missingPreferred.length > 0) {
      readinessReasons.push(`Recommended improvement in ${missingPreferred.length} preferred skills: ${missingPreferred.map((p) => p.subSkillName).join(', ')}.`);
    }
  }

  return {
    opportunityId: opp.id,
    opportunityTitle: opp.title,
    companyName: opp.industry.companyName,
    compatibilityPercentage,
    isReady,
    mandatoryTotal,
    mandatoryMet,
    preferredTotal,
    preferredMet,
    missingMandatory,
    missingPreferred,
    readinessReasons,
    readinessChecklist,
  };
}

/**
 * Generate a personalized, prioritized, multi-phase AI roadmap
 */
export async function generateSkillRoadmap(
  studentId: string,
  targetOpportunityId?: string,
  targetCareer?: string
) {
  const profileAnalysis = await analyzeSkillProfile(studentId);
  const targetRole = targetCareer || profileAnalysis.targetCareer;

  // If specific opportunity target provided, use its exact requirements for highest priority
  let oppReadiness: any = null;
  if (targetOpportunityId) {
    try {
      oppReadiness = await calculateIndustryReadiness(studentId, targetOpportunityId);
    } catch {
      oppReadiness = null;
    }
  }

  // Fetch all available published courses with their sub-skills and modules
  const courses = await prisma.course.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      skills: { include: { skill: true } },
      subSkills: { include: { subSkill: { include: { skill: true, topics: true } } } },
      modules: { include: { lessons: true } },
    },
  });

  // Identify prioritized gaps
  const gapItems: Array<{
    subSkillId: string;
    subSkillName: string;
    skillName: string;
    currentScore: number;
    targetScore: number;
    isMandatory: boolean;
    priorityWeight: number;
    reason: string;
    topics: string[];
  }> = [];

  const evaluatedSubSkillIds = new Set<string>();

  // 1. Mandatory opportunity gaps (Highest Priority Weight: 100+)
  if (oppReadiness?.missingMandatory) {
    for (const m of oppReadiness.missingMandatory) {
      const matchSub = profileAnalysis.subSkillScores.find((s) => s.subSkillName.toLowerCase() === m.subSkillName.toLowerCase());
      const subId = matchSub?.subSkillId || m.subSkillName;
      evaluatedSubSkillIds.add(subId);

      gapItems.push({
        subSkillId: subId,
        subSkillName: m.subSkillName,
        skillName: matchSub?.skillName || 'Core Requirement',
        currentScore: m.currentScore,
        targetScore: m.requiredScore || 75,
        isMandatory: true,
        priorityWeight: 100 + (m.gap || 25),
        reason: `Mandatory requirement for "${oppReadiness.opportunityTitle}" at ${oppReadiness.companyName}. Current score of ${m.currentScore}% is below required ${m.requiredScore}%.`,
        topics: matchSub?.topics || ['Core concepts', 'Application standards', 'Quality control'],
      });
    }
  }

  // 2. Critical profile gaps (<60%) (Priority Weight: 70+)
  for (const cg of profileAnalysis.criticalGaps) {
    if (!evaluatedSubSkillIds.has(cg.subSkillId)) {
      evaluatedSubSkillIds.add(cg.subSkillId);
      const gap = Math.max(0, 75 - cg.scorePercentage);
      gapItems.push({
        subSkillId: cg.subSkillId,
        subSkillName: cg.subSkillName,
        skillName: cg.skillName,
        currentScore: cg.scorePercentage,
        targetScore: 75,
        isMandatory: false,
        priorityWeight: 70 + gap,
        reason: `Critical proficiency gap (${cg.scorePercentage}% vs 75% target) in ${cg.skillName}. Mastering this unlocks advanced clinical and technical opportunities.`,
        topics: cg.topics.length > 0 ? cg.topics : ['Fundamentals', 'Methodologies', 'Practical Execution'],
      });
    }
  }

  // 3. Improvement areas (60-74%) (Priority Weight: 40+)
  for (const imp of profileAnalysis.improvementSkills) {
    if (!evaluatedSubSkillIds.has(imp.subSkillId)) {
      evaluatedSubSkillIds.add(imp.subSkillId);
      const gap = Math.max(0, 80 - imp.scorePercentage);
      gapItems.push({
        subSkillId: imp.subSkillId,
        subSkillName: imp.subSkillName,
        skillName: imp.skillName,
        currentScore: imp.scorePercentage,
        targetScore: 80,
        isMandatory: false,
        priorityWeight: 40 + gap,
        reason: `Developing area (${imp.scorePercentage}%). Elevating to Advanced (≥80%) enhances overall industry match competitiveness.`,
        topics: imp.topics,
      });
    }
  }

  // Sort gaps by priority weight descending
  gapItems.sort((a, b) => b.priorityWeight - a.priorityWeight);

  // Build sequential phases
  const phases = gapItems.map((gap, index) => {
    // Find matching course for this gap
    let matchedCourse = courses.find((c) =>
      c.subSkills.some((cs) => cs.subSkill.name.toLowerCase().includes(gap.subSkillName.toLowerCase()))
    );

    if (!matchedCourse) {
      matchedCourse = courses.find((c) =>
        c.skills.some((s) => s.skill.name.toLowerCase().includes(gap.skillName.toLowerCase()))
      );
    }

    if (!matchedCourse && courses.length > 0) {
      matchedCourse = courses[index % courses.length];
    }

    const isAchieved = gap.currentScore >= gap.targetScore;
    const status = isAchieved ? 'TARGET_ACHIEVED' : index === 0 ? 'CURRENT_PHASE' : 'UPCOMING';

    return {
      phaseNumber: index + 1,
      phaseTitle: `Phase ${index + 1}: Strengthen ${gap.subSkillName}`,
      subSkillId: gap.subSkillId,
      subSkillName: gap.subSkillName,
      skillName: gap.skillName,
      currentScore: gap.currentScore,
      targetScore: gap.targetScore,
      isMandatory: gap.isMandatory,
      status,
      aiRationale: gap.reason,
      topicsToMaster: gap.topics,
      recommendedCourse: matchedCourse
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

  const nextActionableSkill = phases.find((p) => p.status === 'CURRENT_PHASE') || phases[0] || null;

  return {
    studentId,
    targetCareer: targetRole,
    targetOpportunity: oppReadiness
      ? {
          id: oppReadiness.opportunityId,
          title: oppReadiness.opportunityTitle,
          companyName: oppReadiness.companyName,
          compatibilityPercentage: oppReadiness.compatibilityPercentage,
          isReady: oppReadiness.isReady,
        }
      : null,
    totalPhases: phases.length,
    activePhaseNumber: nextActionableSkill ? nextActionableSkill.phaseNumber : 1,
    nextActionableSkill,
    phases,
    achievedCount: phases.filter((p) => p.status === 'TARGET_ACHIEVED').length,
  };
}

/**
 * Calculate historical skill growth trends and deltas
 */
export async function calculateSkillGrowth(studentId: string, subSkillId?: string) {
  const whereClause: any = { studentId };
  if (subSkillId) whereClause.subSkillId = subSkillId;

  const snapshots = await prisma.skillProgressSnapshot.findMany({
    where: whereClause,
    include: {
      subSkill: {
        include: { skill: true },
      },
    },
    orderBy: { recordedAt: 'asc' },
  });

  const subSkillScoreMap = await prisma.studentSubSkillScore.findMany({
    where: whereClause,
    include: {
      subSkill: { include: { skill: true } },
    },
  });

  // Group snapshots by sub-skill
  const grouped = new Map<string, Array<any>>();
  snapshots.forEach((snap) => {
    const list = grouped.get(snap.subSkillId) || [];
    list.push(snap);
    grouped.set(snap.subSkillId, list);
  });

  const growthReport = subSkillScoreMap.map((current) => {
    const history = grouped.get(current.subSkillId) || [];
    const initialScore = history.length > 0 ? history[0].scorePercentage : current.scorePercentage;
    const latestScore = current.scorePercentage;
    const delta = latestScore - initialScore;
    const target = 75;

    return {
      subSkillId: current.subSkillId,
      subSkillName: current.subSkill.name,
      skillName: current.subSkill.skill.name,
      initialScore,
      currentScore: latestScore,
      targetScore: target,
      improvementDelta: delta,
      targetAchieved: latestScore >= target,
      history: history.map((h) => ({
        scorePercentage: h.scorePercentage,
        proficiencyLevel: h.proficiencyLevel,
        delta: h.deltaPercentage || 0,
        date: h.recordedAt,
      })),
    };
  });

  return {
    studentId,
    totalTrackedSkills: growthReport.length,
    overallAverageGrowth:
      growthReport.length > 0
        ? Math.round(growthReport.reduce((acc, g) => acc + g.improvementDelta, 0) / growthReport.length)
        : 0,
    skills: growthReport,
  };
}

/**
 * Record reassessment score and update historical snapshot
 */
export async function recordSubSkillReassessment(params: {
  studentId: string;
  subSkillId: string;
  newScore: number;
  assessmentAttemptId?: string;
}) {
  const { studentId, subSkillId, newScore, assessmentAttemptId } = params;

  const existing = await prisma.studentSubSkillScore.findUnique({
    where: {
      studentId_subSkillId: {
        studentId,
        subSkillId,
      },
    },
    include: { subSkill: true },
  });

  const prevScore = existing ? existing.scorePercentage : newScore;
  const deltaPercentage = Math.round(newScore - prevScore);
  const proficiencyLevel = convertScoreToProficiency(newScore);

  const updated = await prisma.studentSubSkillScore.upsert({
    where: {
      studentId_subSkillId: {
        studentId,
        subSkillId,
      },
    },
    update: {
      scorePercentage: newScore,
      proficiencyLevel,
      questionsAttempted: (existing?.questionsAttempted || 0) + 1,
      questionsCorrect: (existing?.questionsCorrect || 0) + (newScore >= 60 ? 1 : 0),
      lastAssessedAt: new Date(),
    },
    create: {
      studentId,
      subSkillId,
      scorePercentage: newScore,
      proficiencyLevel,
      questionsAttempted: 1,
      questionsCorrect: newScore >= 60 ? 1 : 0,
      lastAssessedAt: new Date(),
    },
  });

  // Record historical snapshot
  await prisma.skillProgressSnapshot.create({
    data: {
      studentId,
      subSkillId,
      assessmentAttemptId,
      scorePercentage: newScore,
      proficiencyLevel,
      deltaPercentage,
      recordedAt: new Date(),
    },
  });

  return {
    updated,
    deltaPercentage,
    growthDelta: deltaPercentage,
    scorePercentage: newScore,
    proficiencyLevel,
    targetAchieved: newScore >= 75,
  };
}
