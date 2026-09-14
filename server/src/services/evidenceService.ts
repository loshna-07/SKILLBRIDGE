import prisma from '../config/db';

export type EvidenceType =
  | 'SELF_DECLARED'
  | 'EVIDENCE_PROVIDED'
  | 'CREDENTIAL_VERIFIED'
  | 'SKILL_ASSESSED'
  | 'INDUSTRY_VALIDATED';

export type EvidenceStrength = 'HIGH' | 'MEDIUM' | 'LOW';

export interface SkillEvidenceItem {
  id: string;
  evidenceType: EvidenceType;
  status: string;
  score: number | null;
  sourceName: string;
  sourceId: string | null;
  issuer: string | null;
  credentialId: string | null;
  documentUrl: string | null;
  verifiedById: string | null;
  verifiedAt: Date | null;
  remarks: string | null;
  evidenceDate: Date;
  metadata?: any;
}

export interface SkillEvidenceSummary {
  skillId: string;
  skillName: string;
  categoryName: string;
  currentProficiency: string;
  measuredScore: number | null;
  claimedLevel: string | null;
  skillBridgeScore: number | null;
  industryScore: number | null;
  highestEvidenceLevel: EvidenceType | 'NONE';
  evidenceStrength: EvidenceStrength;
  verifiedCredentialsCount: number;
  evidenceCount: number;
  evidenceList: SkillEvidenceItem[];
  subSkillsEvidence: Array<{
    subSkillId: string;
    subSkillName: string;
    score: number | null;
    status: string;
  }>;
}

/**
 * Calculate evidence confidence strength for a skill based on its evidence hierarchy
 */
export function calculateEvidenceStrength(evidenceList: Array<{ evidenceType: string; status: string; score?: number | null }>): EvidenceStrength {
  const hasIndustryValidated = evidenceList.some((e) => e.evidenceType === 'INDUSTRY_VALIDATED');
  const hasSkillAssessed = evidenceList.some((e) => e.evidenceType === 'SKILL_ASSESSED');
  const hasCredentialVerified = evidenceList.some((e) => e.evidenceType === 'CREDENTIAL_VERIFIED' || e.status === 'VERIFIED');
  const hasEvidenceProvided = evidenceList.some((e) => e.evidenceType === 'EVIDENCE_PROVIDED');

  if (hasIndustryValidated || (hasSkillAssessed && hasCredentialVerified)) {
    return 'HIGH';
  }

  if (hasSkillAssessed || hasCredentialVerified || hasEvidenceProvided) {
    return 'MEDIUM';
  }

  return 'LOW';
}

/**
 * Record Self-Declared Skill Evidence
 */
export async function recordSelfDeclaredEvidence(params: {
  studentId: string;
  skillId: string;
  proficiencyLevel: string;
}) {
  const { studentId, skillId, proficiencyLevel } = params;

  // Check if a self-declared record already exists for this skill
  const existing = await prisma.skillEvidence.findFirst({
    where: {
      studentId,
      skillId,
      evidenceType: 'SELF_DECLARED',
    },
  });

  if (existing) {
    return prisma.skillEvidence.update({
      where: { id: existing.id },
      data: {
        status: 'COMPLETED',
        remarks: `Claimed level: ${proficiencyLevel}`,
        metadata: JSON.stringify({ proficiencyLevel }),
        evidenceDate: new Date(),
      },
    });
  }

  return prisma.skillEvidence.create({
    data: {
      studentId,
      skillId,
      evidenceType: 'SELF_DECLARED',
      status: 'COMPLETED',
      sourceName: 'Student Self-Declaration',
      remarks: `Claimed level: ${proficiencyLevel}`,
      metadata: JSON.stringify({ proficiencyLevel }),
      evidenceDate: new Date(),
    },
  });
}

/**
 * Record Certificate Evidence (Uploaded -> EVIDENCE_PROVIDED, Verified -> CREDENTIAL_VERIFIED)
 */
export async function recordCertificateEvidence(params: {
  studentId: string;
  certificateId: string;
  title: string;
  issuingOrganization: string;
  skillsCovered?: string | null;
  credentialId?: string | null;
  documentUrl?: string | null;
  isVerified?: boolean;
  verifiedById?: string | null;
  remarks?: string | null;
}) {
  const {
    studentId,
    certificateId,
    title,
    issuingOrganization,
    skillsCovered,
    credentialId,
    documentUrl,
    isVerified = false,
    verifiedById = null,
    remarks = null,
  } = params;

  // Resolve target skills from skillsCovered string or certificate title
  const skillKeywords = (skillsCovered || title || '')
    .split(/[,&/|]/)
    .map((s) => s.trim())
    .filter(Boolean);

  let targetSkills = await prisma.skill.findMany({
    where: {
      OR: skillKeywords.map((k) => ({ name: { contains: k, mode: 'insensitive' } })),
    },
  });

  // If no matching skill found by keywords, search for any partial match or create/find default
  if (targetSkills.length === 0 && skillKeywords.length > 0) {
    for (const kw of skillKeywords) {
      const match = await prisma.skill.findFirst({
        where: { name: { contains: kw, mode: 'insensitive' } },
      });
      if (match) targetSkills.push(match);
    }
  }

  // If still none, link to existing student skills if available
  if (targetSkills.length === 0) {
    const studentSkills = await prisma.studentSkillProfile.findMany({
      where: { studentId },
      include: { skill: true },
    });
    if (studentSkills.length > 0) {
      targetSkills = [studentSkills[0].skill];
    }
  }

  const evidenceType: EvidenceType = isVerified ? 'CREDENTIAL_VERIFIED' : 'EVIDENCE_PROVIDED';
  const status = isVerified ? 'VERIFIED' : 'PENDING';

  for (const skill of targetSkills) {
    // Check if evidence for this certificate & skill already exists
    const existing = await prisma.skillEvidence.findFirst({
      where: {
        studentId,
        skillId: skill.id,
        certificateId,
      },
    });

    if (existing) {
      await prisma.skillEvidence.update({
        where: { id: existing.id },
        data: {
          evidenceType,
          status,
          sourceName: issuingOrganization || 'Authorized Institution',
          issuer: issuingOrganization,
          credentialId,
          documentUrl,
          verifiedById,
          verifiedAt: isVerified ? new Date() : null,
          remarks: remarks || `Certificate: ${title}`,
          evidenceDate: isVerified ? new Date() : existing.evidenceDate,
        },
      });
    } else {
      await prisma.skillEvidence.create({
        data: {
          studentId,
          skillId: skill.id,
          certificateId,
          evidenceType,
          status,
          sourceName: issuingOrganization || 'Authorized Institution',
          issuer: issuingOrganization,
          credentialId,
          documentUrl,
          verifiedById,
          verifiedAt: isVerified ? new Date() : null,
          remarks: `Certificate: ${title}`,
          evidenceDate: new Date(),
        },
      });
    }
  }
}

/**
 * Record Assessment Evidence (SkillBridge Test or Company Assessment)
 */
export async function recordAssessmentEvidence(params: {
  studentId: string;
  attemptId: string;
  assessmentId: string;
  overallScore: number;
  granularBreakdown?: any;
  opportunityId?: string | null;
  companyName?: string | null;
  assessmentTitle?: string;
}) {
  const {
    studentId,
    attemptId,
    assessmentId,
    overallScore,
    granularBreakdown,
    opportunityId,
    companyName,
    assessmentTitle = 'Assessment',
  } = params;

  const isIndustry = Boolean(opportunityId || companyName);
  const evidenceType: EvidenceType = isIndustry ? 'INDUSTRY_VALIDATED' : 'SKILL_ASSESSED';
  const sourceName = isIndustry
    ? companyName || 'Company Technical Assessment'
    : 'SkillBridge Assessment Engine';

  // 1. Process Granular Sub-Skill Scores if available
  if (granularBreakdown?.skillScores && Array.isArray(granularBreakdown.skillScores)) {
    for (const sScore of granularBreakdown.skillScores) {
      const skillId = sScore.skillId;
      if (!skillId) continue;

      await prisma.skillEvidence.create({
        data: {
          studentId,
          skillId,
          assessmentId,
          assessmentAttemptId: attemptId,
          opportunityId: opportunityId || null,
          evidenceType,
          status: 'VALIDATED',
          score: sScore.scorePercentage,
          sourceName,
          remarks: `${assessmentTitle} — Score: ${sScore.scorePercentage}%`,
          metadata: JSON.stringify({
            proficiencyLevel: sScore.proficiencyLevel,
            questionsTotal: sScore.questionsTotal,
            questionsCorrect: sScore.questionsCorrect,
          }),
          evidenceDate: new Date(),
        },
      });
    }
  } else {
    // Lookup skills tied to assessment or student
    const assessment = await prisma.assessment.findUnique({
      where: { id: assessmentId },
      include: {
        questions: { select: { skillId: true } },
      },
    });

    const skillIds = new Set<string>();
    assessment?.questions.forEach((q) => {
      if (q.skillId) skillIds.add(q.skillId);
    });

    for (const sId of skillIds) {
      await prisma.skillEvidence.create({
        data: {
          studentId,
          skillId: sId,
          assessmentId,
          assessmentAttemptId: attemptId,
          opportunityId: opportunityId || null,
          evidenceType,
          status: 'VALIDATED',
          score: overallScore,
          sourceName,
          remarks: `${assessmentTitle} — Score: ${overallScore}%`,
          evidenceDate: new Date(),
        },
      });
    }
  }
}

/**
 * Get Comprehensive Evidence-Based Skill Profile for a Student
 */
export async function getStudentSkillEvidenceProfile(studentId: string): Promise<SkillEvidenceSummary[]> {
  const [studentSkills, subSkillScores, allEvidence] = await Promise.all([
    prisma.studentSkillProfile.findMany({
      where: { studentId },
      include: { skill: { include: { category: true } } },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.studentSubSkillScore.findMany({
      where: { studentId },
      include: { subSkill: { include: { skill: true } } },
    }),
    prisma.skillEvidence.findMany({
      where: { studentId },
      include: {
        skill: { include: { category: true } },
        certificate: true,
      },
      orderBy: { evidenceDate: 'desc' },
    }),
  ]);

  // Group evidence by skill ID
  const evidenceBySkill = new Map<string, any[]>();
  allEvidence.forEach((ev) => {
    const list = evidenceBySkill.get(ev.skillId) || [];
    list.push(ev);
    evidenceBySkill.set(ev.skillId, list);
  });

  // Collect all known skills for the student (from studentSkills and evidence)
  const allSkillMap = new Map<string, { id: string; name: string; categoryName: string; defaultProficiency: string }>();

  studentSkills.forEach((sp) => {
    allSkillMap.set(sp.skillId, {
      id: sp.skillId,
      name: sp.skill.name,
      categoryName: sp.skill.category?.name || 'General',
      defaultProficiency: sp.proficiencyLevel,
    });
  });

  allEvidence.forEach((ev) => {
    if (!allSkillMap.has(ev.skillId) && ev.skill) {
      allSkillMap.set(ev.skillId, {
        id: ev.skillId,
        name: ev.skill.name,
        categoryName: ev.skill.category?.name || 'General',
        defaultProficiency: 'INTERMEDIATE',
      });
    }
  });

  const result: SkillEvidenceSummary[] = [];

  for (const [sId, sMeta] of allSkillMap.entries()) {
    const evidenceListRaw = evidenceBySkill.get(sId) || [];
    const evidenceStrength = calculateEvidenceStrength(evidenceListRaw);

    let claimedLevel: string | null = null;
    let skillBridgeScore: number | null = null;
    let industryScore: number | null = null;
    let verifiedCredentialsCount = 0;

    const evidenceList: SkillEvidenceItem[] = evidenceListRaw.map((e) => {
      if (e.evidenceType === 'SELF_DECLARED') {
        claimedLevel = sMeta.defaultProficiency;
      }
      if (e.evidenceType === 'SKILL_ASSESSED' && typeof e.score === 'number') {
        if (skillBridgeScore === null || e.score > skillBridgeScore) {
          skillBridgeScore = e.score;
        }
      }
      if (e.evidenceType === 'INDUSTRY_VALIDATED' && typeof e.score === 'number') {
        if (industryScore === null || e.score > industryScore) {
          industryScore = e.score;
        }
      }
      if (e.evidenceType === 'CREDENTIAL_VERIFIED' || e.status === 'VERIFIED') {
        verifiedCredentialsCount++;
      }

      let parsedMeta = null;
      if (e.metadata) {
        try {
          parsedMeta = JSON.parse(e.metadata);
        } catch {}
      }

      return {
        id: e.id,
        evidenceType: e.evidenceType as EvidenceType,
        status: e.status,
        score: e.score,
        sourceName: e.sourceName,
        sourceId: e.sourceId,
        issuer: e.issuer || e.certificate?.issuingOrganization || null,
        credentialId: e.credentialId || e.certificate?.credentialId || null,
        documentUrl: e.documentUrl || e.certificate?.certificateDocUrl || null,
        verifiedById: e.verifiedById,
        verifiedAt: e.verifiedAt,
        remarks: e.remarks,
        evidenceDate: e.evidenceDate,
        metadata: parsedMeta,
      };
    });

    // Determine primary measured score (preference: Industry Validated -> SkillBridge Assessed)
    const measuredScore = industryScore !== null ? industryScore : skillBridgeScore !== null ? skillBridgeScore : null;

    // Sub-skills belonging to this skill
    const subSkillsEvidence = subSkillScores
      .filter((sub) => sub.subSkill?.skillId === sId)
      .map((sub) => ({
        subSkillId: sub.subSkillId,
        subSkillName: sub.subSkill.name,
        score: sub.scorePercentage,
        status: sub.proficiencyLevel,
      }));

    // Determine highest evidence level
    const TIER_ORDER: EvidenceType[] = [
      'INDUSTRY_VALIDATED',
      'SKILL_ASSESSED',
      'CREDENTIAL_VERIFIED',
      'EVIDENCE_PROVIDED',
      'SELF_DECLARED',
    ];
    let highestEvidenceLevel: EvidenceType | 'NONE' = 'NONE';
    for (const tier of TIER_ORDER) {
      if (evidenceListRaw.some((e) => e.evidenceType === tier)) {
        highestEvidenceLevel = tier;
        break;
      }
    }

    result.push({
      skillId: sId,
      skillName: sMeta.name,
      categoryName: sMeta.categoryName,
      currentProficiency: sMeta.defaultProficiency,
      measuredScore,
      claimedLevel,
      skillBridgeScore,
      industryScore,
      highestEvidenceLevel,
      evidenceStrength,
      verifiedCredentialsCount,
      evidenceCount: evidenceList.length,
      evidenceList,
      subSkillsEvidence,
    });
  }

  return result.sort((a, b) => {
    // Sort HIGH -> MEDIUM -> LOW, then alphabetical
    const rank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    return rank[b.evidenceStrength] - rank[a.evidenceStrength] || a.skillName.localeCompare(b.skillName);
  });
}

/**
 * Get Chronological Evidence Timeline for a Student
 */
export async function getEvidenceTimeline(studentId: string, skillId?: string) {
  const where: any = { studentId };
  if (skillId) {
    where.skillId = skillId;
  }

  const items = await prisma.skillEvidence.findMany({
    where,
    include: {
      skill: { include: { category: true } },
      certificate: true,
    },
    orderBy: { evidenceDate: 'desc' },
  });

  return items.map((item) => ({
    id: item.id,
    skillId: item.skillId,
    skillName: item.skill?.name || 'General Skill',
    categoryName: item.skill?.category?.name || 'General',
    evidenceType: item.evidenceType,
    status: item.status,
    score: item.score,
    sourceName: item.sourceName,
    issuer: item.issuer || item.certificate?.issuingOrganization || null,
    credentialId: item.credentialId || item.certificate?.credentialId || null,
    documentUrl: item.documentUrl || item.certificate?.certificateDocUrl || null,
    verifiedAt: item.verifiedAt,
    remarks: item.remarks,
    evidenceDate: item.evidenceDate,
  }));
}
