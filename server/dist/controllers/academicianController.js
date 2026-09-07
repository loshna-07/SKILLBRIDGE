"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCollaborations = exports.createCollaboration = exports.updateAcademicianProfile = exports.getAcademicianProfile = exports.getAcademicianDashboard = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAcademicianDashboard = async (req, res) => {
    try {
        const academician = await db_1.default.academicianProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!academician) {
            res.status(404).json({ message: 'Academician profile not found.' });
            return;
        }
        const [fdpCount, facultyInternships, collaborationsCount, totalWorkshops] = await Promise.all([
            db_1.default.learningProgram.count({ where: { type: 'FDP', isPublished: true } }),
            db_1.default.opportunity.count({
                where: {
                    isPublished: true,
                    OR: [
                        { type: 'INTERNSHIP' },
                        { title: { contains: 'Faculty' } },
                        { description: { contains: 'Faculty' } },
                    ],
                },
            }),
            db_1.default.collaboration.count({ where: { initiatorId: academician.id } }),
            db_1.default.learningProgram.count({ where: { type: 'WORKSHOP', isPublished: true } }),
        ]);
        const recentCollaborations = await db_1.default.collaboration.findMany({
            where: { initiatorId: academician.id },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        const recentPrograms = await db_1.default.learningProgram.findMany({
            where: {
                isPublished: true,
                type: { in: ['FDP', 'WORKSHOP'] },
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
        });
        res.json({
            academician,
            stats: {
                fdpCount,
                facultyInternships,
                collaborationsCount,
                totalWorkshops,
            },
            recentCollaborations,
            recentPrograms,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch academician dashboard.' });
    }
};
exports.getAcademicianDashboard = getAcademicianDashboard;
const getAcademicianProfile = async (req, res) => {
    try {
        const profile = await db_1.default.academicianProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!profile) {
            res.status(404).json({ message: 'Profile not found.' });
            return;
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch profile.' });
    }
};
exports.getAcademicianProfile = getAcademicianProfile;
const updateAcademicianProfile = async (req, res) => {
    try {
        const { fullName, phone, institutionName, department, designation, yearsOfExperience, areasOfExpertise, location, bio, } = req.body;
        const updated = await db_1.default.academicianProfile.update({
            where: { userId: req.user.id },
            data: {
                fullName,
                phone,
                institutionName,
                department,
                designation,
                yearsOfExperience: yearsOfExperience ? parseInt(yearsOfExperience, 10) : undefined,
                areasOfExpertise,
                location,
                bio,
            },
        });
        res.json({ message: 'Profile updated successfully.', profile: updated });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update profile.' });
    }
};
exports.updateAcademicianProfile = updateAcademicianProfile;
// Create Collaboration / Consultancy / Research proposal
const createCollaboration = async (req, res) => {
    try {
        const { title, type, description, targetAudience, budget, startDate, endDate } = req.body;
        if (!title || !type || !description) {
            res.status(400).json({ message: 'Title, type, and description are required.' });
            return;
        }
        const collaboration = await db_1.default.collaboration.create({
            data: {
                initiatorId: req.user.id,
                initiatorRole: req.user.role,
                title,
                type,
                description,
                targetAudience,
                budget,
                startDate,
                endDate,
                status: 'OPEN',
            },
        });
        res.status(201).json(collaboration);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create collaboration.' });
    }
};
exports.createCollaboration = createCollaboration;
const getCollaborations = async (req, res) => {
    try {
        const { type } = req.query;
        const whereClause = {};
        if (type && typeof type === 'string' && type !== 'ALL') {
            whereClause.type = type;
        }
        const collaborations = await db_1.default.collaboration.findMany({
            where: whereClause,
            orderBy: { createdAt: 'desc' },
        });
        res.json(collaborations);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch collaborations.' });
    }
};
exports.getCollaborations = getCollaborations;
