/**
 * Prisma Client シングルトン
 * Next.jsの開発環境でのホットリロード時に複数のインスタンスが作成されるのを防ぐ
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
