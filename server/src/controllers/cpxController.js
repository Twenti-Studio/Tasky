import { PrismaClient } from '@prisma/client';
import { calculateRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

/**
 * CPX Research Postback Handler
 * 
 * Query Parameters:
 * - status: 1 (Success), 2 (Chargeback/Fraud)
 * - trans_id: Unique transaction ID from CPX
 * - user_id: Your user's ID (sent in iframe URL)
 * - amount_local: Amount in local currency (IDR for Indonesia)
 * - amount_usd: Amount in USD
 * - currency_type: Currency code (e.g., "IDR")
 * - hash: Security hash (verified by middleware)
 * 
 * Response: Always 200 OK to prevent CPX retries
 */
const cpxCallback = async (req, res) => {
  const { 
    status, 
    trans_id, 
    user_id, 
    amount_local, 
    amount_usd, 
    currency_type,
    reward_name,
    ip,
    country
  } = req.query;

  console.log('[CPX Callback] Received postback:', {
    status,
    trans_id,
    user_id,
    amount_local,
    amount_usd,
    currency_type,
    reward_name,
    ip,
    country
  });

  // Validate required parameters
  if (!status || !trans_id || !user_id || !amount_local) {
    console.error('[CPX Callback] Missing required parameters');
    return res.status(200).send('OK'); // Still 200 to prevent retries
  }

  try {
    // Step 1: Check if transaction already exists (Idempotency)
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        provider_externalTransId: {
          provider: 'cpx',
          externalTransId: trans_id
        }
      }
    });

    if (existingTransaction) {
      console.log(`[CPX Callback] Transaction ${trans_id} already processed. Skipping.`);
      return res.status(200).send('OK');
    }

    // Step 2: Find the user
    const user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      console.error(`[CPX Callback] User ${user_id} not found`);
      return res.status(200).send('OK');
    }

    // Step 3: Parse amount and calculate revenue share (70% user, 30% platform)
    const statusInt = parseInt(status);
    let transactionStatus = 'success';
    let pointsToCredit = 0;
    let revenueData = null;

    if (statusInt === 2) {
      // Chargeback/Fraud - deduct the user's share that was previously credited
      transactionStatus = 'chargeback';
      const originalPoints = parseFloat(amount_local) || 0;
      revenueData = calculateRevenueShare(originalPoints, 'IDR', false);
      pointsToCredit = -Math.abs(revenueData.userShare);
      console.warn(`[CPX Callback] CHARGEBACK for transaction ${trans_id}. Deducting ${Math.abs(pointsToCredit)} points from user ${user_id}`);
    } else if (statusInt === 1) {
      // Success - credit 70% to user, 30% to platform
      transactionStatus = 'success';
      const totalPoints = parseFloat(amount_local) || 0;
      revenueData = calculateRevenueShare(totalPoints, 'IDR', false);
      pointsToCredit = revenueData.userShare;
      console.log(`[CPX Callback] SUCCESS for transaction ${trans_id}.`);
      console.log(`[CPX Callback] Total: ${revenueData.totalPoints} pts | User (70%): ${revenueData.userShare} pts | Platform (30%): ${revenueData.platformShare} pts`);
    } else {
      // Unknown status
      console.error(`[CPX Callback] Unknown status: ${status}`);
      return res.status(200).send('OK');
    }

    // Step 4: Use Prisma transaction to update user balance and create records
    await prisma.$transaction(async (tx) => {
      // Update user balance
      await tx.user.update({
        where: { id: user_id },
        data: {
          balance: {
            increment: pointsToCredit
          }
        }
      });

      // Create Transaction record (for idempotency and audit)
      await tx.transaction.create({
        data: {
          userId: user_id,
          amount: pointsToCredit,
          provider: 'cpx',
          externalTransId: trans_id,
          status: transactionStatus,
          taskType: 'survey',
          metadata: JSON.stringify({
            amount_usd,
            currency_type,
            reward_name,
            ip,
            country,
            raw_status: status
          })
        }
      });

      // Create Earning record (if success)
      if (statusInt === 1 && pointsToCredit > 0) {
        await tx.earning.create({
          data: {
            userId: user_id,
            amount: pointsToCredit,
            source: 'cpx',
            description: `CPX Survey: ${reward_name || 'Survey completed'}`
          }
        });
      }

      // Create AdImpression record
      await tx.adImpression.create({
        data: {
          userId: user_id,
          adType: 'cpx',
          adFormat: 'survey',
          revenue: pointsToCredit,
          status: statusInt === 1 ? 'completed' : 'chargeback',
          metadata: JSON.stringify({
            trans_id,
            amount_usd,
            currency_type,
            reward_name,
            country
          })
        }
      });
    });

    console.log(`[CPX Callback] ✅ User ${user_id} balance updated. Transaction ${trans_id} recorded.`);
    
    // Success response
    return res.status(200).send('OK');

  } catch (error) {
    console.error('[CPX Callback] Error processing postback:', error);
    
    // Even on error, return 200 to prevent infinite retries
    return res.status(200).send('OK');
  }
};

/**
 * Get CPX Research embed URL with user tracking
 * This endpoint generates the URL for embedding CPX surveys
 */
const getCpxUrl = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appId = process.env.CPX_APP_ID;
  
  if (!appId) {
    return res.status(500).json({ error: 'CPX not configured' });
  }

  // CPX Survey Wall URL format
  // Replace with your actual CPX URL format from their dashboard
  const cpxUrl = `https://offers.cpx-research.com/index.php?app_id=${appId}&ext_user_id=${userId}`;

  return res.json({
    url: cpxUrl,
    provider: 'cpx',
    userId: userId
  });
};

export {
  cpxCallback,
  getCpxUrl,
};
