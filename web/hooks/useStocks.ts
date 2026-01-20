/**
 * 銘柄データを取得するカスタムフック
 */

import useSWR from 'swr';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

/**
 * 銘柄一覧を取得
 */
export function useStocks(params?: {
  market?: string;
  page?: number;
  limit?: number;
  search?: string;
  sector?: string;
  hasAnalysis?: boolean;
  isAiTarget?: boolean;
}) {
  // クエリパラメータを構築
  const queryParams = new URLSearchParams();
  if (params?.market) queryParams.append('market', params.market);
  if (params?.page) queryParams.append('page', String(params.page));
  if (params?.limit) queryParams.append('limit', String(params.limit));
  if (params?.search) queryParams.append('search', params.search);
  if (params?.sector) queryParams.append('sector', params.sector);
  if (params?.hasAnalysis !== undefined) {
    queryParams.append('hasAnalysis', String(params.hasAnalysis));
  }
  if (params?.isAiTarget !== undefined) {
    queryParams.append('isAiTarget', String(params.isAiTarget));
  }

  const url = `/api/stocks?${queryParams.toString()}`;

  const { data, error, isLoading, mutate } = useSWR(url, fetcher, {
    revalidateOnFocus: false, // フォーカス時の再検証を無効化
    revalidateOnReconnect: true, // 再接続時の再検証は有効
  });

  return {
    data: data?.data,
    isLoading,
    error,
    mutate,
  };
}

/**
 * 利用可能なセクター一覧を取得
 */
export function useSectors() {
  const { data, error, isLoading } = useSWR('/api/stocks/sectors', fetcher, {
    revalidateOnFocus: false,
  });

  return {
    sectors: data?.data || [],
    isLoading,
    error,
  };
}
