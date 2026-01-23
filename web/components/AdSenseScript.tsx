/**
 * Google AdSense審査用スクリプト
 * 審査コードを<head>内に挿入
 */

'use client';

import Script from 'next/script';

export const AdSenseScript = () => {
  const adsenseId = process.env.NEXT_PUBLIC_ADSENSE_ID;

  // AdSense IDが設定されていない場合は何も表示しない
  if (!adsenseId) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adsenseId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};
