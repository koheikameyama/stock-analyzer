/**
 * GET /api/stock-data/[ticker]
 * 銘柄の株価データを取得（分析結果なし銘柄用）
 */

import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  let ticker: string | undefined;

  try {
    const resolvedParams = await params;
    ticker = resolvedParams.ticker;

    if (!ticker) {
      return NextResponse.json(
        { success: false, message: 'ティッカーシンボルが必要です' },
        { status: 400 }
      );
    }

    // 日本株のティッカーに.Tを追加
    const symbol = `${ticker}.T`;

    // Yahoo Finance APIからデータ取得
    const quote = await yahooFinance.quoteSummary(symbol, {
      modules: ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData'],
    });

    if (!quote || !quote.price) {
      return NextResponse.json(
        {
          success: false,
          message: '株価データの取得に失敗しました',
        },
        { status: 404 }
      );
    }

    // 過去30日の株価履歴を取得
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    const history = await yahooFinance.chart(symbol, {
      period1: startDate,
      period2: endDate,
      interval: '1d',
    });

    // レスポンスデータを整形
    const price = quote.price;
    const summaryDetail = quote.summaryDetail;
    const defaultKeyStatistics = quote.defaultKeyStatistics;
    const financialData = quote.financialData;

    const responseData = {
      ticker,
      name: price.longName || price.shortName || ticker,
      price: price.regularMarketPrice || 0,
      sector: price.sector,
      per: summaryDetail?.trailingPE || defaultKeyStatistics?.trailingPE,
      pbr: defaultKeyStatistics?.priceToBook,
      roe: financialData?.returnOnEquity
        ? financialData.returnOnEquity * 100
        : undefined,
      dividendYield: summaryDetail?.dividendYield
        ? summaryDetail.dividendYield * 100
        : undefined,
      priceHistory: history.quotes?.map((h: any) => ({
        date: new Date(h.date).toISOString().split('T')[0],
        open: h.open,
        high: h.high,
        low: h.low,
        close: h.close,
        volume: h.volume,
      })) || [],
    };

    return NextResponse.json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    console.error('株価データの取得エラー:', ticker || 'unknown', error);
    return NextResponse.json(
      {
        success: false,
        message: 'データ取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
