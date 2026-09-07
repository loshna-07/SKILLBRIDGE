"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const academicianController_1 = require("../controllers/academicianController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
// Dashboard, Profile & Recommendations
router.get('/dashboard', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.getAcademicianDashboard);
router.get('/profile', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.getAcademicianProfile);
router.put('/profile', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.updateAcademicianProfile);
router.get('/recommendations', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.getAcademicianRecommendationsController);
// Participations (academician tracking their applied programs)
router.get('/participations', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.getMyParticipations);
router.post('/participations/:id/withdraw', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.withdrawParticipation);
// Opportunities (all 9 modules)
router.get('/opportunities', academicianController_1.getAcademicianOpportunities);
router.post('/opportunities', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'), academicianController_1.createAcademicianOpportunity);
router.post('/opportunities/:id/apply', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.applyToAcademicianOpportunity);
router.get('/opportunities/:id/applicants', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'), academicianController_1.getOpportunityApplicants);
router.get('/opportunities/:id', academicianController_1.getAcademicianOpportunityById);
router.put('/opportunities/:id', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'), academicianController_1.updateAcademicianOpportunity);
router.delete('/opportunities/:id', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'), academicianController_1.deleteAcademicianOpportunity);
// Applicant management
router.put('/applications/:id/status', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'), academicianController_1.updateApplicantStatus);
// Compatibility aliases for legacy collaborations routes
router.post('/collaborations', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'), academicianController_1.createCollaboration);
router.get('/collaborations', academicianController_1.getCollaborations);
router.post('/collaborations/:id/apply', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.applyToAcademicianOpportunity);
router.post('/collaborations/:id/withdraw', (0, authMiddleware_1.authorizeRoles)('ACADEMICIAN'), academicianController_1.withdrawParticipation);
exports.default = router;
