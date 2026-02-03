import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

/**
 * AdGem Callback Handler
 * Documentation: https://help.adgem.com/en/articles/postback-integration
 * 
 * Postback URL format di AdGem dashboard:
 * https://yourdomain.com/api/callback/adgem?user_id={user_id}&amount={amount}&currency={currency}&transaction_id={transaction_id}&hash={hash}
 */
export const handleAdGemCallback = async (req, res) => {
  try {
    const { user_id, amount, currency, transaction_id, hash } = req.query;

    // Log semua parameter untuk debugging
    console.log('[AdGem Callback] Received:', {
      user_id,
      amount,
      currency,
      transaction_id,
      hash,
      allParams: req.query
    });

    // Validate required parameters
    if (!user_id || !amount || !transaction_id) {
      console.error('[AdGem] Missing required parameters');
      return res.status(400).json({ 
        error: 'Missing required parameters',
        required: ['user_id', 'amount', 'transaction_id']
      });
    }

    // Verify hash untuk security (jika ada)
    const postbackKey = process.env.ADGEM_POSTBACK_KEY;
    
    if (!postbackKey) {
      console.error('[AdGem] Postback key not configured');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // AdGem hash verification (jika mereka kirim hash)
    if (hash) {
      const expectedHash = crypto
        .createHash('md5')
        .update(`${user_id}${amount}${transaction_id}${postbackKey}`)
        .digest('hex');

      if (hash !== expectedHash) {
        console.error('[AdGem] Invalid hash signature');
        console.error('Expected:', expectedHash);
        console.error('Received:', hash);
        return res.status(403).json({ error: 'Invalid signature' });
      }
    }

    // Check for duplicate transaction
    const existingTransaction = await prisma.earning.findFirst({
      where: {
        providerId: 'adgem',
        transactionId: transaction_id
      }
    });

    if (existingTransaction) {
      console.log('[AdGem] Duplicate transaction:', transaction_id);
      return res.status(200).send('1'); // AdGem expects "1" for success
    }

    // Convert amount to points (AdGem usually sends in cents)
    // Adjust conversion rate as needed
    const pointsEarned = Math.floor(parseFloat(amount) * 10); // $1 = 1000 points

    // Find user
    const user = await prisma.user.findUnique({
      where: { id: parseInt(user_id) }
    });

    if (!user) {
      console.error('[AdGem] User not found:', user_id);
      return res.status(404).json({ error: 'User not found' });
    }

    // Create earning record and update balance in transaction
    const [earning, updatedUser] = await prisma.$transaction([
      prisma.earning.create({
        data: {
          userId: user.id,
          providerId: 'adgem',
          providerName: 'AdGem',
          taskId: 'offer',
          amount: pointsEarned,
          transactionId: transaction_id,
          metadata: {
            currency: currency || 'USD',
            originalAmount: amount
          }
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          balance: {
            increment: pointsEarned
          }
        }
      })
    ]);

    console.log('[AdGem] Transaction successful:', {
      userId: user.id,
      username: user.username,
      pointsEarned,
      transactionId: transaction_id,
      newBalance: updatedUser.balance
    });

    // AdGem expects "1" for successful callback
    res.status(200).send('1');

  } catch (error) {
    console.error('[AdGem] Callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Get AdGem offerwall URL for user
 */
export const getAdGemUrl = async (req, res) => {
  try {
    const userId = req.user.id;

    const appId = process.env.ADGEM_POSTBACK_KEY; // AdGem uses postback key as app identifier
    
    if (!appId) {
      return res.status(500).json({ error: 'AdGem not configured' });
    }

    // AdGem iframe URL format
    const adgemUrl = `https://api.adgem.com/v1/wall?appid=${appId}&playerid=${userId}`;

    res.json({
      success: true,
      url: adgemUrl,
      provider: 'adgem'
    });

  } catch (error) {
    console.error('[AdGem] Get URL error:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Test AdGem integration (for development only)
 */
export const testAdGemCallback = async (req, res) => {
  if (process.env.NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Not available in production' });
  }

  try {
    const { user_id, amount } = req.query;

    if (!user_id || !amount) {
      return res.status(400).json({ 
        error: 'Missing parameters',
        usage: '/api/callback/adgem/test?user_id=1&amount=100'
      });
    }

    const transaction_id = `test_${Date.now()}`;
    const postbackKey = process.env.ADGEM_POSTBACK_KEY || 'test-key';

    // Generate test hash
    const hash = crypto
      .createHash('md5')
      .update(`${user_id}${amount}${transaction_id}${postbackKey}`)
      .digest('hex');

    // Call actual callback handler
    const callbackUrl = `http://localhost:${process.env.PORT || 5000}/api/callback/adgem?user_id=${user_id}&amount=${amount}&currency=USD&transaction_id=${transaction_id}&hash=${hash}`;

    console.log('[AdGem Test] Calling:', callbackUrl);

    res.json({
      success: true,
      message: 'Test callback URL generated',
      url: callbackUrl,
      params: {
        user_id,
        amount,
        transaction_id,
        hash
      }
    });

  } catch (error) {
    console.error('[AdGem Test] Error:', error);
    res.status(500).json({ error: error.message });
  }
};
