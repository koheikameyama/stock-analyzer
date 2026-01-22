/**
 * Google Analytics & AdSense スクリプト
 */

'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export const Analytics = () => {
  useEffect(() => {
    // Google Analytics 4 - 既に読み込まれているかチェック
    if (!document.querySelector('script[src*="googletagmanager.com/gtag/js"]')) {
      const gaScript = document.createElement('script');
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=G-0283BB9Y5B';
      gaScript.async = true;
      document.head.appendChild(gaScript);

      const gaInlineScript = document.createElement('script');
      gaInlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-0283BB9Y5B');
      `;
      document.head.appendChild(gaInlineScript);
    }

    // Google AdSense (自動広告) - 既に読み込まれているかチェック
    if (!document.querySelector('script[src*="adsbygoogle.js"]')) {
      const adsenseScript = document.createElement('script');
      adsenseScript.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7558679080857597';
      adsenseScript.async = true;
      adsenseScript.crossOrigin = 'anonymous';
      document.head.appendChild(adsenseScript);
    }

    // クリーンアップは行わない（スクリプトは永続化）
  }, []);

  return null;
};
