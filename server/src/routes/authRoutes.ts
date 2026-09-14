import { Router } from 'express';
import {
  register,
  login,
  logout,
  getMe,
  requestOtp,
  verifyOtp,
  resendOtp,
} from '../controllers/authController';
import { authenticateUser } from '../middleware/authMiddleware';

const router = Router();

// OTP-Based Authentication
router.post('/request-otp', requestOtp);
router.post('/verify-otp', verifyOtp);
router.post('/resend-otp', resendOtp);

// Standard / Fallback Authentication
router.post('/register', register);
router.post('/login', login);
router.post('/logout', authenticateUser, logout);
router.get('/me', authenticateUser, getMe);

export default router;

