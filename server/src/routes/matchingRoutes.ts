import { Router } from 'express';
import {
  getWeights,
  updateWeights,
  matchOpportunity,
  matchLearningProgram,
  calculateCustomMatch,
} from '../controllers/matchingController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

// Configurable weights
router.get('/weights', getWeights);
router.put('/weights', authenticateUser, authorizeRoles('INSTITUTION', 'ACADEMICIAN'), updateWeights);

// Matching endpoints
router.get('/opportunity/:id', authenticateUser, matchOpportunity);
router.get('/learning-program/:id', authenticateUser, matchLearningProgram);
router.post('/calculate', authenticateUser, calculateCustomMatch);

export default router;
