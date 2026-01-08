/**
 * AI株式分析の型定義
 */

// 市場
export type Market = 'JP' | 'US';

// 推奨アクション
export type Recommendation = 'Buy' | 'Sell' | 'Hold';

// 銘柄情報
export interface Stock {
  id: string;
  ticker: string;
  name: string;
  market: Market;
  sector: string | null;
  createdAt: string;
  updatedAt: string;
}

// AI分析結果
export interface Analysis {
  id: string;
  stockId: string;
  stock: {
    ticker: string;
    name: string;
    market: Market;
    sector: string | null;
  };
  analysisDate: string;
  recommendation: Recommendation;
  confidenceScore: number;
  reason: string;
  currentPrice: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  roe: number | null;
  dividendYield: number | null;
  createdAt: string;
  updatedAt: string;
}

// 株価履歴データ
export interface PriceHistory {
  id: string;
  stockId: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: string; // BigInt は文字列として扱う
  createdAt: string;
}

// 分析詳細（株価履歴を含む）
export interface AnalysisDetail extends Analysis {
  stock: Stock & {
    priceHistory: PriceHistory[];
  };
}

// バッチジョブログ
export interface BatchJobLog {
  id: string;
  jobDate: string;
  status: 'success' | 'partial_success' | 'failure';
  totalStocks: number;
  successCount: number;
  failureCount: number;
  errorMessage: string | null;
  duration: number;
  createdAt: string;
}

// APIレスポンス
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 最新分析結果のレスポンス
export interface LatestAnalysesResponse {
  analyses: Analysis[];
  lastUpdateDate: string | null;
}

// 履歴分析結果のレスポンス
export interface HistoryAnalysesResponse {
  analyses: Analysis[];
  date: string;
}

// 分析詳細のレスポンス
export interface AnalysisDetailResponse {
  analysis: AnalysisDetail;
}

// バッチジョブステータスのレスポンス
export interface BatchJobStatusResponse {
  lastJob: BatchJobLog | null;
  message?: string;
}
