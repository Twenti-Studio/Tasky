import { PrismaClient } from '@prisma/client';
import { calculateFixedRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

/**
 * Get flat rate reward for Monetag task types (full amount before revenue share)
 * Platform will take 30%, user gets 70%
 */
const getMontagReward = (taskType) => {
  // These are the FULL amounts - user will receive 70%
  const rewards = {
    push: parseInt(process.env.MONETAG_PUSH_REWARD) || 15,       // User gets ~10
    smartlink: parseInt(process.env.MONETAG_SMARTLINK_REWARD) || 70, // User gets ~49
    popunder: parseInt(process.env.MONETAG_POPUNDER_REWARD) || 45,   // User gets ~31
  };
  return rewards[taskType] || 15;
};

/**
 * Track ad impression (when user clicks a task)
 */
const trackImpression = async (req, res) => {
  try {
    const { adFormat, metadata } = req.body;

    if (!adFormat) {
      return res.status(400).json({ error: 'Ad format is required' });
    }

    // Create ad impression record
    const impression = await prisma.adImpression.create({
      data: {
        userId: req.user.id,
        adType: 'monetag',
        adFormat,
        revenue: 0, // Will be updated when postback arrives
        status: 'pending',
        metadata: metadata ? JSON.stringify(metadata) : null
      }
    });

    res.status(201).json({
      message: 'Impression tracked',
      impression
    });
  } catch (error) {
    console.error('[Monetag] Track impression error:', error);
    res.status(500).json({ error: 'Failed to track impression' });
  }
};

/**
 * Complete ad impression (Client-side tracking)
 * Used when user completes a task on frontend
 */
const completeImpression = async (req, res) => {
  try {
    const { impressionId, taskType } = req.body;

    if (!impressionId) {
      return res.status(400).json({ error: 'Impression ID is required' });
    }

    // Find impression
    const impression = await prisma.adImpression.findFirst({
      where: {
        id: impressionId,
        userId: req.user.id
      }
    });

    if (!impression) {
      return res.status(404).json({ error: 'Impression not found' });
    }

    if (impression.status === 'completed') {
      return res.status(400).json({ error: 'Impression already completed' });
    }

    // Get flat rate reward based on task type
    const points = getMontagReward(taskType || impression.adFormat);

    // Use transaction to ensure atomicity
    await prisma.$transaction(async (tx) => {
      // Update impression
      await tx.adImpression.update({
        where: { id: impressionId },
        data: {
          status: 'completed',
          revenue: points
        }
      });

      // Create earning record
      await tx.earning.create({
        data: {
          userId: req.user.id,
          amount: points,
          source: 'monetag',
          description: `Monetag ${impression.adFormat} completed (+${points} points)`
        }
      });

      // Update user balance
      await tx.user.update({
        where: { id: req.user.id },
        data: {
          balance: { increment: points }
        }
      });
    });

    console.log(`[Monetag] User ${req.user.id} earned ${points} points from ${impression.adFormat}`);

    res.json({
      message: 'Task completed',
      earned: points
    });
  } catch (error) {
    console.error('[Monetag] Complete impression error:', error);
    res.status(500).json({ error: 'Failed to complete impression' });
  }
};

/**
 * Get user's ad impressions
 */
const getImpressions = async (req, res) => {
  try {
    const impressions = await prisma.adImpression.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const stats = await prisma.adImpression.groupBy({
      by: ['status'],
      where: { userId: req.user.id },
      _count: true,
      _sum: { revenue: true }
    });

    res.json({
      impressions,
      stats
    });
  } catch (error) {
    console.error('[Monetag] Get impressions error:', error);
    res.status(500).json({ error: 'Failed to get impressions' });
  }
};

/**
 * Monetag Server-to-Server Postback Endpoint
 * 
 * This handles reward notifications from Monetag
 * Monetag sends GET/POST requests with transaction data
 * 
 * Query/Body Parameters (varies by Monetag integration type):
 * - subid: User ID (sent in SmartLink URL)
 * - amount: Revenue amount (usually in USD cents)
 * - transaction_id: Unique transaction ID
 * - status: Transaction status (approved/pending)
 * - country: User country code
 * - ip: User IP address
 */
const monetagCallback = async (req, res) => {
  try {
    // Support both GET and POST
    const params = { ...req.query, ...req.body };
    
    const { 
      subid,           // User ID
      amount,          // Revenue amount
      currency,        // Currency code
      transaction_id,  // Unique transaction ID
      status,          // Transaction status
      ip,              // User IP
      country,         // User country
      type             // Task type (if sent by Monetag)
    } = params;

    console.log('[Monetag Callback] Received postback:', params);

    // Validate required parameters
    if (!subid) {
      console.error('[Monetag Callback] Missing subid');
      return res.status(200).send('OK'); // Return 200 to prevent retries
    }

    if (!transaction_id) {
      console.error('[Monetag Callback] Missing transaction_id');
      return res.status(200).send('OK');
    }

    // Step 1: Check if transaction already exists (Idempotency)
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        provider_externalTransId: {
          provider: 'monetag',
          externalTransId: transaction_id
        }
      }
    });

    if (existingTransaction) {
      console.log(`[Monetag Callback] Transaction ${transaction_id} already processed`);
      return res.status(200).send('OK');
    }

    // Step 2: Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: subid }
    });

    if (!user) {
      console.error(`[Monetag Callback] User ${subid} not found`);
      return res.status(200).send('OK'); // Still 200 to prevent retries
    }

    // Step 3: Determine task type and calculate revenue share (70% user, 30% platform)
    const taskType = type || 'smartlink';
    const totalPoints = getMontagReward(taskType);
    const revenueData = calculateFixedRevenueShare(totalPoints);
    const userPoints = revenueData.userShare;

    console.log(`[Monetag Callback] Task: ${taskType} | Total: ${totalPoints} pts | User (70%): ${userPoints} pts | Platform (30%): ${revenueData.platformShare} pts`);

    // Step 4: Use Prisma transaction to update database atomically
    await prisma.$transaction(async (tx) => {
      // Create Transaction record (for idempotency)
      await tx.transaction.create({
        data: {
          userId: subid,
          amount: userPoints,
          provider: 'monetag',
          externalTransId: transaction_id,
          status: 'success',
          taskType: taskType,
          metadata: JSON.stringify({
            totalPoints,
            userShare: userPoints,
            platformShare: revenueData.platformShare,
            amount_usd: amount,
            currency,
            country,
            ip,
            status,
            timestamp: new Date().toISOString()
          })
        }
      });

      // Create Earning record
      await tx.earning.create({
        data: {
          userId: subid,
          amount: userPoints,
          source: 'monetag',
          description: `Monetag ${taskType}${country ? ` (${country})` : ''}`
        }
      });

      // Update user balance
      await tx.user.update({
        where: { id: subid },
        data: {
          balance: { increment: userPoints }
        }
      });

      // Create AdImpression record
      await tx.adImpression.create({
        data: {
          userId: subid,
          adType: 'monetag',
          adFormat: taskType,
          revenue: userPoints,
          status: 'completed',
          metadata: JSON.stringify({
            transaction_id,
            totalPoints,
            userShare: userPoints,
            platformShare: revenueData.platformShare,
            country,
            ip
          })
        }
      });
    });

    console.log(`[Monetag Callback] ✅ User ${subid} credited ${userPoints} points for ${taskType} (${country || 'INT'})`);

    // Return success response to Monetag
    return res.status(200).send('OK');

  } catch (error) {
    console.error('[Monetag Callback] Error:', error);
    // Always return 200 to prevent Monetag retries
    return res.status(200).send('OK');
  }
};

export {
  trackImpression,
  completeImpression,
  getImpressions,
  monetagCallback,
};
