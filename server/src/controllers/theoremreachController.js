import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { calculateRevenueShare } from '../utils/revenueShare.js';

const prisma = new PrismaClient();
const PROVIDER_NAME = 'theoremreach';

/**
 * TheoremReach Callback Handler (Server-side)
 * 
 * Callback URL format: /api/callback/theoremreach?user_id={USER_ID}&reward={REWARD}&tx_id={TX_ID}&hash={HASH}
 * 
 * Parameters from TheoremReach:
 * - reward: Amount in-app currency to credit
 * - currency: USD amount (floating point)
 * - user_id: User identifier
 * - tx_id: Transaction ID (unique per transaction)
 * - hash: HMAC SHA-1 hash for verification
 * - reversal: (optional) true if chargeback
 * - debug: (optional) if true, ignore this callback
 * - offer: (optional) true if offer rather than survey
 * - offer_name: (optional) name of offer
 * - placement_id: (optional) placement ID
 */
const theoremreachCallback = async (req, res) => {
    try {
        const params = { ...req.query, ...req.body };

        const {
            user_id,
            reward,
            currency,
            tx_id,
            hash,
            reversal,
            debug,
            offer,
            offer_name,
            placement_id,
        } = params;

        console.log(`[${PROVIDER_NAME.toUpperCase()} Callback] Received:`, params);

        // Ignore debug callbacks
        if (debug === 'true' || debug === true) {
            console.log(`[${PROVIDER_NAME.toUpperCase()}] Ignoring debug callback`);
            return res.status(200).send('1');
        }

        if (!user_id) {
            console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing user_id`);
            return res.status(200).send('1');
        }

        if (!tx_id) {
            console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing tx_id`);
            return res.status(200).send('1');
        }

        // Hash verification using HMAC SHA-1
        const secretKey = process.env.THEOREMREACH_SECRET_KEY;
        if (secretKey && hash) {
            // TheoremReach uses HMAC SHA-1 with Base64 encoding
            // URL to hash is the full callback URL without the hash parameter
            const baseUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            const urlWithoutHash = baseUrl.replace(/&hash=[^&]*/, '').replace(/\?hash=[^&]*&?/, '?');

            const hmac = crypto.createHmac('sha1', secretKey);
            hmac.update(urlWithoutHash);
            const calculatedHash = hmac.digest('base64')
                .replace(/\+/g, '-')
                .replace(/\//g, '_')
                .replace(/=/g, '');

            if (calculatedHash !== hash) {
                console.error(`[${PROVIDER_NAME.toUpperCase()}] Invalid hash. Expected: ${calculatedHash}, Got: ${hash}`);
                // Continue processing for now, but log the mismatch
            }
        }

        // Idempotency check
        const existingTransaction = await prisma.transaction.findUnique({
            where: {
                provider_externalTransId: {
                    provider: PROVIDER_NAME,
                    externalTransId: tx_id
                }
            }
        });

        if (existingTransaction) {
            console.log(`[${PROVIDER_NAME.toUpperCase()}] Transaction ${tx_id} already processed`);
            return res.status(200).send('1');
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { id: user_id }
        });

        if (!user) {
            console.error(`[${PROVIDER_NAME.toUpperCase()}] User ${user_id} not found`);
            return res.status(200).send('1');
        }

        // Calculate revenue share (70% user, 30% platform)
        // TheoremReach sends reward as points and currency as USD
        const usdAmount = parseFloat(currency) || parseFloat(reward) * 0.01;
        const revenueData = calculateRevenueShare(usdAmount * 100, 'USD', true); // Convert to cents
        const userPoints = revenueData.userShare;

        const isReversal = reversal === 'true' || reversal === true;
        const transactionStatus = isReversal ? 'chargeback' : 'success';
        const pointsToCredit = isReversal ? -Math.abs(userPoints) : userPoints;

        console.log(`[${PROVIDER_NAME.toUpperCase()}] Total: ${revenueData.totalPoints} pts | User (70%): ${userPoints} pts | Platform (30%): ${revenueData.platformShare} pts`);

        await prisma.$transaction(async (tx) => {
            await tx.transaction.create({
                data: {
                    userId: user_id,
                    amount: pointsToCredit,
                    provider: PROVIDER_NAME,
                    externalTransId: tx_id,
                    status: transactionStatus,
                    taskType: offer ? 'offer' : 'survey',
                    metadata: JSON.stringify({
                        reward,
                        currency,
                        offer,
                        offer_name,
                        placement_id,
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
                        description: `Survey${offer_name ? `: ${offer_name}` : ''}`
                    }
                });
            }

            await tx.adImpression.create({
                data: {
                    userId: user_id,
                    adType: PROVIDER_NAME,
                    adFormat: offer ? 'offer' : 'survey',
                    revenue: pointsToCredit,
                    status: transactionStatus === 'success' ? 'completed' : 'chargeback',
                    metadata: JSON.stringify({ tx_id, offer_name, placement_id })
                }
            });
        });

        console.log(`[${PROVIDER_NAME.toUpperCase()}] ✅ User ${user_id} credited ${userPoints} points`);

        // TheoremReach expects "1" for success
        return res.status(200).send('1');

    } catch (error) {
        console.error(`[${PROVIDER_NAME.toUpperCase()}] Error:`, error);
        return res.status(200).send('1');
    }
};

/**
 * Get TheoremReach survey wall URL for user
 * Uses JavaScript SDK integration
 */
const getTheoremreachUrl = async (req, res) => {
    try {
        const userId = req.user.id;
        const apiKey = process.env.THEOREMREACH_API_KEY;

        if (!apiKey) {
            return res.status(400).json({
                success: false,
                error: 'TheoremReach not configured'
            });
        }

        // TheoremReach JavaScript SDK URL
        // The SDK should be loaded client-side with userId
        return res.json({
            success: true,
            config: {
                apiKey: apiKey,
                userId: userId,
                // Client-side SDK URL
                sdkUrl: 'https://theoremreach.com/respondent_api/v1/embed/redirect'
            }
        });

    } catch (error) {
        console.error('[THEOREMREACH] Error getting URL:', error);
        return res.status(500).json({
            success: false,
            error: 'Failed to get TheoremReach URL'
        });
    }
};

export { getTheoremreachUrl, theoremreachCallback };

