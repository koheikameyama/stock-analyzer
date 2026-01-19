import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';

const prisma = new PrismaClient();

// VAPID設定
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT || 'mailto:example@yourdomain.com';

if (vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
}

/**
 * プッシュ通知送信API
 * すべての購読者に通知を送信する
 */
export async function POST(request: NextRequest) {
  try {
    // VAPID鍵が設定されているか確認
    if (!vapidPublicKey || !vapidPrivateKey) {
      return NextResponse.json(
        { error: 'VAPID鍵が設定されていません' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { title, body: notificationBody, url } = body;

    // バリデーション
    if (!title || !notificationBody) {
      return NextResponse.json(
        { error: 'タイトルと本文は必須です' },
        { status: 400 }
      );
    }

    // すべての購読情報を取得
    const subscriptions = await prisma.pushSubscription.findMany();

    if (subscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: '購読者がいません',
        sentCount: 0,
      });
    }

    // 通知ペイロードを作成
    const payload = JSON.stringify({
      title,
      body: notificationBody,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      url: url || '/',
    });

    // すべての購読者に通知を送信
    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth,
              },
            },
            payload
          );
          return { success: true, endpoint: subscription.endpoint };
        } catch (error: any) {
          console.error('通知送信エラー:', error);

          // 410 Gone または 404 Not Found の場合は購読情報を削除
          if (error.statusCode === 410 || error.statusCode === 404) {
            await prisma.pushSubscription.delete({
              where: { endpoint: subscription.endpoint },
            });
            console.log(`無効な購読情報を削除: ${subscription.endpoint}`);
          }

          return { success: false, endpoint: subscription.endpoint, error };
        }
      })
    );

    // 成功・失敗をカウント
    const successCount = results.filter(
      (result) => result.status === 'fulfilled' && result.value.success
    ).length;
    const failureCount = results.length - successCount;

    return NextResponse.json({
      success: true,
      message: `通知を送信しました`,
      sentCount: successCount,
      failureCount,
      totalSubscriptions: subscriptions.length,
    });
  } catch (error) {
    console.error('通知送信エラー:', error);
    return NextResponse.json(
      { error: '通知の送信に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
