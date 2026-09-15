import { Router } from 'express';
import { getPublicStats, getWeights, updateWeights, inspectStudents } from '../controllers/statsController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/public', getPublicStats);
router.get('/inspect-students', inspectStudents);
router.get('/weights', getWeights);
router.put('/weights', authenticateUser, authorizeRoles('INSTITUTION'), updateWeights);

export default router;
