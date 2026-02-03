import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Create test accounts for development
 * This script creates a test user and a test admin account
 */
async function createTestAccounts() {
  try {
    console.log('Creating test accounts...\n');

    // Test Admin Account
    const adminEmail = 'admin@test.com';
    const adminUsername = 'testadmin';
    const adminPassword = 'admin123';

    const existingAdmin = await prisma.user.findFirst({
      where: {
        OR: [
          { email: adminEmail },
          { username: adminUsername }
        ]
      }
    });

    if (existingAdmin) {
      console.log('✓ Test admin already exists');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Username: ${adminUsername}`);
      console.log(`  Password: ${adminPassword}\n`);
    } else {
      const hashedAdminPassword = await bcrypt.hash(adminPassword, 10);
      
      const admin = await prisma.user.create({
        data: {
          email: adminEmail,
          username: adminUsername,
          password: hashedAdminPassword,
          name: 'Test Administrator',
          isAdmin: true,
          isActive: true,
          emailVerified: true,
          balance: 0,
          bankMethod: 'dana',
          bankAccountNumber: '081234567890',
          bankAccountName: 'Test Admin'
        }
      });

      console.log('✓ Test admin account created');
      console.log(`  Email: ${adminEmail}`);
      console.log(`  Username: ${adminUsername}`);
      console.log(`  Password: ${adminPassword}\n`);
    }

    // Test User Account
    const userEmail = 'user@test.com';
    const userUsername = 'testuser';
    const userPassword = 'user123';

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: userEmail },
          { username: userUsername }
        ]
      }
    });

    if (existingUser) {
      console.log('✓ Test user already exists');
      console.log(`  Email: ${userEmail}`);
      console.log(`  Username: ${userUsername}`);
      console.log(`  Password: ${userPassword}\n`);
    } else {
      const hashedUserPassword = await bcrypt.hash(userPassword, 10);
      
      const user = await prisma.user.create({
        data: {
          email: userEmail,
          username: userUsername,
          password: hashedUserPassword,
          name: 'Test User',
          isAdmin: false,
          isActive: true,
          emailVerified: true,
          balance: 1000,
          bankMethod: 'gopay',
          bankAccountNumber: '089876543210',
          bankAccountName: 'Test User'
        }
      });

      console.log('✓ Test user account created');
      console.log(`  Email: ${userEmail}`);
      console.log(`  Username: ${userUsername}`);
      console.log(`  Password: ${userPassword}`);
      console.log(`  Balance: 1000 points\n`);
    }

    console.log('=====================================');
    console.log('TEST ACCOUNTS SUMMARY');
    console.log('=====================================');
    console.log('\nADMIN ACCOUNT:');
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Password: ${adminPassword}`);
    console.log('\nUSER ACCOUNT:');
    console.log(`  Email: ${userEmail}`);
    console.log(`  Username: ${userUsername}`);
    console.log(`  Password: ${userPassword}`);
    console.log('\nYou can now use these accounts for testing without creating new ones each time!');
    console.log('=====================================\n');

  } catch (error) {
    console.error('Error creating test accounts:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createTestAccounts();
}

export default createTestAccounts;
