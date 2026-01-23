import express from 'express';
import { 
  trackImpression, 
  completeImpression, 
  getImpressions,
  monetagCallback 
} from '../controllers/monetagController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Public endpoint for Monetag callbacks (both GET and POST)
router.get('/callback', monetagCallback);
router.post('/callback', monetagCallback);

// V1 API endpoint for Monetag postback
router.get('/v1/callback/monetag', monetagCallback);
router.post('/v1/callback/monetag', monetagCallback);

// Protected endpoints
router.post('/track', authenticate, trackImpression);
router.post('/complete', authenticate, completeImpression);
router.get('/impressions', authenticate, getImpressions);

export default router;
