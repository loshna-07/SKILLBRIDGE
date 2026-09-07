"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPortfolioItem = exports.getPendingPortfolioItems = exports.getInstitutionAcademicians = exports.getInstitutionStudentApplications = exports.getInstitutionStudentById = exports.getInstitutionStudents = exports.getInstitutionBranchAnalyticsController = exports.getInstitutionIntelligenceAnalytics = exports.getInstitutionDashboard = void 0;
const db_1 = __importDefault(require("../config/db"));
const analyticsService_1 = require("../services/analyticsService");
const personalizationService_1 = require("../services/personalizationService");
// Institution Dashboard & Analytics
const getInstitutionDashboard = async (req, res) => {
    try {
        const institution = await db_1.default.institutionProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!institution) {
            res.status(404).json({ message: 'Institution profile not found.' });
            return;
        }
        const analytics = await (0, analyticsService_1.getInstitutionAnalytics)(institution.institutionName);
        res.json({
            institution,
            analytics,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch institution dashboard.' });
    }
};
exports.getInstitutionDashboard = getInstitutionDashboard;
// Institution Intelligence Analytics (Deep 9-dimension dynamic analytics with filtering)
const getInstitutionIntelligenceAnalytics = async (req, res) => {
    try {
        const institution = await db_1.default.institutionProfile.findUnique({
            where: { userId: req.user.id },
        });
        const { department, cohort, opportunityType } = req.query;
        const intelligence = await (0, analyticsService_1.getInstitutionIntelligence)({
            department: typeof department === 'string' ? department : undefined,
            cohort: typeof cohort === 'string' ? cohort : undefined,
            opportunityType: typeof opportunityType === 'string' ? opportunityType : undefined,
        }, institution?.institutionName);
        res.json(intelligence);
    }
    catch (error) {
        console.error('getInstitutionIntelligenceAnalytics error:', error);
        res.status(500).json({ message: error.message || 'Failed to fetch intelligence analytics.' });
    }
};
exports.getInstitutionIntelligenceAnalytics = getInstitutionIntelligenceAnalytics;
// Branch-Specific Deep Dive Analytics
const getInstitutionBranchAnalyticsController = async (req, res) => {
    try {
        const institution = await db_1.default.institutionProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!institution) {
            res.status(404).json({ message: 'Institution profile not found.' });
            return;
        }
        const branch = req.query.branch;
        const data = await (0, personalizationService_1.getInstitutionBranchAnalytics)(institution.institutionName, branch);
        res.json(data);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch branch analytics.' });
    }
};
exports.getInstitutionBranchAnalyticsController = getInstitutionBranchAnalyticsController;
// List Registered Students (Strictly scoped to institution, with rich multi-attribute filters)
const getInstitutionStudents = async (req, res) => {
    try {
        const institution = await db_1.default.institutionProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!institution) {
            res.status(404).json({ message: 'Institution profile not found.' });
            return;
        }
        const { branch, department, year, currentYear, minCgpa, maxCgpa, skill, careerInterest, applicationStatus, placementStatus, search, } = req.query;
        const whereClause = {
            institutionName: { contains: institution.institutionName, mode: 'insensitive' },
        };
        // 1. Branch / Department filter
        const targetBranch = branch || department;
        if (targetBranch && typeof targetBranch === 'string' && targetBranch !== 'ALL') {
            whereClause.OR = [
                { department: { contains: targetBranch, mode: 'insensitive' } },
                { degree: { contains: targetBranch, mode: 'insensitive' } },
            ];
        }
        // 2. Year filter
        const targetYear = year || currentYear;
        if (targetYear && typeof targetYear === 'string' && targetYear !== 'ALL') {
            const y = parseInt(targetYear, 10);
            if (!isNaN(y)) {
                whereClause.currentYear = y;
            }
        }
        // 3. CGPA Range filter
        if (minCgpa || maxCgpa) {
            whereClause.cgpa = {};
            if (minCgpa && !isNaN(parseFloat(minCgpa))) {
                whereClause.cgpa.gte = parseFloat(minCgpa);
            }
            if (maxCgpa && !isNaN(parseFloat(maxCgpa))) {
                whereClause.cgpa.lte = parseFloat(maxCgpa);
            }
        }
        // 4. Skill filter
        if (skill && typeof skill === 'string' && skill !== 'ALL') {
            whereClause.skillProfiles = {
                some: {
                    skill: { name: { contains: skill, mode: 'insensitive' } },
                },
            };
        }
        // 5. Career Interest filter
        if (careerInterest && typeof careerInterest === 'string' && careerInterest !== 'ALL') {
            whereClause.careerInterests = { contains: careerInterest, mode: 'insensitive' };
        }
        // 6. Application Status filter
        if (applicationStatus && typeof applicationStatus === 'string' && applicationStatus !== 'ALL') {
            whereClause.applications = {
                some: { status: applicationStatus },
            };
        }
        // 7. Placement Status filter
        if (placementStatus && typeof placementStatus === 'string' && placementStatus !== 'ALL') {
            if (placementStatus === 'PLACED' || placementStatus === 'SELECTED') {
                whereClause.applications = {
                    some: { status: 'SELECTED' },
                };
            }
            else if (placementStatus === 'SEEKING') {
                whereClause.applications = {
                    none: { status: 'SELECTED' },
                };
            }
        }
        // 8. Search query filter
        if (search && typeof search === 'string' && search.trim().length > 0) {
            const q = search.trim();
            whereClause.AND = [
                {
                    OR: [
                        { fullName: { contains: q, mode: 'insensitive' } },
                        { department: { contains: q, mode: 'insensitive' } },
                        { degree: { contains: q, mode: 'insensitive' } },
                        { careerInterests: { contains: q, mode: 'insensitive' } },
                    ],
                },
            ];
        }
        const students = await db_1.default.studentProfile.findMany({
            where: whereClause,
            include: {
                skillProfiles: { include: { skill: true } },
                assessmentAttempts: { select: { percentage: true, passed: true } },
                applications: {
                    select: { id: true, status: true, opportunity: { select: { title: true, type: true } } },
                },
                courseCertificates: { select: { id: true } },
            },
            orderBy: { fullName: 'asc' },
        });
        const enhanced = students.map((s) => {
            const avgScore = s.assessmentAttempts.length > 0
                ? Math.round(s.assessmentAttempts.reduce((sum, a) => sum + a.percentage, 0) /
                    s.assessmentAttempts.length)
                : 0;
            const isPlaced = s.applications.some((a) => a.status === 'SELECTED');
            return {
                id: s.id,
                fullName: s.fullName,
                institutionName: s.institutionName,
                department: s.department,
                degree: s.degree,
                currentYear: s.currentYear,
                cgpa: s.cgpa,
                graduationYear: s.graduationYear,
                skillsCount: s.skillProfiles.length,
                skills: s.skillProfiles.map((sp) => sp.skill.name),
                careerInterests: s.careerInterests,
                avgScore,
                assessmentsCompleted: s.assessmentAttempts.length,
                applicationsCount: s.applications.length,
                isPlaced,
                placementStatus: isPlaced ? 'SELECTED' : 'SEEKING',
                verifiedCertificatesCount: s.courseCertificates.length,
            };
        });
        res.json(enhanced);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch students.' });
    }
};
exports.getInstitutionStudents = getInstitutionStudents;
// Get Full Student Record by ID (for Institutional Profile view)
const getInstitutionStudentById = async (req, res) => {
    try {
        const institution = await db_1.default.institutionProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!institution) {
            res.status(404).json({ message: 'Institution profile not found.' });
            return;
        }
        const id = req.params.id;
        const student = await db_1.default.studentProfile.findFirst({
            where: {
                id,
                institutionName: { contains: institution.institutionName, mode: 'insensitive' },
            },
            include: {
                user: { select: { email: true, createdAt: true } },
                skillProfiles: {
                    include: { skill: { include: { category: true } } },
                    orderBy: { createdAt: 'desc' },
                },
                assessmentAttempts: {
                    include: { assessment: true },
                    orderBy: { startedAt: 'desc' },
                },
                applications: {
                    include: {
                        opportunity: {
                            include: { industry: true, skills: { include: { skill: true } } },
                        },
                        history: { orderBy: { createdAt: 'desc' } },
                        interviews: true,
                    },
                    orderBy: { appliedAt: 'desc' },
                },
                courseEnrollments: {
                    include: {
                        course: { include: { skills: { include: { skill: true } } } },
                    },
                },
                courseCertificates: {
                    include: { course: true },
                },
                certificates: true,
                projects: true,
                internships: true,
                achievements: true,
            },
        });
        if (!student) {
            res.status(404).json({ message: 'Student not found or not affiliated with your institution.' });
            return;
        }
        res.json(student);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch student profile.' });
    }
};
exports.getInstitutionStudentById = getInstitutionStudentById;
// List Student Applications for this Institution
const getInstitutionStudentApplications = async (req, res) => {
    try {
        const institution = await db_1.default.institutionProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!institution) {
            res.status(404).json({ message: 'Institution profile not found.' });
            return;
        }
        const { branch, status, type, studentId, opportunityId } = req.query;
        const whereClause = {
            student: {
                institutionName: { contains: institution.institutionName, mode: 'insensitive' },
            },
        };
        if (branch && typeof branch === 'string' && branch !== 'ALL') {
            whereClause.student.OR = [
                { department: { contains: branch, mode: 'insensitive' } },
                { degree: { contains: branch, mode: 'insensitive' } },
            ];
        }
        if (status && typeof status === 'string' && status !== 'ALL') {
            whereClause.status = status;
        }
        if (type && typeof type === 'string' && type !== 'ALL') {
            whereClause.opportunity = { type: type.toUpperCase() };
        }
        if (studentId && typeof studentId === 'string') {
            whereClause.studentId = studentId;
        }
        if (opportunityId && typeof opportunityId === 'string') {
            whereClause.opportunityId = opportunityId;
        }
        const applications = await db_1.default.application.findMany({
            where: whereClause,
            include: {
                student: {
                    select: {
                        id: true,
                        fullName: true,
                        department: true,
                        degree: true,
                        currentYear: true,
                        cgpa: true,
                    },
                },
                opportunity: {
                    include: {
                        industry: { select: { companyName: true, industrySector: true, location: true } },
                    },
                },
                history: { orderBy: { createdAt: 'desc' } },
                interviews: { orderBy: { scheduledAt: 'desc' } },
            },
            orderBy: { appliedAt: 'desc' },
        });
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch applications.' });
    }
};
exports.getInstitutionStudentApplications = getInstitutionStudentApplications;
// List Registered Academicians
const getInstitutionAcademicians = async (req, res) => {
    try {
        const institution = await db_1.default.institutionProfile.findUnique({
            where: { userId: req.user.id },
        });
        const whereClause = {};
        if (institution) {
            whereClause.institutionName = { contains: institution.institutionName, mode: 'insensitive' };
        }
        const academicians = await db_1.default.academicianProfile.findMany({
            where: whereClause,
            orderBy: { fullName: 'asc' },
        });
        res.json(academicians);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch academicians.' });
    }
};
exports.getInstitutionAcademicians = getInstitutionAcademicians;
// Get Pending Portfolio Items for Verification
const getPendingPortfolioItems = async (_req, res) => {
    try {
        const [projects, certificates, internships, educations, achievements, trainings, skills, resumes] = await Promise.all([
            db_1.default.studentProject.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { student: { select: { fullName: true, department: true, degree: true } } },
            }),
            db_1.default.studentCertification.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { student: { select: { fullName: true, department: true, degree: true } } },
            }),
            db_1.default.studentInternshipExperience.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { student: { select: { fullName: true, department: true, degree: true } } },
            }),
            db_1.default.studentEducation.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { student: { select: { fullName: true, department: true, degree: true } } },
            }),
            db_1.default.studentAchievement.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { student: { select: { fullName: true, department: true, degree: true } } },
            }),
            db_1.default.studentTraining.findMany({
                where: { verificationStatus: 'PENDING' },
                include: { student: { select: { fullName: true, department: true, degree: true } } },
            }),
            db_1.default.studentSkillProfile.findMany({
                where: { verificationStatus: 'PENDING' },
                include: {
                    student: { select: { fullName: true, department: true, degree: true } },
                    skill: true,
                },
            }),
            db_1.default.studentProfile.findMany({
                where: { resumeVerificationStatus: 'PENDING', resumeUrl: { not: null } },
                select: {
                    id: true,
                    fullName: true,
                    department: true,
                    degree: true,
                    resumeUrl: true,
                    resumeVerificationStatus: true,
                    resumeRemarks: true,
                },
            }),
        ]);
        const items = [
            ...projects.map((p) => ({ ...p, itemType: 'PROJECT' })),
            ...certificates.map((c) => ({ ...c, itemType: 'CERTIFICATION' })),
            ...internships.map((i) => ({ ...i, itemType: 'INTERNSHIP' })),
            ...educations.map((e) => ({ ...e, itemType: 'EDUCATION' })),
            ...achievements.map((a) => ({ ...a, itemType: 'ACHIEVEMENT' })),
            ...trainings.map((t) => ({ ...t, itemType: 'TRAINING' })),
            ...skills.map((s) => ({
                ...s,
                itemType: 'SKILL',
                title: s.skill?.name ? `Skill Verification: ${s.skill.name}` : 'Skill Verification',
                description: `Proficiency: ${s.proficiencyLevel}, Score: ${s.scorePercentage}%`,
            })),
            ...resumes.map((r) => ({
                id: r.id,
                itemType: 'RESUME',
                title: `Resume Document (${r.fullName})`,
                description: 'Uploaded Academic / Professional Resume for placement screening',
                fileUrl: r.resumeUrl,
                verificationStatus: r.resumeVerificationStatus,
                remarks: r.resumeRemarks,
                student: {
                    fullName: r.fullName,
                    department: r.department,
                    degree: r.degree,
                },
            })),
        ];
        res.json(items);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch pending portfolio items.' });
    }
};
exports.getPendingPortfolioItems = getPendingPortfolioItems;
// Verify Portfolio Item
const verifyPortfolioItem = async (req, res) => {
    try {
        const { itemId, itemType, status, remarks } = req.body;
        if (!itemId || !itemType || !['VERIFIED', 'REJECTED'].includes(status)) {
            res.status(400).json({ message: 'Item ID, valid itemType, and status (VERIFIED/REJECTED) are required.' });
            return;
        }
        const updateData = {
            verificationStatus: status,
            verifiedById: req.user.id,
            verifiedAt: new Date(),
            remarks,
        };
        let updatedItem = null;
        if (itemType === 'PROJECT') {
            updatedItem = await db_1.default.studentProject.update({
                where: { id: itemId },
                data: updateData,
            });
        }
        else if (itemType === 'CERTIFICATION') {
            updatedItem = await db_1.default.studentCertification.update({
                where: { id: itemId },
                data: updateData,
            });
        }
        else if (itemType === 'INTERNSHIP') {
            updatedItem = await db_1.default.studentInternshipExperience.update({
                where: { id: itemId },
                data: updateData,
            });
        }
        else if (itemType === 'EDUCATION') {
            updatedItem = await db_1.default.studentEducation.update({
                where: { id: itemId },
                data: updateData,
            });
        }
        else if (itemType === 'ACHIEVEMENT') {
            updatedItem = await db_1.default.studentAchievement.update({
                where: { id: itemId },
                data: updateData,
            });
        }
        else if (itemType === 'TRAINING') {
            updatedItem = await db_1.default.studentTraining.update({
                where: { id: itemId },
                data: updateData,
            });
        }
        else if (itemType === 'SKILL') {
            updatedItem = await db_1.default.studentSkillProfile.update({
                where: { id: itemId },
                data: {
                    verificationStatus: status,
                    verified: status === 'VERIFIED',
                    verifiedById: req.user.id,
                    verifiedAt: new Date(),
                    remarks,
                },
            });
        }
        else if (itemType === 'RESUME') {
            updatedItem = await db_1.default.studentProfile.update({
                where: { id: itemId },
                data: {
                    resumeVerificationStatus: status,
                    resumeRemarks: remarks,
                },
            });
        }
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: `PORTFOLIO_${status}`,
                entityType: itemType,
                entityId: itemId,
                details: JSON.stringify({ status, remarks }),
            },
        });
        res.json({ message: `Portfolio item marked as ${status}.`, updatedItem });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to verify portfolio item.' });
    }
};
exports.verifyPortfolioItem = verifyPortfolioItem;
