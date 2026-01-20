# Railway Cron Service

Railway上で動作する株式分析バッチジョブのCronサービスです。

## 機能

- 毎日UTC 9:00（日本時間 18:00）に自動的に株式分析を実行
- Pythonバッチスクリプト (`batch/batch_analysis.py`) を呼び出し
- 分析完了後にプッシュ通知を送信

## Railway セットアップ手順

### 1. 新しいサービスを作成

Railway ダッシュボードで：

1. プロジェクトを開く
2. 「New Service」をクリック
3. 「GitHub Repo」を選択
4. リポジトリ `stock-analyzer` を選択
5. Root Directory を `railway-cron` に設定

### 2. 環境変数を設定

以下の環境変数を設定：

```
DATABASE_URL=<Railway PostgreSQLの接続文字列>
OPENAI_API_KEY=<OpenAI APIキー>
API_BASE_URL=<WebアプリのURL（例: https://stock-analyzer-production.up.railway.app）>
RUN_ON_START=false  # 起動時にテスト実行する場合は true
```

### 3. デプロイ

設定が完了したら、自動的にデプロイが開始されます。

## ローカルでのテスト

```bash
cd railway-cron
npm install

# 環境変数を設定
export DATABASE_URL="postgresql://..."
export OPENAI_API_KEY="sk-..."
export API_BASE_URL="http://localhost:3000"
export RUN_ON_START="true"

# 実行
npm start
```

## Cron スケジュール

デフォルト: `0 9 * * *` (毎日UTC 9:00 = 日本時間 18:00)

スケジュールを変更する場合は `index.js` の `cron.schedule()` の第一引数を編集してください。

## ログの確認

Railway ダッシュボードの「Deployments」タブでログを確認できます。

## トラブルシューティング

### サービスが起動しない

- Dockerfileのビルドログを確認
- 環境変数が正しく設定されているか確認

### バッチが実行されない

- Cronスケジュールが正しいか確認
- タイムゾーンが UTC に設定されているか確認
- Pythonスクリプトのパスが正しいか確認

### DB接続エラー

- `DATABASE_URL` が Railway PostgreSQL の内部URLを使用しているか確認
- PostgreSQL サービスが起動しているか確認
