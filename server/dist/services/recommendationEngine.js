"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStudentLearningRecommendations = void 0;
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
