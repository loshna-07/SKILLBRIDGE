import prisma from '../config/db';

export const PROFICIENCY_RANK: Record<string, number> = {
  BEGINNER: 1,
  DEVELOPING: 2,
  INTERMEDIATE: 3,
  ADVANCED: 4,
  EXPERT: 5,
};

export interface MatchingWeights {
  skillWeight: number;       // default 0.50
  assessmentWeight: number;  // default 0.20
  cgpaWeight: number;        // default 0.15
  academicWeight: number;    // default 0.15
}

export interface MatchedSkillDetail {
  skillId?: string;
  name: string;
  proficiency: string;
  score?: number;
  isRequired: boolean;
}

export interface MissingSkillDetail {
  skillId?: string;
  name: string;
  isRequired: boolean;
}

export interface SkillGapDetail {
  skillId?: string;
  name: string;
  gapType: 'MISSING_REQUIRED' | 'MISSING_PREFERRED' | 'LOW_PROFICIENCY';
  currentProficiency?: string;
  requiredProficiency?: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  recommendation: string;
}

export interface EligibilityResult {
  isEligible: boolean;
  cgpaEligible: boolean;
  departmentEligible: boolean;
  degreeEligible: boolean;
  skillsEligible: boolean;
  proficiencyEligible: boolean;
  deadlineEligible: boolean;
  minCgpa?: number | null;
  studentCgpa?: number | null;
  reasons: string[];
  ineligibleReasons: string[];
  goodMatchReasons: string[];
}

export interface MatchingResult {
  matchScore: number;
  matchPercentage: number;
  matchedSkills: MatchedSkillDetail[];
  missingSkills: MissingSkillDetail[];
  missingRequiredSkills: string[];
  missingPreferredSkills: string[];
  eligibility: EligibilityResult;
  cgpaEligible: boolean;
  departmentEligible: boolean;
  degreeEligible: boolean;
  skillGaps: SkillGapDetail[];
  breakdown: {
    skillScore: number;
    assessmentScore: number;
    cgpaScore: number;
    academicScore: number;
  };
  weightsUsed: MatchingWeights;
  explanation: string;
}

export const getPlatformWeights = async (): Promise<MatchingWeights> => {
  try {
    const setting = await prisma.platformSetting.findUnique({
      where: { key: 'MATCHING_WEIGHTS' },
    });
    if (setting) {
      return JSON.parse(setting.value);
    }
  } catch (err) {
    // fallback to defaults
  }
  return {
    skillWeight: 0.50,
    assessmentWeight: 0.20,
    cgpaWeight: 0.15,
    academicWeight: 0.15,
  };
};

const normalizeAcademicString = (str: string): string => {
  return (str || '')
    .toLowerCase()
    .replace(/[().,;:/|_\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

// Synonym group mapping for academic departments
const DEPARTMENT_SYNONYM_GROUPS: string[][] = [
  // Computer Science & IT
  ['computer science', 'cs', 'cse', 'computer science and engineering', 'computer science & engineering', 'software engineering', 'information technology', 'it', 'computer applications', 'mca', 'bca'],
  // Electronics & Hardware
  ['electronics', 'ece', 'electronics and communication', 'electronics & communication engineering', 'embedded systems', 'embedded', 'iot'],
  // Electrical
  ['electrical', 'eee', 'electrical and electronics', 'electrical & electronics engineering'],
  // Mechanical & Civil
  ['mechanical', 'mech', 'mechanical engineering'],
  ['civil', 'civil engineering'],
  // Commerce & Finance
  ['commerce', 'finance', 'accounting', 'financial studies', 'commerce & finance', 'commerce and finance', 'commerce & financial studies', 'banking', 'business administration', 'bba', 'mba', 'b.com', 'bcom', 'm.com', 'mcom'],
  // Ayurveda & Healthcare
  ['ayurveda', 'bams', 'kayachikitsa', 'dravyaguna', 'panchakarma', 'shalyatantra', 'shalakyatantra', 'kaumarbhritya', 'prasuti tantra', 'swasthavritta', 'rasashastra', 'samhita', 'kriya sharir', 'rachana sharir', 'clinical research', 'herbal medicine', 'ayurvedic medicine'],
];

// Synonym group mapping for academic degrees
const DEGREE_SYNONYM_GROUPS: string[][] = [
  // Engineering degrees
  ['btech', 'b.tech', 'be', 'b.e', 'bachelor of technology', 'bachelor of engineering', 'btech / be', 'b.tech / b.e.'],
  ['mtech', 'm.tech', 'me', 'm.e', 'master of technology', 'master of engineering'],
  // Ayurveda degrees
  ['bams', 'b.a.m.s', 'bachelor of ayurvedic medicine and surgery', 'ayurveda'],
  ['md', 'ms', 'md / ms', 'md (ayurveda)', 'ms (ayurveda)', 'master of ayurveda'],
  // Commerce degrees
  ['bcom', 'b.com', 'bachelor of commerce'],
  ['mcom', 'm.com', 'master of commerce'],
  ['bba', 'b.b.a', 'bachelor of business administration'],
  ['mba', 'm.b.a', 'master of business administration'],
  // Science degrees
  ['bsc', 'b.sc', 'bachelor of science'],
  ['msc', 'm.sc', 'master of science'],
];

export const isDepartmentMatch = (studentDept: string | null | undefined, oppDept: string | null | undefined): boolean => {
  if (!oppDept || !oppDept.trim() || oppDept.trim().toUpperCase() === 'ALL' || oppDept.trim().toUpperCase() === 'ANY') {
    return true;
  }
  if (!studentDept || !studentDept.trim()) {
    return false;
  }

  const sNorm = normalizeAcademicString(studentDept);
  const oNorm = normalizeAcademicString(oppDept);

  // Direct normalized substring match
  if (sNorm.includes(oNorm) || oNorm.includes(sNorm)) {
    return true;
  }

  // Tokenize requirement
  const oppTokens = oppDept.split(/[,;/|]|or|and|&/i).map((t) => normalizeAcademicString(t)).filter(Boolean);
  for (const token of oppTokens) {
    if (sNorm.includes(token) || token.includes(sNorm)) {
      return true;
    }
  }

  // Check synonym groups
  for (const group of DEPARTMENT_SYNONYM_GROUPS) {
    const studentInGroup = group.some((term) => sNorm.includes(normalizeAcademicString(term)) || normalizeAcademicString(term).includes(sNorm));
    if (studentInGroup) {
      const oppInGroup = group.some((term) => {
        const normTerm = normalizeAcademicString(term);
        return oNorm.includes(normTerm) || oppTokens.some((t) => t.includes(normTerm) || normTerm.includes(t));
      });
      if (oppInGroup) {
        return true;
      }
    }
  }

  // Word token overlap check
  const studentWords = new Set(sNorm.split(/\s+/).filter((w) => w.length > 2 && !['and', 'the', 'for', 'studies', 'department'].includes(w)));
  const oppWords = oNorm.split(/\s+/).filter((w) => w.length > 2 && !['and', 'the', 'for', 'studies', 'department'].includes(w));
  for (const w of oppWords) {
    if (studentWords.has(w)) {
      return true;
    }
  }

  return false;
};

export const isDegreeMatch = (studentDegree: string | null | undefined, oppDegree: string | null | undefined): boolean => {
  if (!oppDegree || !oppDegree.trim() || oppDegree.trim().toUpperCase() === 'ALL' || oppDegree.trim().toUpperCase() === 'ANY') {
    return true;
  }
  if (!studentDegree || !studentDegree.trim()) {
    return false;
  }

  const sNorm = normalizeAcademicString(studentDegree);
  const oNorm = normalizeAcademicString(oppDegree);

  // Direct normalized substring match
  if (sNorm.includes(oNorm) || oNorm.includes(sNorm)) {
    return true;
  }

  // Tokenize requirement
  const oppTokens = oppDegree.split(/[,;/|]|or|and|&/i).map((t) => normalizeAcademicString(t)).filter(Boolean);
  for (const token of oppTokens) {
    if (sNorm.includes(token) || token.includes(sNorm)) {
      return true;
    }
  }

  // Check synonym groups
  for (const group of DEGREE_SYNONYM_GROUPS) {
    const studentInGroup = group.some((term) => {
      const normTerm = normalizeAcademicString(term);
      return sNorm.includes(normTerm) || normTerm.includes(sNorm);
    });
    if (studentInGroup) {
      const oppInGroup = group.some((term) => {
        const normTerm = normalizeAcademicString(term);
        return oNorm.includes(normTerm) || oppTokens.some((t) => t.includes(normTerm) || normTerm.includes(t));
      });
      if (oppInGroup) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Calculate compatibility between a Student and an Opportunity (Internship or Job)
 */
export const calculateOpportunityMatch = async (
  studentId: string,
  opportunityId: string,
  customWeights?: MatchingWeights
): Promise<MatchingResult> => {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      skillProfiles: {
        include: { skill: true },
      },
    },
  });

  const opportunity = await prisma.opportunity.findUnique({
    where: { id: opportunityId },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  const defaultWeights = customWeights || (await getPlatformWeights());

  if (!student || !opportunity) {
    return {
      matchScore: 0,
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: [],
      missingRequiredSkills: [],
      missingPreferredSkills: [],
      eligibility: {
        isEligible: false,
        cgpaEligible: false,
        departmentEligible: false,
        degreeEligible: false,
        skillsEligible: false,
        proficiencyEligible: false,
        deadlineEligible: false,
        reasons: ['Student or Opportunity record not found.'],
        ineligibleReasons: ['Student or Opportunity record not found.'],
        goodMatchReasons: [],
      },
      cgpaEligible: false,
      departmentEligible: false,
      degreeEligible: false,
      skillGaps: [],
      breakdown: { skillScore: 0, assessmentScore: 0, cgpaScore: 0, academicScore: 0 },
      weightsUsed: defaultWeights,
      explanation: 'Student or Opportunity not found.',
    };
  }

  const weights = defaultWeights;

  // 1. Skill & Assessment Score
  const studentSkillMap = new Map<string, { proficiency: string; score: number; name: string }>();
  for (const sp of student.skillProfiles) {
    studentSkillMap.set(sp.skillId, {
      proficiency: sp.proficiencyLevel || 'BEGINNER',
      score: sp.scorePercentage || 0,
      name: sp.skill.name,
    });
  }

  const matchedSkills: MatchedSkillDetail[] = [];
  const missingSkills: MissingSkillDetail[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  const skillGaps: SkillGapDetail[] = [];
  const ineligibleReasons: string[] = [];
  const goodMatchReasons: string[] = [];
  const eligibilityReasons: string[] = [];

  let requiredMatchedCount = 0;
  let totalRequiredCount = 0;
  let preferredMatchedCount = 0;
  let totalPreferredCount = 0;
  let totalAssessmentScore = 0;
  let proficiencyEligible = true;

  for (const oppSkill of opportunity.skills) {
    const skillName = oppSkill.skill.name;
    const studentSkill = studentSkillMap.get(oppSkill.skillId);
    const requiredProficiency = oppSkill.minProficiency || 'INTERMEDIATE';
    const requiredRank = PROFICIENCY_RANK[requiredProficiency] || 3;

    if (oppSkill.isRequired) {
      totalRequiredCount++;
      if (studentSkill) {
        requiredMatchedCount++;
        const studentRank = PROFICIENCY_RANK[studentSkill.proficiency] || 1;

        matchedSkills.push({
          skillId: oppSkill.skillId,
          name: skillName,
          proficiency: studentSkill.proficiency,
          score: studentSkill.score,
          isRequired: true,
        });
        totalAssessmentScore += typeof studentSkill.score === 'number' ? studentSkill.score : 0;

        // Check proficiency requirement for mandatory skills
        if (studentRank < requiredRank) {
          proficiencyEligible = false;
          ineligibleReasons.push(
            `Mandatory skill required: ${skillName} (Required proficiency: ${requiredProficiency}, your proficiency: ${studentSkill.proficiency}).`
          );
          skillGaps.push({
            skillId: oppSkill.skillId,
            name: skillName,
            gapType: 'LOW_PROFICIENCY',
            currentProficiency: studentSkill.proficiency,
            requiredProficiency,
            severity: 'HIGH',
            recommendation: `Elevate proficiency in ${skillName} from ${studentSkill.proficiency} to ${requiredProficiency}.`,
          });
        } else {
          goodMatchReasons.push(`✓ Satisfies mandatory skill: ${skillName} (${studentSkill.proficiency})`);
        }
      } else {
        missingRequiredSkills.push(skillName);
        missingSkills.push({ skillId: oppSkill.skillId, name: skillName, isRequired: true });
        ineligibleReasons.push(
          `Mandatory skill required: ${skillName} (Required proficiency: ${requiredProficiency}, your proficiency: Not added).`
        );
        skillGaps.push({
          skillId: oppSkill.skillId,
          name: skillName,
          gapType: 'MISSING_REQUIRED',
          requiredProficiency,
          severity: 'HIGH',
          recommendation: `Mandatory skill ${skillName} is required by this posting. Add or complete courses to gain this competency.`,
        });
      }
    } else {
      totalPreferredCount++;
      if (studentSkill) {
        preferredMatchedCount++;
        matchedSkills.push({
          skillId: oppSkill.skillId,
          name: skillName,
          proficiency: studentSkill.proficiency,
          score: studentSkill.score,
          isRequired: false,
        });
        totalAssessmentScore += typeof studentSkill.score === 'number' ? studentSkill.score : 0;
        goodMatchReasons.push(`✓ Has preferred skill: ${skillName} (${studentSkill.proficiency})`);
      } else {
        missingPreferredSkills.push(skillName);
        missingSkills.push({ skillId: oppSkill.skillId, name: skillName, isRequired: false });
        skillGaps.push({
          skillId: oppSkill.skillId,
          name: skillName,
          gapType: 'MISSING_PREFERRED',
          requiredProficiency: 'BEGINNER',
          severity: 'LOW',
          recommendation: `Preferred skill ${skillName} enhances competitiveness for this role.`,
        });
      }
    }
  }

  // Skill Score calculation
  let skillScore = 100;
  if (totalRequiredCount > 0 || totalPreferredCount > 0) {
    const reqPart = totalRequiredCount > 0 ? (requiredMatchedCount / totalRequiredCount) * 80 : 80;
    const prefPart = totalPreferredCount > 0 ? (preferredMatchedCount / totalPreferredCount) * 20 : 20;
    skillScore = Math.min(100, reqPart + prefPart);
  }

  // Assessment Score
  const matchedCount = matchedSkills.length;
  const avgAssessmentScore = matchedCount > 0 ? totalAssessmentScore / matchedCount : 0;

  // 2. CGPA Check & Score
  let cgpaEligible = true;
  let cgpaScore = 100;

  if (opportunity.minCgpa && Number(opportunity.minCgpa) > 0) {
    const minCgpaNum = Number(opportunity.minCgpa);
    if (student.cgpa === null || student.cgpa === undefined) {
      cgpaEligible = false;
      cgpaScore = 0;
      ineligibleReasons.push(`CGPA not specified on student profile (Minimum required: ${minCgpaNum}).`);
      eligibilityReasons.push(`CGPA not specified on student profile (Minimum required: ${minCgpaNum}).`);
    } else if (Number(student.cgpa) >= minCgpaNum) {
      cgpaEligible = true;
      cgpaScore = Math.min(100, (Number(student.cgpa) / 10) * 100);
      goodMatchReasons.push(`✓ CGPA (${student.cgpa}) meets minimum requirement of ${minCgpaNum}`);
      eligibilityReasons.push(`CGPA (${student.cgpa}) meets or exceeds the minimum requirement of ${minCgpaNum}.`);
    } else {
      cgpaEligible = false;
      cgpaScore = Math.max(0, (Number(student.cgpa) / minCgpaNum) * 60);
      ineligibleReasons.push(`Minimum CGPA required: ${minCgpaNum}. Your CGPA: ${student.cgpa}.`);
      eligibilityReasons.push(`CGPA (${student.cgpa}) is below the required minimum of ${minCgpaNum}.`);
    }
  } else {
    eligibilityReasons.push('No minimum CGPA requirement.');
  }

  // 3. Department & Degree Match
  const departmentEligible = isDepartmentMatch(student.department, opportunity.department);
  if (!departmentEligible) {
    ineligibleReasons.push(`Department mismatch: posting requires '${opportunity.department}' (student: '${student.department || 'Not specified'}').`);
    eligibilityReasons.push(`Department mismatch: posting requires '${opportunity.department}'.`);
  } else if (opportunity.department && opportunity.department.trim()) {
    goodMatchReasons.push(`✓ Department '${student.department}' aligns with role requirements`);
    eligibilityReasons.push(`Department '${student.department}' satisfies role requirements.`);
  } else {
    eligibilityReasons.push('Open to all academic departments.');
  }

  const degreeEligible = isDegreeMatch(student.degree, opportunity.degree);
  if (!degreeEligible) {
    ineligibleReasons.push(`Degree mismatch: posting requires '${opportunity.degree}' (student: '${student.degree || 'Not specified'}').`);
    eligibilityReasons.push(`Degree mismatch: posting requires '${opportunity.degree}'.`);
  } else if (opportunity.degree && opportunity.degree.trim()) {
    goodMatchReasons.push(`✓ Degree '${student.degree}' is eligible`);
    eligibilityReasons.push(`Degree '${student.degree}' meets degree criteria.`);
  } else {
    eligibilityReasons.push('Open to all degree backgrounds.');
  }

  let academicScore = 100;
  if (!departmentEligible && !degreeEligible) academicScore = 30;
  else if (!departmentEligible || !degreeEligible) academicScore = 65;
  else academicScore = 100;

  // 4. Deadline Check
  let deadlineEligible = true;
  if (opportunity.applicationDeadline) {
    const deadline = new Date(opportunity.applicationDeadline);
    if (deadline.getTime() < Date.now()) {
      deadlineEligible = false;
      ineligibleReasons.push(`Application deadline expired on ${deadline.toLocaleDateString()}.`);
      eligibilityReasons.push(`Application deadline has passed.`);
    }
  }

  // Skills eligibility check (only mandatory skills count toward eligibility)
  const skillsEligible = missingRequiredSkills.length === 0;
  if (!skillsEligible) {
    eligibilityReasons.push(`Missing ${missingRequiredSkills.length} mandatory skill(s): ${missingRequiredSkills.join(', ')}.`);
  } else if (totalRequiredCount > 0) {
    eligibilityReasons.push('All mandatory skills satisfied.');
  }

  // Career Interest alignment
  if (student.careerInterests) {
    const interests = student.careerInterests.toLowerCase();
    const oppText = (opportunity.title + ' ' + (opportunity.description || '')).toLowerCase();
    if (interests.split(',').some((i) => oppText.includes(i.trim().toLowerCase()))) {
      goodMatchReasons.push(`✓ Matches career interests in ${student.careerInterests}`);
    }
  }

  const isEligible =
    cgpaEligible &&
    departmentEligible &&
    degreeEligible &&
    skillsEligible &&
    proficiencyEligible &&
    deadlineEligible;

  // Weighted Total Score
  const weightedScore =
    skillScore * weights.skillWeight +
    avgAssessmentScore * weights.assessmentWeight +
    cgpaScore * weights.cgpaWeight +
    academicScore * weights.academicWeight;

  const finalMatchScore = Math.round(Math.min(100, Math.max(0, weightedScore)));

  // Generate clear human explanation
  const explanationParts = [`${finalMatchScore}% overall match`];
  if (matchedSkills.length > 0) {
    explanationParts.push(`Matched skills: ${matchedSkills.map((s) => s.name).join(', ')}`);
  }
  if (missingRequiredSkills.length > 0) {
    explanationParts.push(`Missing mandatory: ${missingRequiredSkills.join(', ')}`);
  }
  if (!isEligible && ineligibleReasons.length > 0) {
    explanationParts.push(`Not eligible: ${ineligibleReasons[0]}`);
  }

  return {
    matchScore: finalMatchScore,
    matchPercentage: finalMatchScore,
    matchedSkills,
    missingSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    eligibility: {
      isEligible,
      cgpaEligible,
      departmentEligible,
      degreeEligible,
      skillsEligible,
      proficiencyEligible,
      deadlineEligible,
      minCgpa: opportunity.minCgpa,
      studentCgpa: student.cgpa,
      reasons: eligibilityReasons,
      ineligibleReasons,
      goodMatchReasons,
    },
    cgpaEligible,
    departmentEligible,
    degreeEligible,
    skillGaps,
    breakdown: {
      skillScore: Math.round(skillScore),
      assessmentScore: Math.round(avgAssessmentScore),
      cgpaScore: Math.round(cgpaScore),
      academicScore: Math.round(academicScore),
    },
    weightsUsed: weights,
    explanation: explanationParts.join('. ') + '.',
  };
};

export const checkOpportunityEligibility = async (
  studentId: string,
  opportunityId: string
): Promise<EligibilityResult> => {
  const match = await calculateOpportunityMatch(studentId, opportunityId);
  return match.eligibility;
};

export const calculateOpportunityCompatibility = async (
  studentId: string,
  opportunityId: string
): Promise<number> => {
  const match = await calculateOpportunityMatch(studentId, opportunityId);
  return match.matchScore;
};

/**
 * Calculate compatibility between a Student and a Learning Program
 */
export const calculateLearningProgramMatch = async (
  studentId: string,
  programId: string,
  customWeights?: MatchingWeights
): Promise<MatchingResult> => {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      skillProfiles: {
        include: { skill: true },
      },
    },
  });

  const program = await prisma.learningProgram.findUnique({
    where: { id: programId },
    include: {
      skills: {
        include: { skill: true },
      },
    },
  });

  const weights = customWeights || (await getPlatformWeights());

  if (!student || !program) {
    return {
      matchScore: 0,
      matchPercentage: 0,
      matchedSkills: [],
      missingSkills: [],
      missingRequiredSkills: [],
      missingPreferredSkills: [],
      eligibility: {
        isEligible: false,
        cgpaEligible: true,
        departmentEligible: true,
        degreeEligible: true,
        skillsEligible: false,
        proficiencyEligible: false,
        deadlineEligible: true,
        reasons: ['Student or Learning Program record not found.'],
        ineligibleReasons: ['Student or Learning Program record not found.'],
        goodMatchReasons: [],
      },
      cgpaEligible: true,
      departmentEligible: true,
      degreeEligible: true,
      skillGaps: [],
      breakdown: { skillScore: 0, assessmentScore: 0, cgpaScore: 100, academicScore: 100 },
      weightsUsed: weights,
      explanation: 'Student or Learning Program not found.',
    };
  }

  const studentSkillMap = new Map<string, { proficiency: string; score: number; name: string }>();
  for (const sp of student.skillProfiles) {
    studentSkillMap.set(sp.skillId, {
      proficiency: sp.proficiencyLevel,
      score: sp.scorePercentage,
      name: sp.skill.name,
    });
  }

  const matchedSkills: MatchedSkillDetail[] = [];
  const missingSkills: MissingSkillDetail[] = [];
  const missingRequiredSkills: string[] = [];
  const missingPreferredSkills: string[] = [];
  const skillGaps: SkillGapDetail[] = [];

  let gapsAddressedCount = 0;
  const programSkills = program.skills;
  const totalSkillsCount = programSkills.length;

  for (const pSkill of programSkills) {
    const skillName = pSkill.skill.name;
    const studentSkill = studentSkillMap.get(pSkill.skillId);

    if (studentSkill) {
      matchedSkills.push({
        skillId: pSkill.skillId,
        name: skillName,
        proficiency: studentSkill.proficiency,
        score: studentSkill.score,
        isRequired: true,
      });

      // If student has weak score in this skill, the program addresses an active gap!
      if (studentSkill.score < 60 || studentSkill.proficiency === 'BEGINNER') {
        gapsAddressedCount++;
        skillGaps.push({
          skillId: pSkill.skillId,
          name: skillName,
          gapType: 'LOW_PROFICIENCY',
          currentProficiency: studentSkill.proficiency,
          requiredProficiency: 'INTERMEDIATE',
          severity: 'HIGH',
          recommendation: `This program directly reinforces ${skillName}, elevating your proficiency from Beginner (${studentSkill.score}%).`,
        });
      }
    } else {
      // Completely new skill that the student lacks
      gapsAddressedCount++;
      missingSkills.push({ skillId: pSkill.skillId, name: skillName, isRequired: true });
      missingRequiredSkills.push(skillName);
      skillGaps.push({
        skillId: pSkill.skillId,
        name: skillName,
        gapType: 'MISSING_REQUIRED',
        requiredProficiency: 'BEGINNER',
        severity: 'MEDIUM',
        recommendation: `Enrolling in this program allows you to acquire and validate ${skillName} from scratch.`,
      });
    }
  }

  // Learning program match percentage:
  let matchPercentage = 0;
  if (totalSkillsCount > 0) {
    const gapClosingRatio = gapsAddressedCount / totalSkillsCount;
    matchPercentage = Math.round(gapClosingRatio * 100);
  }

  const avgAssessmentScore =
    student.skillProfiles.length > 0
      ? Math.round(
          student.skillProfiles.reduce((acc, curr) => acc + (curr.scorePercentage || 0), 0) /
            student.skillProfiles.length
        )
      : 0;
  const studentCgpaScore = student.cgpa ? Math.min(100, Math.round((Number(student.cgpa) / 10) * 100)) : 0;

  const explanation =
    gapsAddressedCount > 0
      ? `Recommended: Directly bridges ${gapsAddressedCount} competency gap(s) (${programSkills.map((s) => s.skill.name).join(', ')}).`
      : totalSkillsCount > 0
      ? `Covers ${totalSkillsCount} relevant topic(s) in your field.`
      : `General learning program.`;

  return {
    matchScore: matchPercentage,
    matchPercentage,
    matchedSkills,
    missingSkills,
    missingRequiredSkills,
    missingPreferredSkills,
    eligibility: {
      isEligible: true,
      cgpaEligible: true,
      departmentEligible: true,
      degreeEligible: true,
      skillsEligible: true,
      proficiencyEligible: true,
      deadlineEligible: true,
      reasons: ['Open academic enrollment for all active students.'],
      ineligibleReasons: [],
      goodMatchReasons: ['Open academic enrollment for all active students.'],
    },
    cgpaEligible: true,
    departmentEligible: true,
    degreeEligible: true,
    skillGaps,
    breakdown: {
      skillScore: matchPercentage,
      assessmentScore: avgAssessmentScore,
      cgpaScore: studentCgpaScore,
      academicScore: studentCgpaScore,
    },
    weightsUsed: weights,
    explanation,
  };
};
