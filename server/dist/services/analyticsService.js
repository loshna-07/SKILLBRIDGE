"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getInstitutionAnalytics = exports.getPublicPlatformStats = void 0;
const db_1 = __importDefault(require("../config/db"));
const getPublicPlatformStats = async () => {
    const [totalStudents, totalCompanies, totalOpportunities, totalInstitutions] = await Promise.all([
        db_1.default.studentProfile.count(),
        db_1.default.industryProfile.count(),
        db_1.default.opportunity.count({ where: { isPublished: true } }),
        db_1.default.institutionProfile.count(),
    ]);
    return {
        totalStudents,
        totalCompanies,
        totalOpportunities,
        totalInstitutions,
    };
};
exports.getPublicPlatformStats = getPublicPlatformStats;
const getInstitutionAnalytics = async (institutionName) => {
    // If institutionName is specified, scope students; otherwise aggregate
    const studentWhere = institutionName ? { institutionName: { contains: institutionName } } : {};
    const totalStudents = await db_1.default.studentProfile.count({ where: studentWhere });
    // Students with completed assessment attempts
    const studentsWithAssessments = await db_1.default.assessmentAttempt.findMany({
        where: {
            completedAt: { not: null },
            student: studentWhere,
        },
        select: { studentId: true, percentage: true },
    });
    const uniqueAssessedStudentIds = new Set(studentsWithAssessments.map((a) => a.studentId));
    const assessmentCompletionRate = totalStudents > 0 ? Math.round((uniqueAssessedStudentIds.size / totalStudents) * 100) : 0;
    const avgSkillScore = studentsWithAssessments.length > 0
        ? Math.round(studentsWithAssessments.reduce((sum, a) => sum + a.percentage, 0) /
            studentsWithAssessments.length)
        : 0;
    // Department distribution
    const students = await db_1.default.studentProfile.findMany({
        where: studentWhere,
        select: { department: true, graduationYear: true },
    });
    const departmentCounts = {};
    const gradYearCounts = {};
    for (const s of students) {
        const dept = s.department || 'Unspecified';
        departmentCounts[dept] = (departmentCounts[dept] || 0) + 1;
        if (s.graduationYear) {
            const year = s.graduationYear.toString();
            gradYearCounts[year] = (gradYearCounts[year] || 0) + 1;
        }
    }
    // Internship & Placement analytics
    const applications = await db_1.default.application.findMany({
        where: {
            student: studentWhere,
        },
        include: {
            opportunity: {
                select: { type: true },
            },
        },
    });
    const totalApplications = applications.length;
    const shortlistedCount = applications.filter((a) => a.status === 'SHORTLISTED' || a.status === 'INTERVIEW').length;
    const selectedCount = applications.filter((a) => a.status === 'SELECTED').length;
    const internshipApps = applications.filter((a) => a.opportunity.type === 'INTERNSHIP');
    const jobApps = applications.filter((a) => a.opportunity.type === 'JOB');
    const internshipPlaced = internshipApps.filter((a) => a.status === 'SELECTED').length;
    const jobPlaced = jobApps.filter((a) => a.status === 'SELECTED').length;
    const placementRate = totalStudents > 0 ? Math.round((selectedCount / totalStudents) * 100) : 0;
    // Skill Demand Analytics: Student skills vs Industry required skills
    const studentSkillProfiles = await db_1.default.studentSkillProfile.findMany({
        where: {
            student: studentWhere,
        },
        include: { skill: true },
    });
    const studentSkillCountMap = {};
    for (const sp of studentSkillProfiles) {
        const name = sp.skill.name;
        studentSkillCountMap[name] = (studentSkillCountMap[name] || 0) + 1;
    }
    const opportunitySkills = await db_1.default.opportunitySkill.findMany({
        where: {
            opportunity: { isPublished: true },
        },
        include: { skill: true },
    });
    const industrySkillDemandMap = {};
    for (const os of opportunitySkills) {
        const name = os.skill.name;
        industrySkillDemandMap[name] = (industrySkillDemandMap[name] || 0) + 1;
    }
    // Union of all skill names
    const allSkillNames = Array.from(new Set([...Object.keys(studentSkillCountMap), ...Object.keys(industrySkillDemandMap)]));
    const skillComparison = allSkillNames.map((skillName) => {
        const studentCount = studentSkillCountMap[skillName] || 0;
        const industryDemand = industrySkillDemandMap[skillName] || 0;
        const gap = industryDemand - studentCount;
        return {
            skill: skillName,
            studentCount,
            industryDemand,
            gap,
            isShortage: gap > 0,
        };
    });
    // Sort by highest industry demand
    skillComparison.sort((a, b) => b.industryDemand - a.industryDemand);
    return {
        totalStudents,
        assessedStudentsCount: uniqueAssessedStudentIds.size,
        assessmentCompletionRate,
        avgSkillScore,
        departmentDistribution: Object.entries(departmentCounts).map(([department, count]) => ({
            department,
            count,
        })),
        graduationYearDistribution: Object.entries(gradYearCounts).map(([year, count]) => ({
            year,
            count,
        })),
        applicationMetrics: {
            totalApplications,
            shortlistedCount,
            selectedCount,
            internshipPlaced,
            jobPlaced,
            placementRate,
        },
        skillComparison,
    };
};
exports.getInstitutionAnalytics = getInstitutionAnalytics;
