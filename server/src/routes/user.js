import express from 'express';
import {
  changePassword,
  getEarnings,
  getProfile,
  getWithdrawals,
  requestWithdrawal,
  updateBankAccount,
  updateProfile
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/earnings', getEarnings);
router.get('/withdrawals', getWithdrawals);
router.post('/withdraw', requestWithdrawal);
router.put('/bank-account', updateBankAccount);
router.post('/change-password', changePassword);

export default router;
