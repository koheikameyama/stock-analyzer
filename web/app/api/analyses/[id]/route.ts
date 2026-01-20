/**
 * GET /api/analyses/[id]
 * 分析詳細を取得
 */

import { NextRequest, NextResponse } from 'next/server';
import { AnalysisService } from '@/lib/analysis.service';

// SQLiteを使用するためNode.jsランタイムを指定
export const runtime = 'nodejs';

// 動的ルートとして扱う（ビルド時の静的生成をスキップ）
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const analysisId = id;

    // データ取得
    const analysis = await AnalysisService.getAnalysisDetail(analysisId);

    if (!analysis) {
      return NextResponse.json(
        {
          success: false,
          message: '指定された分析が見つかりません',
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        analysis,
      },
    });
  } catch (error) {
    console.error('分析詳細の取得エラー:', error);
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
