/**
 * APIルートの統合
 * すべてのルートをここで管理
 */

import { Router } from 'express';
import stocksRoutes from './stocks.routes';
import analysisRoutes from './analysis.routes';
import batchRoutes from './batch.routes';

const router = Router();

// 既存の株式スクリーニングルート
router.use('/stocks', stocksRoutes);

// AI分析ルート
router.use('/analyses', analysisRoutes);

// バッチジョブルート
router.use('/batch-jobs', batchRoutes);

// 銘柄リストルート（batch.routesから移動）
router.get('/stocks-list', async (req, res) => {
  const { BatchController } = await import('../controllers/batch.controller');
  return BatchController.getStocks(req, res);
});

export default router;
