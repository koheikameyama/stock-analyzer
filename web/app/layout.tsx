/**
 * ルートレイアウト
 */

import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { InstallPrompt } from '@/components/InstallPrompt';

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
  manifest: '/manifest.json',
  themeColor: '#6366f1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'AI株式分析',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  openGraph: {
    type: 'website',
    locale: 'ja_JP',
    url: 'https://stock-analyzer.jp/',
    siteName: 'AI株式分析ツール',
    title: 'AI株式分析ツール - 日本株の投資判断を毎日AIが分析',
    description: 'AIが日本株の主要15銘柄を毎日自動分析。投資判断（Buy/Hold/Sell）を詳細な根拠付きで提供します。',
    images: [
      {
        url: 'https://stock-analyzer.jp/icon.png',
        width: 512,
        height: 512,
        alt: 'AI株式分析ツール',
      },
    ],
  },
  twitter: {
    card: 'summary',
    site: '@stockAnalyzerJP',
    creator: '@stockAnalyzerJP',
    title: 'AI株式分析ツール - 日本株の投資判断を毎日AIが分析',
    description: 'AIが日本株の主要15銘柄を毎日自動分析。投資判断を詳細な根拠付きで提供します。',
    images: ['https://stock-analyzer.jp/icon.png'],
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
        {/* Google Analytics 4 */}
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-0283BB9Y5B"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-0283BB9Y5B');
          `}
        </Script>

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
        <InstallPrompt />
      </body>
    </html>
  );
}
