/**
 * APIサービス
 * バックエンドAPIとの通信を担当
 */

import axios, { AxiosInstance } from 'axios';
import { ApiResponse, ScreeningFilters, ScreeningResult } from '../types/stock';

/**
 * APIクライアントの設定
 */
const apiClient: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 30000, // 30秒のタイムアウト
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * APIサービスクラス
 */
export class ApiService {
  /**
   * 銘柄スクリーニング
   */
  static async screenStocks(filters: ScreeningFilters): Promise<ScreeningResult> {
    try {
      const response = await apiClient.get<ApiResponse<ScreeningResult>>('/stocks/screen', {
        params: {
          ...filters,
          sectors: filters.sectors?.join(','),
        },
      });
      return response.data.data;
    } catch (error) {
      console.error('スクリーニングAPIエラー:', error);
      throw this.handleError(error);
    }
  }

  /**
   * セクターリスト取得
   */
  static async getSectors(market: 'JP' | 'US'): Promise<string[]> {
    try {
      const response = await apiClient.get<ApiResponse<{ sectors: string[] }>>('/sectors', {
        params: { market },
      });
      return response.data.data.sectors;
    } catch (error) {
      console.error('セクターリスト取得エラー:', error);
      throw this.handleError(error);
    }
  }

  /**
   * データ更新
   */
  static async refreshData(): Promise<void> {
    try {
      await apiClient.post('/stocks/refresh');
    } catch (error) {
      console.error('データ更新エラー:', error);
      throw this.handleError(error);
    }
  }

  /**
   * ヘルスチェック
   */
  static async healthCheck(): Promise<any> {
    try {
      const response = await apiClient.get<ApiResponse<any>>('/health');
      return response.data.data;
    } catch (error) {
      console.error('ヘルスチェックエラー:', error);
      throw this.handleError(error);
    }
  }

  /**
   * エラーハンドリング
   */
  private static handleError(error: any): Error {
    if (axios.isAxiosError(error)) {
      if (error.response) {
        // サーバーがエラーレスポンスを返した
        const message = error.response.data?.message || 'サーバーエラーが発生しました';
        return new Error(message);
      } else if (error.request) {
        // リクエストは送信されたがレスポンスがない
        return new Error('サーバーに接続できません。ネットワーク接続を確認してください。');
      }
    }
    // その他のエラー
    return new Error('予期しないエラーが発生しました');
  }
}
