import { BatchService } from '../src/services/batch.service';

async function main() {
  console.log('🚀 バッチ分析を手動で実行します...\n');

  try {
    await BatchService.runStockAnalysisBatch();
    console.log('\n✅ バッチ分析が完了しました');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ バッチ分析中にエラーが発生しました:', error);
    process.exit(1);
  }
}

main();
