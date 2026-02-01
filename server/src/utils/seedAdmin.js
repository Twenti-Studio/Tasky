import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Seed default admin account for development
 * Auto-runs when server starts
 */
export async function seedAdmin() {
    try {
        const adminEmail = 'admin@mita.com';
        const adminPassword = 'Admin123!';

        // Check if admin already exists
        const existingAdmin = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existingAdmin) {
            // Ensure existing admin has correct permissions
            await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    isAdmin: true,
                    isActive: true
                }
            });
            console.log('✅ Admin account verified');
            return;
        }

        // Create new admin
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        await prisma.user.create({
            data: {
                email: adminEmail,
                username: 'admin',
                password: hashedPassword,
                name: 'Administrator',
                isAdmin: true,
                isActive: true
            }
        });

        console.log('✅ Default admin account created');
        console.log('   Email: admin@mita.com');
        console.log('   Password: Admin123!');
    } catch (error) {
        console.error('❌ Failed to seed admin:', error.message);
    }
}
