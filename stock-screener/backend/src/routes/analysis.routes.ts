/**
 * 分析APIルート
 * AI株式分析結果のエンドポイント定義
 */

import { Router } from 'express';
import { AnalysisController } from '../controllers/analysis.controller';

const router = Router();

/**
 * GET /api/analyses/latest
 * 最新の分析結果を取得
 */
router.get('/latest', AnalysisController.getLatestAnalyses);

/**
 * GET /api/analyses/history
 * 指定日付の分析結果を取得
 */
router.get('/history', AnalysisController.getHistoryAnalyses);

/**
 * GET /api/analyses/:id
 * 特定分析の詳細情報を取得
 */
router.get('/:id', AnalysisController.getAnalysisDetail);

export default router;
