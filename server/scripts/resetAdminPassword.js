import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function resetAdminPassword() {
    try {
        const adminEmail = 'admin@mita.com';
        const newPassword = 'Admin123!';

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin password
        const updatedAdmin = await prisma.user.update({
            where: { email: adminEmail },
            data: {
                password: hashedPassword,
                isAdmin: true,
                isActive: true
            }
        });

        console.log('✅ Admin password reset successfully!');
        console.log('Email: admin@mita.com');
        console.log('Password: Admin123!');
        console.log('Username:', updatedAdmin.username);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

resetAdminPassword();
