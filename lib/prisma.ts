import { PrismaClient } from '@prisma/client';

// Prisma client instance to be shared across the application
const prisma = new PrismaClient();

export default prisma;
