import { Router } from 'express';
import {
  getIndustryProfile,
  updateIndustryProfile,
  getIndustryRecommendedCandidatesController,
  getIndustryRecommendationsController,
} from '../controllers/industryController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Industry Profile & Personalization Routes
router.get('/profile', authenticateUser, authorizeRoles('INDUSTRY'), getIndustryProfile);
router.put('/profile', authenticateUser, authorizeRoles('INDUSTRY'), updateIndustryProfile);
router.get('/recommended-candidates', authenticateUser, authorizeRoles('INDUSTRY'), getIndustryRecommendedCandidatesController);
router.get('/recommendations', authenticateUser, authorizeRoles('INDUSTRY'), getIndustryRecommendationsController);

export default router;
