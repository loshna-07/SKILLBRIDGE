"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWeights = exports.getWeights = exports.getPublicStats = void 0;
const db_1 = __importDefault(require("../config/db"));
const analyticsService_1 = require("../services/analyticsService");
const matchingEngine_1 = require("../services/matchingEngine");
const getPublicStats = async (_req, res) => {
    try {
        const stats = await (0, analyticsService_1.getPublicPlatformStats)();
        res.json(stats);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch platform statistics.' });
    }
};
exports.getPublicStats = getPublicStats;
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
const updateWeights = async (req, res) => {
    try {
        const { skillWeight, assessmentWeight, cgpaWeight, academicWeight } = req.body;
        const total = parseFloat(skillWeight) +
            parseFloat(assessmentWeight) +
            parseFloat(cgpaWeight) +
            parseFloat(academicWeight);
        if (Math.abs(total - 1.0) > 0.05) {
            res.status(400).json({ message: 'Weights must sum to approximately 1.0 (100%).' });
            return;
        }
        const value = JSON.stringify({
            skillWeight: parseFloat(skillWeight),
            assessmentWeight: parseFloat(assessmentWeight),
            cgpaWeight: parseFloat(cgpaWeight),
            academicWeight: parseFloat(academicWeight),
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
        res.json({ message: 'Matching weights updated successfully.', setting });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update weights.' });
    }
};
exports.updateWeights = updateWeights;
