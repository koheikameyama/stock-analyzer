/**
 * 設定ページ
 */

'use client';

import { Layout } from '@/components/Layout';
import PushNotificationToggle from '@/components/PushNotificationToggle';

export default function SettingsPage() {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-8">
        {/* ヘッダー */}
        <div>
          <h1 className="text-3xl font-bold text-surface-900">⚙️ 設定</h1>
          <p className="text-surface-500 mt-2">
            アプリケーションの設定を管理します
          </p>
        </div>

        {/* 通知設定セクション */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
            <h2 className="text-lg font-semibold text-surface-900">🔔 通知設定</h2>
            <p className="text-sm text-surface-600 mt-1">
              プッシュ通知の設定を管理します
            </p>
          </div>

          <div className="p-6">
            <PushNotificationToggle />

            <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
              <h3 className="text-sm font-medium text-blue-900 mb-2">💡 プッシュ通知について</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>毎日18:00の分析完了時に通知をお届けします</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>最新の投資アイデアをいち早くチェックできます</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-0.5">•</span>
                  <span>いつでもON/OFFを切り替えられます</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* その他の設定セクション（将来の拡張用） */}
        <div className="bg-white rounded-xl border border-surface-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200 bg-surface-50">
            <h2 className="text-lg font-semibold text-surface-900">📱 表示設定</h2>
            <p className="text-sm text-surface-600 mt-1">
              アプリの表示に関する設定
            </p>
          </div>

          <div className="p-6">
            <p className="text-sm text-surface-500">
              今後、テーマ設定やレイアウト設定などを追加予定です
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
