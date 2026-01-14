# ドキュメント目次

AI株式分析ツールの設計書・戦略書・デプロイ情報をまとめています。

---

## 📋 ドキュメント構成

### 🎯 戦略・ビジョン（strategy/）

サービスの方向性、ビジョン、将来構想に関するドキュメント

| ドキュメント | 概要 | 更新日 |
|-------------|------|--------|
| [VISION_AND_STRATEGY.md](./strategy/VISION_AND_STRATEGY.md) | サービスの長期ビジョン、3つの進化軸、5年後の理想像、マイルストーン、競合分析、マネタイズ戦略 | 2026-01-14 |
| [ADVANCED_FEATURES_PROPOSAL.md](./strategy/ADVANCED_FEATURES_PROPOSAL.md) | 革新的機能提案（オルタナティブデータ活用、行動経済学ハック、Blind Sideプロダクト案） | 2026-01-14 |

---

### 🏗️ 設計（design/）

技術設計、アーキテクチャ、実装方針に関するドキュメント

| ドキュメント | 概要 | 更新日 |
|-------------|------|--------|
| [ENHANCED_ANALYSIS_DESIGN.md](./design/ENHANCED_ANALYSIS_DESIGN.md) | 高精度分析システム設計書（データ収集、センチメント分析、テクニカル分析、Mastraハイブリッド構成） | 2026-01-14 |

---

### 🚀 デプロイ・運用（deployment/）

デプロイ手順、環境構築、運用に関するドキュメント

| ドキュメント | 概要 | 更新日 |
|-------------|------|--------|
| [デプロイ概要](./deployment/README.md) | デプロイ全体の概要とナビゲーション | 2026-01-14 |
| [DEPLOYMENT.md](./deployment/DEPLOYMENT.md) | Vercel + Supabaseでのデプロイ手順、環境変数設定、トラブルシューティング | 2026-01-08 |
| [vercel_supabase/](./deployment/vercel_supabase/) | Vercel + Supabase環境の詳細設定 | - |

---

## 🗺️ ドキュメントマップ

### 初めての方へ

```
1. サービス理解
   └─ strategy/VISION_AND_STRATEGY.md
      「このサービスが何を目指しているか」

2. 技術設計理解
   └─ design/ENHANCED_ANALYSIS_DESIGN.md
      「どのように実装するか」

3. デプロイ
   └─ deployment/DEPLOYMENT.md
      「どうやって動かすか」
```

### 開発者向け

```
実装前:
  ├─ design/ENHANCED_ANALYSIS_DESIGN.md（必読）
  └─ strategy/VISION_AND_STRATEGY.md（優先順位判断）

実装中:
  └─ design/ENHANCED_ANALYSIS_DESIGN.md（参照）

デプロイ時:
  └─ deployment/DEPLOYMENT.md

新機能検討時:
  └─ strategy/ADVANCED_FEATURES_PROPOSAL.md
```

---

## 📊 ドキュメント統計

- **総ドキュメント数**: 5ファイル
- **総行数**: 約3,700行
- **最終更新**: 2026-01-14

---

## 🔄 更新履歴

### 2026-01-14
- ドキュメント構成を整理（カテゴリ別ディレクトリ化）
- README.md作成（本ファイル）
- VISION_AND_STRATEGY.md追加
- ADVANCED_FEATURES_PROPOSAL.md追加
- ENHANCED_ANALYSIS_DESIGN.md更新（Mastraハイブリッド構成追加）

### 2026-01-08
- DEPLOYMENT.md作成
- Vercel + Supabase環境の初期構築

---

## 📝 ドキュメント作成ガイドライン

新しいドキュメントを追加する際は、以下を守ってください：

1. **適切なディレクトリに配置**
   - 戦略・ビジョン → `strategy/`
   - 技術設計 → `design/`
   - デプロイ・運用 → `deployment/`

2. **Markdownフォーマット**
   - 見出しを適切に使用
   - コードブロックで技術情報を記載
   - 図表を活用

3. **メタ情報を含める**
   - 作成日
   - バージョン
   - 更新履歴

4. **このREADME.mdを更新**
   - 新規ドキュメントを目次に追加
   - 更新履歴に記載

---

## 📞 お問い合わせ

ドキュメントに関する質問・提案がある場合は、GitHubのIssueまたはPull Requestでお知らせください。
