/**
 * 構造化データ（JSON-LD）コンポーネント
 * 検索結果のリッチスニペット表示を改善
 */

'use client';

export const StructuredData = () => {
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI株式分析ツール',
    alternateName: 'Stock Analyzer',
    url: 'https://stock-analyzer.jp',
    description:
      'AIが日本株の主要15銘柄を毎日自動分析。投資判断（Buy/Hold/Sell）を詳細な根拠付きで提供します。初心者にもわかりやすい無料の株式分析サービスです。',
    applicationCategory: 'FinanceApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'JPY',
    },
    author: {
      '@type': 'Organization',
      name: 'Stock Analyzer',
      url: 'https://stock-analyzer.jp',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Stock Analyzer',
      logo: {
        '@type': 'ImageObject',
        url: 'https://stock-analyzer.jp/icon.png',
      },
    },
    inLanguage: 'ja',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://stock-analyzer.jp/stocks?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
};
