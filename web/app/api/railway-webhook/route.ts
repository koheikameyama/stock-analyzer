/**
 * Railway Webhook受信エンドポイント
 *
 * Railwayのデプロイ完了時にWebhookを受信し、
 * GitHub Actionsのリリースワークフローをトリガーします。
 */

import { NextRequest, NextResponse } from 'next/server';

/**
 * Railway Webhookのペイロード型定義
 * https://docs.railway.app/reference/webhooks
 */
interface RailwayWebhookPayload {
  type: string;
  status: string;
  timestamp: string;
  project: {
    id: string;
    name: string;
  };
  environment: {
    id: string;
    name: string;
  };
  deployment: {
    id: string;
    status: string;
    meta: {
      branch?: string;
      commitHash?: string;
      commitMessage?: string;
    };
  };
}

/**
 * POST /api/railway-webhook
 * Railway Webhookを受信してGitHub Actionsをトリガー
 */
export async function POST(request: NextRequest) {
  try {
    const payload: RailwayWebhookPayload = await request.json();

    console.log('[Railway Webhook] Received:', {
      type: payload.type,
      status: payload.status,
      environment: payload.environment?.name,
      branch: payload.deployment?.meta?.branch,
      deploymentStatus: payload.deployment?.status,
    });

    // デプロイ成功のWebhookのみ処理
    if (
      payload.type === 'DEPLOY' &&
      payload.deployment?.status === 'SUCCESS' &&
      payload.environment?.name === 'production' &&
      payload.deployment?.meta?.branch === 'main'
    ) {
      console.log('[Railway Webhook] Production deployment succeeded, triggering release workflow');

      // GitHub Actions repository_dispatchをトリガー
      const githubToken = process.env.GH_PAT;
      if (!githubToken) {
        console.error('[Railway Webhook] GH_PAT is not configured');
        return NextResponse.json(
          { error: 'GitHub token not configured' },
          { status: 500 }
        );
      }

      const response = await fetch(
        'https://api.github.com/repos/koheikameyama/stock-analyzer/dispatches',
        {
          method: 'POST',
          headers: {
            'Accept': 'application/vnd.github.v3+json',
            'Authorization': `Bearer ${githubToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            event_type: 'railway-deploy-success',
            client_payload: {
              deployment_id: payload.deployment?.id,
              commit_hash: payload.deployment?.meta?.commitHash,
              commit_message: payload.deployment?.meta?.commitMessage,
              timestamp: payload.timestamp,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Railway Webhook] Failed to trigger GitHub Actions:', errorText);
        return NextResponse.json(
          { error: 'Failed to trigger GitHub Actions', details: errorText },
          { status: 500 }
        );
      }

      console.log('[Railway Webhook] Successfully triggered release workflow');
      return NextResponse.json({
        success: true,
        message: 'Release workflow triggered',
      });
    }

    // その他のWebhookは無視
    return NextResponse.json({
      success: true,
      message: 'Webhook received but not processed',
      reason: 'Not a production deployment success',
    });
  } catch (error) {
    console.error('[Railway Webhook] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: String(error) },
      { status: 500 }
    );
  }
}

/**
 * GET /api/railway-webhook
 * ヘルスチェック用
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Railway Webhook endpoint is ready',
  });
}
