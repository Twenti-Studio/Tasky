import express from 'express';
import { 
  getProfile, 
  getEarnings, 
  getWithdrawals, 
  requestWithdrawal 
} from '../controllers/userController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/profile', getProfile);
router.get('/earnings', getEarnings);
router.get('/withdrawals', getWithdrawals);
router.post('/withdraw', requestWithdrawal);

export default router;
