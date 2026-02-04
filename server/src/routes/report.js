import express from 'express';
import {
    createReport,
    deleteReport,
    getAllReports,
    getReport,
    getUserReports,
    updateReportStatus
} from '../controllers/reportController.js';
import { adminAuth } from '../middleware/adminAuth.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', authenticate, createReport);
router.get('/my-reports', authenticate, getUserReports);
router.get('/:id', authenticate, getReport);

// Admin routes
router.get('/', authenticate, adminAuth, getAllReports);
router.patch('/:id', authenticate, adminAuth, updateReportStatus);
router.delete('/:id', authenticate, adminAuth, deleteReport);

export default router;
