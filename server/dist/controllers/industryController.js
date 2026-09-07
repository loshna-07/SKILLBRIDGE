"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIndustryRecommendationsController = exports.getIndustryRecommendedCandidatesController = exports.updateIndustryProfile = exports.getIndustryProfile = void 0;
const db_1 = __importDefault(require("../config/db"));
// Get Industry Profile
const getIndustryProfile = async (req, res) => {
    try {
        const profile = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
            include: {
                user: {
                    select: { id: true, email: true, role: true, createdAt: true },
                },
                opportunities: {
                    include: {
                        skills: { include: { skill: true } },
                        _count: { select: { applications: true } },
                    },
                },
            },
        });
        if (!profile) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        res.json(profile);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch industry profile.' });
    }
};
exports.getIndustryProfile = getIndustryProfile;
// Update Industry Profile
const updateIndustryProfile = async (req, res) => {
    try {
        const { companyName, officialEmail, industrySector, companySize, website, location, description, contactPerson, contactNumber, logoUrl, } = req.body;
        const existing = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!existing) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        const updated = await db_1.default.$transaction(async (tx) => {
            const profile = await tx.industryProfile.update({
                where: { userId: req.user.id },
                data: {
                    companyName: companyName !== undefined ? companyName : undefined,
                    officialEmail: officialEmail !== undefined ? officialEmail : undefined,
                    industrySector: industrySector !== undefined ? industrySector : undefined,
                    companySize: companySize !== undefined ? companySize : undefined,
                    website: website !== undefined ? website : undefined,
                    location: location !== undefined ? location : undefined,
                    description: description !== undefined ? description : undefined,
                    contactPerson: contactPerson !== undefined ? contactPerson : undefined,
                    contactNumber: contactNumber !== undefined ? contactNumber : undefined,
                    logoUrl: logoUrl !== undefined ? logoUrl : undefined,
                },
            });
            await tx.auditLog.create({
                data: {
                    userId: req.user.id,
                    action: 'INDUSTRY_PROFILE_UPDATED',
                    entityType: 'IndustryProfile',
                    entityId: profile.id,
                    details: JSON.stringify({ companyName: profile.companyName }),
                },
            });
            return profile;
        });
        res.json({ message: 'Industry profile updated successfully.', profile: updated });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update industry profile.' });
    }
};
exports.updateIndustryProfile = updateIndustryProfile;
// Get Recommended Candidates for Industry Active Postings
const getIndustryRecommendedCandidatesController = async (req, res) => {
    try {
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!industry) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        const { getIndustryRecommendedCandidates } = await Promise.resolve().then(() => __importStar(require('../services/personalizationService')));
        const result = await getIndustryRecommendedCandidates(industry.id, req.query.opportunityId);
        res.json(result);
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch recommended candidates.' });
    }
};
exports.getIndustryRecommendedCandidatesController = getIndustryRecommendedCandidatesController;
// Get General Industry Recommendations
const getIndustryRecommendationsController = async (req, res) => {
    try {
        const industry = await db_1.default.industryProfile.findUnique({
            where: { userId: req.user.id },
        });
        if (!industry) {
            res.status(404).json({ message: 'Industry profile not found.' });
            return;
        }
        const { getIndustryRecommendedCandidates } = await Promise.resolve().then(() => __importStar(require('../services/personalizationService')));
        const candidates = await getIndustryRecommendedCandidates(industry.id);
        res.json({
            industry,
            recommendedCandidates: candidates.candidates,
            domain: candidates.industryDomain,
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message || 'Failed to fetch industry recommendations.' });
    }
};
exports.getIndustryRecommendationsController = getIndustryRecommendationsController;
