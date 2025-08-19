import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Logger } from '@nestjs/common';

const prisma = new PrismaClient();
const logger = new Logger('PrismaSeed');

async function main() {
  logger.log('🌱 Starting database seeding...');

  try {
    // Create a test user
    const hashedPassword = await bcrypt.hash('TestPassword123!', 12);
    
    const testUser = await prisma.user.upsert({
      where: { email: 'test@maxiphy.com' },
      update: {},
      create: {
        email: 'test@maxiphy.com',
        firstName: 'Test',
        lastName: 'User',
        password: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    });

    logger.log(`✅ Created/updated test user: ${testUser.email}`);

    // Create an admin user
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@maxiphy.com' },
      update: {},
      create: {
        email: 'admin@maxiphy.com',
        firstName: 'Admin',
        lastName: 'User',
        password: hashedPassword,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        isActive: true,
      },
    });

    logger.log(`✅ Created/updated admin user: ${adminUser.email}`);

    // Create some sample audit logs
    await prisma.auditLog.createMany({
      data: [
        {
          userId: testUser.id,
          action: 'USER_LOGIN',
          entity: 'User',
          entityId: testUser.id,
          newValues: { loginAt: new Date() },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          success: true,
        },
        {
          userId: adminUser.id,
          action: 'USER_LOGIN',
          entity: 'User',
          entityId: adminUser.id,
          newValues: { loginAt: new Date() },
          ipAddress: '127.0.0.1',
          userAgent: 'Mozilla/5.0 (Test Browser)',
          success: true,
        },
      ],
      skipDuplicates: true,
    });

    logger.log('✅ Created sample audit logs');

    // Create some system logs
    await prisma.systemLog.createMany({
      data: [
        {
          level: 'info',
          message: 'Application started successfully',
          context: 'Bootstrap',
          metadata: { version: '1.0.0', environment: 'development' },
        },
        {
          level: 'info',
          message: 'Database connected successfully',
          context: 'PrismaService',
          metadata: { connectionPool: 'active' },
        },
      ],
      skipDuplicates: true,
    });

    logger.log('✅ Created sample system logs');

    logger.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    logger.error('❌ Error during database seeding:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    logger.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });