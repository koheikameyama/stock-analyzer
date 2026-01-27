'use client';

import { useQuery } from '@tanstack/react-query';

interface ActionProposal {
  id: string;
  stockId: string;
  actionType: string;
  reason: string;
  confidence: number;
  isRead: boolean;
  createdAt: string;
  stock: {
    ticker: string;
    name: string;
  };
}

async function fetchActionProposals(): Promise<ActionProposal[]> {
  const res = await fetch('/api/action-proposals');
  if (!res.ok) {
    if (res.status === 404) return [];
    throw new Error('アクション提案取得エラー');
  }
  return res.json();
}

export default function ActionProposals() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['action-proposals'],
    queryFn: fetchActionProposals,
  });

  if (isLoading) return null; // 読み込み中は何も表示しない

  if (error) {
    console.error('アクション提案取得エラー:', error);
    return null;
  }

  // 未読の提案のみ表示
  const unreadProposals = data?.filter(p => !p.isRead) || [];

  if (unreadProposals.length === 0) {
    return null; // 提案がない場合は表示しない
  }

  return (
    <div className="mb-6">
      {unreadProposals.map(proposal => {
        const isUrgent = proposal.actionType === 'SELL';

        return (
          <div
            key={proposal.id}
            className={`rounded-lg p-4 border-l-4 ${
              isUrgent ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-grow">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">⚠️</span>
                  <h3 className="text-lg font-bold">{isUrgent ? '売却検討' : 'アクション提案'}</h3>
                </div>
                <p className="font-medium mb-1">{proposal.stock.name}</p>
                <p className="text-sm text-gray-700">{proposal.reason}</p>
                <p className="text-xs text-gray-500 mt-2">確信度: {proposal.confidence}%</p>
              </div>
              <button
                className={`px-4 py-2 rounded font-medium text-white whitespace-nowrap flex-shrink-0 ${
                  isUrgent ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'
                }`}
              >
                詳しく見る
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
