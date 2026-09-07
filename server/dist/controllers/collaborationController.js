"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondMentorshipRequest = exports.getMentorshipRequests = exports.requestMentorship = exports.createMentorshipProgram = exports.getMentorshipPrograms = exports.getCollaborationFeedback = exports.submitCollaborationFeedback = exports.getMyCreatedCollaborations = exports.getMyApplications = exports.updateApplicantStatus = exports.getCollaborationApplicants = exports.applyToCollaboration = exports.deleteCollaboration = exports.updateCollaboration = exports.createCollaboration = exports.getCollaborationById = exports.getCollaborations = exports.VALID_COLLABORATION_TYPES = void 0;
exports.resolveInitiatorInfo = resolveInitiatorInfo;
const notificationController_1 = require("./notificationController");
const db_1 = __importDefault(require("../config/db"));
exports.VALID_COLLABORATION_TYPES = [
    'MENTORSHIP',
    'WORKSHOP',
    'GUEST_LECTURE',
    'LIVE_PROJECT',
    'INNOVATION_CHALLENGE',
    'RESEARCH_PROJECT',
    'RESEARCH', // alias
    'CONSULTANCY',
    'INDUSTRY_VISIT',
    // Legacy / Academician types for backward compatibility
    'FACULTY_INTERNSHIP',
    'INDUSTRIAL_TRAINING',
    'FDP',
];
// Helper to resolve initiator display name and details
async function resolveInitiatorInfo(initiatorId, initiatorRole) {
    try {
        if (initiatorRole === 'INDUSTRY') {
            const ind = await db_1.default.industryProfile.findFirst({
                where: { OR: [{ userId: initiatorId }, { id: initiatorId }] },
            });
            if (ind) {
                return {
                    name: ind.companyName,
                    sector: ind.industrySector,
                    location: ind.location,
                    email: ind.officialEmail,
                    contactPerson: ind.contactPerson,
                    logoUrl: ind.logoUrl,
                };
            }
        }
        else if (initiatorRole === 'INSTITUTION') {
            const inst = await db_1.default.institutionProfile.findFirst({
                where: { OR: [{ userId: initiatorId }, { id: initiatorId }] },
            });
            if (inst) {
                return {
                    name: inst.institutionName,
                    type: inst.institutionType,
                    location: inst.address,
                    email: inst.officialEmail,
                    contactPerson: inst.contactPerson,
                    logoUrl: inst.logoUrl,
                };
            }
        }
        else if (initiatorRole === 'ACADEMICIAN') {
            const acad = await db_1.default.academicianProfile.findFirst({
                where: { OR: [{ userId: initiatorId }, { id: initiatorId }] },
            });
            if (acad) {
                return {
                    name: acad.fullName,
                    institution: acad.institutionName,
                    department: acad.department,
                    designation: acad.designation,
                    email: '',
                };
            }
        }
        const user = await db_1.default.user.findUnique({
            where: { id: initiatorId },
            select: { email: true, role: true },
        });
        return {
            name: user?.email || 'Authorized Partner',
            email: user?.email || '',
            role: user?.role,
        };
    }
    catch {
        return { name: 'SkillBridge Partner' };
    }
}
// 1. Browse & Search Collaborations (Universal)
const getCollaborations = async (req, res) => {
    try {
        const { type, mode, status = 'OPEN', search, initiatorRole } = req.query;
        const where = {};
        if (status && status !== 'ALL') {
            where.status = status.toUpperCase();
        }
        if (type && type !== 'ALL') {
            const t = type.toUpperCase();
            if (t === 'RESEARCH' || t === 'RESEARCH_PROJECT') {
                where.type = { in: ['RESEARCH', 'RESEARCH_PROJECT'] };
            }
            else {
                where.type = t;
            }
        }
        if (mode && mode !== 'ALL') {
            where.mode = mode.toUpperCase();
        }
        if (initiatorRole && initiatorRole !== 'ALL') {
            where.initiatorRole = initiatorRole.toUpperCase();
        }
        if (search) {
            const q = String(search).trim();
            where.OR = [
                { title: { contains: q, mode: 'insensitive' } },
                { description: { contains: q, mode: 'insensitive' } },
                { eligibilityCriteria: { contains: q, mode: 'insensitive' } },
                { targetAudience: { contains: q, mode: 'insensitive' } },
            ];
        }
        const collabs = await db_1.default.collaboration.findMany({
            where,
            include: {
                applications: {
                    select: {
                        id: true,
                        status: true,
                        applicantRole: true,
                        academicianId: true,
                        studentId: true,
                        institutionId: true,
                    },
                },
                feedbacks: {
                    select: {
                        id: true,
                        rating: true,
                        comments: true,
                        userName: true,
                        userRole: true,
                        createdAt: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
        // Identify current user's profile ID if authenticated
        let userStudentId = null;
        let userAcademicianId = null;
        let userInstitutionId = null;
        if (req.user) {
            if (req.user.role === 'STUDENT') {
                const s = await db_1.default.studentProfile.findUnique({
                    where: { userId: req.user.id },
                    select: { id: true },
                });
                userStudentId = s?.id || null;
            }
            else if (req.user.role === 'ACADEMICIAN') {
                const a = await db_1.default.academicianProfile.findUnique({
                    where: { userId: req.user.id },
                    select: { id: true },
                });
                userAcademicianId = a?.id || null;
            }
            else if (req.user.role === 'INSTITUTION') {
                const i = await db_1.default.institutionProfile.findUnique({
                    where: { userId: req.user.id },
                    select: { id: true },
                });
                userInstitutionId = i?.id || null;
            }
        }
        const enriched = await Promise.all(collabs.map(async (collab) => {
            const initiatorInfo = await resolveInitiatorInfo(collab.initiatorId, collab.initiatorRole);
            let myApp = null;
            if (userStudentId) {
                myApp = collab.applications.find((a) => a.studentId === userStudentId);
            }
            else if (userAcademicianId) {
                myApp = collab.applications.find((a) => a.academicianId === userAcademicianId);
            }
            else if (userInstitutionId) {
                myApp = collab.applications.find((a) => a.institutionId === userInstitutionId);
            }
            const avgRating = collab.feedbacks.length > 0
                ? Number((collab.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                    collab.feedbacks.length).toFixed(1))
                : null;
            return {
                id: collab.id,
                initiatorId: collab.initiatorId,
                initiatorRole: collab.initiatorRole,
                title: collab.title,
                type: collab.type,
                description: collab.description,
                targetAudience: collab.targetAudience,
                location: collab.location,
                mode: collab.mode,
                duration: collab.duration,
                remunerationOrStipend: collab.remunerationOrStipend,
                eligibilityCriteria: collab.eligibilityCriteria,
                status: collab.status,
                budget: collab.budget,
                startDate: collab.startDate,
                endDate: collab.endDate,
                createdAt: collab.createdAt,
                updatedAt: collab.updatedAt,
                initiatorInfo,
                applicantCount: collab.applications.length,
                averageRating: avgRating,
                feedbackCount: collab.feedbacks.length,
                hasApplied: Boolean(myApp),
                applicationStatus: myApp?.status || null,
                applicationId: myApp?.id || null,
                isInitiator: req.user?.id === collab.initiatorId,
            };
        }));
        res.json(enriched);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch collaborations.' });
    }
};
exports.getCollaborations = getCollaborations;
// 2. Get Single Collaboration Details
const getCollaborationById = async (req, res) => {
    try {
        const id = req.params.id;
        const collab = await db_1.default.collaboration.findUnique({
            where: { id },
            include: {
                applications: {
                    include: {
                        student: {
                            select: {
                                id: true,
                                fullName: true,
                                department: true,
                                degree: true,
                                institutionName: true,
                                cgpa: true,
                            },
                        },
                        academician: {
                            select: {
                                id: true,
                                fullName: true,
                                institutionName: true,
                                department: true,
                                designation: true,
                                areasOfExpertise: true,
                            },
                        },
                        institution: {
                            select: {
                                id: true,
                                institutionName: true,
                                institutionType: true,
                                affiliatedUniversity: true,
                                address: true,
                            },
                        },
                    },
                },
                feedbacks: {
                    orderBy: { createdAt: 'desc' },
                },
            },
        });
        if (!collab) {
            res.status(404).json({ message: 'Collaboration initiative not found.' });
            return;
        }
        const typedCollab = collab;
        const initiatorInfo = await resolveInitiatorInfo(typedCollab.initiatorId, typedCollab.initiatorRole);
        let myApp = null;
        if (req.user) {
            if (req.user.role === 'STUDENT') {
                const s = await db_1.default.studentProfile.findUnique({
                    where: { userId: req.user.id },
                    select: { id: true },
                });
                if (s)
                    myApp = (typedCollab.applications || []).find((a) => a.studentId === s.id);
            }
            else if (req.user.role === 'ACADEMICIAN') {
                const a = await db_1.default.academicianProfile.findUnique({
                    where: { userId: req.user.id },
                    select: { id: true },
                });
                if (a)
                    myApp = (typedCollab.applications || []).find((a) => a.academicianId === a.id);
            }
            else if (req.user.role === 'INSTITUTION') {
                const i = await db_1.default.institutionProfile.findUnique({
                    where: { userId: req.user.id },
                    select: { id: true },
                });
                if (i)
                    myApp = (typedCollab.applications || []).find((a) => a.institutionId === i.id);
            }
        }
        const avgRating = (typedCollab.feedbacks || []).length > 0
            ? Number((typedCollab.feedbacks.reduce((sum, f) => sum + f.rating, 0) /
                typedCollab.feedbacks.length).toFixed(1))
            : null;
        res.json({
            ...typedCollab,
            initiatorInfo,
            applicantCount: (typedCollab.applications || []).length,
            averageRating: avgRating,
            hasApplied: Boolean(myApp),
            applicationStatus: myApp?.status || null,
            applicationId: myApp?.id || null,
            myApplication: myApp,
            isInitiator: req.user?.id === typedCollab.initiatorId,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch collaboration details.' });
    }
};
exports.getCollaborationById = getCollaborationById;
// 3. Create Collaboration
const createCollaboration = async (req, res) => {
    try {
        const allowedRoles = ['INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'];
        if (!allowedRoles.includes(req.user.role)) {
            res.status(403).json({ message: 'You are not authorized to create collaboration initiatives.' });
            return;
        }
        const { title, type, description, targetAudience, location, mode = 'HYBRID', duration, remunerationOrStipend, eligibilityCriteria, budget, startDate, endDate, } = req.body;
        if (!title || !type || !description) {
            res.status(400).json({ message: 'Title, type, and description are required.' });
            return;
        }
        const normalizedType = type.toUpperCase();
        if (!exports.VALID_COLLABORATION_TYPES.includes(normalizedType)) {
            res.status(400).json({
                message: `Invalid collaboration type. Must be one of: ${exports.VALID_COLLABORATION_TYPES.join(', ')}`,
            });
            return;
        }
        const collab = await db_1.default.collaboration.create({
            data: {
                initiatorId: req.user.id,
                initiatorRole: req.user.role,
                title,
                type: normalizedType,
                description,
                targetAudience: targetAudience || 'ALL',
                location,
                mode: mode.toUpperCase(),
                duration,
                remunerationOrStipend,
                eligibilityCriteria,
                budget,
                startDate,
                endDate,
                status: 'OPEN',
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'CREATE_COLLABORATION',
                entityType: 'Collaboration',
                entityId: collab.id,
                details: JSON.stringify({ title, type: normalizedType, role: req.user.role }),
            },
        });
        res.status(201).json({
            message: 'Collaboration initiative created successfully.',
            collaboration: collab,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create collaboration.' });
    }
};
exports.createCollaboration = createCollaboration;
// 4. Update Collaboration
const updateCollaboration = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await db_1.default.collaboration.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ message: 'Collaboration not found.' });
            return;
        }
        if (existing.initiatorId !== req.user.id) {
            res.status(403).json({ message: 'Only the initiator can update this collaboration.' });
            return;
        }
        const { title, type, description, targetAudience, location, mode, duration, remunerationOrStipend, eligibilityCriteria, budget, startDate, endDate, status, } = req.body;
        const updated = await db_1.default.collaboration.update({
            where: { id },
            data: {
                title,
                type: type ? type.toUpperCase() : undefined,
                description,
                targetAudience,
                location,
                mode: mode ? mode.toUpperCase() : undefined,
                duration,
                remunerationOrStipend,
                eligibilityCriteria,
                budget,
                startDate,
                endDate,
                status: status ? status.toUpperCase() : undefined,
            },
        });
        res.json({
            message: 'Collaboration updated successfully.',
            collaboration: updated,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update collaboration.' });
    }
};
exports.updateCollaboration = updateCollaboration;
// 5. Delete Collaboration
const deleteCollaboration = async (req, res) => {
    try {
        const id = req.params.id;
        const existing = await db_1.default.collaboration.findUnique({ where: { id } });
        if (!existing) {
            res.status(404).json({ message: 'Collaboration not found.' });
            return;
        }
        if (existing.initiatorId !== req.user.id) {
            res.status(403).json({ message: 'Only the initiator can delete this collaboration.' });
            return;
        }
        await db_1.default.collaboration.delete({ where: { id } });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'DELETE_COLLABORATION',
                entityType: 'Collaboration',
                entityId: id,
                details: JSON.stringify({ title: existing.title }),
            },
        });
        res.json({ message: 'Collaboration deleted successfully.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete collaboration.' });
    }
};
exports.deleteCollaboration = deleteCollaboration;
// 6. Apply to Collaboration (Universal for Students, Academicians, Institutions)
const applyToCollaboration = async (req, res) => {
    try {
        const id = req.params.id;
        const { proposal } = req.body;
        const collab = await db_1.default.collaboration.findUnique({ where: { id } });
        if (!collab) {
            res.status(404).json({ message: 'Collaboration initiative not found.' });
            return;
        }
        if (collab.status !== 'OPEN') {
            res.status(400).json({ message: `This initiative is currently ${collab.status.toLowerCase()}.` });
            return;
        }
        let applicantRole = req.user.role;
        let studentId = null;
        let academicianId = null;
        let institutionId = null;
        if (req.user.role === 'STUDENT') {
            const student = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
            if (!student) {
                res.status(404).json({ message: 'Student profile not found. Please complete your profile.' });
                return;
            }
            studentId = student.id;
            const existing = await db_1.default.collaborationApplication.findFirst({
                where: { collaborationId: id, studentId: student.id },
            });
            if (existing) {
                res.status(400).json({ message: `You have already applied (Status: ${existing.status}).` });
                return;
            }
        }
        else if (req.user.role === 'ACADEMICIAN') {
            const academician = await db_1.default.academicianProfile.findUnique({ where: { userId: req.user.id } });
            if (!academician) {
                res.status(404).json({ message: 'Academician profile not found. Please complete your profile.' });
                return;
            }
            academicianId = academician.id;
            const existing = await db_1.default.collaborationApplication.findFirst({
                where: { collaborationId: id, academicianId: academician.id },
            });
            if (existing) {
                res.status(400).json({ message: `You have already applied (Status: ${existing.status}).` });
                return;
            }
        }
        else if (req.user.role === 'INSTITUTION') {
            const institution = await db_1.default.institutionProfile.findUnique({ where: { userId: req.user.id } });
            if (!institution) {
                res.status(404).json({ message: 'Institution profile not found.' });
                return;
            }
            institutionId = institution.id;
            const existing = await db_1.default.collaborationApplication.findFirst({
                where: { collaborationId: id, institutionId: institution.id },
            });
            if (existing) {
                res.status(400).json({ message: `Your institution has already applied (Status: ${existing.status}).` });
                return;
            }
        }
        else {
            res.status(403).json({ message: 'Industry partners cannot apply to collaboration initiatives.' });
            return;
        }
        const application = await db_1.default.collaborationApplication.create({
            data: {
                collaborationId: id,
                applicantRole,
                studentId,
                academicianId,
                institutionId,
                proposal,
                status: 'APPLIED',
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'APPLY_COLLABORATION',
                entityType: 'CollaborationApplication',
                entityId: application.id,
                details: JSON.stringify({ collaborationId: id, role: applicantRole, title: collab.title }),
            },
        });
        // Notify applicant and initiator
        await (0, notificationController_1.sendNotification)({
            userId: req.user.id,
            title: 'Initiative Application Submitted',
            message: `Your application for '${collab.title}' has been submitted successfully.`,
            link: '/student/collaboration',
        });
        await (0, notificationController_1.sendNotification)({
            userId: collab.initiatorId,
            title: 'New Initiative Application',
            message: `New participant proposal received for '${collab.title}'.`,
            link: '/academician/opportunities',
        });
        res.status(201).json({
            message: 'Application submitted successfully!',
            application,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to submit application.' });
    }
};
exports.applyToCollaboration = applyToCollaboration;
// 7. Get Applicants for Collaboration (Initiator only)
const getCollaborationApplicants = async (req, res) => {
    try {
        const id = req.params.id;
        const collab = await db_1.default.collaboration.findUnique({ where: { id } });
        if (!collab) {
            res.status(404).json({ message: 'Collaboration not found.' });
            return;
        }
        if (collab.initiatorId !== req.user.id) {
            res.status(403).json({ message: 'Only the initiator can view applicants.' });
            return;
        }
        const applicants = await db_1.default.collaborationApplication.findMany({
            where: { collaborationId: id },
            include: {
                student: {
                    include: {
                        user: { select: { email: true } },
                    },
                },
                academician: {
                    include: {
                        user: { select: { email: true } },
                    },
                },
                institution: {
                    include: {
                        user: { select: { email: true } },
                    },
                },
            },
            orderBy: { appliedAt: 'desc' },
        });
        res.json(applicants);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch applicants.' });
    }
};
exports.getCollaborationApplicants = getCollaborationApplicants;
// 8. Accept / Reject Applicant Status (Initiator only)
const updateApplicantStatus = async (req, res) => {
    try {
        const id = req.params.id; // Application ID
        const { status } = req.body;
        const validStatuses = ['APPLIED', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'WITHDRAWN'];
        const normalizedStatus = status?.toUpperCase();
        if (!normalizedStatus || !validStatuses.includes(normalizedStatus)) {
            res.status(400).json({
                message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
            });
            return;
        }
        const application = await db_1.default.collaborationApplication.findUnique({
            where: { id },
            include: { collaboration: true },
        });
        if (!application) {
            res.status(404).json({ message: 'Application not found.' });
            return;
        }
        if (application.collaboration?.initiatorId !== req.user.id) {
            res.status(403).json({ message: 'Only the initiator can update applicant status.' });
            return;
        }
        const updated = await db_1.default.collaborationApplication.update({
            where: { id },
            data: { status: normalizedStatus },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'UPDATE_COLLABORATION_APPLICATION_STATUS',
                entityType: 'CollaborationApplication',
                entityId: id,
                details: JSON.stringify({ status: normalizedStatus, collaborationId: application.collaborationId }),
            },
        });
        // Find target applicant userId to notify
        let applicantUserId = null;
        if (application.studentId) {
            const st = await db_1.default.studentProfile.findUnique({ where: { id: application.studentId }, select: { userId: true } });
            applicantUserId = st?.userId || null;
        }
        else if (application.academicianId) {
            const ac = await db_1.default.academicianProfile.findUnique({ where: { id: application.academicianId }, select: { userId: true } });
            applicantUserId = ac?.userId || null;
        }
        else if (application.institutionId) {
            const ins = await db_1.default.institutionProfile.findUnique({ where: { id: application.institutionId }, select: { userId: true } });
            applicantUserId = ins?.userId || null;
        }
        if (applicantUserId) {
            await (0, notificationController_1.sendNotification)({
                userId: applicantUserId,
                title: `Participation Status: ${normalizedStatus}`,
                message: `Your participation status for '${application.collaboration.title}' was updated to ${normalizedStatus}.`,
                link: '/student/collaboration',
            });
        }
        res.json({
            message: `Applicant status updated to ${normalizedStatus}.`,
            application: updated,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update applicant status.' });
    }
};
exports.updateApplicantStatus = updateApplicantStatus;
// 9. Track My Applications (Student, Academician, Institution)
const getMyApplications = async (req, res) => {
    try {
        let whereClause = {};
        if (req.user.role === 'STUDENT') {
            const s = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
            if (!s) {
                res.status(404).json({ message: 'Student profile not found.' });
                return;
            }
            whereClause = { studentId: s.id };
        }
        else if (req.user.role === 'ACADEMICIAN') {
            const a = await db_1.default.academicianProfile.findUnique({ where: { userId: req.user.id } });
            if (!a) {
                res.status(404).json({ message: 'Academician profile not found.' });
                return;
            }
            whereClause = { academicianId: a.id };
        }
        else if (req.user.role === 'INSTITUTION') {
            const inst = await db_1.default.institutionProfile.findUnique({ where: { userId: req.user.id } });
            if (!inst) {
                res.status(404).json({ message: 'Institution profile not found.' });
                return;
            }
            whereClause = { institutionId: inst.id };
        }
        else {
            res.status(403).json({ message: 'Only applicants can view their applied collaborations.' });
            return;
        }
        const applications = await db_1.default.collaborationApplication.findMany({
            where: whereClause,
            include: {
                collaboration: true,
            },
            orderBy: { appliedAt: 'desc' },
        });
        res.json(applications);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch your applications.' });
    }
};
exports.getMyApplications = getMyApplications;
// 10. Track My Created Initiatives (Initiator only)
const getMyCreatedCollaborations = async (req, res) => {
    try {
        const collaborations = await db_1.default.collaboration.findMany({
            where: { initiatorId: req.user.id },
            include: {
                _count: { select: { applications: true, feedbacks: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(collaborations);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch created initiatives.' });
    }
};
exports.getMyCreatedCollaborations = getMyCreatedCollaborations;
// 11. Submit Collaboration Feedback / Review
const submitCollaborationFeedback = async (req, res) => {
    try {
        const id = req.params.id; // collaborationId
        const { rating, comments, applicationId } = req.body;
        if (!rating || rating < 1 || rating > 5) {
            res.status(400).json({ message: 'Rating must be an integer between 1 and 5.' });
            return;
        }
        if (!comments || !comments.trim()) {
            res.status(400).json({ message: 'Comments are required.' });
            return;
        }
        const collab = await db_1.default.collaboration.findUnique({
            where: { id },
            include: { applications: true },
        });
        if (!collab) {
            res.status(404).json({ message: 'Collaboration initiative not found.' });
            return;
        }
        // Resolve user display name
        let userName = req.user.email;
        if (req.user.role === 'STUDENT') {
            const s = await db_1.default.studentProfile.findUnique({ where: { userId: req.user.id } });
            if (s)
                userName = s.fullName;
        }
        else if (req.user.role === 'ACADEMICIAN') {
            const a = await db_1.default.academicianProfile.findUnique({ where: { userId: req.user.id } });
            if (a)
                userName = a.fullName;
        }
        else if (req.user.role === 'INDUSTRY') {
            const ind = await db_1.default.industryProfile.findUnique({ where: { userId: req.user.id } });
            if (ind)
                userName = ind.companyName;
        }
        else if (req.user.role === 'INSTITUTION') {
            const inst = await db_1.default.institutionProfile.findUnique({ where: { userId: req.user.id } });
            if (inst)
                userName = inst.institutionName;
        }
        const feedback = await db_1.default.collaborationFeedback.create({
            data: {
                collaborationId: id,
                applicationId: applicationId || null,
                userId: req.user.id,
                userRole: req.user.role,
                userName,
                rating: Math.round(Number(rating)),
                comments: comments.trim(),
            },
        });
        await db_1.default.auditLog.create({
            data: {
                userId: req.user.id,
                action: 'SUBMIT_COLLABORATION_FEEDBACK',
                entityType: 'CollaborationFeedback',
                entityId: feedback.id,
                details: JSON.stringify({ collaborationId: id, rating, role: req.user.role }),
            },
        });
        res.status(201).json({
            message: 'Feedback submitted successfully!',
            feedback,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to submit feedback.' });
    }
};
exports.submitCollaborationFeedback = submitCollaborationFeedback;
// 12. Get Collaboration Feedback List
const getCollaborationFeedback = async (req, res) => {
    try {
        const id = req.params.id;
        const feedbacks = await db_1.default.collaborationFeedback.findMany({
            where: { collaborationId: id },
            orderBy: { createdAt: 'desc' },
        });
        const avgRating = feedbacks.length > 0
            ? Number((feedbacks.reduce((sum, f) => sum + f.rating, 0) / feedbacks.length).toFixed(1))
            : null;
        res.json({
            collaborationId: id,
            count: feedbacks.length,
            averageRating: avgRating,
            feedbacks,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch feedback.' });
    }
};
exports.getCollaborationFeedback = getCollaborationFeedback;
// -------------------------------------------------------------
// Existing Mentorship Program Endpoints (Preserved for compatibility)
// -------------------------------------------------------------
const getMentorshipPrograms = async (_req, res) => {
    try {
        const programs = await db_1.default.mentorshipProgram.findMany({
            where: { isAccepting: true },
            include: {
                mentor: {
                    select: {
                        id: true,
                        companyName: true,
                        industrySector: true,
                        contactPerson: true,
                        logoUrl: true,
                    },
                },
                _count: { select: { requests: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        res.json(programs);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch mentorship programs.' });
    }
};
exports.getMentorshipPrograms = getMentorshipPrograms;
const createMentorshipProgram = async (req, res) => {
    try {
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!industry) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        const { title, description, maxMentees, expertiseAreas } = req.body;
        if (!title || !description) {
            res.status(400).json({ message: 'Title and description are required.' });
            return;
        }
        const program = await db_1.default.mentorshipProgram.create({
            data: {
                mentorId: industry.id,
                title,
                description,
                maxMentees: maxMentees ? parseInt(maxMentees, 10) : 5,
                expertiseAreas,
                isAccepting: true,
            },
        });
        res.status(201).json(program);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create mentorship program.' });
    }
};
exports.createMentorshipProgram = createMentorshipProgram;
const requestMentorship = async (req, res) => {
    try {
        const programId = req.params.id;
        const { message } = req.body;
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const existing = await db_1.default.mentorshipRequest.findUnique({
            where: {
                programId_studentId: {
                    programId,
                    studentId: student.id,
                },
            },
        });
        if (existing) {
            res.status(400).json({ message: 'Mentorship request already submitted.' });
            return;
        }
        const request = await db_1.default.mentorshipRequest.create({
            data: {
                programId,
                studentId: student.id,
                message,
                status: 'PENDING',
            },
        });
        res.status(201).json({ message: 'Mentorship request sent.', request });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to submit mentorship request.' });
    }
};
exports.requestMentorship = requestMentorship;
const getMentorshipRequests = async (req, res) => {
    try {
        if (req.user?.role === 'STUDENT') {
            const student = await db_1.default.studentProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!student) {
                res.status(404).json({ message: 'Student not found.' });
                return;
            }
            const requests = await db_1.default.mentorshipRequest.findMany({
                where: { studentId: student.id },
                include: {
                    program: { include: { mentor: true } },
                    sessions: true,
                },
                orderBy: { requestedAt: 'desc' },
            });
            res.json(requests);
            return;
        }
        if (req.user?.role === 'INDUSTRY') {
            const industry = await db_1.default.industryProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!industry) {
                res.status(404).json({ message: 'Industry not found.' });
                return;
            }
            const requests = await db_1.default.mentorshipRequest.findMany({
                where: {
                    program: { mentorId: industry.id },
                },
                include: {
                    student: true,
                    program: true,
                    sessions: true,
                },
                orderBy: { requestedAt: 'desc' },
            });
            res.json(requests);
            return;
        }
        res.status(403).json({ message: 'Unauthorized.' });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch mentorship requests.' });
    }
};
exports.getMentorshipRequests = getMentorshipRequests;
const respondMentorshipRequest = async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        if (!['ACCEPTED', 'REJECTED'].includes(status)) {
            res.status(400).json({ message: "Status must be 'ACCEPTED' or 'REJECTED'." });
            return;
        }
        const updated = await db_1.default.mentorshipRequest.update({
            where: { id },
            data: {
                status,
                respondedAt: new Date(),
            },
        });
        res.json({ message: `Mentorship request ${status.toLowerCase()}.`, updated });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to respond to mentorship request.' });
    }
};
exports.respondMentorshipRequest = respondMentorshipRequest;
