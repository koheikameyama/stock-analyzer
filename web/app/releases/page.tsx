'use client';

import { useEffect, useState } from 'react';
import { Layout } from '@/components/Layout';
import ReactMarkdown from 'react-markdown';

interface Release {
  version: string;
  title: string;
  body: string;
  publishedAt: string;
  url: string;
}

export default function ReleasesPage() {
  const [releases, setReleases] = useState<Release[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchReleases = async () => {
      try {
        const response = await fetch('/api/releases');
        if (response.ok) {
          const data = await response.json();
          setReleases(data);
        }
      } catch (error) {
        console.error('Failed to fetch releases:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReleases();
  }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
            リリースノート
          </h1>
          <p className="text-surface-600 dark:text-surface-400">
            AI株式分析ツールの更新履歴
          </p>
        </div>

        {/* リリース一覧 */}
        {isLoading ? (
          <div className="text-center py-12 text-surface-600 dark:text-surface-400">
            読み込み中...
          </div>
        ) : releases.length === 0 ? (
          <div className="text-center py-12 text-surface-600 dark:text-surface-400">
            リリース情報がありません
          </div>
        ) : (
          <div className="space-y-8">
            {releases.map((release, index) => (
              <div
                key={release.version}
                className="bg-white rounded-xl shadow-sm border border-surface-200 overflow-hidden"
              >
                {/* リリースヘッダー */}
                <div className={`px-6 py-4 ${index === 0 ? 'bg-gradient-to-r from-primary-600 to-primary-700' : 'bg-surface-50 border-b border-surface-200'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {index === 0 && <span className="text-2xl">🎉</span>}
                      <div>
                        <h2 className={`text-xl font-bold ${index === 0 ? 'text-white' : 'text-surface-900'}`}>
                          {release.title}
                        </h2>
                        <p className={`text-sm ${index === 0 ? 'text-primary-100' : 'text-surface-600'}`}>
                          {new Date(release.publishedAt).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </p>
                      </div>
                      {index === 0 && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold bg-white/20 text-white rounded">
                          最新
                        </span>
                      )}
                    </div>
                    <a
                      href={release.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-sm font-medium ${index === 0 ? 'text-white hover:text-primary-100' : 'text-primary-600 hover:text-primary-700'} transition-colors`}
                    >
                      GitHub で見る →
                    </a>
                  </div>
                </div>

                {/* リリース内容 */}
                <div className="px-6 py-6">
                  <div className="prose prose-sm max-w-none text-surface-900">
                    <ReactMarkdown>{release.body}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
