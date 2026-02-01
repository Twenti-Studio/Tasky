import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixAdminUser() {
    try {
        const user = await prisma.user.update({
            where: { email: 'admin@tasky.com' },
            data: {
                isActive: true,
                isAdmin: true
            }
        });

        console.log('✅ Admin user fixed!');
        console.log('Email:', user.email);
        console.log('Username:', user.username);
        console.log('isActive:', user.isActive);
        console.log('isAdmin:', user.isAdmin);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

fixAdminUser();
