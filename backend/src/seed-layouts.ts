import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
