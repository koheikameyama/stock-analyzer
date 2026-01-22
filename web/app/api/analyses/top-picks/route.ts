/**
 * GET /api/analyses/top-picks
 * 今日のおすすめ銘柄（上位3銘柄）を取得
 */

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // 最新の分析結果から上位3銘柄を取得
    const topPicks = await prisma.analysis.findMany({
      where: {
        // 最新の分析のみ（過去7日以内）
        analysisDate: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
      include: {
        stock: true,
      },
      orderBy: [
        { overallScore: 'desc' },
        { analysisDate: 'desc' },
      ],
      take: 3,
    });

    // 各銘柄の前日比を計算（簡易版）
    const topPicksWithTrend = topPicks.map((analysis, index) => {
      // ランキング
      const rank = index + 1;
      const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉';

      // トレンド判定（overallScoreが80以上なら買い、40未満なら売り）
      let signal: 'buy' | 'hold' | 'sell' = 'hold';
      if (analysis.overallScore >= 80) {
        signal = 'buy';
      } else if (analysis.overallScore < 40) {
        signal = 'sell';
      }

      return {
        rank,
        medal,
        signal,
        analysis: {
          id: analysis.id,
          overallScore: analysis.overallScore,
          recommendation: analysis.recommendation,
          summary: analysis.summary,
          analysisDate: analysis.analysisDate,
        },
        stock: {
          id: analysis.stock.id,
          ticker: analysis.stock.ticker,
          name: analysis.stock.name,
          sector: analysis.stock.sector,
        },
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        topPicks: topPicksWithTrend,
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('おすすめ銘柄の取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'おすすめ銘柄の取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
