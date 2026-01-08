/**
 * バッチジョブコントローラー
 * バッチジョブのステータス管理API
 */

import { Request, Response } from 'express';
import { BatchService } from '../services/batch.service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * バッチジョブコントローラークラス
 */
export class BatchController {
  /**
   * GET /api/batch-jobs/status
   * 最新のバッチジョブステータスを取得
   */
  static async getBatchJobStatus(req: Request, res: Response): Promise<void> {
    try {
      const latestJob = await BatchService.getLatestBatchJobLog();

      if (!latestJob) {
        res.json({
          success: true,
          data: {
            lastJob: null,
            message: 'バッチジョブの実行履歴がありません',
          },
        });
        return;
      }

      res.json({
        success: true,
        data: {
          lastJob: latestJob,
        },
      });
    } catch (error) {
      console.error('バッチジョブステータスの取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * GET /api/batch-jobs/history
   * バッチジョブの実行履歴を取得
   * @query days - 過去何日分を取得するか（デフォルト: 30日）
   */
  static async getBatchJobHistory(req: Request, res: Response): Promise<void> {
    try {
      const { days } = req.query;
      const daysNumber = days ? parseInt(days as string, 10) : 30;

      if (isNaN(daysNumber) || daysNumber <= 0) {
        res.status(400).json({
          success: false,
          message: 'days は正の整数である必要があります',
        });
        return;
      }

      const history = await BatchService.getBatchJobLogs(daysNumber);

      res.json({
        success: true,
        data: {
          history,
        },
      });
    } catch (error) {
      console.error('バッチジョブ履歴の取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * GET /api/stocks
   * 銘柄リスト取得（管理用）
   * @query market - 市場フィルター（JP/US、オプション）
   */
  static async getStocks(req: Request, res: Response): Promise<void> {
    try {
      const { market } = req.query;

      // バリデーション
      if (market && !['JP', 'US'].includes(market as string)) {
        res.status(400).json({
          success: false,
          message: 'market は JP または US である必要があります',
        });
        return;
      }

      // データ取得
      const stocks = await prisma.stock.findMany({
        where: market ? { market: market as 'JP' | 'US' } : {},
        orderBy: [{ market: 'asc' }, { ticker: 'asc' }],
        select: {
          id: true,
          ticker: true,
          name: true,
          market: true,
          sector: true,
          createdAt: true,
        },
      });

      res.json({
        success: true,
        data: {
          stocks,
          count: stocks.length,
        },
      });
    } catch (error) {
      console.error('銘柄リストの取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
