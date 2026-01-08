/**
 * AI株式分析APIサービス
 * バックエンドAPIとの通信を管理
 */

import axios, { AxiosError } from 'axios';
import type {
  Analysis,
  AnalysisDetail,
  BatchJobLog,
  Market,
  Recommendation,
  ApiResponse,
  LatestAnalysesResponse,
  HistoryAnalysesResponse,
  AnalysisDetailResponse,
  BatchJobStatusResponse,
} from '../types/analysis';

// ベースURL（環境変数から取得、デフォルトはlocalhost）
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

// Axiosインスタンスの作成
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30秒
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * AI株式分析APIサービスクラス
 */
export class AnalysisApiService {
  /**
   * 最新の分析結果を取得
   * @param market 市場フィルター（JP/US、オプション）
   * @param recommendation 推奨フィルター（Buy/Sell/Hold、オプション）
   * @returns 最新の分析結果
   */
  static async getLatestAnalyses(
    market?: Market,
    recommendation?: Recommendation
  ): Promise<LatestAnalysesResponse> {
    try {
      const params = new URLSearchParams();
      if (market) params.append('market', market);
      if (recommendation) params.append('recommendation', recommendation);

      const response = await apiClient.get<
        ApiResponse<LatestAnalysesResponse>
      >(`/analyses/latest?${params.toString()}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'データ取得に失敗しました'
        );
      }

      return response.data.data;
    } catch (error) {
      this.handleError(error, '最新分析結果の取得に失敗しました');
      throw error;
    }
  }

  /**
   * 指定日付の分析結果を取得
   * @param date 日付（YYYY-MM-DD形式）
   * @param market 市場フィルター（JP/US、オプション）
   * @returns 指定日付の分析結果
   */
  static async getHistoryAnalyses(
    date: string,
    market?: Market
  ): Promise<HistoryAnalysesResponse> {
    try {
      const params = new URLSearchParams();
      params.append('date', date);
      if (market) params.append('market', market);

      const response = await apiClient.get<
        ApiResponse<HistoryAnalysesResponse>
      >(`/analyses/history?${params.toString()}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'データ取得に失敗しました'
        );
      }

      return response.data.data;
    } catch (error) {
      this.handleError(error, '履歴分析結果の取得に失敗しました');
      throw error;
    }
  }

  /**
   * 分析詳細を取得（株価履歴を含む）
   * @param analysisId 分析ID
   * @returns 分析詳細
   */
  static async getAnalysisDetail(
    analysisId: string
  ): Promise<AnalysisDetail> {
    try {
      const response = await apiClient.get<
        ApiResponse<AnalysisDetailResponse>
      >(`/analyses/${analysisId}`);

      if (!response.data.success || !response.data.data) {
        throw new Error(
          response.data.message || 'データ取得に失敗しました'
        );
      }

      return response.data.data.analysis;
    } catch (error) {
      this.handleError(error, '分析詳細の取得に失敗しました');
      throw error;
    }
  }

  /**
   * 最新のバッチジョブステータスを取得
   * @returns バッチジョブステータス
   */
  static async getBatchJobStatus(): Promise<BatchJobLog | null> {
    try {
      const response = await apiClient.get<
        ApiResponse<BatchJobStatusResponse>
      >('/batch-jobs/status');

      if (!response.data.success || !response.data.data) {
        return null;
      }

      return response.data.data.lastJob;
    } catch (error) {
      this.handleError(error, 'バッチジョブステータスの取得に失敗しました');
      throw error;
    }
  }

  /**
   * エラーハンドリング
   * @param error エラーオブジェクト
   * @param defaultMessage デフォルトエラーメッセージ
   */
  private static handleError(error: unknown, defaultMessage: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<ApiResponse<unknown>>;

      if (axiosError.response) {
        // サーバーエラーレスポンスがある場合
        const errorMessage =
          axiosError.response.data?.message ||
          axiosError.response.data?.error ||
          defaultMessage;
        console.error(`APIエラー (${axiosError.response.status}):`, errorMessage);
      } else if (axiosError.request) {
        // リクエストは送信されたがレスポンスがない場合
        console.error('ネットワークエラー:', axiosError.message);
      } else {
        // リクエストの設定時にエラーが発生した場合
        console.error('リクエストエラー:', axiosError.message);
      }
    } else {
      // その他のエラー
      console.error('予期しないエラー:', error);
    }
  }
}
