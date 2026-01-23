import { PrismaClient } from '@prisma/client';
import { calculateRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

const PROVIDER_NAME = 'timewall';

/**
 * TimeWall Postback Handler
 * 
 * TimeWall sends GET requests with:
 * - user_id: Your user's ID
 * - offer_id: The completed offer ID
 * - payout: Amount in USD (or cents)
 * - currency: Currency code
 * - signature: Security hash (if configured)
 * - status: Transaction status
 */
const timewallCallback = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    
    const {
      user_id,
      offer_id,
      payout,
      currency,
      signature,
      status,
      country,
      ip,
    } = params;

    console.log(`[${PROVIDER_NAME.toUpperCase()} Callback] Received:`, params);

    if (!user_id) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing user_id`);
      return res.status(200).send('OK');
    }

    if (!offer_id) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing offer_id`);
      return res.status(200).send('OK');
    }

    // Idempotency check
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        provider_externalTransId: {
          provider: PROVIDER_NAME,
          externalTransId: offer_id
        }
      }
    });

    if (existingTransaction) {
      console.log(`[${PROVIDER_NAME.toUpperCase()}] Transaction ${offer_id} already processed`);
      return res.status(200).send('OK');
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] User ${user_id} not found`);
      return res.status(200).send('OK');
    }

    // Calculate revenue share (70% user, 30% platform)
    const revenueData = calculateRevenueShare(payout || 0, currency || 'USD', true);
    const userPoints = revenueData.userShare;

    let transactionStatus = 'success';
    if (status === 'chargeback' || status === 'reversed') {
      transactionStatus = 'chargeback';
    }

    const pointsToCredit = transactionStatus === 'chargeback' ? -Math.abs(userPoints) : userPoints;

    console.log(`[${PROVIDER_NAME.toUpperCase()}] Total: ${revenueData.totalPoints} pts | User (70%): ${userPoints} pts | Platform (30%): ${revenueData.platformShare} pts`);

    await prisma.$transaction(async (tx) => {
      await tx.transaction.create({
        data: {
          userId: user_id,
          amount: pointsToCredit,
          provider: PROVIDER_NAME,
          externalTransId: offer_id,
          status: transactionStatus,
          taskType: 'microtask',
          metadata: JSON.stringify({
            payout,
            currency,
            country,
            ip,
            totalPoints: revenueData.totalPoints,
            userShare: userPoints,
            platformShare: revenueData.platformShare,
            timestamp: new Date().toISOString()
          })
        }
      });

      await tx.user.update({
        where: { id: user_id },
        data: { balance: { increment: pointsToCredit } }
      });

      if (transactionStatus === 'success') {
        await tx.earning.create({
          data: {
            userId: user_id,
            amount: userPoints,
            source: PROVIDER_NAME,
            description: `TimeWall task${country ? ` (${country})` : ''}`
          }
        });
      }

      await tx.adImpression.create({
        data: {
          userId: user_id,
          adType: PROVIDER_NAME,
          adFormat: 'microtask',
          revenue: pointsToCredit,
          status: transactionStatus === 'success' ? 'completed' : 'chargeback',
          metadata: JSON.stringify({ offer_id, country, ip })
        }
      });
    });

    console.log(`[${PROVIDER_NAME.toUpperCase()}] ✅ User ${user_id} credited ${userPoints} points`);
    return res.status(200).send('OK');

  } catch (error) {
    console.error(`[${PROVIDER_NAME.toUpperCase()}] Error:`, error);
    return res.status(200).send('OK');
  }
};

export { timewallCallback };
