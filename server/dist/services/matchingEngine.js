"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateOpportunityMatch = exports.getPlatformWeights = void 0;
const db_1 = __importDefault(require("../config/db"));
const getPlatformWeights = async () => {
    try {
        const setting = await db_1.default.platformSetting.findUnique({
            where: { key: 'MATCHING_WEIGHTS' },
        });
        if (setting) {
            return JSON.parse(setting.value);
        }
    }
    catch (err) {
        // fallback to defaults
    }
    return {
        skillWeight: 0.50,
        assessmentWeight: 0.20,
        cgpaWeight: 0.15,
        academicWeight: 0.15,
    };
};
exports.getPlatformWeights = getPlatformWeights;
const calculateOpportunityMatch = async (studentId, opportunityId) => {
    const student = await db_1.default.studentProfile.findUnique({
        where: { id: studentId },
        include: {
            skillProfiles: {
                include: { skill: true },
            },
        },
    });
    const opportunity = await db_1.default.opportunity.findUnique({
        where: { id: opportunityId },
        include: {
            skills: {
                include: { skill: true },
            },
        },
    });
    if (!student || !opportunity) {
        return {
            matchScore: 0,
            matchedSkills: [],
            missingRequiredSkills: [],
            missingPreferredSkills: [],
            cgpaEligible: false,
            departmentEligible: false,
            degreeEligible: false,
            breakdown: { skillScore: 0, assessmentScore: 0, cgpaScore: 0, academicScore: 0 },
            explanation: 'Student or Opportunity not found.',
        };
    }
    const weights = await (0, exports.getPlatformWeights)();
    // 1. Skill & Assessment Score
    const studentSkillMap = new Map();
    for (const sp of student.skillProfiles) {
        studentSkillMap.set(sp.skillId, {
            proficiency: sp.proficiencyLevel,
            score: sp.scorePercentage,
            name: sp.skill.name,
        });
    }
    const matchedSkills = [];
    const missingRequiredSkills = [];
    const missingPreferredSkills = [];
    let requiredMatchedCount = 0;
    let totalRequiredCount = 0;
    let preferredMatchedCount = 0;
    let totalPreferredCount = 0;
    let totalAssessmentScore = 0;
    for (const oppSkill of opportunity.skills) {
        const skillName = oppSkill.skill.name;
        const studentSkill = studentSkillMap.get(oppSkill.skillId);
        if (oppSkill.isRequired) {
            totalRequiredCount++;
            if (studentSkill) {
                requiredMatchedCount++;
                matchedSkills.push({ name: skillName, proficiency: studentSkill.proficiency, isRequired: true });
                totalAssessmentScore += studentSkill.score || 70;
            }
            else {
                missingRequiredSkills.push(skillName);
            }
        }
        else {
            totalPreferredCount++;
            if (studentSkill) {
                preferredMatchedCount++;
                matchedSkills.push({ name: skillName, proficiency: studentSkill.proficiency, isRequired: false });
                totalAssessmentScore += studentSkill.score || 60;
            }
            else {
                missingPreferredSkills.push(skillName);
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
    if (opportunity.minCgpa && opportunity.minCgpa > 0) {
        if (!student.cgpa) {
            cgpaEligible = false;
            cgpaScore = 40;
        }
        else if (student.cgpa >= opportunity.minCgpa) {
            cgpaEligible = true;
            cgpaScore = Math.min(100, (student.cgpa / 10) * 100);
        }
        else {
            cgpaEligible = false;
            cgpaScore = Math.max(0, (student.cgpa / opportunity.minCgpa) * 60);
        }
    }
    // 3. Department & Degree Match
    let departmentEligible = true;
    let degreeEligible = true;
    let academicScore = 100;
    if (opportunity.department && opportunity.department.trim()) {
        const oppDept = opportunity.department.toLowerCase();
        const studDept = (student.department || '').toLowerCase();
        if (!studDept.includes(oppDept) && !oppDept.includes(studDept)) {
            departmentEligible = false;
        }
    }
    if (opportunity.degree && opportunity.degree.trim()) {
        const oppDeg = opportunity.degree.toLowerCase();
        const studDeg = (student.degree || '').toLowerCase();
        if (!studDeg.includes(oppDeg) && !oppDeg.includes(studDeg)) {
            degreeEligible = false;
        }
    }
    if (!departmentEligible && !degreeEligible)
        academicScore = 30;
    else if (!departmentEligible || !degreeEligible)
        academicScore = 65;
    else
        academicScore = 100;
    // Weighted Total Score
    const weightedScore = skillScore * weights.skillWeight +
        avgAssessmentScore * weights.assessmentWeight +
        cgpaScore * weights.cgpaWeight +
        academicScore * weights.academicWeight;
    const finalMatchScore = Math.round(Math.min(100, Math.max(0, weightedScore)));
    // Generate clear human explanation
    const explanationParts = [`${finalMatchScore}% overall compatibility`];
    if (matchedSkills.length > 0) {
        explanationParts.push(`Matched ${matchedSkills.length} skill(s): ${matchedSkills.map(s => s.name).join(', ')}`);
    }
    if (missingRequiredSkills.length > 0) {
        explanationParts.push(`Missing required: ${missingRequiredSkills.join(', ')}`);
    }
    if (!cgpaEligible && opportunity.minCgpa) {
        explanationParts.push(`CGPA (${student.cgpa || 'N/A'}) below requirement (${opportunity.minCgpa})`);
    }
    return {
        matchScore: finalMatchScore,
        matchedSkills,
        missingRequiredSkills,
        missingPreferredSkills,
        cgpaEligible,
        departmentEligible,
        degreeEligible,
        breakdown: {
            skillScore: Math.round(skillScore),
            assessmentScore: Math.round(avgAssessmentScore),
            cgpaScore: Math.round(cgpaScore),
            academicScore: Math.round(academicScore),
        },
        explanation: explanationParts.join('. ') + '.',
    };
};
exports.calculateOpportunityMatch = calculateOpportunityMatch;
