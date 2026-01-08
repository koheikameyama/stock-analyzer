/**
 * データベースモデルの重点的なテスト
 * 主要な動作のみをテストし、網羅的なカバレッジは不要
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// テスト用のクリーンアップ
beforeAll(async () => {
  // テストデータのクリーンアップ（本番環境では実行しない）
  if (process.env.NODE_ENV === 'test') {
    await prisma.batchJobLog.deleteMany({});
    await prisma.priceHistory.deleteMany({});
    await prisma.analysis.deleteMany({});
    await prisma.stock.deleteMany({});
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('データベースモデルテスト', () => {
  let testStockId: string;

  /**
   * テスト1: Stock モデルの作成とユニーク制約
   */
  test('Stock を作成し、ticker がユニークであることを確認', async () => {
    // Stock作成
    const stock = await prisma.stock.create({
      data: {
        ticker: 'TEST',
        name: 'Test Company',
        market: 'US',
        sector: 'Technology',
      },
    });

    expect(stock.id).toBeDefined();
    expect(stock.ticker).toBe('TEST');
    testStockId = stock.id;

    // 同じ ticker で再度作成しようとするとエラー
    await expect(
      prisma.stock.create({
        data: {
          ticker: 'TEST',
          name: 'Another Company',
          market: 'US',
        },
      })
    ).rejects.toThrow();
  });

  /**
   * テスト2: Analysis モデルと Stock のリレーション
   */
  test('Analysis を作成し、Stock とのリレーションが機能することを確認', async () => {
    const analysis = await prisma.analysis.create({
      data: {
        stockId: testStockId,
        recommendation: 'Buy',
        confidenceScore: 85,
        reasonShort: 'Strong financials and growth potential.',
        reasonDetailed: 'This company shows excellent growth metrics...',
        currentPrice: 150.25,
        peRatio: 25.3,
        pbRatio: 5.2,
        roe: 32.5,
        dividendYield: 0.5,
      },
    });

    expect(analysis.id).toBeDefined();
    expect(analysis.stockId).toBe(testStockId);
    expect(analysis.recommendation).toBe('Buy');

    // リレーションの確認
    const stockWithAnalyses = await prisma.stock.findUnique({
      where: { id: testStockId },
      include: { analyses: true },
    });

    expect(stockWithAnalyses?.analyses).toHaveLength(1);
    expect(stockWithAnalyses?.analyses[0].confidenceScore).toBe(85);
  });

  /**
   * テスト3: PriceHistory モデルとユニーク制約
   */
  test('PriceHistory を作成し、[stockId, date] がユニークであることを確認', async () => {
    const testDate = new Date('2026-01-08');

    // PriceHistory作成
    const priceHistory = await prisma.priceHistory.create({
      data: {
        stockId: testStockId,
        date: testDate,
        open: 148.5,
        high: 152.3,
        low: 147.8,
        close: 150.25,
        volume: BigInt(1000000),
      },
    });

    expect(priceHistory.id).toBeDefined();
    expect(priceHistory.close).toBe('150.25');

    // 同じ stockId と date で再度作成しようとするとエラー
    await expect(
      prisma.priceHistory.create({
        data: {
          stockId: testStockId,
          date: testDate,
          open: 149.0,
          high: 153.0,
          low: 148.0,
          close: 151.0,
          volume: BigInt(2000000),
        },
      })
    ).rejects.toThrow();
  });

  /**
   * テスト4: BatchJobLog モデルの作成
   */
  test('BatchJobLog を作成し、ジョブステータスが記録されることを確認', async () => {
    const batchJobLog = await prisma.batchJobLog.create({
      data: {
        jobDate: new Date(),
        status: 'success',
        totalStocks: 20,
        successCount: 18,
        failureCount: 2,
        errorMessage: 'Some stocks failed to analyze',
        duration: 120000, // 2分
      },
    });

    expect(batchJobLog.id).toBeDefined();
    expect(batchJobLog.status).toBe('success');
    expect(batchJobLog.successCount).toBe(18);
    expect(batchJobLog.duration).toBe(120000);
  });

  /**
   * テスト5: Analysis の analysisDate インデックスでのクエリ
   */
  test('analysisDate でフィルタリングして最新の分析を取得できることを確認', async () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const analyses = await prisma.analysis.findMany({
      where: {
        analysisDate: {
          gte: today,
        },
      },
      orderBy: {
        analysisDate: 'desc',
      },
    });

    expect(analyses.length).toBeGreaterThanOrEqual(1);
    expect(analyses[0].stockId).toBe(testStockId);
  });

  /**
   * テスト6: Stock 削除時の カスケード削除
   */
  test('Stock を削除すると関連する Analysis と PriceHistory も削除されることを確認', async () => {
    // 削除前に存在確認
    const beforeAnalyses = await prisma.analysis.findMany({
      where: { stockId: testStockId },
    });
    const beforePriceHistory = await prisma.priceHistory.findMany({
      where: { stockId: testStockId },
    });

    expect(beforeAnalyses.length).toBeGreaterThan(0);
    expect(beforePriceHistory.length).toBeGreaterThan(0);

    // Stock削除
    await prisma.stock.delete({
      where: { id: testStockId },
    });

    // 削除後に存在しないことを確認
    const afterAnalyses = await prisma.analysis.findMany({
      where: { stockId: testStockId },
    });
    const afterPriceHistory = await prisma.priceHistory.findMany({
      where: { stockId: testStockId },
    });

    expect(afterAnalyses.length).toBe(0);
    expect(afterPriceHistory.length).toBe(0);
  });
});
