# Claude Code 設定

## 言語設定

**すべての出力は日本語で行ってください。**

- ユーザーとのコミュニケーションは日本語で行う
- コードコメントは日本語で記述する
- ドキュメント、仕様書、README等も日本語で作成する
- エラーメッセージや説明も日本語で提供する

## コミュニケーションルール

**質問は1つずつ行ってください。**

- ユーザーに質問をする際は、一度に1つの質問のみを行う
- 複数の質問がある場合でも、1つずつ順番に聞く
- ユーザーが回答した後、次の質問に進む

## 開発フロー

**ブランチ運用に従って開発してください。**

### 🚨 絶対に守るべきルール

**mainブランチへの直接操作は絶対に禁止です。**

- ❌ **mainブランチへの直接push禁止**
- ❌ **mainブランチへの直接merge禁止**
- ❌ **mainブランチへのforce push禁止**
- ✅ **すべての変更は必ずPR経由で行う**
- ✅ **PRのマージはユーザーが手動で行う（自動マージ禁止）**

### ⚠️ 重要：ブランチ運用ルール

**このプロジェクトでは以下のブランチ構成を使用します：**

#### ブランチ構成
- **main**: 本番環境
- **develop**: 開発環境
- **feature/***: 新機能・改善（developから切る → developへPR）
- **hotfix/***: 緊急修正（mainから切る → mainへPR）

#### ブランチ作成ルール
1. **feature/** ブランチ
   - **切り元**: develop
   - **PR先**: develop
   - **用途**: 通常の開発作業（新機能、改善、バグ修正など）
   - **例**: `feature/release-note-feature`, `feature/performance-improvement`

2. **hotfix/** ブランチ
   - **切り元**: main
   - **PR先**: main
   - **用途**: 本番環境の緊急修正のみ
   - **例**: `hotfix/critical-login-bug`, `hotfix/security-patch`

3. **重要な制約**
   - ❌ **既にマージされたブランチは絶対に使わない**
   - ❌ **feature/とhotfix/以外のプレフィックスは使用禁止**
   - ✅ **ブランチ名は英語のケバブケース（lowercase-with-hyphens）**
   - ✅ **ブランチをpushすると自動的にPRが作成されます**

### 🚨 作業開始時の必須確認

**作業を始める前に、必ず以下の手順を実行してください：**

#### 1. 現在のブランチ状態をチェック

```bash
# 現在のブランチを確認
git branch --show-current

# そのブランチのPR状態を確認
gh pr list --head <current-branch> --state all
```

#### 2. マージ済みブランチかチェック

以下のいずれかに該当する場合は、**絶対にそのブランチで作業してはいけません**：

- ❌ PRが既にマージされている（state: MERGED）
- ❌ PRが既にクローズされている（state: CLOSED）
- ❌ main または develop ブランチである

**マージ済みブランチで作業しようとした場合：**
1. ユーザーに警告を出す
2. 「このブランチは既にマージ済みです。新しいブランチを作成しますか？」と確認
3. developから新しいfeatureブランチを作成

#### 3. 新しいブランチ作成の確認

**質問例:**
- 「どのブランチで作業しますか？」
  - 既存のブランチで続ける（マージ済みでない場合のみ）
  - 新しいブランチを作成
    - 通常の開発 → developから feature/〇〇
    - 本番の緊急修正 → mainから hotfix/〇〇

#### 4. 作業開始前のチェックリスト

- [ ] 現在のブランチがマージ済みでないことを確認
- [ ] main/developブランチで作業していないことを確認
- [ ] 適切なブランチ（feature/またはhotfix/）で作業していることを確認

### PR作成時の注意

PR作成時は、適切なバージョンラベルを提案してください。

**バージョンラベルの使い分けルール:**

詳細は `.claude/includes/version-label-guidelines.md` を参照してください。

**要約:**
- バージョンラベルは「ユーザーから見て価値がある変更」にのみ付与
- 判断基準: 「ユーザーに説明して価値が伝わるか？」
  - ✅ 伝わる → バージョンラベル必要
  - ❌ 伝わらない → ラベル不要

**バージョンラベル（major/minor）で実行される処理:**
- GitHub Release作成
- Slack通知
- X投稿テンプレート生成
- `/releases`ページに表示
- リリースモーダル表示

**develop→mainのPR（デプロイPR）について:**

- デプロイPRは`create-deploy-pr.yml`ワークフローが自動生成します
- 「## 更新内容」セクションに、含まれるfeature PRのタイトル（リンク）とバージョンラベルが自動的に記載されます
- 例:
  ```markdown
  ## 更新内容
  - [minor] [プッシュ通知機能を追加](https://github.com/.../pull/100)
  - [リリースノート表示を改善](https://github.com/.../pull/101)
  ```

**リリースノート生成について:**

- mainブランチにマージされると、AIが「更新内容」をもとに華やかなユーザー向け説明を自動生成します
- 生成された説明はGitHub Releaseとリリースモーダルに表示されます
- X投稿テンプレートにも使用されます

**確認する質問例:**
- 「このPRには `version:minor` ラベルを付けますか？（新機能追加のため）」
- 「破壊的変更なので `version:major` ラベルを付けますか？」
- 「バグ修正なのでラベルなしで良いですか？（次のminorリリースに含まれます）」

### 自動リリースの流れ

1. PR作成 + version:major または version:minor ラベル付与
2. main にマージ
3. 自動的にバージョン計算してGitHub Release作成
4. Slack通知（X投稿候補付き）
5. ユーザーが手動でX投稿
6. リリースモーダルが自動表示

### 詳細ドキュメント

詳しくは [ブランチ運用戦略](./docs/branch_strategy.md) を参照してください。

## Issue管理

**新しいissueを作成したら、必ずプロジェクトに追加してください。**

### Issue作成時の手順

1. `gh issue create` でissueを作成
2. 作成されたissue番号を確認
3. 以下のコマンドでプロジェクトに追加：
   ```bash
   gh project item-add 2 --owner koheikameyama --url https://github.com/koheikameyama/stock-analyzer/issues/<ISSUE_NUMBER>
   ```

### プロジェクト情報

- **プロジェクト番号**: 2
- **プロジェクト名**: Stock Analyzer Development
- **Owner**: koheikameyama

### 例

```bash
# Issue作成
gh issue create --title "新機能" --body "説明" --label "enhancement"
# → Issue #44 が作成される

# プロジェクトに追加
gh project item-add 2 --owner koheikameyama --url https://github.com/koheikameyama/stock-analyzer/issues/44
```

**重要: issueを作成したら、必ずプロジェクトへの追加も実行してください。**

## N+1問題の防止

**データベースクエリでN+1問題を発生させないでください。**

N+1問題は、データベースクエリが必要以上に多く実行される問題で、サーバーレス環境では接続プール枯渇やタイムアウトの原因になります。

### ✅ DO（推奨）

1. **`include`でリレーションを取得**
   ```typescript
   // ✅ 1クエリで全て取得
   const analyses = await prisma.analysis.findMany({
     include: { stock: true }
   });
   ```

2. **一括操作には`deleteMany`/`updateMany`を使う**
   ```typescript
   // ✅ 1クエリで一括削除
   await prisma.record.deleteMany({
     where: { id: { in: ids } }
   });
   ```

3. **全データ取得後、メモリ上でフィルタリング**
   ```typescript
   // ✅ 1クエリで全取得 → メモリ上で最新のみ抽出
   const allAnalyses = await prisma.analysis.findMany({
     include: { stock: true },
     orderBy: { analysisDate: 'desc' }
   });

   const latestByStock = new Map();
   for (const analysis of allAnalyses) {
     if (!latestByStock.has(analysis.stockId)) {
       latestByStock.set(analysis.stockId, analysis);
     }
   }
   ```

### ❌ DON'T（避ける）

1. **ループ内でデータベースクエリを実行しない**
   ```typescript
   // ❌ 悪い例（Nクエリ発生）
   for (const stock of stocks) {
     const analysis = await prisma.analysis.findFirst({
       where: { stockId: stock.id }
     });
   }
   ```

2. **ループ内で個別削除/更新しない**
   ```typescript
   // ❌ 悪い例（Nクエリ発生）
   for (const id of ids) {
     await prisma.record.delete({ where: { id } });
   }
   ```

### 実装時のチェックリスト

- [ ] ループ内で`await prisma.*`を呼んでいないか？
- [ ] `include`でリレーションを効率的に取得しているか？
- [ ] 複数レコードの更新/削除に`*Many`を使っているか？

### 過去の問題例

- `/api/analyses/latest`: 16クエリ → タイムアウト → 1クエリに最適化
- `/api/push-notifications/send`: ループ内delete → deleteMany に変更

詳細は [N+1問題防止ガイド](./docs/n-plus-1-prevention.md) を参照してください。

## UI/UXデザイン原則

**スマホ表示を最優先に設計してください。**

### モバイルファーストの原則

1. **スマホでの表示を最初に考える**
   - UIコンポーネントを設計する際は、まずスマホでの表示を確認
   - 横幅が狭い画面でもレイアウトが崩れないように設計
   - テキストやボタンが見切れないように配慮

2. **レスポンシブデザインの必須項目**
   - `flex-wrap` で自動改行を活用
   - `whitespace-nowrap` と `flex-shrink-0` で重要な要素を保護
   - `break-words` で長いテキストを適切に改行
   - `gap-3` などで適切な余白を確保

3. **実装時のチェックリスト**
   - [ ] スマホ（375px幅）で表示が崩れないか？
   - [ ] 長い企業名やテキストで要素が重ならないか？
   - [ ] ツールチップが画面端で見切れないか？
   - [ ] タッチ操作しやすいサイズか？（最小44x44px）

### 具体例

```tsx
// ❌ 悪い例：スマホで崩れる
<div className="flex justify-between items-start">
  <h3>{longCompanyName}</h3>
  <div>ステータス</div>
</div>

// ✅ 良い例：スマホでも崩れない
<div className="flex justify-between items-start gap-3">
  <h3 className="break-words">{longCompanyName}</h3>
  <div className="whitespace-nowrap flex-shrink-0">ステータス</div>
</div>
```

## コミットメッセージ・PR本文

**「🤖 Generated with [Claude Code]」は含めないでください。**

- コミットメッセージに含めない
- PRの本文に含めない
- シンプルで読みやすいメッセージを心がける

## 例外

- コード自体（変数名、関数名、クラス名など）は英語で記述する
- commit メッセージは英語または日本語（プロジェクトの慣習に従う）
