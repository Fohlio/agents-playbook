import { PrismaClient } from '@prisma/client';

// Extend global type for development hot reload
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Create Prisma client singleton
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' 
      ? ['query', 'error', 'warn'] 
      : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Cache client in development to prevent multiple instances during hot reload
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Graceful shutdown handlers (only in Node.js runtime, not Edge Runtime)
if (typeof process !== 'undefined' && typeof process.on === 'function' && typeof process.exit === 'function') {
  process.on('beforeExit', async () => {
    console.log('[Prisma] Disconnecting before exit...');
    await prisma.$disconnect();
  });

  process.on('SIGINT', async () => {
    console.log('[Prisma] Disconnecting on SIGINT...');
    await prisma.$disconnect();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('[Prisma] Disconnecting on SIGTERM...');
    await prisma.$disconnect();
    process.exit(0);
  });
}

