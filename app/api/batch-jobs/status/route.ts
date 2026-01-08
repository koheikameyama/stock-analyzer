/**
 * GET /api/batch-jobs/status
 * 最新のバッチジョブステータスを取得
 */

import { NextResponse } from 'next/server';
import { BatchService } from '@/lib/batch.service';

export async function GET() {
  try {
    const lastJob = await BatchService.getLatestBatchJobLog();

    return NextResponse.json({
      success: true,
      data: {
        lastJob,
      },
    });
  } catch (error) {
    console.error('バッチジョブステータス取得エラー:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'ステータス取得に失敗しました',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
