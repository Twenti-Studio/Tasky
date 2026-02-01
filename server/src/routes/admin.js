import express from 'express';
import {
    getStats,
    getUserDetails,
    getUsers,
    getWithdrawals,
    updateUserStatus,
    updateWithdrawalStatus
} from '../controllers/adminController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication + admin privileges
router.use(authenticate);
router.use(adminAuth);

// Dashboard stats
router.get('/stats', getStats);

// User management
router.get('/users', getUsers);
router.get('/users/:userId', getUserDetails);
router.put('/users/:userId/status', updateUserStatus);

// Withdrawal management
router.get('/withdrawals', getWithdrawals);
router.put('/withdrawals/:withdrawalId', updateWithdrawalStatus);

export default router;
