import express from 'express';
import { login, logout, me, register, resendVerification, verifyEmail } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', authenticate, me);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', authenticate, resendVerification);

export default router;
