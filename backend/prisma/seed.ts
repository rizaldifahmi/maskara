import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@monthlyreport.local';
  const plainPassword = process.env.ADMIN_PASSWORD || 'securepassword123';

  // Strict single user check
  const existingUserCount = await prisma.user.count();
  if (existingUserCount > 0) {
    console.log('User already exists in the database. Seeding skipped.');
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 12);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });

  console.log(`Created strict single secure user: ${user.email}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
