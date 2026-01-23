import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Get user profile
export const getProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        balance: true,
        createdAt: true,
        _count: {
          select: {
            earnings: true,
            adImpressions: true
          }
        }
      }
    });

    res.json({ user });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Get user earnings
export const getEarnings = async (req, res) => {
  try {
    const earnings = await prisma.earning.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    });

    const totalEarnings = await prisma.earning.aggregate({
      where: { userId: req.user.id },
      _sum: { amount: true }
    });

    res.json({
      earnings,
      total: totalEarnings._sum.amount || 0
    });
  } catch (error) {
    console.error('Get earnings error:', error);
    res.status(500).json({ error: 'Failed to get earnings' });
  }
};

// Get user withdrawals
export const getWithdrawals = async (req, res) => {
  try {
    const withdrawals = await prisma.withdrawal.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ withdrawals });
  } catch (error) {
    console.error('Get withdrawals error:', error);
    res.status(500).json({ error: 'Failed to get withdrawals' });
  }
};

// Request withdrawal
export const requestWithdrawal = async (req, res) => {
  try {
    const { amount, method, accountNumber, accountName } = req.body;

    // Validation
    if (!amount || !method || !accountNumber || !accountName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (amount < 5000) {
      return res.status(400).json({ error: 'Minimum withdrawal is 5,000 points (Rp 5,000)' });
    }

    // Check balance
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    if (user.balance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create withdrawal request
    const withdrawal = await prisma.withdrawal.create({
      data: {
        userId: req.user.id,
        amount,
        method,
        accountNumber,
        accountName,
        status: 'pending'
      }
    });

    // Deduct balance
    await prisma.user.update({
      where: { id: req.user.id },
      data: { balance: { decrement: amount } }
    });

    res.status(201).json({
      message: 'Withdrawal request submitted',
      withdrawal
    });
  } catch (error) {
    console.error('Request withdrawal error:', error);
    res.status(500).json({ error: 'Failed to request withdrawal' });
  }
};
