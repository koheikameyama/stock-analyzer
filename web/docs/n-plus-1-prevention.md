# N+1問題の防止ガイドライン

## N+1問題とは

N+1問題は、データベースクエリが必要以上に多く実行される問題です。

**悪い例（N+1問題あり）:**
```typescript
// 1. すべての銘柄を取得（1クエリ）
const stocks = await prisma.stock.findMany();

// 2. 各銘柄の最新分析を取得（Nクエリ）
for (const stock of stocks) {
  const analysis = await prisma.analysis.findFirst({
    where: { stockId: stock.id },
    orderBy: { analysisDate: 'desc' },
  });
}
// 合計: 1 + N = 16クエリ（15銘柄の場合）
```

**良い例（N+1問題なし）:**
```typescript
// 1回のクエリで全データを取得
const allAnalyses = await prisma.analysis.findMany({
  where: { stock: { market: 'JP' } },
  include: { stock: true },
  orderBy: { analysisDate: 'desc' },
});

// メモリ上でフィルタリング
const latestByStock = new Map();
for (const analysis of allAnalyses) {
  if (!latestByStock.has(analysis.stockId)) {
    latestByStock.set(analysis.stockId, analysis);
  }
}
// 合計: 1クエリ
```

## 実装ルール

### ✅ DO（推奨）

1. **`include`を使う**
   ```typescript
   const analyses = await prisma.analysis.findMany({
     include: {
       stock: { select: { ticker: true, name: true } }
     }
   });
   ```

2. **一括削除は`deleteMany`を使う**
   ```typescript
   // ❌ ループ内でdelete（N+1問題）
   for (const id of ids) {
     await prisma.record.delete({ where: { id } });
   }

   // ✅ deleteMany（1クエリ）
   await prisma.record.deleteMany({
     where: { id: { in: ids } }
   });
   ```

3. **一括更新は`updateMany`を使う**
   ```typescript
   // ❌ ループ内でupdate（N+1問題）
   for (const item of items) {
     await prisma.record.update({
       where: { id: item.id },
       data: { status: 'processed' }
     });
   }

   // ✅ updateMany（1クエリ）
   await prisma.record.updateMany({
     where: { id: { in: items.map(i => i.id) } },
     data: { status: 'processed' }
   });
   ```

4. **メモリ上でフィルタリング**
   - 複雑な条件の場合は、全データ取得後にJavaScriptで処理

### ❌ DON'T（避ける）

1. **ループ内でデータベースクエリを実行しない**
   ```typescript
   // ❌ 悪い例
   for (const user of users) {
     const posts = await prisma.post.findMany({
       where: { userId: user.id }
     });
   }
   ```

2. **関連データを個別に取得しない**
   ```typescript
   // ❌ 悪い例
   const analysis = await prisma.analysis.findFirst({ where: { id } });
   const stock = await prisma.stock.findFirst({ where: { id: analysis.stockId } });

   // ✅ 良い例
   const analysis = await prisma.analysis.findFirst({
     where: { id },
     include: { stock: true }
   });
   ```

## Vercelサーバーレス環境での注意点

- 接続プールが限られている（`connection_limit=1`）
- タイムアウトは30秒（`maxDuration`で最大60秒）
- **N+1問題は致命的**: 16クエリで30秒超過 → 500エラー

## 実際に発生した問題と解決例

### ケース1: `/api/analyses/latest`のタイムアウト

**問題:**
```typescript
// 各銘柄の最新分析を個別に取得（16クエリ）
const stocks = await prisma.stock.findMany();
for (const stock of stocks) {
  const analysis = await prisma.analysis.findFirst({
    where: { stockId: stock.id },
    orderBy: { analysisDate: 'desc' }
  });
}
```

**解決:**
```typescript
// 全分析を1回で取得し、メモリ上でフィルタリング（1クエリ）
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

**効果:** 16クエリ → 1クエリ（94%削減、タイムアウト解消）

### ケース2: プッシュ通知の無効購読削除

**問題:**
```typescript
// ループ内で個別削除（Nクエリ）
for (const subscription of invalidSubscriptions) {
  await prisma.pushSubscription.delete({
    where: { endpoint: subscription.endpoint }
  });
}
```

**解決:**
```typescript
// 無効なエンドポイントを収集
const invalidEndpoints = [];
for (const subscription of results) {
  if (subscription.invalid) {
    invalidEndpoints.push(subscription.endpoint);
  }
}

// 一括削除（1クエリ）
await prisma.pushSubscription.deleteMany({
  where: { endpoint: { in: invalidEndpoints } }
});
```

## チェックリスト

新しいコードを書く際は、以下を確認してください：

- [ ] ループ内で`prisma.*`を呼んでいないか？
- [ ] `include`や`select`でリレーションを効率的に取得しているか？
- [ ] 複数レコードの更新/削除に`updateMany`/`deleteMany`を使っているか？
- [ ] クエリ数が少ない実装になっているか？

## 参考リンク

- [Prisma Performance Guide](https://www.prisma.io/docs/guides/performance-and-optimization/query-optimization-performance)
- [N+1 Query Problem](https://stackoverflow.com/questions/97197/what-is-the-n1-selects-problem-in-orm-object-relational-mapping)
