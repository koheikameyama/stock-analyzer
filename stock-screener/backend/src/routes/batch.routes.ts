/**
 * バッチジョブAPIルート
 * バッチジョブステータスと銘柄管理のエンドポイント定義
 */

import { Router } from 'express';
import { BatchController } from '../controllers/batch.controller';

const router = Router();

/**
 * GET /api/batch-jobs/status
 * 最新のバッチジョブステータスを取得
 */
router.get('/status', BatchController.getBatchJobStatus);

/**
 * GET /api/batch-jobs/history
 * バッチジョブの実行履歴を取得
 */
router.get('/history', BatchController.getBatchJobHistory);

/**
 * GET /api/stocks
 * 銘柄リスト取得（管理用）
 */
router.get('/stocks', BatchController.getStocks);

export default router;
