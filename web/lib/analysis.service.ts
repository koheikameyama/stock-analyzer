/**
 * 株式分析サービス
 * Yahoo FinanceとOpenAI APIを統合して株式分析を実行
 */


import { YahooFinanceService } from './yahoo-finance.service';
import { OpenAIService, StockAnalysisInput } from './openai.service';

import { prisma } from './prisma';

/**
 * 単一銘柄の分析結果
 */
export interface AnalysisResult {
  ticker: string;
  success: boolean;
  analysisId?: string;
  error?: string;
}

/**
 * 株式分析サービスクラス
 */
export class AnalysisService {
  /**
   * 単一銘柄の分析を実行
   * データ取得 → AI分析 → 結果保存のフロー
   * @param ticker ティッカーシンボル
   * @param market 市場（JP/US）
   * @returns 分析結果
   */
  static async analyzeSingleStock(
    ticker: string,
    market: 'JP' | 'US'
  ): Promise<AnalysisResult> {
    try {
      console.log(`🔍 ${ticker} の分析を開始...`);

      // 1. Stockレコードを取得または作成
      const stock = await prisma.stock.upsert({
        where: { ticker },
        update: {},
        create: {
          ticker,
          name: ticker, // 仮の名前、後で更新
          market,
        },
      });

      // 2. Yahoo Finance APIからデータ取得
      const data = await YahooFinanceService.fetchStockWithHistory(
        ticker,
        market
      );

      if (!data || !data.stockInfo) {
        throw new Error('株価データの取得に失敗しました');
      }

      const { stockInfo, priceHistory } = data;

      // 3. Stockレコードを更新
      await prisma.stock.update({
        where: { id: stock.id },
        data: {
          name: stockInfo.name,
          sector: stockInfo.sector,
        },
      });

      // 4. OpenAI API で分析
      if (!OpenAIService.checkApiKey()) {
        throw new Error('OPENAI_API_KEYが設定されていません');
      }

      const analysisInput: StockAnalysisInput = {
        ticker,
        name: stockInfo.name,
        currentPrice: stockInfo.price || 0,
        sector: stockInfo.sector || null,
        priceHistory: priceHistory.map((p) => ({
          date: p.date.toISOString().split('T')[0],
          close: p.close,
        })),
        peRatio: stockInfo.per || null,
        pbRatio: stockInfo.pbr || null,
        roe: stockInfo.roe || null,
        dividendYield: stockInfo.dividendYield || null,
      };

      const aiResult = await OpenAIService.analyzeStock(analysisInput);

      // 5. トランザクション処理でAnalysisとPriceHistoryに保存
      const analysisId = await prisma.$transaction(async (tx) => {
        // Analysis保存
        const analysis = await tx.analysis.create({
          data: {
            stockId: stock.id,
            recommendation: aiResult.recommendation,
            confidenceScore: aiResult.confidence_score,
            reason: aiResult.reason,
            currentPrice: stockInfo.price,
            peRatio: stockInfo.per,
            pbRatio: stockInfo.pbr,
            roe: stockInfo.roe,
            dividendYield: stockInfo.dividendYield,
          },
        });

        // PriceHistory保存（既存データは上書き）
        for (const priceData of priceHistory) {
          await tx.priceHistory.upsert({
            where: {
              stockId_date: {
                stockId: stock.id,
                date: priceData.date,
              },
            },
            update: {
              open: priceData.open,
              high: priceData.high,
              low: priceData.low,
              close: priceData.close,
              volume: priceData.volume,
            },
            create: {
              stockId: stock.id,
              date: priceData.date,
              open: priceData.open,
              high: priceData.high,
              low: priceData.low,
              close: priceData.close,
              volume: priceData.volume,
            },
          });
        }

        return analysis.id;
      });

      console.log(`✅ ${ticker} の分析完了 (推奨: ${aiResult.recommendation})`);

      return {
        ticker,
        success: true,
        analysisId,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      console.error(`❌ ${ticker} の分析エラー:`, errorMessage);

      return {
        ticker,
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * 複数銘柄の分析を実行
   * @param tickers ティッカーシンボルの配列
   * @param market 市場（JP/US）
   * @param concurrency 同時実行数（デフォルト: 1）
   * @returns 分析結果の配列
   */
  static async analyzeMultipleStocks(
    tickers: string[],
    market: 'JP' | 'US',
    concurrency: number = 1
  ): Promise<AnalysisResult[]> {
    const results: AnalysisResult[] = [];

    console.log(
      `📊 ${market}市場の${tickers.length}銘柄の分析を開始（同時実行数: ${concurrency}）...`
    );

    // 順次処理（OpenAI APIのレート制限を考慮）
    for (let i = 0; i < tickers.length; i++) {
      const ticker = tickers[i];
      const result = await this.analyzeSingleStock(ticker, market);
      results.push(result);

      // 進捗表示
      if ((i + 1) % 5 === 0 || i === tickers.length - 1) {
        const successCount = results.filter((r) => r.success).length;
        const failureCount = results.filter((r) => !r.success).length;
        console.log(
          `進捗: ${i + 1}/${tickers.length} (成功: ${successCount}, 失敗: ${failureCount})`
        );
      }

      // レート制限対策: 各分析の間に少し遅延
      if (i < tickers.length - 1) {
        await new Promise((resolve) => setTimeout(resolve, 2000)); // 2秒待機
      }
    }

    const successCount = results.filter((r) => r.success).length;
    const failureCount = results.filter((r) => !r.success).length;
    console.log(
      `✅ 分析完了: 成功 ${successCount}件, 失敗 ${failureCount}件`
    );

    return results;
  }

  /**
   * 最新の分析結果を取得（各銘柄につき最新1件のみ）
   * @param market 市場（JP/US、オプション）
   * @param recommendation 推奨フィルター（Buy/Sell/Hold、オプション）
   * @returns 分析結果の配列
   */
  static async getLatestAnalyses(
    market?: 'JP' | 'US',
    recommendation?: 'Buy' | 'Sell' | 'Hold'
  ) {
    // 1. 対象銘柄を取得
    const stocks = await prisma.stock.findMany({
      where: market ? { market } : undefined,
      select: { id: true, ticker: true, name: true, market: true, sector: true },
    });

    // 2. 各銘柄の最新分析を取得
    const latestAnalyses = await Promise.all(
      stocks.map(async (stock) => {
        const analysis = await prisma.analysis.findFirst({
          where: {
            stockId: stock.id,
            ...(recommendation && { recommendation }),
          },
          orderBy: { analysisDate: 'desc' },
        });

        if (!analysis) return null;

        return {
          ...analysis,
          stock: {
            ticker: stock.ticker,
            name: stock.name,
            market: stock.market,
            sector: stock.sector,
          },
        };
      })
    );

    // 3. nullを除外してconfidenceScoreでソート
    return latestAnalyses
      .filter((a): a is NonNullable<typeof a> => a !== null)
      .sort((a, b) => b.confidenceScore - a.confidenceScore);
  }

  /**
   * 指定日付の分析結果を取得
   * @param date 日付（YYYY-MM-DD形式）
   * @param market 市場（JP/US、オプション）
   * @returns 分析結果の配列
   */
  static async getAnalysesByDate(date: string, market?: 'JP' | 'US') {
    const targetDate = new Date(date);
    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    return prisma.analysis.findMany({
      where: {
        analysisDate: {
          gte: startOfDay,
          lte: endOfDay,
        },
        ...(market && { stock: { market } }),
      },
      include: {
        stock: {
          select: {
            ticker: true,
            name: true,
            market: true,
            sector: true,
          },
        },
      },
      orderBy: {
        confidenceScore: 'desc',
      },
    });
  }

  /**
   * 分析の詳細情報を取得（株価履歴を含む）
   * @param analysisId 分析ID
   * @returns 分析詳細
   */
  static async getAnalysisDetail(analysisId: string) {
    const analysis = await prisma.analysis.findUnique({
      where: { id: analysisId },
      include: {
        stock: {
          include: {
            priceHistory: {
              orderBy: { date: 'desc' },
              take: 30, // 過去30日分
            },
          },
        },
      },
    });

    return analysis;
  }

}
