import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        const newPassword = 'Admin123!';
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        const user = await prisma.user.update({
            where: { email: 'admin@tasky.com' },
            data: {
                password: hashedPassword,
                isActive: true,
                isAdmin: true
            }
        });

        console.log('✅ Admin password reset successfully!');
        console.log('   Email:', user.email);
        console.log('   Username:', user.username);
        console.log('   Password: Admin123!');
        console.log('   isActive:', user.isActive);
        console.log('   isAdmin:', user.isAdmin);
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

resetAdminPassword();
