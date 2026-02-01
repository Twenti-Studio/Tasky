import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Admin authentication middleware
 * Checks if user is authenticated and has admin privileges
 */
export const adminAuth = async (req, res, next) => {
    try {
        // First check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ error: 'Authentication required' });
        }

        // Get fresh user data with admin status
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: { id: true, isAdmin: true, isActive: true }
        });

        if (!user) {
            return res.status(401).json({ error: 'User not found' });
        }

        if (!user.isActive) {
            return res.status(403).json({ error: 'Account is disabled' });
        }

        if (!user.isAdmin) {
            return res.status(403).json({ error: 'Admin access required' });
        }

        next();
    } catch (error) {
        console.error('[AdminAuth] Error:', error);
        res.status(500).json({ error: 'Authorization failed' });
    }
};
