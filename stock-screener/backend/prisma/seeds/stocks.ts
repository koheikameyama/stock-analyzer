/**
 * 株式銘柄の初期データシード
 * AI分析対象となる主要銘柄のリスト
 */

export interface SeedStock {
  ticker: string;
  name: string;
  market: 'JP' | 'US';
  sector: string;
}

/**
 * 日本株の主要銘柄リスト
 */
export const jpStocks: SeedStock[] = [
  { ticker: '7203.T', name: 'トヨタ自動車', market: 'JP', sector: '自動車' },
  { ticker: '6758.T', name: 'ソニーグループ', market: 'JP', sector: 'テクノロジー' },
  { ticker: '9984.T', name: 'ソフトバンクグループ', market: 'JP', sector: '通信' },
  { ticker: '6861.T', name: 'キーエンス', market: 'JP', sector: '電子機器' },
  { ticker: '9433.T', name: 'KDDI', market: 'JP', sector: '通信' },
  { ticker: '8306.T', name: '三菱UFJフィナンシャル・グループ', market: 'JP', sector: '金融' },
  { ticker: '6501.T', name: '日立製作所', market: 'JP', sector: '電機' },
  { ticker: '7974.T', name: '任天堂', market: 'JP', sector: 'ゲーム' },
  { ticker: '4063.T', name: '信越化学工業', market: 'JP', sector: '化学' },
  { ticker: '6902.T', name: 'デンソー', market: 'JP', sector: '自動車部品' },
];

/**
 * 米国株の主要銘柄リスト
 */
export const usStocks: SeedStock[] = [
  { ticker: 'AAPL', name: 'Apple Inc.', market: 'US', sector: 'Technology' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', market: 'US', sector: 'Technology' },
  { ticker: 'GOOGL', name: 'Alphabet Inc.', market: 'US', sector: 'Technology' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', market: 'US', sector: 'Consumer Cyclical' },
  { ticker: 'TSLA', name: 'Tesla Inc.', market: 'US', sector: 'Automotive' },
  { ticker: 'META', name: 'Meta Platforms Inc.', market: 'US', sector: 'Technology' },
  { ticker: 'NVDA', name: 'NVIDIA Corporation', market: 'US', sector: 'Technology' },
  { ticker: 'JPM', name: 'JPMorgan Chase & Co.', market: 'US', sector: 'Financial Services' },
  { ticker: 'V', name: 'Visa Inc.', market: 'US', sector: 'Financial Services' },
  { ticker: 'WMT', name: 'Walmart Inc.', market: 'US', sector: 'Consumer Defensive' },
];

/**
 * 全銘柄リスト
 */
export const allStocks: SeedStock[] = [...jpStocks, ...usStocks];
