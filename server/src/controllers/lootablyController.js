import { PrismaClient } from '@prisma/client';
import { calculateRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

const PROVIDER_NAME = 'lootably';

/**
 * Lootably Postback Handler
 * 
 * Lootably sends GET requests with:
 * - user_id: Your user's ID
 * - transaction_id: Unique transaction ID
 * - payout: Reward amount in USD
 * - offer_name: Name of the completed offer
 * - status: complete/reversed
 */
const lootablyCallback = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };
    
    const {
      user_id,
      transaction_id,
      payout,
      offer_name,
      status,
      country,
    } = params;

    console.log(`[${PROVIDER_NAME.toUpperCase()} Callback] Received:`, params);

    if (!user_id) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing user_id`);
      return res.status(200).send('OK');
    }

    if (!transaction_id) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing transaction_id`);
      return res.status(200).send('OK');
    }

    // Idempotency check
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        provider_externalTransId: {
          provider: PROVIDER_NAME,
          externalTransId: transaction_id
        }
      }
    });

    if (existingTransaction) {
      console.log(`[${PROVIDER_NAME.toUpperCase()}] Transaction ${transaction_id} already processed`);
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
    // Lootably sends payout in USD dollars (not cents)
    const revenueData = calculateRevenueShare((parseFloat(payout) || 0) * 100, 'USD', true);
    const userPoints = revenueData.userShare;

    let transactionStatus = 'success';
    if (status === 'reversed' || status === 'chargeback') {
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
          externalTransId: transaction_id,
          status: transactionStatus,
          taskType: 'offer',
          metadata: JSON.stringify({
            payout,
            offer_name,
            country,
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
            description: `Lootably: ${offer_name || 'Offer completed'}`
          }
        });
      }

      await tx.adImpression.create({
        data: {
          userId: user_id,
          adType: PROVIDER_NAME,
          adFormat: 'offer',
          revenue: pointsToCredit,
          status: transactionStatus === 'success' ? 'completed' : 'chargeback',
          metadata: JSON.stringify({ transaction_id, offer_name, country })
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

export { lootablyCallback };
