/**
 * Yahoo Finance APIサービス
 * yahoo-finance2パッケージを使用した株価データ取得
 */

import yahooFinance from 'yahoo-finance2';
import { Prisma } from '@prisma/client';

/**
 * 銘柄情報の型定義
 */
export interface StockInfo {
  ticker: string;
  name: string;
  market: 'JP' | 'US';
  sector?: string;
  marketCap?: number;
  per?: number;
  pbr?: number;
  roe?: number;
  dividendYield?: number;
  price?: number;
  currency: string;
}

/**
 * 株価履歴データの型定義
 */
export interface PriceHistoryData {
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: bigint;
}

/**
 * Yahoo Finance APIサービスクラス
 */
export class YahooFinanceService {
  /**
   * 単一銘柄の詳細データを取得
   * @param ticker ティッカーシンボル
   * @param market 市場（JP/US）
   * @returns 銘柄情報
   */
  static async fetchStockData(ticker: string, market: 'JP' | 'US'): Promise<StockInfo | null> {
    try {
      // 日本株の場合はティッカーに.Tを追加
      const symbol = market === 'JP' ? `${ticker}.T` : ticker;

      // 株価情報を取得
      const quote = await yahooFinance.quote(symbol);

      if (!quote) {
        console.warn(`銘柄データが見つかりません: ${ticker}`);
        return null;
      }

      // データを整形
      const stockInfo: StockInfo = {
        ticker,
        name: quote.longName || quote.shortName || ticker,
        market,
        sector: quote.sector || undefined,
        marketCap: quote.marketCap ? Number(quote.marketCap) : undefined,
        per: quote.trailingPE ? Number(quote.trailingPE.toFixed(2)) : undefined,
        pbr: quote.priceToBook ? Number(quote.priceToBook.toFixed(2)) : undefined,
        roe: quote.returnOnEquity ? Number((quote.returnOnEquity * 100).toFixed(2)) : undefined,
        dividendYield: quote.dividendYield ? Number((quote.dividendYield * 100).toFixed(2)) : undefined,
        price: quote.regularMarketPrice ? Number(quote.regularMarketPrice.toFixed(4)) : undefined,
        currency: market === 'JP' ? 'JPY' : 'USD',
      };

      return stockInfo;
    } catch (error) {
      console.error(`銘柄データ取得エラー: ${ticker}`, error);
      return null;
    }
  }

  /**
   * 過去の株価履歴データを取得（過去30日分）
   * @param ticker ティッカーシンボル
   * @param market 市場（JP/US）
   * @param days 取得日数（デフォルト: 30日）
   * @returns 株価履歴データの配列
   */
  static async fetchPriceHistory(
    ticker: string,
    market: 'JP' | 'US',
    days: number = 30
  ): Promise<PriceHistoryData[]> {
    try {
      const symbol = market === 'JP' ? `${ticker}.T` : ticker;

      // 終了日（今日）
      const endDate = new Date();
      // 開始日（指定日数前）
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // 履歴データを取得
      const history = await yahooFinance.historical(symbol, {
        period1: startDate,
        period2: endDate,
        interval: '1d', // 日次データ
      });

      // データを整形
      const priceHistory: PriceHistoryData[] = history.map((item) => ({
        date: item.date,
        open: Number(item.open.toFixed(4)),
        high: Number(item.high.toFixed(4)),
        low: Number(item.low.toFixed(4)),
        close: Number(item.close.toFixed(4)),
        volume: BigInt(item.volume),
      }));

      return priceHistory;
    } catch (error) {
      console.error(`株価履歴取得エラー: ${ticker}`, error);
      return [];
    }
  }

  /**
   * 複数銘柄のデータを一括取得
   * レート制限を考慮して遅延を設けながら取得
   * @param tickers ティッカーシンボルの配列
   * @param market 市場（JP/US）
   * @param delayMs リクエスト間の遅延時間（ミリ秒）
   * @returns 銘柄情報の配列
   */
  static async fetchMultipleStocks(
    tickers: string[],
    market: 'JP' | 'US',
    delayMs: number = 1000
  ): Promise<StockInfo[]> {
    const results: StockInfo[] = [];
    let successCount = 0;
    let failureCount = 0;

    console.log(`📊 ${market}市場の${tickers.length}銘柄のデータ取得を開始...`);

    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];

      try {
        const stockInfo = await this.fetchStockData(ticker, market);

        if (stockInfo) {
          results.push(stockInfo);
          successCount++;
        } else {
          failureCount++;
        }

        // 進捗表示
        if ((i + 1) % 10 === 0) {
          console.log(`進捗: ${i + 1}/${tickers.length} (成功: ${successCount}, 失敗: ${failureCount})`);
        }

        // レート制限対策のための遅延
        if (i < tickers.length - 1) {
          await this.delay(delayMs);
        }
      } catch (error) {
        console.error(`銘柄データ取得エラー: ${ticker}`, error);
        failureCount++;
      }
    }

    console.log(`✅ データ取得完了: 成功 ${successCount}件, 失敗 ${failureCount}件`);
    return results;
  }

  /**
   * 銘柄データと株価履歴を同時に取得
   * @param ticker ティッカーシンボル
   * @param market 市場（JP/US）
   * @returns 銘柄情報と株価履歴
   */
  static async fetchStockWithHistory(
    ticker: string,
    market: 'JP' | 'US'
  ): Promise<{ stockInfo: StockInfo; priceHistory: PriceHistoryData[] } | null> {
    try {
      // 並列で両方のデータを取得
      const [stockInfo, priceHistory] = await Promise.all([
        this.fetchStockData(ticker, market),
        this.fetchPriceHistory(ticker, market),
      ]);

      if (!stockInfo) {
        return null;
      }

      return {
        stockInfo,
        priceHistory,
      };
    } catch (error) {
      console.error(`銘柄データ+履歴取得エラー: ${ticker}`, error);
      return null;
    }
  }

  /**
   * 指定時間待機するユーティリティ関数
   * @param ms 待機時間（ミリ秒）
   */
  private static delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * リトライ機構付きでデータを取得
   * @param ticker ティッカーシンボル
   * @param market 市場（JP/US）
   * @param maxRetries 最大リトライ回数
   * @returns 銘柄情報
   */
  static async fetchStockDataWithRetry(
    ticker: string,
    market: 'JP' | 'US',
    maxRetries: number = 3
  ): Promise<StockInfo | null> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const result = await this.fetchStockData(ticker, market);
        if (result) {
          return result;
        }
      } catch (error) {
        lastError = error as Error;
        console.warn(`リトライ ${attempt}/${maxRetries} 失敗: ${ticker}`);

        // 指数バックオフ
        if (attempt < maxRetries) {
          const backoffTime = Math.pow(2, attempt) * 1000;
          await this.delay(backoffTime);
        }
      }
    }

    console.error(`最大リトライ回数に達しました: ${ticker}`, lastError);
    return null;
  }
}

/**
 * 主要銘柄リスト
 * 日経225とS&P 500の一部を含む
 */
export const MAJOR_TICKERS = {
  JP: [
    // 日経225の主要銘柄（サンプル）
    '7203', // トヨタ自動車
    '9984', // ソフトバンクグループ
    '6758', // ソニーグループ
    '6861', // キーエンス
    '9433', // KDDI
    '8306', // 三菱UFJフィナンシャル・グループ
    '6098', // リクルートホールディングス
    '4063', // 信越化学工業
    '6902', // デンソー
    '7974', // 任天堂
    '4502', // 武田薬品工業
    '8035', // 東京エレクトロン
    '7267', // ホンダ
    '8058', // 三菱商事
    '6367', // ダイキン工業
  ],
  US: [
    // S&P 500の主要銘柄（サンプル）
    'AAPL', // Apple
    'MSFT', // Microsoft
    'GOOGL', // Alphabet
    'AMZN', // Amazon
    'NVDA', // NVIDIA
    'META', // Meta
    'TSLA', // Tesla
    'BRK.B', // Berkshire Hathaway
    'V', // Visa
    'JNJ', // Johnson & Johnson
    'WMT', // Walmart
    'JPM', // JPMorgan Chase
    'PG', // Procter & Gamble
    'MA', // Mastercard
    'HD', // Home Depot
  ],
};
