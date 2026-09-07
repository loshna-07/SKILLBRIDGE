"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateCustomMatch = exports.matchLearningProgram = exports.matchOpportunity = exports.updateWeights = exports.getWeights = void 0;
const db_1 = __importDefault(require("../config/db"));
const matchingEngine_1 = require("../services/matchingEngine");
// Get Current Configured Platform Weights
const getWeights = async (_req, res) => {
    try {
        const weights = await (0, matchingEngine_1.getPlatformWeights)();
        res.json(weights);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch matching weights.' });
    }
};
exports.getWeights = getWeights;
// Update Configurable Platform Weights (Institution / Academician)
const updateWeights = async (req, res) => {
    try {
        const { skillWeight, assessmentWeight, cgpaWeight, academicWeight } = req.body;
        const sW = parseFloat(skillWeight);
        const aW = parseFloat(assessmentWeight);
        const cW = parseFloat(cgpaWeight);
        const acW = parseFloat(academicWeight);
        if (isNaN(sW) || isNaN(aW) || isNaN(cW) || isNaN(acW)) {
            res.status(400).json({ message: 'All four weights must be valid numbers.' });
            return;
        }
        const total = sW + aW + cW + acW;
        if (Math.abs(total - 1.0) > 0.05) {
            res.status(400).json({ message: `Weights must sum to 1.0 (current sum: ${total.toFixed(2)}).` });
            return;
        }
        const value = JSON.stringify({
            skillWeight: sW,
            assessmentWeight: aW,
            cgpaWeight: cW,
            academicWeight: acW,
        });
        const setting = await db_1.default.platformSetting.upsert({
            where: { key: 'MATCHING_WEIGHTS' },
            update: { value },
            create: {
                key: 'MATCHING_WEIGHTS',
                value,
                description: 'Configurable weights for the SkillBridge matching algorithm',
            },
        });
        res.json({
            message: 'Matching weights updated successfully.',
            weights: JSON.parse(setting.value),
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update matching weights.' });
    }
};
exports.updateWeights = updateWeights;
// Match Opportunity (Internship or Job)
const matchOpportunity = async (req, res) => {
    try {
        const opportunityId = req.params.id;
        let studentId = req.query.studentId;
        if (!studentId) {
            if (req.user?.role !== 'STUDENT') {
                res.status(400).json({ message: 'studentId query param is required for non-student roles.' });
                return;
            }
            const student = await db_1.default.studentProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!student) {
                res.status(404).json({ message: 'Student profile not found.' });
                return;
            }
            studentId = student.id;
        }
        const result = await (0, matchingEngine_1.calculateOpportunityMatch)(studentId, opportunityId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to calculate opportunity match.' });
    }
};
exports.matchOpportunity = matchOpportunity;
// Match Learning Program
const matchLearningProgram = async (req, res) => {
    try {
        const programId = req.params.id;
        let studentId = req.query.studentId;
        if (!studentId) {
            if (req.user?.role !== 'STUDENT') {
                res.status(400).json({ message: 'studentId query param is required for non-student roles.' });
                return;
            }
            const student = await db_1.default.studentProfile.findUnique({
                where: { userId: req.user.id },
            });
            if (!student) {
                res.status(404).json({ message: 'Student profile not found.' });
                return;
            }
            studentId = student.id;
        }
        const result = await (0, matchingEngine_1.calculateLearningProgramMatch)(studentId, programId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to calculate learning program match.' });
    }
};
exports.matchLearningProgram = matchLearningProgram;
// Unified Custom Simulation / Calculation Endpoint
const calculateCustomMatch = async (req, res) => {
    try {
        const { studentId, entityType, entityId, customWeights } = req.body;
        let targetStudentId = studentId;
        if (!targetStudentId) {
            if (req.user?.role === 'STUDENT') {
                const student = await db_1.default.studentProfile.findUnique({
                    where: { userId: req.user.id },
                });
                targetStudentId = student?.id;
            }
        }
        if (!targetStudentId || !entityType || !entityId) {
            res.status(400).json({ message: 'studentId, entityType, and entityId are required.' });
            return;
        }
        if (entityType === 'OPPORTUNITY' || entityType === 'INTERNSHIP' || entityType === 'JOB') {
            const result = await (0, matchingEngine_1.calculateOpportunityMatch)(targetStudentId, entityId, customWeights);
            res.json(result);
        }
        else if (entityType === 'LEARNING_PROGRAM') {
            const result = await (0, matchingEngine_1.calculateLearningProgramMatch)(targetStudentId, entityId, customWeights);
            res.json(result);
        }
        else {
            res.status(400).json({ message: `Unsupported entityType: ${entityType}. Use 'OPPORTUNITY' or 'LEARNING_PROGRAM'.` });
        }
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to execute custom match calculation.' });
    }
};
exports.calculateCustomMatch = calculateCustomMatch;
