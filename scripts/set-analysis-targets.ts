#!/usr/bin/env tsx
/**
 * AI分析対象銘柄を設定するスクリプト
 *
 * 使用例:
 * - すべての銘柄を対象にする: tsx scripts/set-analysis-targets.ts --all
 * - 特定のティッカーを対象にする: tsx scripts/set-analysis-targets.ts --tickers 7203,9984,6758
 * - セクターで対象にする: tsx scripts/set-analysis-targets.ts --sector "自動車"
 * - すべての対象を解除: tsx scripts/set-analysis-targets.ts --clear
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log('使用方法:');
    console.log('  すべての銘柄を対象: tsx scripts/set-analysis-targets.ts --all');
    console.log('  特定ティッカー: tsx scripts/set-analysis-targets.ts --tickers 7203,9984,6758');
    console.log('  セクター指定: tsx scripts/set-analysis-targets.ts --sector "自動車"');
    console.log('  対象を解除: tsx scripts/set-analysis-targets.ts --clear');
    process.exit(1);
  }

  const command = args[0];

  if (command === '--all') {
    // すべての銘柄を対象にする
    const result = await prisma.stock.updateMany({
      data: { isAiAnalysisTarget: true }
    });
    console.log(`✅ ${result.count}銘柄を分析対象に設定しました`);

  } else if (command === '--tickers' && args[1]) {
    // 特定のティッカーを対象にする
    const tickers = args[1].split(',').map(t => t.trim());
    const result = await prisma.stock.updateMany({
      where: { ticker: { in: tickers } },
      data: { isAiAnalysisTarget: true }
    });
    console.log(`✅ ${result.count}銘柄を分析対象に設定しました`);
    console.log(`   ティッカー: ${tickers.join(', ')}`);

  } else if (command === '--sector' && args[1]) {
    // セクター指定で対象にする
    const sector = args[1];
    const result = await prisma.stock.updateMany({
      where: { sector: sector },
      data: { isAiAnalysisTarget: true }
    });
    console.log(`✅ ${result.count}銘柄を分析対象に設定しました`);
    console.log(`   セクター: ${sector}`);

  } else if (command === '--clear') {
    // すべての対象を解除
    const result = await prisma.stock.updateMany({
      data: { isAiAnalysisTarget: false }
    });
    console.log(`✅ ${result.count}銘柄の分析対象を解除しました`);

  } else {
    console.error('❌ 不正なコマンドです');
    process.exit(1);
  }

  // 現在の対象銘柄数を表示
  const targetCount = await prisma.stock.count({
    where: { isAiAnalysisTarget: true }
  });
  console.log(`\n📊 現在の分析対象銘柄数: ${targetCount}件`);
}

main()
  .catch((e) => {
    console.error('❌ エラー:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
