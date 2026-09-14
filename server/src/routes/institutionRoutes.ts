import { Router } from 'express';
import {
  getInstitutionDashboard,
  getInstitutionIntelligenceAnalytics,
  getInstitutionBranchAnalyticsController,
  getInstitutionStudents,
  getInstitutionStudentById,
  getInstitutionStudentApplications,
  getInstitutionAcademicians,
  getPendingPortfolioItems,
  verifyPortfolioItem,
  getPublicInstitutionsList,
  approveInstitutionStudent,
  rejectInstitutionStudent,
  approveInstitutionAcademician,
  rejectInstitutionAcademician,
  getInstitutionPartnerships,
  respondInstitutionPartnership,
} from '../controllers/institutionController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Public endpoint for registration and directory (unauthenticated)
router.get('/public-list', getPublicInstitutionsList);

// Authenticated institution & academician routes
router.use(authenticateUser);

router.get('/dashboard', authorizeRoles('INSTITUTION'), getInstitutionDashboard);
router.get('/intelligence', authorizeRoles('INSTITUTION'), getInstitutionIntelligenceAnalytics);
router.get('/analytics', authorizeRoles('INSTITUTION'), getInstitutionIntelligenceAnalytics);
router.get('/branch-analytics', authorizeRoles('INSTITUTION'), getInstitutionBranchAnalyticsController);
router.get('/students', authorizeRoles('INSTITUTION'), getInstitutionStudents);
router.get('/students/:id', authorizeRoles('INSTITUTION'), getInstitutionStudentById);
router.post('/students/:id/approve', authorizeRoles('INSTITUTION'), approveInstitutionStudent);
router.post('/students/:id/reject', authorizeRoles('INSTITUTION'), rejectInstitutionStudent);
router.get('/applications', authorizeRoles('INSTITUTION'), getInstitutionStudentApplications);
router.get('/academicians', authorizeRoles('INSTITUTION'), getInstitutionAcademicians);
router.post('/academicians/:id/approve', authorizeRoles('INSTITUTION'), approveInstitutionAcademician);
router.post('/academicians/:id/reject', authorizeRoles('INSTITUTION'), rejectInstitutionAcademician);

// Industry-Institution Partnerships
router.get('/partnerships', authorizeRoles('INSTITUTION'), getInstitutionPartnerships);
router.post('/partnerships/:id/respond', authorizeRoles('INSTITUTION'), respondInstitutionPartnership);

// Portfolio items verification
router.get('/portfolio/pending', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), getPendingPortfolioItems);
router.post('/portfolio/verify', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), verifyPortfolioItem);

export default router;

