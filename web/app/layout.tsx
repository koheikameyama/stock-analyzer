/**
 * ルートレイアウト
 */

import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AI株式分析ツール',
  description: 'AIが日本株の主要15銘柄を毎日自動分析。投資判断（Buy/Hold/Sell）を詳細な根拠付きで提供します。初心者にもわかりやすい無料の株式分析サービスです。',
  keywords: ['AI', '株式分析', '日本株', '投資', 'Buy/Hold/Sell', '株価予測', '個人投資家'],
  authors: [{ name: 'Stock Analyzer' }],
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://stock-analyzer.jp/',
    siteName: 'AI株式分析ツール',
    title: 'AI株式分析ツール - 日本株の投資判断を毎日AIが分析',
    description: 'AIが日本株の主要15銘柄を毎日自動分析。投資判断（Buy/Hold/Sell）を詳細な根拠付きで提供します。',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@stockAnalyzerJP',
    creator: '@stockAnalyzerJP',
    title: 'AI株式分析ツール - 日本株の投資判断を毎日AIが分析',
    description: 'AIが日本株の主要15銘柄を毎日自動分析。投資判断を詳細な根拠付きで提供します。',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" className={`${inter.variable} ${outfit.variable}`}>
      <head>
        {/* Google AdSense */}
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7558679080857597"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
