// lib/prisma.ts

import { PrismaClient } from '@prisma/client';

declare global {
  namespace NodeJS {
    interface Global {
      prisma: PrismaClient;
    }
  }
}

let prisma: PrismaClient;

// Initialize PrismaClient based on environment
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  // Ensure global.prisma is initialized only once in development
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
