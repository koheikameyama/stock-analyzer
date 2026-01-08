import type { NextConfig } from 'next';

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

export default nextConfig;
