/**
 * 分析コントローラー
 * AI株式分析結果のAPIエンドポイント
 */

import { Request, Response } from 'express';
import { AnalysisService } from '../services/analysis.service';
import { BatchService } from '../services/batch.service';

/**
 * 分析コントローラークラス
 */
export class AnalysisController {
  /**
   * GET /api/analyses/latest
   * 最新の分析結果を取得
   * @query market - 市場フィルター（JP/US、オプション）
   * @query recommendation - 推奨フィルター（Buy/Sell/Hold、オプション）
   */
  static async getLatestAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const { market, recommendation } = req.query;

      // バリデーション
      if (market && !['JP', 'US'].includes(market as string)) {
        res.status(400).json({
          success: false,
          message: 'market は JP または US である必要があります',
        });
        return;
      }

      if (
        recommendation &&
        !['Buy', 'Sell', 'Hold'].includes(recommendation as string)
      ) {
        res.status(400).json({
          success: false,
          message: 'recommendation は Buy, Sell, または Hold である必要があります',
        });
        return;
      }

      // データ取得
      const analyses = await AnalysisService.getLatestAnalyses(
        market as 'JP' | 'US' | undefined,
        recommendation as 'Buy' | 'Sell' | 'Hold' | undefined
      );

      // 最終更新日時
      const lastUpdateDate =
        analyses.length > 0 ? analyses[0].analysisDate : null;

      res.json({
        success: true,
        data: {
          analyses,
          lastUpdateDate,
        },
      });
    } catch (error) {
      console.error('最新分析結果の取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * GET /api/analyses/history
   * 指定日付の分析結果を取得
   * @query date - 日付（YYYY-MM-DD形式、必須）
   * @query market - 市場フィルター（JP/US、オプション）
   */
  static async getHistoryAnalyses(req: Request, res: Response): Promise<void> {
    try {
      const { date, market } = req.query;

      // バリデーション
      if (!date || typeof date !== 'string') {
        res.status(400).json({
          success: false,
          message: 'date パラメータ（YYYY-MM-DD形式）が必要です',
        });
        return;
      }

      // 日付フォーマットの検証
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(date)) {
        res.status(400).json({
          success: false,
          message: 'date は YYYY-MM-DD 形式である必要があります',
        });
        return;
      }

      if (market && !['JP', 'US'].includes(market as string)) {
        res.status(400).json({
          success: false,
          message: 'market は JP または US である必要があります',
        });
        return;
      }

      // データ取得
      const analyses = await AnalysisService.getAnalysesByDate(
        date,
        market as 'JP' | 'US' | undefined
      );

      res.json({
        success: true,
        data: {
          analyses,
          date,
        },
      });
    } catch (error) {
      console.error('履歴分析結果の取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * GET /api/analyses/:id
   * 特定分析の詳細情報を取得（株価履歴を含む）
   * @param id - 分析ID（UUID）
   */
  static async getAnalysisDetail(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // UUIDフォーマットの簡易検証
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(id)) {
        res.status(400).json({
          success: false,
          message: '無効な分析IDです',
        });
        return;
      }

      // データ取得
      const analysis = await AnalysisService.getAnalysisDetail(id);

      if (!analysis) {
        res.status(404).json({
          success: false,
          message: '指定された分析が見つかりませんでした',
        });
        return;
      }

      res.json({
        success: true,
        data: {
          analysis,
        },
      });
    } catch (error) {
      console.error('分析詳細の取得エラー:', error);
      res.status(500).json({
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }
}
