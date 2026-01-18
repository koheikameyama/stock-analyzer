import type { NextConfig } from 'next';
import withPWA from 'next-pwa';

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
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development', // 開発環境では無効化
})(nextConfig);

export default pwaConfig;
