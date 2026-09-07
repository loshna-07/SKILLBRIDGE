import { Router } from 'express';
import { getPublicStats, getWeights, updateWeights } from '../controllers/statsController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/public', getPublicStats);
router.get('/weights', getWeights);
router.put('/weights', authenticateUser, authorizeRoles('INSTITUTION'), updateWeights);

export default router;
