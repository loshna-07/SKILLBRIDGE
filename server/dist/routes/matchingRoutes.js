"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const matchingController_1 = require("../controllers/matchingController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Configurable weights
router.get('/weights', matchingController_1.getWeights);
router.put('/weights', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INSTITUTION', 'ACADEMICIAN'), matchingController_1.updateWeights);
// Matching endpoints
router.get('/opportunity/:id', authMiddleware_1.authenticateUser, matchingController_1.matchOpportunity);
router.get('/learning-program/:id', authMiddleware_1.authenticateUser, matchingController_1.matchLearningProgram);
router.post('/calculate', authMiddleware_1.authenticateUser, matchingController_1.calculateCustomMatch);
exports.default = router;
