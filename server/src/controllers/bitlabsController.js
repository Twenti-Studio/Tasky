import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { calculateRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

const PROVIDER_NAME = 'bitlabs';

/**
 * BitLabs Postback Handler
 * 
 * BitLabs sends GET/POST requests with:
 * - user_id: Your user's ID
 * - tx: Transaction ID
 * - value: Reward amount in USD cents
 * - status: 1 (credit), 2 (chargeback)
 * - hash: Security hash (SHA1)
 */
const bitlabsCallback = async (req, res) => {
  try {
    const params = { ...req.query, ...req.body };

    const {
      user_id,
      tx,
      value,
      status,
      hash,
      country,
    } = params;

    console.log(`[${PROVIDER_NAME.toUpperCase()} Callback] Received:`, params);

    if (!user_id) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing user_id`);
      return res.status(200).send('OK');
    }

    if (!tx) {
      console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing tx`);
      return res.status(200).send('OK');
    }

    // Hash verification (if configured)
    const secretKey = process.env.BITLABS_SECRET_KEY;
    if (secretKey && hash) {
      // BitLabs hash format: SHA1(user_id + tx + value + secret)
      const hashString = `${user_id}${tx}${value}${secretKey}`;
      const calculatedHash = crypto.createHash('sha1').update(hashString).digest('hex');

      if (calculatedHash !== hash) {
        console.error(`[${PROVIDER_NAME.toUpperCase()}] Invalid hash`);
        return res.status(200).send('OK');
      }
    }

    // Idempotency check
    const existingTransaction = await prisma.transaction.findUnique({
      where: {
        provider_externalTransId: {
          provider: PROVIDER_NAME,
          externalTransId: tx
        }
      }
    });

    if (existingTransaction) {
      console.log(`[${PROVIDER_NAME.toUpperCase()}] Transaction ${tx} already processed`);
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
    const revenueData = calculateRevenueShare(value || 0, 'USD', true);
    const userPoints = revenueData.userShare;

    const statusInt = parseInt(status);
    let transactionStatus = 'success';
    if (statusInt === 2) {
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
          externalTransId: tx,
          status: transactionStatus,
          taskType: 'survey',
          metadata: JSON.stringify({
            value,
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
            description: `BitLabs survey${country ? ` (${country})` : ''}`
          }
        });
      }

      await tx.adImpression.create({
        data: {
          userId: user_id,
          adType: PROVIDER_NAME,
          adFormat: 'survey',
          revenue: pointsToCredit,
          status: transactionStatus === 'success' ? 'completed' : 'chargeback',
          metadata: JSON.stringify({ tx, country })
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

/**
 * Fetch available surveys from BitLabs
 * GET /api/bitlabs/surveys
 */
const getBitlabsSurveys = async (req, res) => {
  try {
    const userId = req.user.id;
    const token = process.env.NEXT_PUBLIC_BITLABS_TOKEN || '3cbd4dde-42bf-4dfb-8463-58146b64cc51';

    // BitLabs API endpoint to get surveys
    const apiUrl = `https://api.bitlabs.ai/v2/surveys?uid=${userId}`;

    console.log(`[BITLABS] Fetching surveys for user ${userId}`);

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Api-Token': token,
      }
    });

    if (!response.ok) {
      console.error(`[BITLABS] API error: ${response.status} ${response.statusText}`);
      return res.json({
        success: true,
        surveys: [],
        error: `API returned ${response.status}`
      });
    }

    const data = await response.json();

    console.log(`[BITLABS] Retrieved ${data?.surveys?.length || 0} surveys`);

    // Transform surveys to our format
    const surveys = (data.surveys || []).map(survey => ({
      id: survey.id,
      category: survey.category || 'general',
      loi: survey.loi, // Length of interview in minutes
      reward: survey.value, // Reward in USD cents
      points: Math.round(survey.value * 100), // Convert to points (1 cent = 100 points)
      link: survey.link,
      rating: survey.rating,
      tags: survey.tags || [],
      type: survey.type || 'survey',
    }));

    return res.json({
      success: true,
      surveys,
      count: surveys.length
    });

  } catch (error) {
    console.error('[BITLABS] Error fetching surveys:', error);
    return res.json({
      success: true,
      surveys: [],
      error: error.message
    });
  }
};

export { bitlabsCallback, getBitlabsSurveys };

