import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { calculateRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

const PROVIDER_NAME = 'wannads';

/**
 * Wannads Postback Handler
 * 
 * Wannads sends GET requests with:
 * - user_id: Your user's ID
 * - transaction_id: Unique transaction ID
 * - reward: Reward amount in virtual currency
 * - status: 1 (credit), 2 (chargeback)
 * - signature: MD5 hash (user_id + transaction_id + reward + SECRET)
 * - payout: Amount in USD
 * - offer_id: ID of the offer
 * - offer_name: Name of the offer
 */
const wannadsCallback = async (req, res) => {
    try {
        const params = { ...req.query, ...req.body };

        const {
            user_id,
            transaction_id,
            reward,
            status,
            signature,
            payout,
            offer_id,
            offer_name
        } = params;

        console.log(`[${PROVIDER_NAME.toUpperCase()} Callback] Received:`, params);

        if (!user_id || !transaction_id || !signature) {
            console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing required parameters`);
            return res.status(200).send('OK');
        }

        // Signature verification
        const secretKey = process.env.WANNADS_SECRET_KEY;
        if (secretKey) {
            // Wannads hash format: MD5(user_id + transaction_id + reward + secret)
            const hashString = `${user_id}${transaction_id}${reward}${secretKey}`;
            const calculatedHash = crypto.createHash('md5').update(hashString).digest('hex');

            if (calculatedHash !== signature) {
                console.error(`[${PROVIDER_NAME.toUpperCase()}] Invalid signature! Received: ${signature}, Calculated: ${calculatedHash}`);
                return res.status(200).send('OK');
            }
        } else {
            console.warn(`[${PROVIDER_NAME.toUpperCase()}] WANNADS_SECRET_KEY not set, skipping signature verification`);
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
        // We prefer using payout in USD for consistency if available
        const revenueData = calculateRevenueShare(payout || 0, 'USD', false);

        // If payout is missing, we use reward as points directly (assuming user set it correctly in Wannads dashboard)
        const userPoints = payout ? revenueData.userShare : Math.round(parseFloat(reward) * 0.7);
        const totalPoints = payout ? revenueData.totalPoints : Math.round(parseFloat(reward));
        const platformShare = totalPoints - userPoints;

        const statusInt = parseInt(status);
        let transactionStatus = 'success';
        if (statusInt === 2) {
            transactionStatus = 'chargeback';
        }

        const pointsToCredit = transactionStatus === 'chargeback' ? -Math.abs(userPoints) : userPoints;

        console.log(`[${PROVIDER_NAME.toUpperCase()}] Total: ${totalPoints} pts | User (70%): ${userPoints} pts | Platform (30%): ${platformShare} pts`);

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
                        reward,
                        offer_id,
                        offer_name,
                        totalPoints,
                        userShare: userPoints,
                        platformShare,
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
                        description: `Wannads offer: ${offer_name || offer_id}`
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
                    metadata: JSON.stringify({ transaction_id, offer_id })
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

export { wannadsCallback };

