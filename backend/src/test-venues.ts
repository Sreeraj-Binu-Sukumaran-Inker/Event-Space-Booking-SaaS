import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.venue.findMany({ include: { facilities: true } }).then(vs => { console.log(JSON.stringify(vs, null, 2)); prisma.$disconnect(); });
