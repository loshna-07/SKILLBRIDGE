import { Router } from 'express';
import { getPublicStats, getWeights, updateWeights, inspectStudents, deleteTargetedTestStudents } from '../controllers/statsController';
import { authenticateUser, authorizeRoles } from '../middleware/authMiddleware';

const router = Router();

router.get('/public', getPublicStats);
router.get('/inspect-students', inspectStudents);
router.post('/delete-target-students', deleteTargetedTestStudents);
router.get('/weights', getWeights);
router.put('/weights', authenticateUser, authorizeRoles('INSTITUTION'), updateWeights);

export default router;
