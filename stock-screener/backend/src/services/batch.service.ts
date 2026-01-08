/**
 * バッチ処理サービス
 * 銘柄分析のバッチジョブを管理
 */

import { PrismaClient } from '@prisma/client';
import { AnalysisService, AnalysisResult } from './analysis.service';

const prisma = new PrismaClient();

/**
 * バッチジョブの実行結果
 */
export interface BatchJobResult {
  jobDate: Date;
  status: 'success' | 'partial_success' | 'failure';
  totalStocks: number;
  successCount: number;
  failureCount: number;
  errorMessage?: string;
  duration: number;
}

/**
 * バッチ処理サービスクラス
 */
export class BatchService {
  /**
   * 全銘柄の分析バッチジョブを実行
   * @returns バッチジョブの実行結果
   */
  static async runStockAnalysisBatch(): Promise<BatchJobResult> {
    const startTime = Date.now();
    const jobDate = new Date();

    console.log(
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
    console.log(`🚀 株式分析バッチジョブ開始`);
    console.log(`⏰ 開始時刻: ${jobDate.toLocaleString('ja-JP')}`);
    console.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    );

    try {
      // 1. 対象銘柄リストをデータベースから取得
      const stocks = await prisma.stock.findMany({
        select: {
          ticker: true,
          market: true,
        },
      });

      if (stocks.length === 0) {
        console.warn('⚠️ 分析対象の銘柄が見つかりませんでした');
        const duration = Date.now() - startTime;

        // バッチジョブログを記録
        await this.logBatchJob({
          jobDate,
          status: 'failure',
          totalStocks: 0,
          successCount: 0,
          failureCount: 0,
          errorMessage: '分析対象の銘柄が見つかりませんでした',
          duration,
        });

        return {
          jobDate,
          status: 'failure',
          totalStocks: 0,
          successCount: 0,
          failureCount: 0,
          errorMessage: '分析対象の銘柄が見つかりませんでした',
          duration,
        };
      }

      console.log(`📋 対象銘柄数: ${stocks.length}件\n`);

      // 2. 市場別に銘柄を分類
      const jpStocks = stocks
        .filter((s) => s.market === 'JP')
        .map((s) => s.ticker);
      const usStocks = stocks
        .filter((s) => s.market === 'US')
        .map((s) => s.ticker);

      const allResults: AnalysisResult[] = [];

      // 3. 日本株の分析
      if (jpStocks.length > 0) {
        console.log(`🇯🇵 日本株の分析開始（${jpStocks.length}銘柄）\n`);
        const jpResults = await AnalysisService.analyzeMultipleStocks(
          jpStocks,
          'JP'
        );
        allResults.push(...jpResults);
      }

      // 4. 米国株の分析
      if (usStocks.length > 0) {
        console.log(`\n🇺🇸 米国株の分析開始（${usStocks.length}銘柄）\n`);
        const usResults = await AnalysisService.analyzeMultipleStocks(
          usStocks,
          'US'
        );
        allResults.push(...usResults);
      }

      // 5. 結果の集計
      const successCount = allResults.filter((r) => r.success).length;
      const failureCount = allResults.filter((r) => !r.success).length;
      const duration = Date.now() - startTime;

      // 6. ステータスの判定
      let status: 'success' | 'partial_success' | 'failure';
      let errorMessage: string | undefined;

      if (successCount === stocks.length) {
        status = 'success';
      } else if (successCount > 0) {
        status = 'partial_success';
        errorMessage = `${failureCount}件の銘柄分析に失敗しました`;
      } else {
        status = 'failure';
        errorMessage = 'すべての銘柄分析に失敗しました';
      }

      // 7. バッチジョブログを記録
      await this.logBatchJob({
        jobDate,
        status,
        totalStocks: stocks.length,
        successCount,
        failureCount,
        errorMessage,
        duration,
      });

      // 8. 結果のサマリー表示
      console.log(
        `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
      );
      console.log(`✅ バッチジョブ完了`);
      console.log(`⏱️  処理時間: ${(duration / 1000).toFixed(2)}秒`);
      console.log(`📊 結果サマリー:`);
      console.log(`   - 対象銘柄数: ${stocks.length}`);
      console.log(`   - 成功: ${successCount}`);
      console.log(`   - 失敗: ${failureCount}`);
      console.log(`   - ステータス: ${status}`);
      if (errorMessage) {
        console.log(`   - エラー: ${errorMessage}`);
      }
      console.log(
        `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
      );

      return {
        jobDate,
        status,
        totalStocks: stocks.length,
        successCount,
        failureCount,
        errorMessage,
        duration,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      console.error(
        `\n❌ バッチジョブでエラーが発生しました: ${errorMessage}\n`
      );

      // エラーログを記録
      await this.logBatchJob({
        jobDate,
        status: 'failure',
        totalStocks: 0,
        successCount: 0,
        failureCount: 0,
        errorMessage: `バッチジョブエラー: ${errorMessage}`,
        duration,
      });

      return {
        jobDate,
        status: 'failure',
        totalStocks: 0,
        successCount: 0,
        failureCount: 0,
        errorMessage: `バッチジョブエラー: ${errorMessage}`,
        duration,
      };
    }
  }

  /**
   * バッチジョブログをデータベースに記録
   * @param result バッチジョブの実行結果
   */
  private static async logBatchJob(result: BatchJobResult): Promise<void> {
    try {
      await prisma.batchJobLog.create({
        data: {
          jobDate: result.jobDate,
          status: result.status,
          totalStocks: result.totalStocks,
          successCount: result.successCount,
          failureCount: result.failureCount,
          errorMessage: result.errorMessage,
          duration: result.duration,
        },
      });

      console.log('📝 バッチジョブログを記録しました');
    } catch (error) {
      console.error('バッチジョブログの記録に失敗しました:', error);
    }
  }

  /**
   * 最新のバッチジョブログを取得
   * @returns 最新のバッチジョブログ
   */
  static async getLatestBatchJobLog() {
    return prisma.batchJobLog.findFirst({
      orderBy: { jobDate: 'desc' },
    });
  }

  /**
   * 指定期間のバッチジョブログを取得
   * @param days 過去何日分を取得するか（デフォルト: 30日）
   * @returns バッチジョブログの配列
   */
  static async getBatchJobLogs(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.batchJobLog.findMany({
      where: {
        jobDate: {
          gte: startDate,
        },
      },
      orderBy: { jobDate: 'desc' },
    });
  }
}
