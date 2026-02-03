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
import { auth } from '../middleware/auth.js';

const router = express.Router();

// User routes
router.post('/', auth, createReport);
router.get('/my-reports', auth, getUserReports);
router.get('/:id', auth, getReport);

// Admin routes
router.get('/', auth, adminAuth, getAllReports);
router.patch('/:id', auth, adminAuth, updateReportStatus);
router.delete('/:id', auth, adminAuth, deleteReport);

export default router;
