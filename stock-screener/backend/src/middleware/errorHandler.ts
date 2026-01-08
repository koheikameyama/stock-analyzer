/**
 * エラーハンドリングミドルウェア
 * 統一されたエラーレスポンス形式を提供
 */

import { Request, Response, NextFunction } from 'express';

/**
 * カスタムエラークラス
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * グローバルエラーハンドラー
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('エラー発生:', err);

  // AppErrorの場合
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      error: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
    return;
  }

  // その他のエラー（500 Internal Server Error）
  res.status(500).json({
    success: false,
    message: '内部サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
}

/**
 * 404 Not Foundハンドラー
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    success: false,
    message: `ルート ${req.originalUrl} が見つかりません`,
  });
}
