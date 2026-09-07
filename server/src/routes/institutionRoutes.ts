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
} from '../controllers/institutionController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

router.get('/dashboard', authorizeRoles('INSTITUTION'), getInstitutionDashboard);
router.get('/intelligence', authorizeRoles('INSTITUTION'), getInstitutionIntelligenceAnalytics);
router.get('/analytics', authorizeRoles('INSTITUTION'), getInstitutionIntelligenceAnalytics);
router.get('/branch-analytics', authorizeRoles('INSTITUTION'), getInstitutionBranchAnalyticsController);
router.get('/students', authorizeRoles('INSTITUTION'), getInstitutionStudents);
router.get('/students/:id', authorizeRoles('INSTITUTION'), getInstitutionStudentById);
router.get('/applications', authorizeRoles('INSTITUTION'), getInstitutionStudentApplications);
router.get('/academicians', authorizeRoles('INSTITUTION'), getInstitutionAcademicians);
router.get('/portfolio/pending', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), getPendingPortfolioItems);
router.post('/portfolio/verify', authorizeRoles('INSTITUTION', 'ACADEMICIAN'), verifyPortfolioItem);

export default router;
