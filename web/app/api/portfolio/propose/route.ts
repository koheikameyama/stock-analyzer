import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import OpenAI from 'openai';
import { prisma } from '@/lib/prisma';

// ポートフォリオ提案のレスポンス型
interface ProposedStock {
  stockId: string;
  ticker: string;
  name: string;
  sector: string;
  currentPrice: number;
  recommendedShares: number; // 推奨購入株数
  estimatedCost: number; // 推定購入金額
  reason: string; // 選定理由
}

interface ProposeResponse {
  investmentBudget: number;
  proposedStocks: ProposedStock[];
  totalEstimatedCost: number;
}

// 投資予算から銘柄数を計算
function calculateStockCount(budget: number): number {
  if (budget < 100000) return 2;
  if (budget < 300000) return 3;
  if (budget < 500000) return 5;
  if (budget < 1000000) return 7;
  return 10;
}

// 候補銘柄を抽出（フィルタリング）
async function getCandidateStocks() {
  // 日経225の主要銘柄から候補を取得
  // 条件：
  // - 時価総額1000億円以上
  // - セクター分散
  const stocks = await prisma.stock.findMany({
    where: {
      market: 'JP',
      marketCap: {
        gte: 100000000000, // 1000億円以上
      },
    },
    orderBy: {
      marketCap: 'desc',
    },
    take: 50, // 上位50銘柄から選定
  });

  return stocks;
}

// AIで銘柄を選定
async function selectStocksWithAI(candidates: any[], targetCount: number): Promise<any[]> {
  // OpenAI APIで選定
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  // 候補銘柄をJSON形式で整形
  const candidatesInfo = candidates.map((s, index) => ({
    index,
    ticker: s.ticker,
    name: s.name,
    sector: s.sector,
    marketCap: s.marketCap?.toString() || 'N/A',
  }));

  const prompt = `あなたは投資初心者向けのポートフォリオアドバイザーです。
以下の日本株候補から、初心者に適した${targetCount}銘柄を選定してください。

【選定基準】
1. セクター分散：異なる業種に分散する
2. 安定性重視：時価総額が大きく、業績が安定している企業
3. 成長性：将来の成長も期待できる
4. 初心者向け：有名で理解しやすい事業を行っている企業

【候補銘柄】
${JSON.stringify(candidatesInfo, null, 2)}

【指示】
上記の候補から${targetCount}銘柄を選定し、以下のJSON形式のみで回答してください。
他の説明文は一切不要です。

{
  "selected": [
    { "index": 0, "reason": "選定理由（50文字以内）" },
    ...
  ]
}`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content?.trim();
    if (!responseText) {
      throw new Error('AI応答が空です');
    }

    // JSONをパース
    const result = JSON.parse(responseText);
    const selectedIndices = result.selected.map((s: { index: number }) => s.index);

    return selectedIndices.map((idx: number) => candidates[idx]);
  } catch (error) {
    console.error('AI選定エラー:', error);
    // フォールバック：セクター分散で選定
    const sectors = [...new Set(candidates.map(s => s.sector))];
    const selected: any[] = [];
    const stocksPerSector = Math.ceil(targetCount / sectors.length);

    for (const sector of sectors) {
      const sectorStocks = candidates.filter(s => s.sector === sector);
      selected.push(...sectorStocks.slice(0, stocksPerSector));
      if (selected.length >= targetCount) break;
    }

    return selected.slice(0, targetCount);
  }
}

// 最新株価を取得（仮実装）
async function getCurrentPrice(stockId: string): Promise<number> {
  const latestPrice = await prisma.priceHistory.findFirst({
    where: { stockId },
    orderBy: { date: 'desc' },
  });

  return latestPrice?.close ?? 1000; // デフォルト値
}

// 推奨購入株数を計算
function calculateRecommendedShares(
  budget: number,
  stockCount: number,
  currentPrice: number
): number {
  const budgetPerStock = budget / stockCount;
  const shares = Math.floor(budgetPerStock / currentPrice);

  // 単元株（100株）に調整
  return Math.floor(shares / 100) * 100;
}

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    // リクエストボディを取得
    const body = await request.json();
    const { investmentBudget } = body;

    // バリデーション
    if (!investmentBudget || investmentBudget < 10000) {
      return NextResponse.json(
        { error: '投資予算は10,000円以上を指定してください' },
        { status: 400 }
      );
    }

    // 既にポートフォリオがある場合はエラー
    const existingPortfolio = await prisma.portfolio.findUnique({
      where: { userId: session.user.id },
    });

    if (existingPortfolio) {
      return NextResponse.json({ error: '既にポートフォリオが存在します' }, { status: 400 });
    }

    // 銘柄数を計算
    const stockCount = calculateStockCount(investmentBudget);

    // 候補銘柄を取得
    const candidates = await getCandidateStocks();

    if (candidates.length === 0) {
      return NextResponse.json({ error: '候補銘柄が見つかりませんでした' }, { status: 500 });
    }

    // AIで選定
    const selectedStocks = await selectStocksWithAI(candidates, stockCount);

    // 各銘柄の詳細情報を構築
    const proposedStocks: ProposedStock[] = await Promise.all(
      selectedStocks.map(async stock => {
        const currentPrice = await getCurrentPrice(stock.id);
        const recommendedShares = calculateRecommendedShares(
          investmentBudget,
          stockCount,
          currentPrice
        );
        const estimatedCost = recommendedShares * currentPrice;

        return {
          stockId: stock.id,
          ticker: stock.ticker,
          name: stock.name,
          sector: stock.sector || '未分類',
          currentPrice,
          recommendedShares,
          estimatedCost,
          reason: `${stock.sector}セクターの代表的な銘柄として選定しました。`, // TODO: AI生成
        };
      })
    );

    // 合計金額を計算
    const totalEstimatedCost = proposedStocks.reduce((sum, stock) => sum + stock.estimatedCost, 0);

    const response: ProposeResponse = {
      investmentBudget,
      proposedStocks,
      totalEstimatedCost,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('ポートフォリオ提案エラー:', error);
    return NextResponse.json({ error: 'サーバーエラーが発生しました' }, { status: 500 });
  }
}
