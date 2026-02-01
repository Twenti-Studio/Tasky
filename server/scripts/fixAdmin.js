import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function fixAdminAccount() {
    try {
        const targetUsername = 'admin';
        const targetEmail = 'admin@mita.com';
        const targetPassword = 'Admin123!';

        console.log(`Searching for user with username: ${targetUsername}...`);

        const user = await prisma.user.findUnique({
            where: { username: targetUsername }
        });

        if (!user) {
            console.log(`❌ No user found with username: ${targetUsername}. Creating new...`);
            const hashedPassword = await bcrypt.hash(targetPassword, 10);
            await prisma.user.create({
                data: {
                    username: targetUsername,
                    email: targetEmail,
                    password: hashedPassword,
                    name: 'Administrator',
                    isAdmin: true,
                    isActive: true,
                    balance: 0
                }
            });
            console.log('✅ Admin created successfully!');
        } else {
            console.log(`Found user: ${user.username} (Email: ${user.email}). Updating to match desired credentials...`);
            const hashedPassword = await bcrypt.hash(targetPassword, 10);
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    email: targetEmail,
                    password: hashedPassword,
                    isAdmin: true,
                    isActive: true
                }
            });
            console.log('✅ Admin account updated successfully!');
        }

        console.log('=====================================');
        console.log('Login with:');
        console.log(`Email: ${targetEmail}`);
        console.log(`Password: ${targetPassword}`);
        console.log('=====================================');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

fixAdminAccount();
