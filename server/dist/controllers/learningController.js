"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrollInProgram = exports.createLearningProgram = exports.getLearningProgramById = exports.getLearningPrograms = void 0;
const db_1 = __importDefault(require("../config/db"));
const getLearningPrograms = async (req, res) => {
    try {
        const { type, search } = req.query;
        const whereClause = { isPublished: true };
        if (type && typeof type === 'string' && type !== 'ALL') {
            whereClause.type = type;
        }
        if (search && typeof search === 'string') {
            whereClause.OR = [
                { title: { contains: search } },
                { description: { contains: search } },
            ];
        }
        const programs = await db_1.default.learningProgram.findMany({
            where: whereClause,
            include: {
                skills: { include: { skill: true } },
                _count: { select: { enrollments: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        let studentWeakSkills = new Set();
        let enrolledProgramIds = new Set();
        if (req.user?.role === 'STUDENT') {
            const student = await db_1.default.studentProfile.findUnique({
                where: { userId: req.user.id },
                include: {
                    skillProfiles: true,
                    learningEnrollments: true,
                },
            });
            if (student) {
                student.learningEnrollments.forEach((e) => enrolledProgramIds.add(e.programId));
                student.skillProfiles
                    .filter((sp) => sp.scorePercentage < 60 || sp.proficiencyLevel === 'BEGINNER')
                    .forEach((sp) => studentWeakSkills.add(sp.skillId));
            }
        }
        const enhanced = programs.map((p) => {
            const addressesGap = p.skills.some((s) => studentWeakSkills.has(s.skillId));
            const isEnrolled = enrolledProgramIds.has(p.id);
            return {
                ...p,
                addressesGap,
                isEnrolled,
            };
        });
        res.json(enhanced);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch learning programs.' });
    }
};
exports.getLearningPrograms = getLearningPrograms;
const getLearningProgramById = async (req, res) => {
    try {
        const id = req.params.id;
        const program = await db_1.default.learningProgram.findUnique({
            where: { id },
            include: {
                skills: { include: { skill: true } },
                _count: { select: { enrollments: true } },
            },
        });
        if (!program) {
            res.status(404).json({ message: 'Learning program not found.' });
            return;
        }
        let isEnrolled = false;
        let enrollment = null;
        if (req.user?.role === 'STUDENT') {
            const student = await db_1.default.studentProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (student) {
                enrollment = await db_1.default.learningEnrollment.findUnique({
                    where: {
                        studentId_programId: {
                            studentId: student.id,
                            programId: program.id,
                        },
                    },
                });
                isEnrolled = !!enrollment;
            }
        }
        res.json({
            ...program,
            isEnrolled,
            enrollment,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch program details.' });
    }
};
exports.getLearningProgramById = getLearningProgramById;
const createLearningProgram = async (req, res) => {
    try {
        const { title, type, description, duration, url, mode, price, startDate, skillIds } = req.body;
        if (!title || !type || !description) {
            res.status(400).json({ message: 'Title, type, and description are required.' });
            return;
        }
        const program = await db_1.default.$transaction(async (tx) => {
            const created = await tx.learningProgram.create({
                data: {
                    providerId: req.user.id,
                    providerRole: req.user.role,
                    title,
                    type,
                    description,
                    duration,
                    url,
                    mode: mode || 'ONLINE',
                    price: price || 'Free',
                    startDate,
                    isPublished: true,
                },
            });
            if (Array.isArray(skillIds) && skillIds.length > 0) {
                for (const sId of skillIds) {
                    await tx.learningProgramSkill.create({
                        data: {
                            programId: created.id,
                            skillId: typeof sId === 'string' ? sId : sId.skillId,
                        },
                    });
                }
            }
            await tx.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'LEARNING_PROGRAM_CREATED',
                    entityType: 'LearningProgram',
                    entityId: created.id,
                    details: JSON.stringify({ title, type }),
                },
            });
            return created;
        });
        res.status(201).json(program);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create learning program.' });
    }
};
exports.createLearningProgram = createLearningProgram;
const enrollInProgram = async (req, res) => {
    try {
        const programId = req.params.id;
        const student = await db_1.default.studentProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!student) {
            res.status(404).json({ message: 'Student profile not found.' });
            return;
        }
        const existing = await db_1.default.learningEnrollment.findUnique({
            where: {
                studentId_programId: {
                    studentId: student.id,
                    programId,
                },
            },
        });
        if (existing) {
            res.status(400).json({ message: 'Already enrolled in this program.' });
            return;
        }
        const enrollment = await db_1.default.learningEnrollment.create({
            data: {
                studentId: student.id,
                programId,
                status: 'ENROLLED',
            },
        });
        res.status(201).json({ message: 'Successfully enrolled.', enrollment });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to enroll.' });
    }
};
exports.enrollInProgram = enrollInProgram;
