/**
 * VAPID鍵生成スクリプト
 * Web Push通知に必要なVAPID（Voluntary Application Server Identification）鍵ペアを生成します
 *
 * 使い方:
 *   node generate_vapid_keys.js
 *
 * 出力された公開鍵と秘密鍵を環境変数として設定してください:
 *   NEXT_PUBLIC_VAPID_PUBLIC_KEY=<公開鍵>
 *   VAPID_PRIVATE_KEY=<秘密鍵>
 */

const webpush = require('web-push');

// VAPID鍵ペアを生成
const vapidKeys = webpush.generateVAPIDKeys();

console.log('='.repeat(60));
console.log('VAPID鍵が生成されました');
console.log('='.repeat(60));
console.log('');
console.log('公開鍵（クライアント側で使用）:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${vapidKeys.publicKey}`);
console.log('');
console.log('秘密鍵（サーバー側で使用）:');
console.log(`VAPID_PRIVATE_KEY=${vapidKeys.privateKey}`);
console.log('');
console.log('='.repeat(60));
console.log('以下の手順で設定してください:');
console.log('='.repeat(60));
console.log('');
console.log('1. ローカル開発環境:');
console.log('   web/.env.local ファイルに上記の2つの環境変数を追加');
console.log('');
console.log('2. 本番環境（GitHub Secrets）:');
console.log('   リポジトリの Settings → Secrets and variables → Actions');
console.log('   から以下のSecretsを追加:');
console.log('   - NEXT_PUBLIC_VAPID_PUBLIC_KEY');
console.log('   - VAPID_PRIVATE_KEY');
console.log('');
console.log('='.repeat(60));
