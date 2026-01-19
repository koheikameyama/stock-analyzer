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

### ⚠️ 重要：ブランチ作成ルール

**リリース対象の変更のみブランチを作成してください。**

- **リリース対象の変更**（新機能、破壊的変更）は必ずブランチ経由で PR を作成 → version:major/minor ラベル付与
- **リリース対象外の変更**（バグ修正、軽微な改善、内部ドキュメント追加、リファクタリングなど）は main に直接コミット可
- ブランチ名の例:
  - `feature/リリースノート機能`
  - `feature/issue-33-design-improvement`
  - `feature/ポートフォリオ機能`

### ブランチ作成確認

リリース対象の作業を始める前に、必ずユーザーに確認してください：

**質問例:**
- 「この作業用に `feature/リリースノート機能` ブランチを作成しますか？（新機能のため）」
- 「この新機能は `version:minor` でリリースしますか？」

**バグ修正や軽微な改善は main に直接コミットしてください。**

### PR作成時の注意

PR作成時は、適切なバージョンラベルを提案してください。

**基本ルール: リリース対象かどうかで判断**

- **version:major** - 破壊的変更（例: API仕様変更、既存機能削除）
  - 即座にリリース作成・通知
- **version:minor** - 新機能追加（例: リリースノート機能、ナビゲーション改善）
  - 即座にリリース作成・通知
- **ラベルなし** - バグ修正、軽微な改善、内部改善など（例: 表示エラー修正、リファクタリング、ドキュメント更新）
  - リリース作成なし（次のminorリリース時に含まれる）

**バージョンラベル（major/minor）で実行される処理:**
- GitHub Release作成
- Slack通知
- X投稿テンプレート生成
- `/releases`ページに表示
- リリースモーダル表示

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

## コミットメッセージ

**コミットメッセージはシンプルに保ってください。**

- コミットメッセージの最後に`Co-Authored-By: Claude <noreply@anthropic.com>`を含めない
- 🤖 Generated with [Claude Code]のリンクも含めない
- 変更内容を簡潔に記述するだけでOK

## 例外

- コード自体（変数名、関数名、クラス名など）は英語で記述する
- commit メッセージは英語または日本語（プロジェクトの慣習に従う）
