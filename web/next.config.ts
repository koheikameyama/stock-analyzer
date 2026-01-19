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
  register: false, // 手動で登録するため無効化
  skipWaiting: true,
  disable: false, // 開発環境でも有効化（push通知テストのため）
  sw: 'sw.js',
  scope: '/',
})(nextConfig);

export default pwaConfig;
