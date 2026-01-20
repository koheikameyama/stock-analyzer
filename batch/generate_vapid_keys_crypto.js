/**
 * VAPID鍵生成スクリプト（cryptoモジュール使用版）
 * Web Push通知に必要なVAPID鍵ペアを生成します
 *
 * 使い方:
 *   node generate_vapid_keys_crypto.js
 */

const crypto = require('crypto');

// Base64 URL-safeエンコード
function base64UrlEncode(buffer) {
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

// VAPID鍵ペアを生成（EC P-256）
const { publicKey, privateKey } = crypto.generateKeyPairSync('ec', {
  namedCurve: 'prime256v1',
  publicKeyEncoding: {
    type: 'spki',
    format: 'der'
  },
  privateKeyEncoding: {
    type: 'pkcs8',
    format: 'der'
  }
});

// 公開鍵をBase64 URL-safeでエンコード
const publicKeyBase64 = base64UrlEncode(publicKey);

// 秘密鍵をBase64 URL-safeでエンコード
const privateKeyBase64 = base64UrlEncode(privateKey);

console.log('='.repeat(60));
console.log('VAPID鍵が生成されました');
console.log('='.repeat(60));
console.log('');
console.log('公開鍵（クライアント側で使用）:');
console.log(`NEXT_PUBLIC_VAPID_PUBLIC_KEY=${publicKeyBase64}`);
console.log('');
console.log('秘密鍵（サーバー側で使用）:');
console.log(`VAPID_PRIVATE_KEY=${privateKeyBase64}`);
console.log('');
console.log('='.repeat(60));
console.log('以下の手順で設定してください:');
console.log('='.repeat(60));
console.log('');
console.log('1. ローカル開発環境:');
console.log('   web/.env.local ファイルに上記の2つの環境変数を追加');
console.log('   VAPID_SUBJECT=mailto:your-email@example.com も追加してください');
console.log('');
console.log('2. 本番環境（Vercel）:');
console.log('   Vercel Dashboard → Settings → Environment Variables');
console.log('   から以下の環境変数を追加:');
console.log('   - NEXT_PUBLIC_VAPID_PUBLIC_KEY');
console.log('   - VAPID_PRIVATE_KEY');
console.log('   - VAPID_SUBJECT');
console.log('');
console.log('='.repeat(60));
