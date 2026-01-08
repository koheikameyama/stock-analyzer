/**
 * AI株式分析用のReact Queryカスタムフック
 */

import { useQuery } from '@tanstack/react-query';
import { AnalysisApiService } from '../lib/analysisApi';
import type { Market, Recommendation } from '../types/analysis';

/**
 * 最新の分析結果を取得するフック
 * @param market 市場フィルター（JP/US、オプション）
 * @param recommendation 推奨フィルター（Buy/Sell/Hold、オプション）
 */
export function useLatestAnalyses(
  market?: Market,
  recommendation?: Recommendation
) {
  return useQuery({
    queryKey: ['analyses', 'latest', market, recommendation],
    queryFn: () => AnalysisApiService.getLatestAnalyses(market, recommendation),
    staleTime: 5 * 60 * 1000, // 5分間キャッシュ
    gcTime: 10 * 60 * 1000, // 10分間保持（旧cacheTime）
    retry: 2,
  });
}

/**
 * 指定日付の分析結果を取得するフック
 * @param date 日付（YYYY-MM-DD形式）
 * @param market 市場フィルター（JP/US、オプション）
 * @param enabled クエリを有効にするか
 */
export function useHistoryAnalyses(
  date: string | null,
  market?: Market,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['analyses', 'history', date, market],
    queryFn: () => {
      if (!date) {
        throw new Error('日付が指定されていません');
      }
      return AnalysisApiService.getHistoryAnalyses(date, market);
    },
    enabled: enabled && !!date,
    staleTime: 10 * 60 * 1000, // 10分間キャッシュ（履歴は変わらないため長め）
    gcTime: 30 * 60 * 1000, // 30分間保持
    retry: 2,
  });
}

/**
 * 分析詳細を取得するフック（株価履歴を含む）
 * @param analysisId 分析ID
 * @param enabled クエリを有効にするか
 */
export function useAnalysisDetail(
  analysisId: string | null,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ['analyses', 'detail', analysisId],
    queryFn: () => {
      if (!analysisId) {
        throw new Error('分析IDが指定されていません');
      }
      return AnalysisApiService.getAnalysisDetail(analysisId);
    },
    enabled: enabled && !!analysisId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    retry: 2,
  });
}

/**
 * バッチジョブステータスを取得するフック
 */
export function useBatchJobStatus() {
  return useQuery({
    queryKey: ['batchJobs', 'status'],
    queryFn: () => AnalysisApiService.getBatchJobStatus(),
    staleTime: 2 * 60 * 1000, // 2分間キャッシュ
    gcTime: 5 * 60 * 1000, // 5分間保持
    retry: 1,
    refetchInterval: 5 * 60 * 1000, // 5分ごとに自動リフェッチ
  });
}
