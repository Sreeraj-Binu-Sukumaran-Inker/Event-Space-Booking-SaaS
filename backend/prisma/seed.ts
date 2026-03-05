import { PrismaClient, Role } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcrypt";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL environment variable is not set");
}

const pool = new Pool({
  connectionString,
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main(): Promise<void> {
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { role: Role.SUPER_ADMIN },
  });

  // Seed Layouts
  const layouts = [
    { name: 'Basic Layout', key: 'BASIC', description: 'The standard layout for basic plans.' },
    { name: 'Pro Layout', key: 'PRO', description: 'Enhanced layout for pro plans.' },
    { name: 'Premium Layout', key: 'PREMIUM', description: 'Advanced layout for premium plans.' },
  ];

  for (const layout of layouts) {
    await prisma.layout.upsert({
      where: { key: layout.key },
      update: {},
      create: layout,
    });
  }
  console.log('Layouts seeded successfully');

  if (existingSuperAdmin) {
    console.log("Super Admin already exists.");
    return;
  }

  const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD!, 10);
  const superAdminName = process.env.SUPER_ADMIN_NAME!;
  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL!;

  await prisma.user.create({
    data: Object.assign({}, {
      name: superAdminName,
      email: superAdminEmail,
      password: hashedPassword,
      role: Role.SUPER_ADMIN,
      tenantId: null,
    }),
  });

  console.log("Super Admin created successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
