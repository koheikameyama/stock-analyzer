/**
 * データベースシードスクリプト
 * 初期銘柄データをデータベースに投入
 */

import { PrismaClient } from '@prisma/client';
import { allStocks } from './seeds/stocks';

const prisma = new PrismaClient();

/**
 * メインシード関数
 */
async function main() {
  console.log('データベースシード開始...');

  // 既存の銘柄データをカウント
  const existingCount = await prisma.stock.count();
  console.log(`既存銘柄数: ${existingCount}`);

  // 銘柄データの投入
  let createdCount = 0;
  let skippedCount = 0;

  for (const stock of allStocks) {
    try {
      // ticker でユニーク制約があるため、upsert を使用
      await prisma.stock.upsert({
        where: { ticker: stock.ticker },
        update: {
          name: stock.name,
          sector: stock.sector,
          market: stock.market,
        },
        create: {
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector,
          market: stock.market,
        },
      });
      createdCount++;
      console.log(`✓ ${stock.ticker} - ${stock.name}`);
    } catch (error) {
      console.error(`✗ ${stock.ticker} でエラー:`, error);
      skippedCount++;
    }
  }

  console.log(`\nシード完了:`);
  console.log(`- 処理済み: ${createdCount}`);
  console.log(`- スキップ: ${skippedCount}`);
  console.log(`- 合計銘柄数: ${await prisma.stock.count()}`);
}

// スクリプト実行
main()
  .catch((e) => {
    console.error('シードエラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
