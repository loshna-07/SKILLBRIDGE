import { Router } from 'express';
import {
  getAcademicianDashboard,
  getAcademicianProfile,
  updateAcademicianProfile,
  getAcademicianOpportunities,
  getAcademicianOpportunityById,
  createAcademicianOpportunity,
  updateAcademicianOpportunity,
  deleteAcademicianOpportunity,
  applyToAcademicianOpportunity,
  getMyParticipations,
  withdrawParticipation,
  getOpportunityApplicants,
  updateApplicantStatus,
  createCollaboration,
  getCollaborations,
  getAcademicianRecommendationsController,
} from '../controllers/academicianController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

// Dashboard, Profile & Recommendations
router.get('/dashboard', authorizeRoles('ACADEMICIAN'), getAcademicianDashboard);
router.get('/profile', authorizeRoles('ACADEMICIAN'), getAcademicianProfile);
router.put('/profile', authorizeRoles('ACADEMICIAN'), updateAcademicianProfile);
router.get('/recommendations', authorizeRoles('ACADEMICIAN'), getAcademicianRecommendationsController);

// Participations (academician tracking their applied programs)
router.get('/participations', authorizeRoles('ACADEMICIAN'), getMyParticipations);
router.post('/participations/:id/withdraw', authorizeRoles('ACADEMICIAN'), withdrawParticipation);

// Opportunities (all 9 modules)
router.get('/opportunities', getAcademicianOpportunities);
router.post(
  '/opportunities',
  authorizeRoles('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'),
  createAcademicianOpportunity
);
router.post(
  '/opportunities/:id/apply',
  authorizeRoles('ACADEMICIAN'),
  applyToAcademicianOpportunity
);
router.get(
  '/opportunities/:id/applicants',
  authorizeRoles('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'),
  getOpportunityApplicants
);
router.get('/opportunities/:id', getAcademicianOpportunityById);
router.put(
  '/opportunities/:id',
  authorizeRoles('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'),
  updateAcademicianOpportunity
);
router.delete(
  '/opportunities/:id',
  authorizeRoles('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'),
  deleteAcademicianOpportunity
);

// Applicant management
router.put(
  '/applications/:id/status',
  authorizeRoles('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'),
  updateApplicantStatus
);

// Compatibility aliases for legacy collaborations routes
router.post('/collaborations', authorizeRoles('ACADEMICIAN', 'INDUSTRY', 'INSTITUTION'), createCollaboration);
router.get('/collaborations', getCollaborations);
router.post('/collaborations/:id/apply', authorizeRoles('ACADEMICIAN'), applyToAcademicianOpportunity);
router.post('/collaborations/:id/withdraw', authorizeRoles('ACADEMICIAN'), withdrawParticipation);

export default router;
