# PRを作成または更新

## 手順

1. **対象ブランチの確認**
   - 現在のブランチを確認
   - 「どのブランチ向けにPRを作成しますか？」
     - main（本番環境）
     - develop（開発環境）
     - その他（ブランチ名を指定）

2. **既存PRの確認**
   - 現在のブランチから対象ブランチへのPRが既に存在するか確認
   ```bash
   gh pr list --head <current-branch> --base <target-branch> --state open
   ```

3. **PR作成またはオプション提示**
   - **既存PRがある場合**:
     - 「既にPR #<番号> が存在します。どうしますか？」
       - PR内容を更新（本文を最新の変更内容で上書き）
       - PRを閉じて新規作成
       - 何もしない

   - **既存PRがない場合**:
     - 新規PR作成に進む

4. **変更内容の確認**（新規作成または更新時）
   ```bash
   git status
   git diff <target-branch>...HEAD
   git log <target-branch>..HEAD --oneline
   git rev-parse --abbrev-ref --symbolic-full-name @{u}
   ```

5. **PR本文の生成**
   - コミット履歴から変更内容を分析
   - 以下のセクションを含むPR本文を自動生成:
     - 概要
     - 主な変更内容（箇条書き）
     - テスト計画
     - 注意事項
     - バージョンラベル推奨

6. **バージョンラベルの提案**

   **詳細は `CLAUDE.md` の「PR作成時の注意」セクションを参照**

   ユーザーに確認: 「このPRに `version:〇〇` ラベルを付けますか？」

7. **ユーザー向け説明の生成**（バージョンラベルがある場合のみ）

   バージョンラベル（major/minor/patch）が付く場合、OpenAI APIを使ってユーザー向けの説明を生成:

   ```bash
   # OpenAI APIでユーザー向け説明を生成
   PROMPT="以下のPRタイトルと変更内容をもとに、ユーザー向けの華やかで分かりやすい説明を生成してください。

   要件:
   - PRの内容を理解し、ユーザーにとってのメリットを説明
   - 絵文字を積極的に使用
   - 各説明は1行で簡潔に
   - 2から4個の箇条書きにまとめる
   - 語尾は「しました」「できます」などを使用

   出力形式（プレーンテキスト、箇条書きマーク不要）:
   機能Aを追加しました
   機能Bが使いやすくなりました
   パフォーマンスが向上しました

   PRタイトル: <title>
   変更内容:
   <changes>"

   RESPONSE=$(curl -s https://api.openai.com/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $OPENAI_API_KEY" \
     -d "{\"model\":\"gpt-4o-mini\",\"messages\":[{\"role\":\"user\",\"content\":\"$PROMPT\"}],\"temperature\":0.7,\"max_tokens\":300}")

   USER_FACING_CHANGES=$(echo "$RESPONSE" | jq -r '.choices[0].message.content')
   ```

   生成された説明を「## ユーザー向けの変更」セクションとしてPR本文に追加

8. **PR作成または更新の実行**

   **新規作成の場合**:
   ```bash
   # リモートにpush（必要な場合）
   git push -u origin <current-branch>

   # PR作成
   gh pr create --base <target-branch> --head <current-branch> \
     --title "<タイトル>" \
     --body "<本文>"
   ```

   **更新の場合**:
   ```bash
   # PR本文を更新
   gh pr edit <pr-number> --body "<新しい本文>"
   ```

9. **ラベル付与**（ユーザーが承認した場合）
   ```bash
   gh pr edit <pr-number> --add-label "version:minor"
   ```

10. **完了メッセージ**
   - PR URLを表示
   - 付与したラベルを表示
   - 「マージはユーザーが手動で行います」と明記

## 重要なルール

- **PRの自動マージは絶対に行わない**
- PR本文に「🤖 Generated with [Claude Code]」は含めない
- mainブランチへのPRには特に注意を払う
- バージョンラベルはユーザーに確認してから付与
- 既存PRがある場合は必ず確認してからアクション

## PR本文テンプレート

### バージョンラベルなしの場合

```markdown
## 概要

<変更の概要を1-2文で説明>

## 主な変更内容

- <変更1>
- <変更2>
- <変更3>

## テスト計画

- [ ] <テスト項目1>
- [ ] <テスト項目2>
- [ ] <テスト項目3>

## 注意事項

<特に注意すべき点があれば記載>
```

### バージョンラベルありの場合

```markdown
## 概要

<変更の概要を1-2文で説明>

## ユーザー向けの変更

<AIが生成したユーザー向けの説明（箇条書き）>

## 主な変更内容

- <変更1>
- <変更2>
- <変更3>

## テスト計画

- [ ] <テスト項目1>
- [ ] <テスト項目2>
- [ ] <テスト項目3>

## 注意事項

<特に注意すべき点があれば記載>
```

## エラー対応

- リモートブランチが存在しない場合: 自動でpush
- PR作成に失敗した場合: エラー内容を表示してユーザーに確認
- 既存PRの更新に失敗した場合: 手動更新の方法を案内
