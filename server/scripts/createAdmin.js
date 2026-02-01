import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
    try {
        const adminEmail = 'admin@mita.com';
        const adminPassword = 'Admin123!';

        // Check if admin exists
        const existing = await prisma.user.findUnique({
            where: { email: adminEmail }
        });

        if (existing) {
            console.log('❌ Admin already exists!');
            console.log('Email:', existing.email);
            console.log('Username:', existing.username);

            // Try to update password
            const hashedPassword = await bcrypt.hash(adminPassword, 10);
            await prisma.user.update({
                where: { email: adminEmail },
                data: {
                    password: hashedPassword,
                    isAdmin: true,
                    isActive: true
                }
            });
            console.log('✅ Password updated to: Admin123!');
            process.exit(0);
            return;
        }

        // Create new admin
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        const admin = await prisma.user.create({
            data: {
                email: adminEmail,
                username: 'admin',
                password: hashedPassword,
                name: 'Administrator',
                isAdmin: true,
                isActive: true,
                balance: 0
            }
        });

        console.log('✅ Admin created successfully!');
        console.log('=====================================');
        console.log('Email: admin@mita.com');
        console.log('Password: Admin123!');
        console.log('Username:', admin.username);
        console.log('=====================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error('Full error:', error);
        process.exit(1);
    }
}

createAdmin();
