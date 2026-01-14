/**
 * Google AdSense広告バナーコンポーネント
 */

'use client';

import React, { useEffect } from 'react';

interface AdBannerProps {
  /**
   * 広告スロットID（AdSenseダッシュボードから取得）
   */
  adSlot: string;

  /**
   * 広告フォーマット
   */
  adFormat?: 'auto' | 'fluid' | 'rectangle' | 'horizontal' | 'vertical';

  /**
   * レスポンシブ対応
   */
  fullWidthResponsive?: boolean;

  /**
   * カスタムクラス
   */
  className?: string;
}

// グローバルなGoogle AdSenseの型定義
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

/**
 * Google AdSenseバナー広告コンポーネント
 *
 * 使用例:
 * <AdBanner adSlot="1234567890" adFormat="auto" />
 */
export const AdBanner: React.FC<AdBannerProps> = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive = true,
  className = '',
}) => {
  useEffect(() => {
    try {
      // Google AdSenseの広告をプッシュ
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className={`ad-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-7558679080857597"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
};
