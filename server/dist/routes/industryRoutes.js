"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const industryController_1 = require("../controllers/industryController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Industry Profile & Personalization Routes
router.get('/profile', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), industryController_1.getIndustryProfile);
router.put('/profile', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), industryController_1.updateIndustryProfile);
router.get('/recommended-candidates', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), industryController_1.getIndustryRecommendedCandidatesController);
router.get('/recommendations', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), industryController_1.getIndustryRecommendationsController);
exports.default = router;
