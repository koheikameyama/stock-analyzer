/**
 * GET /api/analyses/latest
 * 最新の分析結果を取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/lib/analysis.service';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const market = searchParams.get('market') as 'JP' | 'US' | null;
    const recommendation = searchParams.get('recommendation') as
      | 'Buy'
      | 'Sell'
      | 'Hold'
      | null;

    // バリデーション
    if (market && !['JP', 'US'].includes(market)) {
      return NextResponse.json(
        {
          success: false,
          message: 'market は JP または US である必要があります',
        },
        { status: 400 }
      );
    }

    if (recommendation && !['Buy', 'Sell', 'Hold'].includes(recommendation)) {
      return NextResponse.json(
        {
          success: false,
          message: 'recommendation は Buy, Sell, または Hold である必要があります',
        },
        { status: 400 }
      );
    }

    // データ取得
    const analyses = await AnalysisService.getLatestAnalyses(
      market || undefined,
      recommendation || undefined
    );

    // 最終更新日時
    const lastUpdateDate =
      analyses.length > 0 ? analyses[0].analysisDate : null;

    return NextResponse.json({
      success: true,
      data: {
        analyses,
        lastUpdateDate,
      },
    });
  } catch (error) {
    console.error('最新分析結果の取得エラー:', error);
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
