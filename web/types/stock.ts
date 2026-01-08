/**
 * 銘柄関連の型定義
 */

/**
 * 市場タイプ
 */
export type Market = 'JP' | 'US';

/**
 * ソート順
 */
export type SortOrder = 'asc' | 'desc';

/**
 * 銘柄データ
 */
export interface Stock {
  ticker: string;
  name: string;
  market: Market;
  sector: string | null;
  marketCap: number | null;
  per: number | null;
  pbr: number | null;
  roe: number | null;
  dividendYield: number | null;
  price: number | null;
  currency: string;
  lastUpdated: string;
}

/**
 * スクリーニングフィルタ
 */
export interface ScreeningFilters {
  market: Market;
  marketCapMin?: number;
  marketCapMax?: number;
  perMin?: number;
  perMax?: number;
  pbrMin?: number;
  pbrMax?: number;
  roeMin?: number;
  roeMax?: number;
  dividendYieldMin?: number;
  dividendYieldMax?: number;
  priceMin?: number;
  priceMax?: number;
  sectors?: string[];
  sortBy?: string;
  sortOrder?: SortOrder;
  page?: number;
  pageSize?: number;
}

/**
 * スクリーニング結果
 */
export interface ScreeningResult {
  stocks: Stock[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * APIレスポンス
 */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * エラーレスポンス
 */
export interface ApiError {
  error: string;
  message: string;
  statusCode: number;
  details?: any;
}
