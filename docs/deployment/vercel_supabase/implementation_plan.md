# デプロイ実装計画 (Vercel + Supabase)

Stock Analyzerを本番環境（Vercel + Supabase）にデプロイするための手順書です。

## 前提条件

以下のサービスのアカウントが必要です：
- GitHub
- Vercel (Webアプリのホスティング)
- Supabase (データベース)
- OpenAI API Key (AI分析用)

## 1. データベースのセットアップ (Supabase)

SupabaseでPostgreSQLデータベースを作成し、接続情報を取得します。

### 手順
1. [Supabase](https://supabase.com/) にログインし、"New Project" を作成します。
2. データベースのパスワードを設定します（後で必要になるので控えておいてください）。
3. プロジェクトが作成されたら、Settings -> Database -> Connection string -> URI を確認します。
4. `Mode: Transaction` (ポート6543) または `Session` (ポート5432) が選べますが、まずはデフォルトの `Session` (5432) を使用します。
   - 形式: `postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres`

## 2. 環境変数の設定

### GitHub Secrets (バッチ処理用)
`.github/workflows/daily-analysis.yml` が動作するために必要です。
- `This Repository` -> Settings -> Secrets and variables -> Actions -> New repository secret
- 追加するキー:
  - `DATABASE_URL`: Supabaseの接続文字列
  - `OPENAI_API_KEY`: OpenAIのAPIキー

### Vercel Environment Variables (Webアプリ用)
Vercelへのデプロイ時に必要です。
- プロジェクト作成時に設定、または Settings -> Environment Variables
- 追加するキー:
  - `DATABASE_URL`: Supabaseの接続文字列
  - `NEXT_PUBLIC_API_URL`: (必要であれば)

## 3. デプロイ手順

### データベースの初期化
ローカル環境からSupabaseに対してスキーマの適用と初期データの投入を行います。

```bash
# .env を更新
DATABASE_URL="Supabaseの接続文字列"

# スキーマ適用
npx prisma db push

# シードデータ投入
npm run db:seed
```

### Webアプリのデプロイ (Vercel)
1. Vercelダッシュボードから "Add New..." -> "Project"
2. GitHubリポジトリ `stock-analyzer` をインポート
3. Framework Preset は `Next.js` が自動選択されます
4. Environment Variables に `DATABASE_URL` を追加
5. Deploy

## 4. バッチ処理の確認 (GitHub Actions)
1. GitHubのActionsタブを確認
2. 手動で `Daily Stock Analysis` を実行し、成功するか確認

## 検証計画
- [ ] Supabaseにテーブルが作成されていること (`npx prisma studio` またはSupabaseダッシュボードで確認)
- [ ] Webアプリ (`https://[project].vercel.app`) にアクセスできること
- [ ] データベースのデータがWebアプリに表示されること
- [ ] GitHub Actionsのバッチ処理が成功すること
