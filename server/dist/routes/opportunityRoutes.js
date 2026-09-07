"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const opportunityController_1 = require("../controllers/opportunityController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
// Publicly viewable opportunities, or enriched if authenticated student
router.get('/', authMiddleware_1.authenticateUser, opportunityController_1.getOpportunities);
// Industry management
router.get('/my/created', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.getMyOpportunities);
router.get('/my/applicants', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.getOpportunityApplicants);
router.post('/', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.createOpportunity);
router.put('/applications/:id/status', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.updateApplicationStatus);
router.patch('/applications/:id/status', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.updateApplicationStatus);
router.post('/applications/:id/interview', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.scheduleInterview);
// Single Opportunity & Assessment
router.get('/:id', authMiddleware_1.authenticateUser, opportunityController_1.getOpportunityById);
router.put('/:id', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.updateOpportunity);
router.delete('/:id', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), opportunityController_1.deleteOpportunity);
// Opportunity-Specific Assessment endpoints
router.get('/:id/assessment', authMiddleware_1.authenticateUser, opportunityController_1.getOpportunityAssessment);
router.post('/:id/assessment/submit', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), opportunityController_1.submitOpportunityAssessment);
// Direct apply (for opportunities without assessment)
router.post('/:id/apply', authMiddleware_1.authenticateUser, (0, authMiddleware_1.authorizeRoles)('STUDENT'), opportunityController_1.applyToOpportunity);
exports.default = router;
