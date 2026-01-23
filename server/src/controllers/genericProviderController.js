import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { calculateRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

/**
 * GENERIC PROVIDER CONTROLLER TEMPLATE
 * 
 * Use this template for integrating new providers like BitLabs, TimeWall, etc.
 * 
 * Steps to integrate a new provider:
 * 1. Copy this file and rename it (e.g., bitlabsController.js)
 * 2. Update the provider name constant
 * 3. Modify parameter names according to provider's documentation
 * 4. Implement hash verification if provider supports it
 * 5. Add environment variables for the provider
 * 6. Create route in routes/callback.js
 * 7. Test with provider's test postback feature
 */

// Configuration
const PROVIDER_NAME = 'generic'; // Change this: 'bitlabs', 'timewall', etc.

/**
 * Generic Provider Postback Handler
 * 
 * Common Query Parameters (adjust based on actual provider):
 * - user_id / uid / subid: Your user's ID
 * - transaction_id / trans_id / txn_id: Unique transaction ID
 * - amount / reward / payout: Reward amount
 * - currency: Currency code
 * - status: Transaction status
 * - signature / hash / secure_hash: Security hash (if supported)
 * - type: Task type (survey, offer, etc.)
 * 
 * Response: Usually 200 OK to prevent retries
 */
const genericCallback = async (req, res) => {
  try {
    // Support both GET and POST requests
    const params = { ...req.query, ...req.body };
    
    const {
      user_id,        // Adjust parameter name based on provider
      transaction_id, // Adjust parameter name
      amount,         // Adjust parameter name
      currency,
      status,
      type,           // Task type
      signature,      // Security hash (if supported)
      ip,
      country,
      // Add more parameters as needed
    } = params;

    console.log(`[${PROVIDER_NAME.toUpperCase()} Callback] Received postback:`, params);

    // Step 1: Validate required parameters
    if (!user_id) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing user_id`);
      return res.status(200).send('OK'); // Return 200 to prevent retries
    }

    if (!transaction_id) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing transaction_id`);
      return res.status(200).send('OK');
    }

    // Step 2: Verify signature/hash (if provider supports it)
    // Uncomment and modify based on provider's hash verification method
    /*
    const isValid = verifySignature(params);
    if (!isValid) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Invalid signature`);
      return res.status(200).send('OK');
    }
    */

    // Step 3: Check if transaction already exists (Idempotency)
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

    // Step 4: Find user
    const user = await prisma.user.findUnique({
      where: { id: user_id }
    });

    if (!user) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] User ${user_id} not found`);
      return res.status(200).send('OK');
    }

    // Step 5: Calculate points with 70/30 revenue share
    const revenueData = calculatePoints(amount, currency);
    const userPoints = revenueData.userPoints;

    // Step 6: Determine transaction status
    let transactionStatus = 'success';
    if (status === 'chargeback' || status === 'reversed') {
      transactionStatus = 'chargeback';
      console.warn(`[${PROVIDER_NAME.toUpperCase()}] CHARGEBACK detected for transaction ${transaction_id}`);
    }

    // Step 7: Use Prisma transaction for atomic database operations
    await prisma.$transaction(async (tx) => {
      // Determine points to credit (negative for chargeback)
      const pointsToCredit = transactionStatus === 'chargeback' ? -Math.abs(userPoints) : userPoints;

      // Create Transaction record
      await tx.transaction.create({
        data: {
          userId: user_id,
          amount: pointsToCredit,
          provider: PROVIDER_NAME,
          externalTransId: transaction_id,
          status: transactionStatus,
          taskType: type || 'task',
          metadata: JSON.stringify({
            amount,
            currency,
            country,
            ip,
            status,
            totalPoints: revenueData.totalPoints,
            userShare: userPoints,
            platformShare: revenueData.platformShare,
            timestamp: new Date().toISOString(),
            raw_params: params
          })
        }
      });

      // Update user balance
      await tx.user.update({
        where: { id: user_id },
        data: {
          balance: { increment: pointsToCredit }
        }
      });

      // Create Earning record (only for successful transactions)
      if (transactionStatus === 'success') {
        await tx.earning.create({
          data: {
            userId: user_id,
            amount: userPoints,
            source: PROVIDER_NAME,
            description: `${PROVIDER_NAME} ${type || 'task'}${country ? ` (${country})` : ''}`
          }
        });
      }

      // Create AdImpression record
      await tx.adImpression.create({
        data: {
          userId: user_id,
          adType: PROVIDER_NAME,
          adFormat: type || 'task',
          revenue: pointsToCredit,
          status: transactionStatus === 'success' ? 'completed' : 'chargeback',
          metadata: JSON.stringify({
            transaction_id,
            country,
            ip
          })
        }
      });
    });

    console.log(`[${PROVIDER_NAME.toUpperCase()}] ✅ User ${user_id} credited ${points} points (status: ${transactionStatus})`);

    // Return success response
    return res.status(200).send('OK');

  } catch (error) {
    console.error(`[${PROVIDER_NAME.toUpperCase()}] Error:`, error);
    // Always return 200 to prevent provider retries
    return res.status(200).send('OK');
  }
};

/**
 * Calculate points from provider's amount with 70/30 revenue share
 * User gets 70%, platform keeps 30%
 */
function calculatePoints(amount, currency) {
  const revenueData = calculateRevenueShare(amount, currency || 'USD', true);
  
  console.log(`[Generic Provider] Revenue Share: Total ${revenueData.totalPoints} pts | User (70%): ${revenueData.userShare} pts | Platform (30%): ${revenueData.platformShare} pts`);
  
  // Return user's share (70%)
  return {
    userPoints: revenueData.userShare,
    totalPoints: revenueData.totalPoints,
    platformShare: revenueData.platformShare
  };
}

/**
 * Verify signature/hash from provider
 * Implement this based on provider's security documentation
 * 
 * Example for MD5 hash:
 * Expected format: MD5(user_id-transaction_id-amount-SECRET_KEY)
 */
function verifySignature(params) {
  const { user_id, transaction_id, amount, signature } = params;
  const secretKey = process.env[`${PROVIDER_NAME.toUpperCase()}_SECRET_KEY`];

  if (!secretKey || !signature) {
    return false;
  }

  // Build hash string (adjust based on provider's documentation)
  const hashString = `${user_id}-${transaction_id}-${amount}-${secretKey}`;
  const calculatedHash = crypto.createHash('md5').update(hashString).digest('hex');

  console.log(`[${PROVIDER_NAME.toUpperCase()}] Hash verification:`, {
    received: signature,
    calculated: calculatedHash,
    match: calculatedHash === signature
  });

  return calculatedHash === signature;
}

/**
 * Get provider URL with user tracking
 * Generate the URL for embedding provider's content
 */
const getProviderUrl = async (req, res) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const appId = process.env[`${PROVIDER_NAME.toUpperCase()}_APP_ID`];
  
  if (!appId) {
    return res.status(500).json({ error: `${PROVIDER_NAME} not configured` });
  }

  // Build provider URL (adjust based on provider's URL format)
  const providerUrl = `https://example-provider.com/offers?app_id=${appId}&user_id=${userId}`;

  return res.json({
    url: providerUrl,
    provider: PROVIDER_NAME,
    userId: userId
  });
};

export {
  genericCallback,
  getProviderUrl,
};
