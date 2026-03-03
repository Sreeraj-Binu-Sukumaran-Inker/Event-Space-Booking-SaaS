import { PrismaClient } from '@prisma/client';
import { createVenue } from './services/venue.service';

const prisma = new PrismaClient();

async function test() {
  const tenant = await prisma.tenant.findFirst();
  if (!tenant) throw new Error("No tenant");

  const v = await createVenue({
    name: "Test Space",
    location: "Test Location",
    capacity: 100,
    price: 50,
    tenantId: tenant.id,
    phone: "1234567890",
    description: "Awesome description",
    city: "New York",
    state: "NY",
    pincode: "10001",
    email: "test@example.com",
    isActive: true,
  });

  console.log("Created venue:", JSON.stringify(v, null, 2));
}

test().catch(console.error).finally(() => prisma.$disconnect());
