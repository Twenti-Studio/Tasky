import express from 'express';
const router = express.Router();

// Import controllers
import { bitlabsCallback, getBitlabsSurveys } from '../controllers/bitlabsController.js';
import { cpxCallback, getCpxUrl } from '../controllers/cpxController.js';
import { genericCallback, getProviderUrl } from '../controllers/genericProviderController.js';
import { lootablyCallback } from '../controllers/lootablyController.js';
import { monetagCallback } from '../controllers/monetagController.js';
import { revlumCallback } from '../controllers/revlumController.js';
import { getTheoremreachUrl, theoremreachCallback } from '../controllers/theoremreachController.js';
import { timewallCallback } from '../controllers/timewallController.js';

// Import security middleware
import { authenticate } from '../middleware/auth.js';
import { cpxIpWhitelist, sanitizeInput, simpleRateLimit, verifyCpxHash } from '../middleware/security.js';

/**
 * UNIFIED POSTBACK ROUTING SYSTEM
 * 
 * All provider callbacks use the /api/v1/callback prefix
 * Revenue sharing: 70% user, 30% platform
 */

// ============================================
// CPX RESEARCH (Premium Surveys)
// ============================================
router.get('/cpx', sanitizeInput, cpxIpWhitelist, verifyCpxHash, cpxCallback);
router.get('/cpx/url', authenticate, getCpxUrl);

// ============================================
// MONETAG (Ads - SmartLink, Push, Pop)
// ============================================
router.get('/monetag', sanitizeInput, simpleRateLimit(1000, 60000), monetagCallback);
router.post('/monetag', sanitizeInput, simpleRateLimit(1000, 60000), monetagCallback);

// ============================================
// TIMEWALL (Micro Tasks)
// ============================================
router.get('/timewall', sanitizeInput, simpleRateLimit(500, 60000), timewallCallback);
router.post('/timewall', sanitizeInput, simpleRateLimit(500, 60000), timewallCallback);

// ============================================
// BITLABS (Surveys & Offers)
// ============================================
router.get('/bitlabs', sanitizeInput, simpleRateLimit(500, 60000), bitlabsCallback);
router.post('/bitlabs', sanitizeInput, simpleRateLimit(500, 60000), bitlabsCallback);
router.get('/bitlabs/surveys', authenticate, getBitlabsSurveys);

// ============================================
// LOOTABLY (Video & Offers)
// ============================================
router.get('/lootably', sanitizeInput, simpleRateLimit(500, 60000), lootablyCallback);
router.post('/lootably', sanitizeInput, simpleRateLimit(500, 60000), lootablyCallback);

// ============================================
// REVLUM (Multi-task Platform)
// ============================================
router.get('/revlum', sanitizeInput, simpleRateLimit(500, 60000), revlumCallback);
router.post('/revlum', sanitizeInput, simpleRateLimit(500, 60000), revlumCallback);

// ============================================
// THEOREMREACH (Premium Surveys)
// ============================================
router.get('/theoremreach', sanitizeInput, simpleRateLimit(500, 60000), theoremreachCallback);
router.post('/theoremreach', sanitizeInput, simpleRateLimit(500, 60000), theoremreachCallback);
router.get('/theoremreach/url', authenticate, getTheoremreachUrl);

// ============================================
// GENERIC (Template for new providers)
// ============================================
router.get('/generic', sanitizeInput, simpleRateLimit(500, 60000), genericCallback);
router.post('/generic', sanitizeInput, simpleRateLimit(500, 60000), genericCallback);
router.get('/generic/url', authenticate, getProviderUrl);

// ============================================
// HEALTH CHECK
// ============================================
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    revenueShare: '70% user / 30% platform',
    providers: {
      monetag: 'active',
      cpx: 'active',
      timewall: 'active',
      bitlabs: 'active',
      lootably: 'active',
      revlum: 'active',
      theoremreach: 'active',
    }
  });
});

export default router;
