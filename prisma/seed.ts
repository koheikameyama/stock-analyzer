/**
 * Prisma シードスクリプト
 * 初期銘柄データをデータベースに投入
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 シードデータを投入中...\n');

  // Supabaseからエクスポートした銘柄データを読み込み
  const jsonPath = path.join(__dirname, 'seed-data/supabase-export.json');

  if (!fs.existsSync(jsonPath)) {
    console.log('⚠️  銘柄データが見つかりません。スキップします。');
    return;
  }

  const jsonData = fs.readFileSync(jsonPath, 'utf-8');
  const data = JSON.parse(jsonData);

  console.log(`📊 ${data.stocks.length}銘柄を登録中...\n`);

  // バッチで銘柄を登録
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < data.stocks.length; i += batchSize) {
    const batch = data.stocks.slice(i, i + batchSize);
    await prisma.stock.createMany({
      data: batch,
      skipDuplicates: true
    });
    imported += batch.length;
    console.log(`  進捗: ${imported}/${data.stocks.length}`);
  }

  // 登録結果を確認
  const totalStocks = await prisma.stock.count();

  console.log('\n✅ シードデータの投入が完了しました！');
  console.log(`   合計: ${totalStocks}銘柄\n`);
}

main()
  .catch((e) => {
    console.error('❌ シードデータの投入に失敗しました:');
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
