/**
 * 株式分析バッチジョブスケジューラー
 * node-cronを使用して毎朝7時に自動実行（月〜金のみ）
 */

import cron from 'node-cron';
import { BatchService } from '../services/batch.service';

/**
 * 株式分析バッチジョブを実行する関数
 */
async function runStockAnalysisBatchJob() {
  console.log('\n=================================================');
  console.log('株式分析バッチジョブが起動されました');
  console.log(`実行時刻: ${new Date().toLocaleString('ja-JP')}`);
  console.log('=================================================\n');

  try {
    const result = await BatchService.runStockAnalysisBatch();

    if (result.status === 'success') {
      console.log('✅ バッチジョブが正常に完了しました');
    } else if (result.status === 'partial_success') {
      console.warn('⚠️ バッチジョブが部分的に成功しました');
    } else {
      console.error('❌ バッチジョブが失敗しました');
    }
  } catch (error) {
    console.error('予期しないエラーが発生しました:', error);
  }
}

/**
 * スケジューラーの設定と起動
 */
export function startStockAnalysisScheduler() {
  // 毎朝7時、月曜日〜金曜日のみ実行（JST）
  // cron式: '0 7 * * 1-5'
  // - 0: 分（0分）
  // - 7: 時（7時）
  // - *: 日（毎日）
  // - *: 月（毎月）
  // - 1-5: 曜日（月曜日〜金曜日）
  const cronExpression = '0 7 * * 1-5';

  const task = cron.schedule(
    cronExpression,
    async () => {
      await runStockAnalysisBatchJob();
    },
    {
      timezone: 'Asia/Tokyo',
    }
  );

  console.log('🕐 株式分析バッチジョブのスケジューラーを起動しました');
  console.log('⏰ 実行スケジュール: 毎朝7:00 AM（月〜金曜日）');
  console.log(`🌏 タイムゾーン: Asia/Tokyo`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // デバッグ用: 次回実行時刻の表示
  const nextRun = getNextCronRun(cronExpression);
  if (nextRun) {
    console.log(`📅 次回実行予定: ${nextRun.toLocaleString('ja-JP')}\n`);
  }

  return task;
}

/**
 * 次回のcron実行時刻を計算（簡易版）
 */
function getNextCronRun(cronExpression: string): Date | null {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(7, 0, 0, 0);

  // 月〜金の7時を探す
  for (let i = 0; i < 7; i++) {
    const day = tomorrow.getDay(); // 0=日曜, 1=月曜, ..., 6=土曜
    if (day >= 1 && day <= 5) {
      // 月〜金
      return tomorrow;
    }
    tomorrow.setDate(tomorrow.getDate() + 1);
  }

  return null;
}

/**
 * 手動でバッチジョブを実行（テスト用）
 */
export async function runManualBatchJob() {
  console.log('🔧 手動バッチジョブを実行します...\n');
  await runStockAnalysisBatchJob();
}
