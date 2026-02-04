import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';
import { calculateRevenueShare } from '../utils/revenueShare.js';
const prisma = new PrismaClient();

const PROVIDER_NAME = 'kiwiwall';

/**
 * KIWIWALL POSTBACK HANDLER
 * 
 * Kiwiwall sends postback with these macros:
 * - {status} : Transaction status (1 = credited, 2 = reversed/chargeback)
 * - {trans_id} : Unique transaction ID
 * - {sub_id} : Your user's ID (mapped to sub_id)
 * - {sub_id_2} to {sub_id_5} : Additional sub parameters
 * - {gross} : Total reward in points
 * - {amount} : Reward amount for user
 * - {offer_id} : Offer ID
 * - {offer_name} : Offer name
 * - {category} : Offer category
 * - {os} : Operating system
 * - {app_id} : Your app ID
 * - {ip_address} : User's IP address
 * - {signature} : Security signature for verification
 * 
 * Currency: points (1 point = 1 point in our system based on exchange rate 1000)
 * Exchange Rate: 1000 (meaning 1000 kiwiwall points = 1 USD equivalent)
 */
const kiwiwallCallback = async (req, res) => {
    try {
        // Support both GET and POST requests
        const params = { ...req.query, ...req.body };

        const {
            status,
            trans_id,
            sub_id,         // User ID
            sub_id_2,
            sub_id_3,
            sub_id_4,
            sub_id_5,
            gross,          // Total reward
            amount,         // User reward amount
            offer_id,
            offer_name,
            category,
            os,
            app_id,
            ip_address,
            signature,
        } = params;

        console.log(`[${PROVIDER_NAME.toUpperCase()} Callback] Received:`, params);

        // Step 1: Validate required parameters
        if (!sub_id) {
            console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing sub_id (user_id)`);
            return res.status(200).send('1'); // Kiwiwall expects '1' for success
        }

        if (!trans_id) {
            console.error(`[${PROVIDER_NAME.toUpperCase()}] Missing trans_id`);
            return res.status(200).send('1');
        }

        // Step 2: Verify signature (if configured)
        const secretKey = process.env.KIWIWALL_SECRET_KEY;
        if (secretKey && signature) {
            // Kiwiwall signature format: MD5(trans_id + sub_id + amount + secret_key)
            const hashString = `${trans_id}${sub_id}${amount || gross}${secretKey}`;
            const calculatedSignature = crypto.createHash('md5').update(hashString).digest('hex');

            if (calculatedSignature.toLowerCase() !== signature.toLowerCase()) {
                console.error(`[${PROVIDER_NAME.toUpperCase()}] Invalid signature`);
                console.error(`[${PROVIDER_NAME.toUpperCase()}] Expected: ${calculatedSignature}, Received: ${signature}`);
                return res.status(200).send('0'); // Return '0' for invalid
            }
            console.log(`[${PROVIDER_NAME.toUpperCase()}] Signature verified successfully`);
        }

        // Step 3: Check idempotency - prevent duplicate processing
        const existingTransaction = await prisma.transaction.findUnique({
            where: {
                provider_externalTransId: {
                    provider: PROVIDER_NAME,
                    externalTransId: trans_id
                }
            }
        });

        if (existingTransaction) {
            console.log(`[${PROVIDER_NAME.toUpperCase()}] Transaction ${trans_id} already processed`);
            return res.status(200).send('1');
        }

        // Step 4: Find user
        const user = await prisma.user.findUnique({
            where: { id: sub_id }
        });

        if (!user) {
            console.error(`[${PROVIDER_NAME.toUpperCase()}] User ${sub_id} not found`);
            return res.status(200).send('1');
        }

        // Step 5: Calculate points
        // Kiwiwall uses exchange rate 1000 (1000 kiwiwall points = 1 USD)
        // Amount is in kiwiwall points, convert to USD cents then calculate
        const kiwiwallPoints = parseFloat(amount || gross) || 0;
        const usdCents = (kiwiwallPoints / 1000) * 100; // Convert to cents

        // Calculate revenue share (70% user, 30% platform)
        const revenueData = calculateRevenueShare(usdCents, 'USD', true);
        const userPoints = revenueData.userShare;

        // Step 6: Determine transaction status
        const statusInt = parseInt(status);
        let transactionStatus = 'success';

        // Status: 1 = credited, 2 = reversed/chargeback
        if (statusInt === 2) {
            transactionStatus = 'chargeback';
            console.warn(`[${PROVIDER_NAME.toUpperCase()}] CHARGEBACK detected for transaction ${trans_id}`);
        }

        const pointsToCredit = transactionStatus === 'chargeback' ? -Math.abs(userPoints) : userPoints;

        console.log(`[${PROVIDER_NAME.toUpperCase()}] Revenue Share: Total ${revenueData.totalPoints} pts | User (70%): ${userPoints} pts | Platform (30%): ${revenueData.platformShare} pts`);

        // Step 7: Use Prisma transaction for atomic database operations
        await prisma.$transaction(async (tx) => {
            // Create Transaction record
            await tx.transaction.create({
                data: {
                    userId: sub_id,
                    amount: pointsToCredit,
                    provider: PROVIDER_NAME,
                    externalTransId: trans_id,
                    status: transactionStatus,
                    taskType: category || 'offer',
                    metadata: JSON.stringify({
                        gross,
                        amount,
                        offer_id,
                        offer_name,
                        category,
                        os,
                        app_id,
                        ip_address,
                        sub_id_2,
                        sub_id_3,
                        sub_id_4,
                        sub_id_5,
                        totalPoints: revenueData.totalPoints,
                        userShare: userPoints,
                        platformShare: revenueData.platformShare,
                        kiwiwallPoints,
                        timestamp: new Date().toISOString()
                    })
                }
            });

            // Update user balance
            await tx.user.update({
                where: { id: sub_id },
                data: {
                    balance: { increment: pointsToCredit }
                }
            });

            // Create Earning record (only for successful transactions)
            if (transactionStatus === 'success') {
                await tx.earning.create({
                    data: {
                        userId: sub_id,
                        amount: userPoints,
                        source: PROVIDER_NAME,
                        description: `Kiwiwall ${offer_name || category || 'offer'}`
                    }
                });
            }

            // Create AdImpression record
            await tx.adImpression.create({
                data: {
                    userId: sub_id,
                    adType: PROVIDER_NAME,
                    adFormat: category || 'offer',
                    revenue: pointsToCredit,
                    status: transactionStatus === 'success' ? 'completed' : 'chargeback',
                    metadata: JSON.stringify({
                        trans_id,
                        offer_id,
                        offer_name,
                        os,
                        ip_address
                    })
                }
            });
        });

        console.log(`[${PROVIDER_NAME.toUpperCase()}] ✅ User ${sub_id} credited ${userPoints} points (status: ${transactionStatus})`);

        // Kiwiwall expects '1' for successful processing
        return res.status(200).send('1');

    } catch (error) {
        console.error(`[${PROVIDER_NAME.toUpperCase()}] Error:`, error);
        // Return '1' to prevent retries (we logged the error for debugging)
        return res.status(200).send('1');
    }
};

/**
 * Get Kiwiwall Offerwall URL for embedding
 * GET /api/callback/kiwiwall/url
 */
const getKiwiwallUrl = async (req, res) => {
    try {
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        const appId = process.env.KIWIWALL_APP_ID;

        if (!appId) {
            return res.status(500).json({ error: 'Kiwiwall not configured' });
        }

        // Kiwiwall offerwall URL format
        // Reference: https://www.kiwiwall.com/documentation
        const kiwiwallUrl = `https://www.kiwiwall.com/wall/${appId}/iframe?s1=${encodeURIComponent(userId)}`;

        return res.json({
            url: kiwiwallUrl,
            provider: PROVIDER_NAME,
            userId: userId
        });

    } catch (error) {
        console.error(`[${PROVIDER_NAME.toUpperCase()}] Error getting URL:`, error);
        return res.status(500).json({ error: 'Failed to get Kiwiwall URL' });
    }
};

/**
 * Get available Kiwiwall offers (if API is available)
 * GET /api/callback/kiwiwall/offers
 */
const getKiwiwallOffers = async (req, res) => {
    try {
        const userId = req.user?.id;
        const apiKey = process.env.KIWIWALL_API_KEY;

        if (!apiKey) {
            console.log('[KIWIWALL] No API key configured');
            return res.json({
                success: true,
                offers: [],
                error: 'Kiwiwall API not configured'
            });
        }

        // Kiwiwall offers API endpoint (if available)
        // Note: Check Kiwiwall documentation for actual API endpoint
        const appId = process.env.KIWIWALL_APP_ID;
        const apiUrl = `https://www.kiwiwall.com/api/v1/offers?app_id=${appId}&user_id=${encodeURIComponent(userId)}`;

        console.log(`[KIWIWALL] Fetching offers for user ${userId}`);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Authorization': `Bearer ${apiKey}`,
            }
        });

        if (!response.ok) {
            console.error(`[KIWIWALL] API error: ${response.status}`);
            return res.json({
                success: true,
                offers: [],
                error: `API returned ${response.status}`
            });
        }

        const data = await response.json();
        const offersData = data.offers || data.data || [];

        // Transform offers to our format
        const offers = offersData.map(offer => ({
            id: offer.id || offer.offer_id,
            name: offer.name || offer.offer_name,
            description: offer.description || '',
            category: offer.category || 'general',
            points: Math.round(parseFloat(offer.payout || offer.amount || 0) * 0.7), // 70% after revenue share
            link: offer.link || offer.url,
            icon: offer.icon || offer.image,
            requirements: offer.instructions || offer.requirements || '',
            type: 'offer',
        }));

        return res.json({
            success: true,
            offers,
            count: offers.length
        });

    } catch (error) {
        console.error('[KIWIWALL] Error fetching offers:', error);
        return res.json({
            success: true,
            offers: [],
            error: error.message
        });
    }
};

export { getKiwiwallOffers, getKiwiwallUrl, kiwiwallCallback };

