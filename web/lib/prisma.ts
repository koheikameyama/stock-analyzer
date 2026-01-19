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
  // サーバーレス環境に最適化された接続プール設定
  const url = new URL(process.env.DATABASE_URL || '');
  url.searchParams.set('connection_limit', '1');
  url.searchParams.set('pool_timeout', '0');

  return new PrismaClient({
    datasourceUrl: url.toString(),
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
