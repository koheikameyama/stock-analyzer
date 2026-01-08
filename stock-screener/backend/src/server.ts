/**
 * Express サーバーのメインファイル
 * AI株式分析ツール バックエンド
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';
import { startStockAnalysisScheduler } from './jobs/stockAnalysisJob';

// 環境変数の読み込み
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// レート制限
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15分
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100リクエスト/15分
  message: 'リクエストが多すぎます。しばらくしてから再度お試しください。',
});
app.use('/api/', limiter);

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'AI Stock Analyzer API',
  });
});

// APIルート
app.use('/api/v1', routes);

// エラーハンドリングミドルウェア
app.use(errorHandler);

// サーバー起動
app.listen(PORT, () => {
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🚀 AI株式分析ツール バックエンド起動');
  console.log(`📍 ポート: ${PORT}`);
  console.log(`🌐 環境: ${process.env.NODE_ENV || 'development'}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  // バッチジョブスケジューラーの起動
  if (process.env.NODE_ENV !== 'test') {
    startStockAnalysisScheduler();
  }
});

// エラーハンドリング
process.on('unhandledRejection', (reason, promise) => {
  console.error('未処理のPromise拒否:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('キャッチされなかった例外:', error);
  process.exit(1);
});

export default app;
