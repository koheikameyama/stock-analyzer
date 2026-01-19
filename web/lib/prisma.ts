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
  // pgbouncerを使用する場合は、connection_limitとpool_timeoutを設定しない
  const databaseUrl = process.env.DATABASE_URL || '';

  return new PrismaClient({
    datasourceUrl: databaseUrl,
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // 接続タイムアウトを短くして、素早く失敗させる
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
