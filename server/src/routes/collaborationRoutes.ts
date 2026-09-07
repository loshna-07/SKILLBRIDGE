import { Router } from 'express';
import {
  getCollaborations,
  getCollaborationById,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
  applyToCollaboration,
  getCollaborationApplicants,
  updateApplicantStatus,
  getMyApplications,
  getMyCreatedCollaborations,
  submitCollaborationFeedback,
  getCollaborationFeedback,
  getMentorshipPrograms,
  createMentorshipProgram,
  requestMentorship,
  getMentorshipRequests,
  respondMentorshipRequest,
} from '../controllers/collaborationController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

// 1. My Applications / Participations tracking
router.get('/my/applications', getMyApplications);
router.get('/my/created', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), getMyCreatedCollaborations);

// 2. Applicant Status Management
router.put(
  '/applications/:id/status',
  authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'),
  updateApplicantStatus
);

// 3. Mentorship Programs (Preserved)
router.get('/mentorship', getMentorshipPrograms);
router.post('/mentorship', authorizeRoles('INDUSTRY'), createMentorshipProgram);
router.post('/mentorship/:id/request', authorizeRoles('STUDENT'), requestMentorship);
router.get('/mentorship/requests', getMentorshipRequests);
router.put('/mentorship/requests/:id/respond', authorizeRoles('INDUSTRY'), respondMentorshipRequest);

// 4. Feedback
router.post('/:id/feedback', submitCollaborationFeedback);
router.get('/:id/feedback', getCollaborationFeedback);

// 5. Applicants
router.get(
  '/:id/applicants',
  authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'),
  getCollaborationApplicants
);

// 6. Apply
router.post(
  '/:id/apply',
  authorizeRoles('STUDENT', 'ACADEMICIAN', 'INSTITUTION'),
  applyToCollaboration
);

// 7. Core CRUD
router.get('/', getCollaborations);
router.get('/:id', getCollaborationById);
router.post('/', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), createCollaboration);
router.put('/:id', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), updateCollaboration);
router.delete('/:id', authorizeRoles('INDUSTRY', 'INSTITUTION', 'ACADEMICIAN'), deleteCollaboration);

export default router;
