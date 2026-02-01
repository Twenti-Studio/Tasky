// Script to create or promote a user to admin
// Usage: node scripts/createAdmin.js <username-or-email> [password]

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function createOrPromoteAdmin() {
    const usernameOrEmail = process.argv[2];
    const password = process.argv[3];

    if (!usernameOrEmail) {
        console.log('Usage:');
        console.log('  Promote existing user: node scripts/createAdmin.js <username-or-email>');
        console.log('  Create new admin: node scripts/createAdmin.js <email> <password>');
        process.exit(1);
    }

    try {
        // Check if user exists
        let user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: usernameOrEmail },
                    { username: usernameOrEmail }
                ]
            }
        });

        if (user) {
            // Promote existing user to admin
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    isAdmin: true,
                    isActive: true  // Ensure account is active
                }
            });
            console.log('✅ User promoted to admin successfully!');
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   isAdmin: ${user.isAdmin}`);
            console.log(`   isActive: ${user.isActive}`);
        } else if (password) {
            // Create new admin user
            const hashedPassword = await bcrypt.hash(password, 10);
            const username = usernameOrEmail.split('@')[0] || 'admin';

            user = await prisma.user.create({
                data: {
                    email: usernameOrEmail,
                    username: username,
                    password: hashedPassword,
                    name: 'Administrator',
                    isAdmin: true,
                    isActive: true
                }
            });
            console.log('✅ Admin user created successfully!');
            console.log(`   Username: ${user.username}`);
            console.log(`   Email: ${user.email}`);
            console.log(`   isAdmin: ${user.isAdmin}`);
        } else {
            console.log('❌ User not found. To create a new admin, provide password:');
            console.log(`   node scripts/createAdmin.js ${usernameOrEmail} <password>`);
            process.exit(1);
        }
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

createOrPromoteAdmin();
