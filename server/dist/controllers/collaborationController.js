"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.respondMentorshipRequest = exports.getMentorshipRequests = exports.requestMentorship = exports.createMentorshipProgram = exports.getMentorshipPrograms = void 0;
const db_1 = __importDefault(require("../config/db"));
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
