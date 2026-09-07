"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const collaborationController_1 = require("../controllers/collaborationController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.use(authMiddleware_1.authenticateUser);
// 1. My Applications / Participations tracking
router.get('/my/applications', collaborationController_1.getMyApplications);
router.get('/my/created', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), collaborationController_1.getMyCreatedCollaborations);
// 2. Applicant Status Management
router.put('/applications/:id/status', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), collaborationController_1.updateApplicantStatus);
// 3. Mentorship Programs (Preserved)
router.get('/mentorship', collaborationController_1.getMentorshipPrograms);
router.post('/mentorship', (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), collaborationController_1.createMentorshipProgram);
router.post('/mentorship/:id/request', (0, authMiddleware_1.authorizeRoles)('STUDENT'), collaborationController_1.requestMentorship);
router.get('/mentorship/requests', collaborationController_1.getMentorshipRequests);
router.put('/mentorship/requests/:id/respond', (0, authMiddleware_1.authorizeRoles)('INDUSTRY'), collaborationController_1.respondMentorshipRequest);
// 4. Feedback
router.post('/:id/feedback', collaborationController_1.submitCollaborationFeedback);
router.get('/:id/feedback', collaborationController_1.getCollaborationFeedback);
// 5. Applicants
router.get('/:id/applicants', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), collaborationController_1.getCollaborationApplicants);
// 6. Apply
router.post('/:id/apply', (0, authMiddleware_1.authorizeRoles)('STUDENT', 'ACADEMICIAN', 'INSTITUTION'), collaborationController_1.applyToCollaboration);
// 7. Core CRUD
router.get('/', collaborationController_1.getCollaborations);
router.get('/:id', collaborationController_1.getCollaborationById);
router.post('/', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), collaborationController_1.createCollaboration);
router.put('/:id', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), collaborationController_1.updateCollaboration);
router.delete('/:id', (0, authMiddleware_1.authorizeRoles)('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), collaborationController_1.deleteCollaboration);
exports.default = router;
