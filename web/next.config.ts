import type { NextConfig } from 'next';
import withPWA from 'next-pwa';
import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

// Cloudflareローカル開発用の初期化
if (process.env.NODE_ENV === 'development') {
  initOpenNextCloudflareForDev();
}

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // ホットリロードの最適化
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // ファイルウォッチャーの設定
      config.watchOptions = {
        poll: 1000, // 1秒ごとにファイルの変更をチェック
        aggregateTimeout: 300, // 変更後300ms待ってから再コンパイル
      };
    }
    return config;
  },
};

// PWA設定
const pwaConfig = withPWA({
  dest: 'public',
  register: false, // 手動で登録するため無効化
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 開発環境では無効化
  sw: 'sw.js',
  scope: '/',
  // 存在しないファイルをプリキャッシュしないように設定
  buildExcludes: [/app-build-manifest\.json$/],
  // ランタイムキャッシング戦略を設定
  runtimeCaching: [
    {
      urlPattern: /^https?.*/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'offlineCache',
        expiration: {
          maxEntries: 200,
        },
      },
    },
  ],
})(nextConfig);

export default pwaConfig;
