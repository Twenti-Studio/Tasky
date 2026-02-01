import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

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

// Update bank account information
export const updateBankAccount = async (req, res) => {
  try {
    const { bankMethod, bankAccountNumber, bankAccountName } = req.body;

    // Validation
    if (!bankMethod || !bankAccountNumber || !bankAccountName) {
      return res.status(400).json({ error: 'All bank account fields are required' });
    }

    // Update user bank account info
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: {
        bankMethod,
        bankAccountNumber,
        bankAccountName
      },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        balance: true,
        isAdmin: true,
        bankMethod: true,
        bankAccountNumber: true,
        bankAccountName: true
      }
    });

    res.json({
      message: 'Bank account updated successfully',
      user
    });
  } catch (error) {
    console.error('Update bank account error:', error);
    res.status(500).json({ error: 'Failed to update bank account' });
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

// Update profile
export const updateProfile = async (req, res) => {
  try {
    const { name, email } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email) {
      // Check if email is already taken
      const existing = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id: req.user.id }
        }
      });
      if (existing) {
        return res.status(400).json({ error: 'Email already in use' });
      }
      updateData.email = email;
    }

    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: updateData,
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        balance: true
      }
    });

    res.json({
      message: 'Profile updated successfully',
      user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Current and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: req.user.id }
    });

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: req.user.id },
      data: { password: hashedPassword }
    });

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to change password' });
  }
};
