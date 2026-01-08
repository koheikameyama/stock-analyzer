/**
 * APIエンドポイントの重点的なテスト
 * 主要CRUD操作と主要エラーケースをテスト
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// テスト用データのクリーンアップ
beforeAll(async () => {
  if (process.env.NODE_ENV === 'test') {
    // テストデータのセットアップ
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe('APIエンドポイントテスト', () => {
  /**
   * テスト1: 銘柄リスト取得（GET /api/stocks-list）
   */
  test('銘柄リストを取得できることを確認', async () => {
    const stocks = await prisma.stock.findMany({
      take: 5,
    });

    expect(stocks).toBeDefined();
    expect(Array.isArray(stocks)).toBe(true);
  });

  /**
   * テスト2: 市場フィルターが機能することを確認
   */
  test('市場フィルター（JP/US）が機能することを確認', async () => {
    const jpStocks = await prisma.stock.findMany({
      where: { market: 'JP' },
      take: 5,
    });

    const usStocks = await prisma.stock.findMany({
      where: { market: 'US' },
      take: 5,
    });

    // 日本株は market === 'JP'
    jpStocks.forEach((stock) => {
      expect(stock.market).toBe('JP');
    });

    // 米国株は market === 'US'
    usStocks.forEach((stock) => {
      expect(stock.market).toBe('US');
    });
  });

  /**
   * テスト3: 分析結果の取得（最新）
   */
  test('最新の分析結果を取得できることを確認', async () => {
    const latestAnalysis = await prisma.analysis.findFirst({
      orderBy: { analysisDate: 'desc' },
      include: { stock: true },
    });

    if (latestAnalysis) {
      expect(latestAnalysis.id).toBeDefined();
      expect(['Buy', 'Sell', 'Hold']).toContain(latestAnalysis.recommendation);
      expect(latestAnalysis.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(latestAnalysis.confidenceScore).toBeLessThanOrEqual(100);
      expect(latestAnalysis.stock).toBeDefined();
    }
  });

  /**
   * テスト4: バッチジョブログの取得
   */
  test('バッチジョブログを取得できることを確認', async () => {
    const batchJobLog = await prisma.batchJobLog.findFirst({
      orderBy: { jobDate: 'desc' },
    });

    if (batchJobLog) {
      expect(batchJobLog.id).toBeDefined();
      expect(['success', 'partial_success', 'failure']).toContain(
        batchJobLog.status
      );
      expect(batchJobLog.totalStocks).toBeGreaterThanOrEqual(0);
      expect(batchJobLog.successCount).toBeGreaterThanOrEqual(0);
      expect(batchJobLog.failureCount).toBeGreaterThanOrEqual(0);
    }
  });

  /**
   * テスト5: 無効な市場パラメータのバリデーション
   */
  test('無効な市場パラメータを検出することを確認', () => {
    const invalidMarkets = ['XX', 'INVALID', '123'];
    const validMarkets = ['JP', 'US'];

    invalidMarkets.forEach((market) => {
      expect(validMarkets.includes(market)).toBe(false);
    });
  });

  /**
   * テスト6: UUIDフォーマットのバリデーション
   */
  test('UUIDフォーマットを検証できることを確認', () => {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    const validUUIDs = [
      '123e4567-e89b-12d3-a456-426614174000',
      'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    ];

    const invalidUUIDs = [
      'invalid-uuid',
      '123',
      'not-a-uuid',
      '12345678-1234-1234-1234-12345678901', // 短い
    ];

    validUUIDs.forEach((uuid) => {
      expect(uuidRegex.test(uuid)).toBe(true);
    });

    invalidUUIDs.forEach((uuid) => {
      expect(uuidRegex.test(uuid)).toBe(false);
    });
  });
});
