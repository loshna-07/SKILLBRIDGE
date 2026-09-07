"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPersonalizedCourseRecommendations = exports.getPersonalizedSkillRecommendations = exports.getStudentLearningRecommendations = void 0;
const db_1 = __importDefault(require("../config/db"));
const getStudentLearningRecommendations = async (studentId) => {
    // 1. Get student skill profile
    const student = await db_1.default.studentProfile.findUnique({
        where: { id: studentId },
        include: {
            skillProfiles: {
                include: { skill: true },
            },
        },
    });
    if (!student)
        return [];
    const existingSkillIds = new Set(student.skillProfiles.map((s) => s.skillId));
    const weakSkillIds = new Set(student.skillProfiles
        .filter((s) => s.scorePercentage < 60 || s.proficiencyLevel === 'BEGINNER')
        .map((s) => s.skillId));
    // 2. Identify industry-demanded skills that student lacks
    const publishedOpportunities = await db_1.default.opportunity.findMany({
        where: { isPublished: true },
        include: {
            skills: {
                include: { skill: true },
            },
        },
        take: 20,
    });
    const missingDemandedSkillIds = new Set();
    const skillDemandMap = new Map(); // skillId -> skillName
    for (const opp of publishedOpportunities) {
        for (const s of opp.skills) {
            if (!existingSkillIds.has(s.skillId)) {
                missingDemandedSkillIds.add(s.skillId);
                skillDemandMap.set(s.skillId, s.skill.name);
            }
        }
    }
    // Target skills: weak skills + missing demanded skills
    const targetSkillIds = Array.from(new Set([...Array.from(weakSkillIds), ...Array.from(missingDemandedSkillIds)]));
    if (targetSkillIds.length === 0) {
        // If student has no gaps, recommend latest published programs
        const generalPrograms = await db_1.default.learningProgram.findMany({
            where: { isPublished: true },
            include: {
                skills: { include: { skill: true } },
            },
            take: 6,
        });
        return generalPrograms.map((p) => ({
            program: p,
            matchingSkills: p.skills.map((s) => s.skill.name),
            reasons: ['Recommended for continuous skill advancement'],
        }));
    }
    // 3. Find learning programs that teach target skills
    const programs = await db_1.default.learningProgram.findMany({
        where: {
            isPublished: true,
            skills: {
                some: {
                    skillId: { in: targetSkillIds },
                },
            },
        },
        include: {
            skills: {
                include: { skill: true },
            },
        },
        take: 10,
    });
    const recommendations = [];
    for (const program of programs) {
        const matchingSkillNames = [];
        const reasons = [];
        for (const progSkill of program.skills) {
            if (weakSkillIds.has(progSkill.skillId)) {
                matchingSkillNames.push(progSkill.skill.name);
                reasons.push(`Helps improve proficiency in ${progSkill.skill.name}`);
            }
            else if (missingDemandedSkillIds.has(progSkill.skillId)) {
                matchingSkillNames.push(progSkill.skill.name);
                reasons.push(`Acquire ${progSkill.skill.name} demanded by industry postings`);
            }
        }
        recommendations.push({
            program,
            matchingSkills: matchingSkillNames,
            reasons: reasons.length > 0 ? reasons : ['Aligns with active market demand'],
        });
    }
    return recommendations;
};
exports.getStudentLearningRecommendations = getStudentLearningRecommendations;
/**
 * Skills You Should Learn Next - Based on career interests, active opportunities, and student gaps
 */
const getPersonalizedSkillRecommendations = async (studentId) => {
    const student = await db_1.default.studentProfile.findUnique({
        where: { id: studentId },
        include: {
            skillProfiles: { include: { skill: { include: { category: true } } } },
        },
    });
    if (!student)
        return [];
    const studentSkillMap = new Map(); // skillId -> proficiency
    student.skillProfiles.forEach((sp) => {
        studentSkillMap.set(sp.skillId, sp.proficiencyLevel || 'BEGINNER');
    });
    // Fetch published opportunities
    const publishedOpportunities = await db_1.default.opportunity.findMany({
        where: { isPublished: true },
        include: {
            skills: { include: { skill: { include: { category: true } } } },
        },
    });
    const skillStatsMap = new Map();
    const studentInterests = student.careerInterests
        ? student.careerInterests.split(',').map((i) => i.trim().toLowerCase()).filter(Boolean)
        : [];
    for (const opp of publishedOpportunities) {
        const oppText = (opp.title + ' ' + (opp.description || '') + ' ' + (opp.department || '')).toLowerCase();
        const matchedInterests = studentInterests.filter((interest) => oppText.includes(interest));
        for (const os of opp.skills) {
            if (!skillStatsMap.has(os.skillId)) {
                skillStatsMap.set(os.skillId, {
                    skill: os.skill,
                    oppCount: 0,
                    interestMatches: [],
                });
            }
            const entry = skillStatsMap.get(os.skillId);
            entry.oppCount += 1;
            matchedInterests.forEach((intName) => {
                if (!entry.interestMatches.includes(intName)) {
                    entry.interestMatches.push(intName);
                }
            });
        }
    }
    const recommendations = [];
    for (const [skillId, stats] of skillStatsMap.entries()) {
        const currentProficiency = studentSkillMap.get(skillId);
        // If student doesn't have it or has it at BEGINNER / INTERMEDIATE where ADVANCED is valuable
        if (!currentProficiency) {
            let reason = '';
            if (stats.interestMatches.length > 0) {
                const intDisplay = stats.interestMatches.map((i) => i.charAt(0).toUpperCase() + i.slice(1)).join(', ');
                reason = `${stats.skill.name} is required by ${stats.oppCount} opportunity(s) matching your interest in ${intDisplay}.`;
            }
            else if (stats.oppCount > 0) {
                reason = `${stats.skill.name} is in high demand, required by ${stats.oppCount} active industry opportunity(s).`;
            }
            else {
                reason = `Essential skill for emerging roles in ${stats.skill.category?.name || 'industry'}.`;
            }
            recommendations.push({
                skillId,
                skillName: stats.skill.name,
                category: stats.skill.category?.name || 'General',
                reason,
                currentLevel: 'Not added',
                targetLevel: 'Intermediate',
                opportunityCount: stats.oppCount,
            });
        }
        else if (currentProficiency === 'BEGINNER') {
            recommendations.push({
                skillId,
                skillName: stats.skill.name,
                category: stats.skill.category?.name || 'General',
                reason: `You have Beginner level in ${stats.skill.name}. Elevating to Intermediate/Advanced will unlock ${stats.oppCount} opportunity(s).`,
                currentLevel: 'Beginner',
                targetLevel: 'Advanced',
                opportunityCount: stats.oppCount,
            });
        }
    }
    // Sort by opportunity count descending
    recommendations.sort((a, b) => b.opportunityCount - a.opportunityCount);
    return recommendations.slice(0, 8);
};
exports.getPersonalizedSkillRecommendations = getPersonalizedSkillRecommendations;
/**
 * Recommended Courses For You - Based on career interests, skill gaps, and active opportunity requirements
 */
const getPersonalizedCourseRecommendations = async (studentId) => {
    const student = await db_1.default.studentProfile.findUnique({
        where: { id: studentId },
        include: {
            skillProfiles: { include: { skill: true } },
            courseEnrollments: { select: { courseId: true } },
        },
    });
    if (!student)
        return [];
    const enrolledCourseIds = new Set(student.courseEnrollments.map((e) => e.courseId));
    const studentSkillMap = new Map();
    student.skillProfiles.forEach((sp) => {
        studentSkillMap.set(sp.skillId, sp.proficiencyLevel || 'BEGINNER');
    });
    // Identify student gap skill IDs (weak or not present)
    const weakSkillIds = new Set(student.skillProfiles
        .filter((s) => s.scorePercentage < 60 || s.proficiencyLevel === 'BEGINNER')
        .map((s) => s.skillId));
    // Demanded skills in published opportunities
    const opportunities = await db_1.default.opportunity.findMany({
        where: { isPublished: true },
        include: { skills: true },
    });
    const missingOpportunitySkills = new Map(); // skillId -> oppCount
    for (const opp of opportunities) {
        for (const os of opp.skills) {
            if (!studentSkillMap.has(os.skillId)) {
                missingOpportunitySkills.set(os.skillId, (missingOpportunitySkills.get(os.skillId) || 0) + 1);
            }
        }
    }
    // Fetch all published courses
    const publishedCourses = await db_1.default.course.findMany({
        where: {
            status: 'PUBLISHED',
            id: { notIn: Array.from(enrolledCourseIds) },
        },
        include: {
            skills: { include: { skill: true } },
            _count: { select: { enrollments: true, modules: true } },
        },
        orderBy: { createdAt: 'desc' },
    });
    if (publishedCourses.length === 0)
        return [];
    const results = [];
    for (const course of publishedCourses) {
        const addressedGaps = [];
        let gapMatchCount = 0;
        let relevantOppCount = 0;
        for (const cs of course.skills) {
            if (!studentSkillMap.has(cs.skillId)) {
                addressedGaps.push(cs.skill.name);
                gapMatchCount++;
                const opps = missingOpportunitySkills.get(cs.skillId) || 0;
                if (opps > relevantOppCount)
                    relevantOppCount = opps;
            }
            else if (weakSkillIds.has(cs.skillId)) {
                addressedGaps.push(`${cs.skill.name} (Upgrade)`);
                gapMatchCount++;
            }
        }
        if (addressedGaps.length > 0) {
            let reason = '';
            if (relevantOppCount > 0) {
                reason = `Recommended because you are missing ${addressedGaps[0]}, which is required for ${relevantOppCount} opportunity(s) matching your profile.`;
            }
            else {
                reason = `Recommended because it bridges your skill gap in ${addressedGaps.slice(0, 2).join(', ')}.`;
            }
            const matchPercentage = Math.min(100, Math.round((gapMatchCount / Math.max(1, course.skills.length)) * 100) || 75);
            results.push({
                course,
                matchPercentage,
                reason,
                addressedGaps,
            });
        }
    }
    // Sort by match percentage and gaps addressed
    results.sort((a, b) => b.addressedGaps.length - a.addressedGaps.length || b.matchPercentage - a.matchPercentage);
    return results.slice(0, 6);
};
exports.getPersonalizedCourseRecommendations = getPersonalizedCourseRecommendations;
