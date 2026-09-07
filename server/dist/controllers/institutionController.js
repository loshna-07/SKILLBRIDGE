"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyPortfolioItem = exports.getPendingPortfolioItems = exports.getInstitutionAcademicians = exports.getInstitutionStudents = exports.getInstitutionDashboard = void 0;
const db_1 = __importDefault(require("../config/db"));
const analyticsService_1 = require("../services/analyticsService");
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
// List Registered Students
const getInstitutionStudents = async (req, res) => {
    try {
        const { department, search } = req.query;
        const whereClause = {};
        if (department && typeof department === 'string' && department !== 'ALL') {
            whereClause.department = department;
        }
        if (search && typeof search === 'string') {
            whereClause.OR = [
                { fullName: { contains: search } },
                { department: { contains: search } },
                { degree: { contains: search } },
            ];
        }
        const students = await db_1.default.studentProfile.findMany({
            where: whereClause,
            include: {
                skillProfiles: { include: { skill: true } },
                assessmentAttempts: {
                    select: { percentage: true, passed: true },
                },
                _count: { select: { applications: true } },
            },
            orderBy: { fullName: 'asc' },
        });
        const enhanced = students.map((s) => {
            const avgScore = s.assessmentAttempts.length > 0
                ? Math.round(s.assessmentAttempts.reduce((sum, a) => sum + a.percentage, 0) /
                    s.assessmentAttempts.length)
                : 0;
            return {
                id: s.id,
                fullName: s.fullName,
                department: s.department,
                degree: s.degree,
                currentYear: s.currentYear,
                cgpa: s.cgpa,
                graduationYear: s.graduationYear,
                skillsCount: s.skillProfiles.length,
                avgScore,
                assessmentsCompleted: s.assessmentAttempts.length,
                applicationsCount: s._count.applications,
            };
        });
        res.json(enhanced);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch students.' });
    }
};
exports.getInstitutionStudents = getInstitutionStudents;
// List Registered Academicians
const getInstitutionAcademicians = async (req, res) => {
    try {
        const academicians = await db_1.default.academicianProfile.findMany({
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
        const [projects, certificates, internships, educations] = await Promise.all([
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
        ]);
        res.json({
            projects,
            certificates,
            internships,
            educations,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch pending portfolio items.' });
    }
};
exports.getPendingPortfolioItems = getPendingPortfolioItems;
// Verify Portfolio Item (PENDING -> VERIFIED / REJECTED)
const verifyPortfolioItem = async (req, res) => {
    try {
        const { itemType, itemId, status, remarks } = req.body;
        if (!['VERIFIED', 'REJECTED'].includes(status)) {
            res.status(400).json({ message: "Status must be either 'VERIFIED' or 'REJECTED'." });
            return;
        }
        const validTypes = ['PROJECT', 'CERTIFICATION', 'INTERNSHIP', 'EDUCATION'];
        if (!validTypes.includes(itemType)) {
            res.status(400).json({ message: `Invalid itemType. Must be one of: ${validTypes.join(', ')}` });
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
