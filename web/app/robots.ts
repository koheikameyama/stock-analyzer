/**
 * robots.txt生成
 * クローラーの動作を制御
 */

import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/settings'],
      },
    ],
    sitemap: 'https://stock-analyzer.jp/sitemap.xml',
  };
}
