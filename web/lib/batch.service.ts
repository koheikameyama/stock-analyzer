/**
 * バッチ処理サービス
 * 銘柄分析のバッチジョブを管理
 * Python + yfinanceスクリプトを呼び出して分析を実行
 */


import { spawn } from 'child_process';
import * as path from 'path';

import { prisma } from './prisma';

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
   * Pythonスクリプト（yfinance）を使用してデータ取得と分析を実行
   * @returns バッチジョブの実行結果
   */
  static async runStockAnalysisBatch(): Promise<BatchJobResult> {
    const startTime = Date.now();
    const jobDate = new Date();

    console.log(
      `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`
    );
    console.log(`🚀 株式分析バッチジョブ開始 (Python + yfinance)`);
    console.log(`⏰ 開始時刻: ${jobDate.toLocaleString('ja-JP')}`);
    console.log(
      `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`
    );

    return new Promise((resolve) => {
      // Pythonスクリプトのパス
      const scriptPath = path.join(
        __dirname,
        '..',
        '..',
        'scripts',
        'batch_analysis.py'
      );

      console.log(`📝 Pythonスクリプトを実行: ${scriptPath}\n`);

      // Pythonスクリプトを実行
      const pythonProcess = spawn('python3', [scriptPath]);

      // 標準出力をリアルタイムで表示
      pythonProcess.stdout.on('data', (data: Buffer) => {
        process.stdout.write(data.toString());
      });

      // 標準エラー出力を表示
      pythonProcess.stderr.on('data', (data: Buffer) => {
        process.stderr.write(data.toString());
      });

      // プロセス終了時の処理
      pythonProcess.on('close', async (code: number) => {
        const duration = Date.now() - startTime;

        if (code === 0) {
          console.log(
            `\n✅ Pythonバッチスクリプト正常終了（終了コード: ${code}）`
          );

          // データベースから最新のバッチジョブログを取得
          const latestLog = await this.getLatestBatchJobLog();

          if (latestLog) {
            resolve({
              jobDate: latestLog.jobDate,
              status: latestLog.status as 'success' | 'partial_success' | 'failure',
              totalStocks: latestLog.totalStocks,
              successCount: latestLog.successCount,
              failureCount: latestLog.failureCount,
              errorMessage: latestLog.errorMessage || undefined,
              duration: latestLog.duration,
            });
          } else {
            // ログが見つからない場合（想定外）
            resolve({
              jobDate,
              status: 'success',
              totalStocks: 0,
              successCount: 0,
              failureCount: 0,
              duration,
            });
          }
        } else {
          console.error(
            `\n❌ Pythonバッチスクリプト異常終了（終了コード: ${code}）`
          );

          // エラーログを記録
          await this.logBatchJob({
            jobDate,
            status: 'failure',
            totalStocks: 0,
            successCount: 0,
            failureCount: 0,
            errorMessage: `Pythonスクリプトが異常終了しました（終了コード: ${code}）`,
            duration,
          });

          resolve({
            jobDate,
            status: 'failure',
            totalStocks: 0,
            successCount: 0,
            failureCount: 0,
            errorMessage: `Pythonスクリプトが異常終了しました（終了コード: ${code}）`,
            duration,
          });
        }
      });

      // エラー発生時の処理
      pythonProcess.on('error', async (error: Error) => {
        const duration = Date.now() - startTime;
        console.error(`\n❌ Pythonスクリプト実行エラー: ${error.message}`);

        // エラーログを記録
        await this.logBatchJob({
          jobDate,
          status: 'failure',
          totalStocks: 0,
          successCount: 0,
          failureCount: 0,
          errorMessage: `Pythonスクリプト実行エラー: ${error.message}`,
          duration,
        });

        resolve({
          jobDate,
          status: 'failure',
          totalStocks: 0,
          successCount: 0,
          failureCount: 0,
          errorMessage: `Pythonスクリプト実行エラー: ${error.message}`,
          duration,
        });
      });
    });
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
