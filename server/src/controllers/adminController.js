import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Get admin dashboard stats
 */
export const getStats = async (req, res) => {
    try {
        // Use safe queries with fallback
        const totalUsers = await prisma.user.count().catch(() => 0);
        const activeUsers = await prisma.user.count({ where: { isActive: true } }).catch(() => 0);

        // Withdrawals might not exist yet
        const totalWithdrawals = await prisma.withdrawal.count().catch(() => 0);
        const pendingWithdrawals = await prisma.withdrawal.count({ where: { status: 'pending' } }).catch(() => 0);

        // Earnings might not exist yet
        const totalEarnings = await prisma.earning.aggregate({ _sum: { amount: true } }).catch(() => ({ _sum: { amount: 0 } }));

        // Recent users
        const recentUsers = await prisma.user.findMany({
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
                id: true,
                username: true,
                createdAt: true,
                balance: true
            }
        }).catch(() => []);

        res.json({
            stats: {
                totalUsers,
                activeUsers,
                inactiveUsers: totalUsers - activeUsers,
                totalWithdrawals,
                pendingWithdrawals,
                totalEarnings: totalEarnings._sum.amount || 0
            },
            recentUsers
        });
    } catch (error) {
        console.error('[Admin] Get stats error:', error);
        res.status(500).json({
            error: 'Failed to get stats',
            stats: {
                totalUsers: 0,
                activeUsers: 0,
                inactiveUsers: 0,
                totalWithdrawals: 0,
                pendingWithdrawals: 0,
                totalEarnings: 0
            },
            recentUsers: []
        });
    }
};

/**
 * Get all users with pagination
 */
export const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;
        const search = req.query.search || '';

        const where = search ? {
            OR: [
                { email: { contains: search, mode: 'insensitive' } },
                { username: { contains: search, mode: 'insensitive' } },
                { name: { contains: search, mode: 'insensitive' } }
            ]
        } : {};

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    username: true,
                    name: true,
                    balance: true,
                    isActive: true,
                    isAdmin: true,
                    createdAt: true,
                    _count: {
                        select: {
                            earnings: true,
                            withdrawals: true
                        }
                    }
                }
            }),
            prisma.user.count({ where })
        ]);

        res.json({
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('[Admin] Get users error:', error);
        res.status(500).json({ error: 'Failed to get users' });
    }
};

/**
 * Update user status (activate/deactivate)
 */
export const updateUserStatus = async (req, res) => {
    try {
        const { userId } = req.params;
        const { isActive } = req.body;

        if (typeof isActive !== 'boolean') {
            return res.status(400).json({ error: 'isActive must be a boolean' });
        }

        const user = await prisma.user.update({
            where: { id: userId },
            data: { isActive },
            select: {
                id: true,
                username: true,
                isActive: true
            }
        });

        console.log(`[Admin] User ${user.username} ${isActive ? 'activated' : 'deactivated'}`);

        res.json({
            message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
            user
        });
    } catch (error) {
        console.error('[Admin] Update user status error:', error);
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

/**
 * Get user details
 */
export const getUserDetails = async (req, res) => {
    try {
        const { userId } = req.params;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                balance: true,
                isActive: true,
                isAdmin: true,
                createdAt: true,
                earnings: {
                    orderBy: { createdAt: 'desc' },
                    take: 20
                },
                withdrawals: {
                    orderBy: { createdAt: 'desc' },
                    take: 10
                },
                _count: {
                    select: {
                        earnings: true,
                        withdrawals: true,
                        transactions: true
                    }
                }
            }
        });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user });
    } catch (error) {
        console.error('[Admin] Get user details error:', error);
        res.status(500).json({ error: 'Failed to get user details' });
    }
};

/**
 * Get all withdrawals
 */
export const getWithdrawals = async (req, res) => {
    try {
        const status = req.query.status || 'all';

        const where = status !== 'all' ? { status } : {};

        const withdrawals = await prisma.withdrawal.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });

        const stats = await prisma.withdrawal.groupBy({
            by: ['status'],
            _count: true,
            _sum: { amount: true }
        });

        res.json({
            withdrawals,
            stats
        });
    } catch (error) {
        console.error('[Admin] Get withdrawals error:', error);
        res.status(500).json({ error: 'Failed to get withdrawals' });
    }
};

/**
 * Update withdrawal status
 */
export const updateWithdrawalStatus = async (req, res) => {
    try {
        const { withdrawalId } = req.params;
        const { status, adminNote } = req.body;

        const validStatuses = ['pending', 'approved', 'processing', 'completed', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const withdrawal = await prisma.withdrawal.findUnique({
            where: { id: withdrawalId },
            include: { user: { select: { username: true } } }
        });

        if (!withdrawal) {
            return res.status(404).json({ error: 'Withdrawal not found' });
        }

        const updateData = {
            status,
            adminNote: adminNote || null
        };

        // Set timestamps based on status
        if (status === 'approved' || status === 'processing') {
            updateData.processedAt = new Date();
        }
        if (status === 'completed') {
            updateData.transferredAt = new Date();
        }

        const updated = await prisma.withdrawal.update({
            where: { id: withdrawalId },
            data: updateData,
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true
                    }
                }
            }
        });

        console.log(`[Admin] Withdrawal ${withdrawalId} updated to ${status}`);

        res.json({
            message: 'Withdrawal updated successfully',
            withdrawal: updated
        });
    } catch (error) {
        console.error('[Admin] Update withdrawal error:', error);
        res.status(500).json({ error: 'Failed to update withdrawal' });
    }
};
