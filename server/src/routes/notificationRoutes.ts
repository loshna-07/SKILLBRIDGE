import { Router } from 'express';
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notificationController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateUser);

router.get('/', getMyNotifications);
router.patch('/:id/read', markAsRead);
router.post('/:id/read', markAsRead);
router.patch('/read-all', markAllAsRead);
router.post('/read-all', markAllAsRead);

export default router;
