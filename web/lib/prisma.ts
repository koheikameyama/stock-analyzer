/**
 * Prisma Client シングルトン
 * Next.jsの開発環境でのホットリロード時に複数のインスタンスが作成されるのを防ぐ
 */

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Vercelサーバーレス環境用の接続プール設定
const createPrismaClient = () => {
  return new PrismaClient({
    datasourceUrl: process.env.DATABASE_URL,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
