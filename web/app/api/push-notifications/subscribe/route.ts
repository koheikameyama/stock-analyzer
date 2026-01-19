import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * プッシュ通知購読API
 * クライアントから送信された購読情報をデータベースに保存する
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint, keys } = body;

    // バリデーション
    if (!endpoint || !keys || !keys.p256dh || !keys.auth) {
      return NextResponse.json(
        { error: '購読情報が不正です' },
        { status: 400 }
      );
    }

    // 既存の購読情報を確認
    const existingSubscription = await prisma.pushSubscription.findUnique({
      where: { endpoint },
    });

    if (existingSubscription) {
      // 既存の購読情報がある場合は更新
      await prisma.pushSubscription.update({
        where: { endpoint },
        data: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      });

      return NextResponse.json({
        success: true,
        message: '購読情報を更新しました',
      });
    }

    // 新規購読情報を保存
    await prisma.pushSubscription.create({
      data: {
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      },
    });

    return NextResponse.json({
      success: true,
      message: '購読情報を保存しました',
    });
  } catch (error) {
    console.error('購読エラー:', error);
    return NextResponse.json(
      { error: '購読の保存に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * プッシュ通知購読解除API
 * クライアントから送信されたエンドポイントに紐づく購読情報を削除する
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return NextResponse.json(
        { error: 'エンドポイントが指定されていません' },
        { status: 400 }
      );
    }

    // 購読情報を削除
    await prisma.pushSubscription.delete({
      where: { endpoint },
    });

    return NextResponse.json({
      success: true,
      message: '購読を解除しました',
    });
  } catch (error) {
    console.error('購読解除エラー:', error);
    return NextResponse.json(
      { error: '購読解除に失敗しました' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
