import prisma from '../config/db';
import { calculateOpportunityMatch, MatchingResult } from './matchingEngine';

export type PlatformDomain = 'AYURVEDA' | 'ENGINEERING' | 'COMMERCE' | 'GENERAL';

export const DOMAIN_DISPLAY_NAMES: Record<PlatformDomain, string> = {
  AYURVEDA: 'Ayurveda & Healthcare',
  ENGINEERING: 'Engineering & Technology',
  COMMERCE: 'Commerce & Business',
  GENERAL: 'Interdisciplinary & General',
};

/**
 * Robust domain resolver based on academic department, degree, institution name, sector, and career interests
 */
export function resolveDomain(input: {
  department?: string | null;
  degree?: string | null;
  institutionName?: string | null;
  industrySector?: string | null;
  category?: string | null;
  careerInterests?: string | null;
  title?: string | null;
}): PlatformDomain {
  const combined = [
    input.department || '',
    input.degree || '',
    input.institutionName || '',
    input.industrySector || '',
    input.category || '',
    input.careerInterests || '',
    input.title || '',
  ]
    .join(' ')
    .toLowerCase();

  // 1. Ayurveda & Healthcare keywords
  if (
    /ayurved|bams|md\s*\(ayu|kayachikitsa|dravyaguna|rasashastra|bhaishajya|panchakarma|swasthavritta|shalya|shalakya|prasuti|kaumarbhritya|roganidana|ayush|herbal|phytochem|botanical|wellness|nadi\s*pariksha/i.test(
      combined
    )
  ) {
    return 'AYURVEDA';
  }

  // 2. Engineering & Technology keywords
  if (
    /engineer|b\.?tech|b\.?e\.?|m\.?tech|computer\s*science|cse|ece|it\b|information\s*technology|embedded|microcontroller|iot|electronics|software|full\s*stack|web\s*dev|react|node|cloud|python|java\b|robotics/i.test(
      combined
    )
  ) {
    return 'ENGINEERING';
  }

  // 3. Commerce & Business keywords
  if (
    /commerce|b\.?com|m\.?com|bba|mba|finance|financial|accounting|accountancy|audit|taxation|business\s*analytics|fintech|banking|marketing/i.test(
      combined
    )
  ) {
    return 'COMMERCE';
  }

  return 'GENERAL';
}

/**
 * Normalize and tokenize comma/slash/semicolon-separated interests or keywords
 */
export function parseKeywordList(str?: string | null): string[] {
  if (!str) return [];
  return str
    .split(/[,/;|\n]/)
    .map((k) => k.trim())
    .filter(Boolean);
}

/**
 * Robust word-boundary and token matching for skills, career interests, and disciplines
 */
export function isKeywordMatch(term: string, target: string): boolean {
  if (!term || !target) return false;
  const t = term.trim().toLowerCase();
  const tgt = target.trim().toLowerCase();
  if (t === tgt) return true;

  // Exact word-boundary match
  const escaped = t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(^|[^a-z0-9])${escaped}([^a-z0-9]|$)`, 'i');
  if (regex.test(tgt)) return true;

  if (t.length >= 4 && tgt.length >= 4) {
    if (tgt.includes(t) || t.includes(tgt)) return true;
  }
  return false;
}

const PROFICIENCY_RANK: Record<string, number> = {
  BEGINNER: 1,
  INTERMEDIATE: 2,
  ADVANCED: 3,
  EXPERT: 4,
};

// --------------------------------------------------------------------------
// STUDENT PERSONALIZATION TYPES
// --------------------------------------------------------------------------

export interface RecommendedSkillItem {
  skillId: string;
  skillName: string;
  category: string;
  domain: PlatformDomain;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  currentLevel: string;
  targetLevel: string;
  opportunityCount: number;
  courseCount: number;
  reason: string;
  matchingInterests: string[];
}

export interface SkillGapItem {
  skillId: string;
  skillName: string;
  category: string;
  domain: PlatformDomain;
  gapType: 'MISSING_REQUIRED' | 'LOW_PROFICIENCY';
  currentLevel: string;
  requiredLevel: string;
  severity: 'HIGH' | 'MEDIUM';
  recommendation: string;
  relevantOpportunitiesCount: number;
  suggestedCourses: Array<{ id: string; title: string }>;
}

export interface RecommendedCourseItem {
  course: any;
  matchPercentage: number;
  reason: string;
  addressedGaps: string[];
  relevanceScore: number;
}

export interface MatchedSkillEntry {
  name: string;
  requiredLevel: string;
  studentLevel: string;
  matchType: 'FULL' | 'PARTIAL';
}

export interface UnmatchedSkillEntry {
  name: string;
  requiredLevel: string;
  isRequired: boolean;
}

export interface RecommendedOpportunityItem {
  opportunity: any;
  matchResult: MatchingResult;
  isEligible: boolean;
  ineligibleReasons: string[];
  goodMatchReasons: string[];
  matchedSkills: MatchedSkillEntry[];
  unmatchedSkills: UnmatchedSkillEntry[];
  hasApplied: boolean;
  applicationStatus: string | null;
  recommendationReason: string;
}

export interface RecommendedMentorItem {
  id: string;
  name: string;
  type: 'ACADEMICIAN' | 'INDUSTRY';
  designation: string;
  organization: string;
  domain: PlatformDomain;
  matchScore: number;
  expertise: string[];
  matchedInterests: string[];
  canHelpLearn: string[];
  reason: string;
  avatarUrl?: string | null;
}

export interface RecommendedCollaborationItem {
  id: string;
  title: string;
  type: string;
  initiatorRole: string;
  domain: PlatformDomain;
  mode: string;
  duration?: string | null;
  matchScore: number;
  matchedInterests: string[];
  skillsCanDevelop: string[];
  reason: string;
  status: string;
}

export interface StudentPersonalizationPayload {
  domain: PlatformDomain;
  domainDisplayName: string;
  primaryCareerInterest: string;
  secondaryCareerInterests: string[];
  careerInterests: string[];
  currentSkills: Array<{
    id: string;
    skillId: string;
    name: string;
    category: string;
    proficiencyLevel: string;
    scorePercentage: number;
    verificationStatus: string;
  }>;
  recommendedSkills: RecommendedSkillItem[];
  skillsToLearnNext: RecommendedSkillItem[];
  skillGaps: SkillGapItem[];
  recommendedCourses: RecommendedCourseItem[];
  recommendedInternships: RecommendedOpportunityItem[];
  recommendedJobs: RecommendedOpportunityItem[];
  recommendedMentors: RecommendedMentorItem[];
  recommendedCollaborations: RecommendedCollaborationItem[];
  myApplications: any[];
}

// --------------------------------------------------------------------------
// 1. GET STUDENT RECOMMENDATIONS
// --------------------------------------------------------------------------
export async function getStudentRecommendations(studentId: string): Promise<StudentPersonalizationPayload> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      skillProfiles: {
        include: { skill: { include: { category: true } } },
      },
      courseEnrollments: {
        include: { course: true },
      },
      applications: {
        include: {
          opportunity: {
            include: {
              industry: true,
              skills: { include: { skill: true } },
            },
          },
          history: { orderBy: { createdAt: 'desc' } },
        },
      },
      certificates: true,
      projects: true,
    },
  });

  if (!student) {
    throw new Error('Student profile not found.');
  }

  // 1. Identify Domain & Career Interests
  const studentDomain = resolveDomain({
    department: student.department,
    degree: student.degree,
    institutionName: student.institutionName,
    careerInterests: student.careerInterests,
  });

  const parsedInterests = parseKeywordList(student.careerInterests);
  const parsedRoles = parseKeywordList(student.preferredRoles);
  const allParsed = [...parsedInterests, ...parsedRoles];
  const activeInterests = allParsed.length > 0 ? allParsed : [DOMAIN_DISPLAY_NAMES[studentDomain]];
  
  const primaryCareerInterest = parsedInterests.length > 0 ? parsedInterests[0] : (parsedRoles[0] || DOMAIN_DISPLAY_NAMES[studentDomain]);
  const secondaryCareerInterests = parsedInterests.slice(1);

  // Existing student skills map (skillId -> proficiency)
  const studentSkillMap = new Map<
    string,
    { id: string; name: string; proficiency: string; score: number; category: string; verification: string }
  >();

  student.skillProfiles.forEach((sp) => {
    studentSkillMap.set(sp.skillId, {
      id: sp.id,
      name: sp.skill.name,
      proficiency: sp.proficiencyLevel || 'BEGINNER',
      score: sp.scorePercentage || 0,
      category: sp.skill.category?.name || 'General',
      verification: sp.verificationStatus || 'PENDING',
    });
  });

  const currentSkillsList = student.skillProfiles.map((sp) => ({
    id: sp.id,
    skillId: sp.skillId,
    name: sp.skill.name,
    category: sp.skill.category?.name || 'General',
    proficiencyLevel: sp.proficiencyLevel || 'BEGINNER',
    scorePercentage: sp.scorePercentage || 0,
    verificationStatus: sp.verificationStatus || 'PENDING',
  }));

  // 2. Fetch Domain-Scoped Skills
  const domainCategoryName = DOMAIN_DISPLAY_NAMES[studentDomain];
  const domainSkills = await prisma.skill.findMany({
    where: {
      category: {
        name: { equals: domainCategoryName, mode: 'insensitive' },
      },
    },
    include: {
      category: true,
    },
  });

  // 3. Fetch Domain-Scoped Published Opportunities
  const allOpportunities = await prisma.opportunity.findMany({
    where: { isPublished: true },
    include: {
      industry: true,
      skills: { include: { skill: { include: { category: true } } } },
    },
  });

  const domainOpportunities = allOpportunities.filter((opp) => {
    const oppDomain = resolveDomain({
      department: opp.department,
      degree: opp.degree,
      industrySector: opp.industry?.industrySector,
      category: opp.industry?.companyName,
      title: opp.title,
    });
    return oppDomain === studentDomain || oppDomain === 'GENERAL';
  });

  // 4. Fetch Domain-Scoped Published Courses
  const enrolledCourseIds = new Set(student.courseEnrollments.map((ce) => ce.courseId));
  const allCourses = await prisma.course.findMany({
    where: {
      status: 'PUBLISHED',
      id: { notIn: Array.from(enrolledCourseIds) },
    },
    include: {
      skills: { include: { skill: true } },
      _count: { select: { enrollments: true, modules: true } },
    },
  });

  const domainCourses = allCourses.filter((course) => {
    const courseDomain = resolveDomain({
      category: course.category,
      title: course.title,
    });
    return courseDomain === studentDomain || courseDomain === 'GENERAL';
  });

  // 5. Calculate Demand & Course Availability per Skill
  const skillOpportunityDemand = new Map<string, { count: number; matchingInterests: string[] }>();
  const skillCourseAvailability = new Map<string, Array<{ id: string; title: string }>>();

  for (const opp of domainOpportunities) {
    const oppText = opp.title + ' ' + opp.description + ' ' + (opp.department || '');
    const matchedInts = activeInterests.filter((interest) => isKeywordMatch(interest, oppText));

    for (const os of opp.skills) {
      if (!skillOpportunityDemand.has(os.skillId)) {
        skillOpportunityDemand.set(os.skillId, { count: 0, matchingInterests: [] });
      }
      const entry = skillOpportunityDemand.get(os.skillId)!;
      entry.count += 1;
      matchedInts.forEach((intName) => {
        if (!entry.matchingInterests.includes(intName)) {
          entry.matchingInterests.push(intName);
        }
      });
    }
  }

  for (const course of domainCourses) {
    for (const cs of course.skills) {
      if (!skillCourseAvailability.has(cs.skillId)) {
        skillCourseAvailability.set(cs.skillId, []);
      }
      skillCourseAvailability.get(cs.skillId)!.push({ id: course.id, title: course.title });
    }
  }

  // 6. Calculate Recommended Skills, Skills to Learn Next & Skill Gaps
  const recommendedSkills: RecommendedSkillItem[] = [];
  const skillsToLearnNext: RecommendedSkillItem[] = [];
  const skillGaps: SkillGapItem[] = [];

  for (const skill of domainSkills) {
    const oppStats = skillOpportunityDemand.get(skill.id) || { count: 0, matchingInterests: [] };
    const coursesTeachingSkill = skillCourseAvailability.get(skill.id) || [];
    const studentSkill = studentSkillMap.get(skill.id);

    // Primary interest vs secondary interest check
    const matchesPrimary = isKeywordMatch(skill.name, primaryCareerInterest);
    const matchesAnyInterest = activeInterests.some((int) => isKeywordMatch(skill.name, int));

    if (matchesAnyInterest && !oppStats.matchingInterests.includes(skill.name)) {
      oppStats.matchingInterests.push(skill.name);
    }

    // Determine priority
    let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    let rankScore = 0;

    if (matchesPrimary) {
      priority = 'HIGH';
      rankScore += 100;
    } else if (matchesAnyInterest || oppStats.matchingInterests.length > 0) {
      priority = 'HIGH';
      rankScore += 60;
    } else if (oppStats.count >= 2) {
      priority = 'MEDIUM';
      rankScore += 40;
    } else if (oppStats.count >= 1 || coursesTeachingSkill.length >= 1) {
      priority = 'LOW';
      rankScore += 20;
    }
    rankScore += oppStats.count * 10;

    if (!studentSkill) {
      let reason = '';
      if (matchesPrimary) {
        reason = `Core requirement for your primary career pathway in ${primaryCareerInterest}. Required across ${oppStats.count || 1} active opening(s).`;
      } else if (oppStats.matchingInterests.length > 0) {
        const intDisplay = oppStats.matchingInterests.slice(0, 2).join(', ');
        reason = `Required by ${oppStats.count || 1} opportunity(s) matching your career interest in ${intDisplay}.`;
      } else if (oppStats.count > 0) {
        reason = `Frequently demanded across ${oppStats.count} active industry postings in ${DOMAIN_DISPLAY_NAMES[studentDomain]}.`;
      } else {
        reason = `Essential competency for ${DOMAIN_DISPLAY_NAMES[studentDomain]} career pathways.`;
      }

      const skillItem: RecommendedSkillItem = {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category?.name || domainCategoryName,
        domain: studentDomain,
        priority,
        currentLevel: 'Not added',
        targetLevel: 'Intermediate',
        opportunityCount: oppStats.count,
        courseCount: coursesTeachingSkill.length,
        reason,
        matchingInterests: oppStats.matchingInterests,
      };

      recommendedSkills.push(skillItem);
      skillsToLearnNext.push(skillItem);

      if (matchesAnyInterest || oppStats.matchingInterests.length > 0) {
        skillGaps.push({
          skillId: skill.id,
          skillName: skill.name,
          category: skill.category?.name || domainCategoryName,
          domain: studentDomain,
          gapType: 'MISSING_REQUIRED',
          currentLevel: 'Not added',
          requiredLevel: 'Intermediate',
          severity: priority === 'HIGH' ? 'HIGH' : 'MEDIUM',
          recommendation: `Mandatory competency for ${primaryCareerInterest || DOMAIN_DISPLAY_NAMES[studentDomain]}. Enroll in recommended courses to acquire this skill.`,
          relevantOpportunitiesCount: oppStats.count,
          suggestedCourses: coursesTeachingSkill.slice(0, 3),
        });
      }
    } else if (studentSkill.proficiency === 'BEGINNER') {
      const reason = `Elevating ${skill.name} from Beginner to Advanced unlocks higher match scores across ${oppStats.count || 1} opportunity(s).`;
      const skillItem: RecommendedSkillItem = {
        skillId: skill.id,
        skillName: skill.name,
        category: skill.category?.name || domainCategoryName,
        domain: studentDomain,
        priority: matchesAnyInterest ? 'HIGH' : 'MEDIUM',
        currentLevel: 'Beginner',
        targetLevel: 'Advanced',
        opportunityCount: oppStats.count,
        courseCount: coursesTeachingSkill.length,
        reason,
        matchingInterests: oppStats.matchingInterests,
      };

      recommendedSkills.push(skillItem);
      skillsToLearnNext.push(skillItem);

      if (matchesAnyInterest || oppStats.matchingInterests.length > 0) {
        skillGaps.push({
          skillId: skill.id,
          skillName: skill.name,
          category: skill.category?.name || domainCategoryName,
          domain: studentDomain,
          gapType: 'LOW_PROFICIENCY',
          currentLevel: 'Beginner',
          requiredLevel: 'Advanced',
          severity: 'MEDIUM',
          recommendation: `Upgrade ${skill.name} proficiency to Advanced for increased recruiter selection priority.`,
          relevantOpportunitiesCount: oppStats.count,
          suggestedCourses: coursesTeachingSkill.slice(0, 3),
        });
      }
    }
  }

  const priorityRank = { HIGH: 3, MEDIUM: 2, LOW: 1 };
  const skillSorter = (a: RecommendedSkillItem, b: RecommendedSkillItem) =>
    priorityRank[b.priority] - priorityRank[a.priority] || b.opportunityCount - a.opportunityCount;

  recommendedSkills.sort(skillSorter);
  skillsToLearnNext.sort(skillSorter);

  skillGaps.sort(
    (a, b) => (b.severity === 'HIGH' ? 1 : 0) - (a.severity === 'HIGH' ? 1 : 0) || b.relevantOpportunitiesCount - a.relevantOpportunitiesCount
  );

  // 7. Calculate Recommended Courses
  const recommendedCourses: RecommendedCourseItem[] = [];
  const gapSkillIds = new Set(skillGaps.map((g) => g.skillId));

  for (const course of domainCourses) {
    const addressedGaps: string[] = [];
    let gapMatchCount = 0;

    for (const cs of course.skills) {
      if (gapSkillIds.has(cs.skillId) || !studentSkillMap.has(cs.skillId)) {
        addressedGaps.push(cs.skill.name);
        gapMatchCount++;
      }
    }

    const matchesInterests = activeInterests.some(
      (interest) => isKeywordMatch(interest, course.title) || isKeywordMatch(interest, course.learningOutcomes || '')
    );

    if (addressedGaps.length > 0 || matchesInterests) {
      let reason = '';
      if (addressedGaps.length > 0) {
        reason = `This course helps you develop ${addressedGaps.length} skill(s) (${addressedGaps.slice(0, 2).join(', ')}) required for your selected career interest in ${primaryCareerInterest}.`;
      } else {
        reason = `Directly aligns with your career interest in ${primaryCareerInterest || DOMAIN_DISPLAY_NAMES[studentDomain]}.`;
      }

      const matchPercentage = Math.min(
        100,
        Math.max(
          65,
          Math.round(
            (gapMatchCount / Math.max(1, course.skills.length)) * 50 +
              (matchesInterests ? 40 : 20)
          )
        )
      );

      const relevanceScore = matchPercentage + (matchesInterests ? 30 : 0) + addressedGaps.length * 15;

      recommendedCourses.push({
        course,
        matchPercentage,
        reason,
        addressedGaps,
        relevanceScore,
      });
    }
  }

  recommendedCourses.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 8. Calculate Recommended Internships & Jobs with Matched & Unmatched breakdown
  const recommendedInternships: RecommendedOpportunityItem[] = [];
  const recommendedJobs: RecommendedOpportunityItem[] = [];

  for (const opp of domainOpportunities) {
    const matchResult = await calculateOpportunityMatch(student.id, opp.id);
    const existingApp = student.applications.find((a) => a.opportunityId === opp.id);
    const oppText = opp.title + ' ' + opp.description + ' ' + (opp.department || '');
    const matchesInterests = activeInterests.some((int) => isKeywordMatch(int, oppText));

    let recommendationReason = '';
    if (matchResult.matchScore >= 80) {
      recommendationReason = `High compatibility (${matchResult.matchScore}%) with your verified skills and interest in ${primaryCareerInterest}.`;
    } else if (matchesInterests) {
      recommendationReason = `Directly matches your specified career interest in ${primaryCareerInterest}.`;
    } else {
      recommendationReason = `In-demand role in ${DOMAIN_DISPLAY_NAMES[studentDomain]}.`;
    }

    // Build structured matched vs unmatched skills
    const matchedSkillEntries: MatchedSkillEntry[] = [];
    const unmatchedSkillEntries: UnmatchedSkillEntry[] = [];

    for (const os of opp.skills) {
      const studentSkill = studentSkillMap.get(os.skillId);
      const reqProficiency = os.minProficiency || 'INTERMEDIATE';
      const reqRank = PROFICIENCY_RANK[reqProficiency] || 2;

      if (studentSkill) {
        const studentRank = PROFICIENCY_RANK[studentSkill.proficiency] || 1;
        matchedSkillEntries.push({
          name: os.skill.name,
          requiredLevel: reqProficiency,
          studentLevel: studentSkill.proficiency,
          matchType: studentRank >= reqRank ? 'FULL' : 'PARTIAL',
        });
      } else {
        unmatchedSkillEntries.push({
          name: os.skill.name,
          requiredLevel: reqProficiency,
          isRequired: os.isRequired,
        });
      }
    }

    const hasSkillOverlap = matchedSkillEntries.length > 0;
    const hasGapOverlap = unmatchedSkillEntries.some((u) => gapSkillIds.has(u.name.toLowerCase()));
    const isCareerRelevant =
      matchesInterests ||
      hasSkillOverlap ||
      (hasGapOverlap && matchResult.matchScore >= 40) ||
      matchResult.matchScore >= 60;

    if (isCareerRelevant) {
      const item: RecommendedOpportunityItem = {
        opportunity: opp,
        matchResult,
        isEligible: matchResult.eligibility?.isEligible ?? false,
        ineligibleReasons: matchResult.eligibility?.ineligibleReasons || [],
        goodMatchReasons: matchResult.eligibility?.goodMatchReasons || [],
        matchedSkills: matchedSkillEntries,
        unmatchedSkills: unmatchedSkillEntries,
        hasApplied: Boolean(existingApp),
        applicationStatus: existingApp ? existingApp.status : null,
        recommendationReason,
      };

      if (opp.type === 'INTERNSHIP') {
        recommendedInternships.push(item);
      } else {
        recommendedJobs.push(item);
      }
    }
  }

  const oppSorter = (a: RecommendedOpportunityItem, b: RecommendedOpportunityItem) => {
    if (a.isEligible !== b.isEligible) return a.isEligible ? -1 : 1;
    return b.matchResult.matchScore - a.matchResult.matchScore;
  };

  recommendedInternships.sort(oppSorter);
  recommendedJobs.sort(oppSorter);

  // 9. Calculate Recommended Mentors (Academicians & Industry Mentors)
  const [academicians, industryMentorships] = await Promise.all([
    prisma.academicianProfile.findMany({
      include: { user: true },
    }),
    prisma.mentorshipProgram.findMany({
      where: { isAccepting: true },
      include: { mentor: { include: { user: true } } },
    }),
  ]);

  const recommendedMentors: RecommendedMentorItem[] = [];
  const missingSkillNames = new Set(skillGaps.map((s) => s.skillName.toLowerCase()));

  // 9a. Academician Mentors
  for (const acad of academicians) {
    const acadDomain = resolveDomain({
      department: acad.department,
      institutionName: acad.institutionName,
      title: acad.areasOfExpertise,
    });

    if (acadDomain === studentDomain || acadDomain === 'GENERAL') {
      const expertiseList = parseKeywordList(acad.areasOfExpertise);
      const matchedInts = activeInterests.filter((interest) =>
        expertiseList.some((exp) => isKeywordMatch(interest, exp))
      );

      const canHelpLearn = expertiseList.filter((exp) =>
        Array.from(missingSkillNames).some((missing) => isKeywordMatch(missing, exp))
      );

      if (matchedInts.length > 0 || canHelpLearn.length > 0) {
        let matchScore = 65;
        if (matchedInts.length > 0) matchScore += 25;
        if (canHelpLearn.length > 0) matchScore += 10;
        matchScore = Math.min(98, matchScore);

        recommendedMentors.push({
          id: acad.id,
          name: acad.fullName,
          type: 'ACADEMICIAN',
          designation: `${acad.designation}, ${acad.department}`,
          organization: acad.institutionName,
          domain: acadDomain,
          matchScore,
          expertise: expertiseList,
          matchedInterests: matchedInts.length > 0 ? matchedInts : [primaryCareerInterest],
          canHelpLearn: canHelpLearn.slice(0, 3),
          reason: `Your interest in ${primaryCareerInterest} aligns with ${acad.fullName}'s expertise in ${expertiseList.slice(0, 2).join(', ')}.`,
        });
      }
    }
  }

  // 9b. Industry Mentors
  for (const mp of industryMentorships) {
    const indDomain = resolveDomain({
      industrySector: mp.mentor.industrySector,
      institutionName: mp.mentor.companyName,
      title: mp.title + ' ' + mp.description + ' ' + (mp.expertiseAreas || ''),
    });

    if (indDomain === studentDomain || indDomain === 'GENERAL') {
      const expertiseList = parseKeywordList(mp.expertiseAreas || mp.title);
      const matchedInts = activeInterests.filter((interest) =>
        expertiseList.some((exp) => isKeywordMatch(interest, exp))
      );

      const canHelpLearn = expertiseList.filter((exp) =>
        Array.from(missingSkillNames).some((missing) => isKeywordMatch(missing, exp))
      );

      if (matchedInts.length > 0 || canHelpLearn.length > 0) {
        let matchScore = 70;
        if (matchedInts.length > 0) matchScore += 20;
        if (canHelpLearn.length > 0) matchScore += 10;
        matchScore = Math.min(98, matchScore);

        recommendedMentors.push({
          id: mp.id,
          name: `${mp.mentor.contactPerson || mp.mentor.companyName} (${mp.title})`,
          type: 'INDUSTRY',
          designation: `Industry Mentor • ${mp.mentor.industrySector}`,
          organization: mp.mentor.companyName,
          domain: indDomain,
          matchScore,
          expertise: expertiseList,
          matchedInterests: matchedInts.length > 0 ? matchedInts : [primaryCareerInterest],
          canHelpLearn: canHelpLearn.slice(0, 3),
          reason: `Corporate mentorship program at ${mp.mentor.companyName} covering ${expertiseList.slice(0, 2).join(', ')}.`,
        });
      }
    }
  }

  recommendedMentors.sort((a, b) => b.matchScore - a.matchScore);

  // 10. Calculate Recommended Collaborations (Projects, Workshops, Research)
  const allCollabs = await prisma.collaboration.findMany({
    where: { status: 'OPEN' },
  });

  const recommendedCollaborations: RecommendedCollaborationItem[] = [];

  for (const collab of allCollabs) {
    const collabDomain = resolveDomain({
      title: collab.title,
      category: collab.type,
      careerInterests: collab.description + ' ' + (collab.targetAudience || '') + ' ' + (collab.eligibilityCriteria || ''),
    });

    if (collabDomain === studentDomain || collabDomain === 'GENERAL') {
      const text = collab.title + ' ' + collab.description + ' ' + collab.type;
      const matchedInts = activeInterests.filter((interest) => isKeywordMatch(interest, text));
      
      const skillsCanDevelop = Array.from(missingSkillNames)
        .filter((sk) => isKeywordMatch(sk, text))
        .map((s) => s.charAt(0).toUpperCase() + s.slice(1));

      if (matchedInts.length > 0 || skillsCanDevelop.length > 0) {
        let matchScore = 65;
        if (matchedInts.length > 0) matchScore += 25;
        if (skillsCanDevelop.length > 0) matchScore += 10;
        matchScore = Math.min(98, matchScore);

        const reason =
          matchedInts.length > 0
            ? `Recommended because it matches your interest in ${matchedInts.join(', ')} and offers hands-on project experience.`
            : `Offers direct project experience developing skills in ${skillsCanDevelop.slice(0, 2).join(', ')}.`;

        recommendedCollaborations.push({
          id: collab.id,
          title: collab.title,
          type: collab.type,
          initiatorRole: collab.initiatorRole,
          domain: collabDomain,
          mode: collab.mode || 'HYBRID',
          duration: collab.duration,
          matchScore,
          matchedInterests: matchedInts.length > 0 ? matchedInts : [primaryCareerInterest],
          skillsCanDevelop: skillsCanDevelop.slice(0, 3),
          reason,
          status: collab.status,
        });
      }
    }
  }

  recommendedCollaborations.sort((a, b) => b.matchScore - a.matchScore);

  return {
    domain: studentDomain,
    domainDisplayName: DOMAIN_DISPLAY_NAMES[studentDomain],
    primaryCareerInterest,
    secondaryCareerInterests,
    careerInterests: activeInterests,
    currentSkills: currentSkillsList,
    recommendedSkills: recommendedSkills.slice(0, 15),
    skillsToLearnNext: skillsToLearnNext.slice(0, 15),
    skillGaps: skillGaps.slice(0, 15),
    recommendedCourses: recommendedCourses.slice(0, 20),
    recommendedInternships: recommendedInternships,
    recommendedJobs: recommendedJobs,
    recommendedMentors: recommendedMentors,
    recommendedCollaborations: recommendedCollaborations,
    myApplications: student.applications,
  };
}

// --------------------------------------------------------------------------
// 2. GET INDUSTRY RECOMMENDATIONS & CANDIDATE SCREENING
// --------------------------------------------------------------------------
export interface RecommendedCandidateItem {
  studentId: string;
  fullName: string;
  department: string;
  degree: string;
  institutionName: string;
  currentYear: number | null;
  cgpa: number | null;
  matchScore: number;
  isEligible: boolean;
  ineligibleReasons: string[];
  matchedSkills: Array<{ name: string; proficiency: string }>;
  missingSkills: string[];
  careerInterests: string[];
  applicationStatus: string | null;
}

export async function getIndustryRecommendedCandidates(
  industryId: string,
  opportunityId?: string
): Promise<{
  opportunity: any | null;
  candidates: RecommendedCandidateItem[];
  industryDomain: PlatformDomain;
}> {
  const industry = await prisma.industryProfile.findUnique({
    where: { id: industryId },
    include: {
      opportunities: {
        where: { isPublished: true },
        include: { skills: { include: { skill: true } } },
      },
    },
  });

  if (!industry) {
    throw new Error('Industry profile not found.');
  }

  const industryDomain = resolveDomain({
    industrySector: industry.industrySector,
    institutionName: industry.companyName,
    title: industry.description,
  });

  let targetOpportunity = null;
  if (opportunityId) {
    targetOpportunity = industry.opportunities.find((o) => o.id === opportunityId) || null;
  }
  if (!targetOpportunity && industry.opportunities.length > 0) {
    targetOpportunity = industry.opportunities[0];
  }

  const allStudents = await prisma.studentProfile.findMany({
    include: {
      skillProfiles: { include: { skill: true } },
      applications: { where: targetOpportunity ? { opportunityId: targetOpportunity.id } : {} },
    },
  });

  const domainStudents = allStudents.filter((s) => {
    const sDomain = resolveDomain({
      department: s.department,
      degree: s.degree,
      institutionName: s.institutionName,
      careerInterests: s.careerInterests,
    });
    return sDomain === industryDomain || sDomain === 'GENERAL';
  });

  const candidates: RecommendedCandidateItem[] = [];

  for (const student of domainStudents) {
    let matchScore = 70;
    let isEligible = true;
    let ineligibleReasons: string[] = [];
    let matchedSkills: Array<{ name: string; proficiency: string }> = [];
    let missingSkills: string[] = [];

    if (targetOpportunity) {
      const match = await calculateOpportunityMatch(student.id, targetOpportunity.id);
      matchScore = match.matchScore;
      isEligible = match.eligibility.isEligible;
      ineligibleReasons = match.eligibility.ineligibleReasons || [];
      matchedSkills = match.matchedSkills.map((ms) => ({ name: ms.name, proficiency: ms.proficiency }));
      missingSkills = match.missingRequiredSkills;
    } else {
      matchedSkills = student.skillProfiles.map((sp) => ({
        name: sp.skill.name,
        proficiency: sp.proficiencyLevel || 'BEGINNER',
      }));
    }

    const app = student.applications[0];

    candidates.push({
      studentId: student.id,
      fullName: student.fullName,
      department: student.department,
      degree: student.degree,
      institutionName: student.institutionName,
      currentYear: student.currentYear,
      cgpa: student.cgpa,
      matchScore,
      isEligible,
      ineligibleReasons,
      matchedSkills,
      missingSkills,
      careerInterests: parseKeywordList(student.careerInterests),
      applicationStatus: app ? app.status : null,
    });
  }

  candidates.sort((a, b) => b.matchScore - a.matchScore || (b.cgpa || 0) - (a.cgpa || 0));

  return {
    opportunity: targetOpportunity,
    candidates: candidates.slice(0, 20),
    industryDomain,
  };
}

// --------------------------------------------------------------------------
// 3. GET INSTITUTION RECOMMENDATIONS & BRANCH DEEP DIVE
// --------------------------------------------------------------------------
export interface BranchAnalyticsDeepDive {
  branch: string;
  totalStudents: number;
  avgCgpa: number;
  assessedPercentage: number;
  placedPercentage: number;
  topSkills: Array<{ name: string; count: number; avgScore: number }>;
  topCareerInterests: Array<{ interest: string; count: number }>;
  branchSkillGaps: Array<{ skillName: string; missingCount: number; severity: string }>;
  applicationPipeline: {
    applied: number;
    shortlisted: number;
    selected: number;
    rejected: number;
  };
}

export async function getInstitutionBranchAnalytics(
  institutionName: string,
  targetBranch?: string
): Promise<BranchAnalyticsDeepDive> {
  const studentWhere: any = {
    institutionName: { contains: institutionName, mode: 'insensitive' },
  };

  if (targetBranch && targetBranch !== 'ALL') {
    studentWhere.OR = [
      { department: { contains: targetBranch, mode: 'insensitive' } },
      { degree: { contains: targetBranch, mode: 'insensitive' } },
    ];
  }

  const students = await prisma.studentProfile.findMany({
    where: studentWhere,
    include: {
      skillProfiles: { include: { skill: true } },
      assessmentAttempts: true,
      applications: true,
    },
  });

  const totalStudents = students.length;
  const avgCgpa =
    totalStudents > 0
      ? Number((students.reduce((acc, s) => acc + (s.cgpa || 0), 0) / totalStudents).toFixed(2))
      : 0;

  const assessedStudents = students.filter((s) => s.assessmentAttempts.length > 0).length;
  const assessedPercentage = totalStudents > 0 ? Math.round((assessedStudents / totalStudents) * 100) : 0;

  const placedStudents = students.filter((s) => s.applications.some((a) => a.status === 'SELECTED')).length;
  const placedPercentage = totalStudents > 0 ? Math.round((placedStudents / totalStudents) * 100) : 0;

  const skillCountMap = new Map<string, { count: number; scoreSum: number }>();
  students.forEach((s) => {
    s.skillProfiles.forEach((sp) => {
      if (!skillCountMap.has(sp.skill.name)) {
        skillCountMap.set(sp.skill.name, { count: 0, scoreSum: 0 });
      }
      const entry = skillCountMap.get(sp.skill.name)!;
      entry.count += 1;
      entry.scoreSum += sp.scorePercentage || 70;
    });
  });

  const topSkills = Array.from(skillCountMap.entries())
    .map(([name, data]) => ({
      name,
      count: data.count,
      avgScore: Math.round(data.scoreSum / data.count),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const interestCountMap = new Map<string, number>();
  students.forEach((s) => {
    parseKeywordList(s.careerInterests).forEach((int) => {
      interestCountMap.set(int, (interestCountMap.get(int) || 0) + 1);
    });
  });

  const topCareerInterests = Array.from(interestCountMap.entries())
    .map(([interest, count]) => ({ interest, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);

  const branchDomain = resolveDomain({
    department: targetBranch,
    degree: targetBranch,
  });

  const domainCategoryName = DOMAIN_DISPLAY_NAMES[branchDomain];
  const domainSkills = await prisma.skill.findMany({
    where: {
      category: { name: { equals: domainCategoryName, mode: 'insensitive' } },
    },
  });

  const branchSkillGaps = domainSkills
    .map((skill) => {
      const haveCount = students.filter((s) => s.skillProfiles.some((sp) => sp.skillId === skill.id)).length;
      const missingCount = Math.max(0, totalStudents - haveCount);
      return {
        skillName: skill.name,
        missingCount,
        severity: missingCount > totalStudents * 0.5 ? 'HIGH' : 'MEDIUM',
      };
    })
    .filter((g) => g.missingCount > 0)
    .sort((a, b) => b.missingCount - a.missingCount)
    .slice(0, 6);

  const allApps = students.flatMap((s) => s.applications);
  const applicationPipeline = {
    applied: allApps.filter((a) => a.status === 'APPLIED').length,
    shortlisted: allApps.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length,
    selected: allApps.filter((a) => a.status === 'SELECTED').length,
    rejected: allApps.filter((a) => a.status === 'REJECTED').length,
  };

  return {
    branch: targetBranch || 'ALL_DEPARTMENTS',
    totalStudents,
    avgCgpa,
    assessedPercentage,
    placedPercentage,
    topSkills,
    topCareerInterests,
    branchSkillGaps,
    applicationPipeline,
  };
}

// --------------------------------------------------------------------------
// 4. GET ACADEMICIAN RECOMMENDATIONS
// --------------------------------------------------------------------------
export async function getAcademicianRecommendations(academicianId: string): Promise<{
  academicianDomain: PlatformDomain;
  recommendedCollaborations: any[];
  topResearchStudents: any[];
  curriculumGaps: Array<{ skillName: string; demandCount: number; courseCount: number }>;
}> {
  const academician = await prisma.academicianProfile.findUnique({
    where: { id: academicianId },
  });

  if (!academician) {
    throw new Error('Academician profile not found.');
  }

  const domain = resolveDomain({
    department: academician.department,
    institutionName: academician.institutionName,
    title: academician.areasOfExpertise,
  });

  const collaborations = await prisma.collaboration.findMany({
    take: 6,
    orderBy: { createdAt: 'desc' },
  });

  const students = await prisma.studentProfile.findMany({
    where: {
      institutionName: { contains: academician.institutionName, mode: 'insensitive' },
    },
    include: {
      skillProfiles: { include: { skill: true } },
      assessmentAttempts: true,
    },
    take: 6,
    orderBy: { cgpa: 'desc' },
  });

  const domainCategoryName = DOMAIN_DISPLAY_NAMES[domain];
  const domainSkills = await prisma.skill.findMany({
    where: { category: { name: { equals: domainCategoryName, mode: 'insensitive' } } },
    include: {
      opportunitySkills: true,
      courseSkills: true,
    },
  });

  const curriculumGaps = domainSkills
    .map((s) => ({
      skillName: s.name,
      demandCount: s.opportunitySkills.length,
      courseCount: s.courseSkills.length,
    }))
    .sort((a, b) => b.demandCount - a.demandCount)
    .slice(0, 5);

  return {
    academicianDomain: domain,
    recommendedCollaborations: collaborations,
    topResearchStudents: students.map((s) => ({
      id: s.id,
      fullName: s.fullName,
      department: s.department,
      degree: s.degree,
      cgpa: s.cgpa,
      skills: s.skillProfiles.map((sp) => sp.skill.name).slice(0, 4),
    })),
    curriculumGaps,
  };
}


// --------------------------------------------------------------------------
// 5. SKILL PROFILE, SKILL MAPPING, RECOMMENDED INDUSTRIES & JOB ROLES
// --------------------------------------------------------------------------

export interface StudentSkillItem {
  id: string;
  skillId: string;
  name: string;
  category: string;
  proficiencyLevel: string;
  scorePercentage: number;
  source: 'ASSESSMENT' | 'SELF_ADDED';
  isVerified: boolean;
  lastAssessedAt?: Date | null;
}

export interface StudentSkillProfileResponse {
  overallSkillScore: number;
  totalSkills: number;
  assessedSkillsCount: number;
  verifiedSkillsCount: number;
  strongSkills: StudentSkillItem[];
  developingSkills: StudentSkillItem[];
  weakSkills: StudentSkillItem[];
  skillGaps: SkillGapItem[];
  categoryDistribution: Array<{ category: string; count: number; averageScore: number }>;
  assessmentHistory: Array<{
    id: string;
    title: string;
    score: number;
    totalScore: number;
    percentage: number;
    passed: boolean;
    completedAt: Date | null;
  }>;
  domain: PlatformDomain;
  domainDisplayName: string;
  primaryCareerInterest: string;
  careerInterests: string[];
}

export interface RecommendedIndustryItem {
  id: string;
  companyName: string;
  industrySector: string;
  location: string | null;
  description: string | null;
  website: string | null;
  logoUrl: string | null;
  matchScore: number;
  domain: PlatformDomain;
  whyRecommended: string;
  relevantSkills: string[];
  skillGaps: string[];
  activeOpportunitiesCount: number;
  openPositions: Array<{ id: string; title: string; type: string; stipendOrSalary: string | null }>;
}

export interface RecommendedJobRoleItem {
  roleTitle: string;
  domain: PlatformDomain;
  compatibilityPercentage: number;
  matchedSkills: string[];
  unmatchedSkills: string[];
  whyRecommended: string;
  marketDemand: 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
  averageSalary: string;
  livePostingsCount: number;
  matchingOpportunities: Array<{ id: string; title: string; companyName: string; type: string; location: string | null }>;
}

export interface PipelineStageItem {
  stage: string;
  title: string;
  status: 'COMPLETED' | 'IN_PROGRESS' | 'ACTION_REQUIRED';
  summary: string;
}

export interface StudentSkillMappingPayload {
  student: {
    id: string;
    fullName: string;
    degree: string;
    department: string;
    institutionName: string;
    cgpa: number | null;
    currentYear: number | null;
  };
  domain: PlatformDomain;
  domainDisplayName: string;
  primaryCareerInterest: string;
  careerInterests: string[];
  skillProfile: StudentSkillProfileResponse;
  recommendedSkills: RecommendedSkillItem[];
  recommendedCourses: RecommendedCourseItem[];
  recommendedInternships: RecommendedOpportunityItem[];
  recommendedJobs: RecommendedOpportunityItem[];
  recommendedIndustries: RecommendedIndustryItem[];
  recommendedJobRoles: RecommendedJobRoleItem[];
  pipelineStages: PipelineStageItem[];
}

/**
 * Generate Comprehensive Student Skill Profile with Assessed & Self-Declared Competencies
 */
export async function getStudentSkillProfile(studentId: string): Promise<StudentSkillProfileResponse> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      skillProfiles: {
        include: { skill: { include: { category: true } } },
      },
      assessmentAttempts: {
        include: { assessment: true },
        orderBy: { completedAt: 'desc' },
      },
    },
  });

  if (!student) {
    throw new Error('Student profile not found.');
  }

  const domain = resolveDomain({
    department: student.department,
    degree: student.degree,
    institutionName: student.institutionName,
    careerInterests: student.careerInterests,
  });

  const parsedInterests = parseKeywordList(student.careerInterests);
  const primaryCareerInterest = parsedInterests[0] || DOMAIN_DISPLAY_NAMES[domain];

  const strongSkills: StudentSkillItem[] = [];
  const developingSkills: StudentSkillItem[] = [];
  const weakSkills: StudentSkillItem[] = [];

  let totalScoreSum = 0;
  let scoreCount = 0;
  let assessedCount = 0;
  let verifiedCount = 0;

  const categoryMap = new Map<string, { count: number; totalScore: number }>();

  student.skillProfiles.forEach((sp) => {
    const isAssessed = Boolean(sp.lastAssessedAt);
    if (isAssessed) assessedCount++;
    if (sp.verified || sp.verificationStatus === 'VERIFIED') verifiedCount++;

    // Base score calculation from proficiency or assessed percentage
    let calculatedScore = sp.scorePercentage || 0;
    if (calculatedScore === 0) {
      if (sp.proficiencyLevel === 'EXPERT') calculatedScore = 95;
      else if (sp.proficiencyLevel === 'ADVANCED') calculatedScore = 85;
      else if (sp.proficiencyLevel === 'INTERMEDIATE') calculatedScore = 65;
      else calculatedScore = 35;
    }

    totalScoreSum += calculatedScore;
    scoreCount++;

    const catName = sp.skill.category?.name || 'General Skills';
    if (!categoryMap.has(catName)) {
      categoryMap.set(catName, { count: 0, totalScore: 0 });
    }
    const catEntry = categoryMap.get(catName)!;
    catEntry.count += 1;
    catEntry.totalScore += calculatedScore;

    const skillItem: StudentSkillItem = {
      id: sp.id,
      skillId: sp.skillId,
      name: sp.skill.name,
      category: catName,
      proficiencyLevel: sp.proficiencyLevel,
      scorePercentage: calculatedScore,
      source: isAssessed ? 'ASSESSMENT' : 'SELF_ADDED',
      isVerified: sp.verified || sp.verificationStatus === 'VERIFIED',
      lastAssessedAt: sp.lastAssessedAt,
    };

    if (calculatedScore >= 75 || sp.proficiencyLevel === 'ADVANCED' || sp.proficiencyLevel === 'EXPERT') {
      strongSkills.push(skillItem);
    } else if (calculatedScore >= 40 || sp.proficiencyLevel === 'INTERMEDIATE') {
      developingSkills.push(skillItem);
    } else {
      weakSkills.push(skillItem);
    }
  });

  const overallSkillScore = scoreCount > 0 ? Math.round(totalScoreSum / scoreCount) : 0;

  const categoryDistribution = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    count: stats.count,
    averageScore: Math.round(stats.totalScore / stats.count),
  }));

  const assessmentHistory = student.assessmentAttempts.map((att) => ({
    id: att.id,
    title: att.assessment.title,
    score: att.score,
    totalScore: att.totalScore,
    percentage: att.percentage,
    passed: att.passed,
    completedAt: att.completedAt,
  }));

  // Fetch recommendations to get accurate skill gaps
  const recs = await getStudentRecommendations(studentId);

  return {
    overallSkillScore,
    totalSkills: student.skillProfiles.length,
    assessedSkillsCount: assessedCount,
    verifiedSkillsCount: verifiedCount,
    strongSkills,
    developingSkills,
    weakSkills,
    skillGaps: recs.skillGaps,
    categoryDistribution,
    assessmentHistory,
    domain,
    domainDisplayName: DOMAIN_DISPLAY_NAMES[domain],
    primaryCareerInterest,
    careerInterests: parsedInterests.length > 0 ? parsedInterests : [DOMAIN_DISPLAY_NAMES[domain]],
  };
}

/**
 * Recommended Industries Tailored to Domain & Career Interest
 */
export async function getRecommendedIndustries(studentId: string): Promise<RecommendedIndustryItem[]> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      skillProfiles: { include: { skill: true } },
    },
  });

  if (!student) {
    throw new Error('Student profile not found.');
  }

  const studentDomain = resolveDomain({
    department: student.department,
    degree: student.degree,
    institutionName: student.institutionName,
    careerInterests: student.careerInterests,
  });

  const parsedInterests = parseKeywordList(student.careerInterests);
  const primaryCareerInterest = parsedInterests[0] || DOMAIN_DISPLAY_NAMES[studentDomain];

  const studentSkillNames = new Set(student.skillProfiles.map((s) => s.skill.name.toLowerCase()));

  const allIndustries = await prisma.industryProfile.findMany({
    include: {
      opportunities: {
        where: { isPublished: true },
        include: { skills: { include: { skill: true } } },
      },
    },
  });

  const recommendedIndustries: RecommendedIndustryItem[] = [];

  for (const ind of allIndustries) {
    const indDomain = resolveDomain({
      industrySector: ind.industrySector,
      institutionName: ind.companyName,
      title: ind.description,
    });

    const isDomainMatch = indDomain === studentDomain || indDomain === 'GENERAL';
    const text = ind.companyName + ' ' + ind.industrySector + ' ' + (ind.description || '');
    const matchesInterests = parsedInterests.some((int) => isKeywordMatch(int, text));

    // Aggregate required skills across all active postings of this company
    const indSkillSet = new Set<string>();
    ind.opportunities.forEach((opp) => {
      opp.skills.forEach((os) => {
        indSkillSet.add(os.skill.name);
      });
    });

    const relevantSkills: string[] = [];
    const missingSkills: string[] = [];

    indSkillSet.forEach((sk) => {
      if (studentSkillNames.has(sk.toLowerCase())) {
        relevantSkills.push(sk);
      } else {
        missingSkills.push(sk);
      }
    });

    let matchScore = 50;
    if (isDomainMatch) matchScore += 25;
    if (matchesInterests) matchScore += 20;
    if (relevantSkills.length > 0) matchScore += Math.min(20, relevantSkills.length * 5);
    matchScore = Math.min(99, matchScore);

    if (isDomainMatch || matchesInterests || relevantSkills.length > 0) {
      let whyRecommended = '';
      if (matchesInterests) {
        whyRecommended = `Leading enterprise in ${ind.industrySector} directly aligning with your career ambition in ${primaryCareerInterest}.`;
      } else if (relevantSkills.length > 0) {
        whyRecommended = `Demands your key skills in ${relevantSkills.slice(0, 3).join(', ')} with ${ind.opportunities.length} open position(s).`;
      } else {
        whyRecommended = `Major employer and innovation hub in ${DOMAIN_DISPLAY_NAMES[studentDomain]}.`;
      }

      recommendedIndustries.push({
        id: ind.id,
        companyName: ind.companyName,
        industrySector: ind.industrySector,
        location: ind.location,
        description: ind.description,
        website: ind.website,
        logoUrl: ind.logoUrl,
        matchScore,
        domain: indDomain,
        whyRecommended,
        relevantSkills: Array.from(indSkillSet),
        skillGaps: missingSkills,
        activeOpportunitiesCount: ind.opportunities.length,
        openPositions: ind.opportunities.map((opp) => ({
          id: opp.id,
          title: opp.title,
          type: opp.type,
          stipendOrSalary: opp.stipendOrSalary,
        })),
      });
    }
  }

  recommendedIndustries.sort((a, b) => b.matchScore - a.matchScore || b.activeOpportunitiesCount - a.activeOpportunitiesCount);
  return recommendedIndustries;
}

/**
 * Standard Job Role Archetypes per Domain with Competency Requirements
 */
const DOMAIN_JOB_ROLE_BLUEPRINTS: Record<
  PlatformDomain,
  Array<{
    title: string;
    requiredSkills: string[];
    marketDemand: 'HIGH' | 'VERY_HIGH' | 'CRITICAL';
    averageSalary: string;
    description: string;
  }>
> = {
  AYURVEDA: [
    {
      title: 'Clinical Ayurvedic Physician / Consultant',
      requiredSkills: ['Ayurvedic Fundamentals', 'Ayurvedic Diagnosis', 'Patient Assessment', 'Kayachikitsa', 'Lifestyle Counselling'],
      marketDemand: 'VERY_HIGH',
      averageSalary: '₹6.5 - 12.0 LPA',
      description: 'Lead clinical diagnosis, dosha balancing, and integrative patient management in hospital and wellness settings.',
    },
    {
      title: 'Panchakarma Specialist & Wellness Director',
      requiredSkills: ['Panchakarma', 'Abhyanga', 'Swedana', 'Basti', 'Shirodhara'],
      marketDemand: 'CRITICAL',
      averageSalary: '₹7.0 - 14.0 LPA',
      description: 'Design and supervise classical bio-purification therapies, detoxification routines, and therapeutic retreat regimens.',
    },
    {
      title: 'Herbal Formulation & QC Specialist',
      requiredSkills: ['Dravyaguna', 'Medicinal Plants', 'Herbal Medicine', 'Quality Control', 'Pharmacognosy', 'Rasashastra'],
      marketDemand: 'HIGH',
      averageSalary: '₹5.5 - 10.5 LPA',
      description: 'Standardize polyherbal formulations, HPTLC analytical profiling, and GMP compliance in AYUSH manufacturing.',
    },
    {
      title: 'Ayurvedic Clinical Research Scientist',
      requiredSkills: ['Clinical Research', 'Research Methodology', 'Scientific Writing', 'Biostatistics', 'Digital Health'],
      marketDemand: 'HIGH',
      averageSalary: '₹6.0 - 11.0 LPA',
      description: 'Design evidence-based clinical trials, pharmacological validation assays, and peer-reviewed AYUSH publications.',
    },
  ],
  ENGINEERING: [
    {
      title: 'Full Stack Web & Cloud Developer',
      requiredSkills: ['JavaScript', 'React', 'Node.js', 'SQL', 'Git', 'Cloud Computing', 'HTML', 'CSS'],
      marketDemand: 'CRITICAL',
      averageSalary: '₹8.0 - 18.0 LPA',
      description: 'Architect scalable web applications, responsive SPAs, REST/GraphQL microservices, and database pipelines.',
    },
    {
      title: 'Embedded Systems & Firmware Engineer',
      requiredSkills: ['C', 'Embedded C', 'Microcontrollers', 'Digital Electronics', 'Sensors', 'Linux'],
      marketDemand: 'VERY_HIGH',
      averageSalary: '₹7.5 - 16.0 LPA',
      description: 'Develop low-level bare-metal firmware, RTOS drivers, hardware communication protocols (I2C/SPI), and PCB bring-up.',
    },
    {
      title: 'IoT & Smart Edge Solutions Architect',
      requiredSkills: ['IoT', 'Sensors', 'Embedded C', 'Networking', 'Cloud Computing', 'Arduino'],
      marketDemand: 'HIGH',
      averageSalary: '₹8.5 - 17.5 LPA',
      description: 'Design edge-to-cloud connected architectures, telemetry pipelines via MQTT, and industrial sensor networks.',
    },
    {
      title: 'Database & Backend Infrastructure Engineer',
      requiredSkills: ['SQL', 'Node.js', 'DevOps', 'Cloud Computing', 'Linux', 'Git'],
      marketDemand: 'VERY_HIGH',
      averageSalary: '₹8.0 - 16.5 LPA',
      description: 'Design transactional database schemas, query optimization, high-availability clusters, and deployment pipelines.',
    },
  ],
  COMMERCE: [
    {
      title: 'Corporate Financial Analyst',
      requiredSkills: ['Financial Analysis', 'Accounting', 'Excel', 'Business Analytics', 'Business Strategy'],
      marketDemand: 'CRITICAL',
      averageSalary: '₹7.0 - 15.0 LPA',
      description: 'Perform corporate DCF valuation, variance analysis, financial forecasting models, and executive capital budgets.',
    },
    {
      title: 'Business Analytics & Intelligence Consultant',
      requiredSkills: ['Business Analytics', 'Excel', 'Financial Analysis', 'Business Strategy', 'Communication'],
      marketDemand: 'VERY_HIGH',
      averageSalary: '₹6.5 - 14.0 LPA',
      description: 'Translate operational and financial metrics into actionable cohort insights, KPI dashboards, and growth strategy.',
    },
    {
      title: 'Management Accountant & Compliance Specialist',
      requiredSkills: ['Accounting', 'Financial Analysis', 'Excel', 'Business Management'],
      marketDemand: 'HIGH',
      averageSalary: '₹6.0 - 12.0 LPA',
      description: 'Supervise general ledger accounting, statutory compliance, audit readiness, and internal financial controls.',
    },
    {
      title: 'Strategic Growth & Marketing Analyst',
      requiredSkills: ['Marketing', 'Digital Marketing', 'Business Analytics', 'Business Strategy', 'Communication'],
      marketDemand: 'HIGH',
      averageSalary: '₹5.5 - 11.5 LPA',
      description: 'Design multi-channel customer acquisition funnels, ROI measurement models, and market positioning campaigns.',
    },
  ],
  GENERAL: [
    {
      title: 'Interdisciplinary Project Coordinator',
      requiredSkills: ['Communication', 'Business Management', 'Research Methodology', 'Business Strategy'],
      marketDemand: 'HIGH',
      averageSalary: '₹5.0 - 10.0 LPA',
      description: 'Facilitate cross-sector research, academic-industry partnerships, and operational milestone tracking.',
    },
  ],
};

/**
 * Recommended Job Roles Tailored to Career Interest, Domain, and Verified Skill Strengths
 */
export async function getRecommendedJobRoles(studentId: string): Promise<RecommendedJobRoleItem[]> {
  const student = await prisma.studentProfile.findUnique({
    where: { id: studentId },
    include: {
      skillProfiles: { include: { skill: true } },
    },
  });

  if (!student) {
    throw new Error('Student profile not found.');
  }

  const studentDomain = resolveDomain({
    department: student.department,
    degree: student.degree,
    institutionName: student.institutionName,
    careerInterests: student.careerInterests,
  });

  const parsedInterests = parseKeywordList(student.careerInterests);
  const primaryCareerInterest = parsedInterests[0] || DOMAIN_DISPLAY_NAMES[studentDomain];

  const studentSkillMap = new Map<string, number>();
  student.skillProfiles.forEach((sp) => {
    let score = sp.scorePercentage || 0;
    if (score === 0) {
      if (sp.proficiencyLevel === 'EXPERT') score = 95;
      else if (sp.proficiencyLevel === 'ADVANCED') score = 85;
      else if (sp.proficiencyLevel === 'INTERMEDIATE') score = 65;
      else score = 35;
    }
    studentSkillMap.set(sp.skill.name.toLowerCase(), score);
  });

  const blueprints = DOMAIN_JOB_ROLE_BLUEPRINTS[studentDomain] || DOMAIN_JOB_ROLE_BLUEPRINTS.GENERAL;
  const allOpportunities = await prisma.opportunity.findMany({
    where: { isPublished: true },
    include: { industry: true, skills: { include: { skill: true } } },
  });

  const recommendedJobRoles: RecommendedJobRoleItem[] = [];

  for (const bp of blueprints) {
    const matchedSkills: string[] = [];
    const unmatchedSkills: string[] = [];
    let earnedSkillPoints = 0;
    const maxSkillPoints = bp.requiredSkills.length * 100;

    bp.requiredSkills.forEach((reqSkill) => {
      const studentScore = studentSkillMap.get(reqSkill.toLowerCase());
      if (studentScore !== undefined && studentScore >= 50) {
        matchedSkills.push(reqSkill);
        earnedSkillPoints += studentScore;
      } else {
        unmatchedSkills.push(reqSkill);
        if (studentScore !== undefined) {
          earnedSkillPoints += studentScore * 0.5;
        }
      }
    });

    const isCareerInterestMatch = parsedInterests.some(
      (int) => isKeywordMatch(int, bp.title) || isKeywordMatch(int, bp.description)
    );

    const baseScore = maxSkillPoints > 0 ? Math.round((earnedSkillPoints / maxSkillPoints) * 75) : 50;
    const bonus = isCareerInterestMatch ? 20 : 10;
    const compatibilityPercentage = Math.min(99, Math.max(30, baseScore + bonus));

    // Find actual matching active opportunities from DB
    const matchingOpps = allOpportunities.filter((opp) => {
      const oppText = opp.title + ' ' + opp.description + ' ' + (opp.department || '');
      return (
        isKeywordMatch(bp.title, oppText) ||
        bp.requiredSkills.some((sk) => isKeywordMatch(sk, oppText))
      );
    });

    let whyRecommended = '';
    if (isCareerInterestMatch) {
      whyRecommended = `Direct match with your chosen career interest in "${primaryCareerInterest}". High recruiter hiring demand.`;
    } else if (matchedSkills.length >= 3) {
      whyRecommended = `Strong competency alignment with ${matchedSkills.length} of your validated skills (${matchedSkills.slice(0, 2).join(', ')}).`;
    } else {
      whyRecommended = `Benchmark career trajectory for ${student.degree || DOMAIN_DISPLAY_NAMES[studentDomain]} graduates.`;
    }

    recommendedJobRoles.push({
      roleTitle: bp.title,
      domain: studentDomain,
      compatibilityPercentage,
      matchedSkills,
      unmatchedSkills,
      whyRecommended,
      marketDemand: bp.marketDemand,
      averageSalary: bp.averageSalary,
      livePostingsCount: matchingOpps.length,
      matchingOpportunities: matchingOpps.map((o) => ({
        id: o.id,
        title: o.title,
        companyName: o.industry.companyName,
        type: o.type,
        location: o.location,
      })),
    });
  }

  recommendedJobRoles.sort((a, b) => b.compatibilityPercentage - a.compatibilityPercentage);
  return recommendedJobRoles;
}

/**
 * Full End-to-End Skill Mapping & Career Pathways
 */
export async function getStudentSkillMapping(studentId: string): Promise<StudentSkillMappingPayload> {
  const [student, skillProfile, recs, industries, jobRoles] = await Promise.all([
    prisma.studentProfile.findUnique({
      where: { id: studentId },
    }),
    getStudentSkillProfile(studentId),
    getStudentRecommendations(studentId),
    getRecommendedIndustries(studentId),
    getRecommendedJobRoles(studentId),
  ]);

  if (!student) {
    throw new Error('Student profile not found.');
  }

  const pipelineStages: PipelineStageItem[] = [
    {
      stage: 'MY_SKILLS',
      title: 'Declared Competencies',
      status: skillProfile.totalSkills > 0 ? 'COMPLETED' : 'ACTION_REQUIRED',
      summary: `${skillProfile.totalSkills} total skills registered across your profile.`,
    },
    {
      stage: 'ASSESSMENT',
      title: 'Standardized Assessment',
      status: skillProfile.assessedSkillsCount > 0 ? 'COMPLETED' : 'ACTION_REQUIRED',
      summary: `${skillProfile.assessmentHistory.length} assessment attempts recorded in the database.`,
    },
    {
      stage: 'SKILL_PROFILE',
      title: 'Skill Intelligence Matrix',
      status: skillProfile.strongSkills.length > 0 ? 'COMPLETED' : 'IN_PROGRESS',
      summary: `Overall skill readiness score: ${skillProfile.overallSkillScore}% (${skillProfile.strongSkills.length} strong, ${skillProfile.developingSkills.length} developing).`,
    },
    {
      stage: 'SKILL_GAPS',
      title: 'Gap Identification',
      status: skillProfile.skillGaps.length === 0 ? 'COMPLETED' : 'ACTION_REQUIRED',
      summary: `${skillProfile.skillGaps.length} critical competency gaps identified for your target career.`,
    },
    {
      stage: 'CAREER_INTEREST',
      title: 'Target Career Pathway',
      status: skillProfile.primaryCareerInterest ? 'COMPLETED' : 'IN_PROGRESS',
      summary: `Focused on ${skillProfile.primaryCareerInterest}.`,
    },
    {
      stage: 'LEARNING_BRIDGES',
      title: 'Courses & Certifications',
      status: recs.recommendedCourses.length > 0 ? 'IN_PROGRESS' : 'COMPLETED',
      summary: `${recs.recommendedCourses.length} personalized courses available to bridge your skill gaps.`,
    },
    {
      stage: 'INDUSTRY_PLACEMENT',
      title: 'Opportunities & Roles',
      status: industries.length > 0 && jobRoles.length > 0 ? 'COMPLETED' : 'IN_PROGRESS',
      summary: `${industries.length} recommended industries & ${jobRoles.length} target job roles ready for application.`,
    },
  ];

  return {
    student: {
      id: student.id,
      fullName: student.fullName,
      degree: student.degree,
      department: student.department,
      institutionName: student.institutionName,
      cgpa: student.cgpa,
      currentYear: student.currentYear,
    },
    domain: skillProfile.domain,
    domainDisplayName: skillProfile.domainDisplayName,
    primaryCareerInterest: skillProfile.primaryCareerInterest,
    careerInterests: skillProfile.careerInterests,
    skillProfile,
    recommendedSkills: recs.recommendedSkills,
    recommendedCourses: recs.recommendedCourses,
    recommendedInternships: recs.recommendedInternships,
    recommendedJobs: recs.recommendedJobs,
    recommendedIndustries: industries,
    recommendedJobRoles: jobRoles,
    pipelineStages,
  };
}
