import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUser() {
    try {
        const user = await prisma.user.findFirst({
            where: { email: 'admin@mita.com' }
        });

        if (user) {
            console.log('User found:');
            console.log('Email:', user.email);
            console.log('Username:', user.username);
            console.log('isActive:', user.isActive);
            console.log('isAdmin:', user.isAdmin);
        } else {
            console.log('User not found');
        }
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkUser();
