import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';

const prisma = new PrismaClient();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// リクエストの型定義
type RiskTolerance = 'conservative' | 'balanced' | 'aggressive';
type InvestmentPeriod = 'short' | 'medium' | 'long';

interface PortfolioRequest {
  amount: number; // 投資金額
  riskTolerance: RiskTolerance; // リスク許容度
  investmentPeriod: InvestmentPeriod; // 投資期間
}

// レスポンスの型定義
interface StockSuggestion {
  stockId: number;
  code: string;
  name: string;
  shares: number; // 推奨株数
  price: number; // 現在株価
  amount: number; // 投資金額
  sector: string;
  reason: string; // 選定理由（簡易版）
}

interface PortfolioSuggestion {
  stocks: StockSuggestion[];
  totalAmount: number;
  cashReserve: number; // 余剰資金
  aiExplanation: string; // AIによる総合説明
  disclaimer: string; // 免責事項
}

export async function POST(request: NextRequest) {
  try {
    const body: PortfolioRequest = await request.json();
    const { amount, riskTolerance, investmentPeriod } = body;

    // バリデーション
    if (!amount || amount < 10000) {
      return NextResponse.json(
        { error: '投資金額は1万円以上を指定してください' },
        { status: 400 }
      );
    }

    if (!['conservative', 'balanced', 'aggressive'].includes(riskTolerance)) {
      return NextResponse.json(
        { error: '無効なリスク許容度です' },
        { status: 400 }
      );
    }

    if (!['short', 'medium', 'long'].includes(investmentPeriod)) {
      return NextResponse.json(
        { error: '無効な投資期間です' },
        { status: 400 }
      );
    }

    // ルールベースで銘柄選定
    const suggestions = await selectStocks(amount, riskTolerance, investmentPeriod);

    // AI説明生成
    const aiExplanation = await generateAIExplanation(suggestions, amount, riskTolerance, investmentPeriod);

    const response: PortfolioSuggestion = {
      stocks: suggestions.stocks,
      totalAmount: suggestions.totalAmount,
      cashReserve: suggestions.cashReserve,
      aiExplanation,
      disclaimer: '本サービスは金融商品取引業者ではありません。提供する情報はあくまで参考情報であり、投資判断は必ずご自身の責任で行ってください。投資にはリスクが伴います。',
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Portfolio suggestion error:', error);
    return NextResponse.json(
      { error: 'ポートフォリオ提案の生成に失敗しました' },
      { status: 500 }
    );
  }
}

// ルールベースで銘柄選定
async function selectStocks(
  amount: number,
  riskTolerance: RiskTolerance,
  investmentPeriod: InvestmentPeriod
): Promise<{ stocks: StockSuggestion[]; totalAmount: number; cashReserve: number }> {
  // 最新の分析データを取得（PER, PBR, ROE, 配当利回り、株価があるもの）
  const analyses = await prisma.analysis.findMany({
    where: {
      peRatio: { not: null },
      pbRatio: { not: null },
      roe: { not: null },
      dividendYield: { not: null },
      currentPrice: { not: null },
    },
    include: {
      stock: true,
    },
    orderBy: {
      analysisDate: 'desc',
    },
  });

  // 銘柄ごとに最新の分析のみ抽出
  const latestByStock = new Map();
  for (const analysis of analyses) {
    if (!latestByStock.has(analysis.stockId)) {
      latestByStock.set(analysis.stockId, analysis);
    }
  }

  const latestAnalyses = Array.from(latestByStock.values());

  // リスク許容度に応じた選定基準
  let selectedAnalyses = [...latestAnalyses];

  if (riskTolerance === 'conservative') {
    // 安定志向: 高配当、低PER/PBR
    selectedAnalyses = selectedAnalyses
      .filter(a => a.dividendYield! >= 2.0) // 配当利回り2%以上
      .sort((a, b) => {
        // PERとPBRの平均が低い順
        const avgA = ((a.peRatio || 0) + (a.pbRatio || 0)) / 2;
        const avgB = ((b.peRatio || 0) + (b.pbRatio || 0)) / 2;
        return avgA - avgB;
      });
  } else if (riskTolerance === 'balanced') {
    // バランス: ROEが高く、PER/PBRが適正
    selectedAnalyses = selectedAnalyses
      .filter(a => (a.roe || 0) >= 8.0) // ROE 8%以上
      .sort((a, b) => (b.roe || 0) - (a.roe || 0));
  } else {
    // 積極的: ROEが高い成長株
    selectedAnalyses = selectedAnalyses
      .filter(a => (a.roe || 0) >= 10.0) // ROE 10%以上
      .sort((a, b) => (b.roe || 0) - (a.roe || 0));
  }

  // セクター分散を考慮して上位5銘柄を選定
  const diversifiedStocks: typeof selectedAnalyses = [];
  const usedSectors = new Set<string>();

  for (const analysis of selectedAnalyses) {
    if (diversifiedStocks.length >= 5) break;

    const sector = analysis.stock.sector || 'その他';

    // 既に同じセクターが2つ以上ある場合はスキップ
    const sectorCount = diversifiedStocks.filter(a => (a.stock.sector || 'その他') === sector).length;
    if (sectorCount >= 2) continue;

    diversifiedStocks.push(analysis);
  }

  // 投資金額を分散（各銘柄に均等配分 + 現金余剰）
  const stockCount = Math.min(diversifiedStocks.length, 5);
  const amountPerStock = Math.floor(amount * 0.9 / stockCount); // 90%を投資、10%は現金

  const suggestions: StockSuggestion[] = [];
  let totalAmount = 0;

  for (const analysis of diversifiedStocks.slice(0, stockCount)) {
    const currentPrice = analysis.currentPrice || 0;
    if (currentPrice === 0) continue;

    const shares = Math.floor(amountPerStock / currentPrice);
    if (shares === 0) continue;

    const investmentAmount = shares * currentPrice;
    totalAmount += investmentAmount;

    suggestions.push({
      stockId: analysis.stockId,
      code: analysis.stock.ticker,
      name: analysis.stock.name,
      shares,
      price: currentPrice,
      amount: investmentAmount,
      sector: analysis.stock.sector || 'その他',
      reason: generateStockReason(analysis, riskTolerance),
    });
  }

  const cashReserve = amount - totalAmount;

  return { stocks: suggestions, totalAmount, cashReserve };
}

// 銘柄選定理由を生成
function generateStockReason(analysis: any, riskTolerance: RiskTolerance): string {
  if (riskTolerance === 'conservative') {
    return `配当利回り ${analysis.dividendYield?.toFixed(1)}%、PER ${analysis.peRatio?.toFixed(1)}、安定性重視`;
  } else if (riskTolerance === 'balanced') {
    return `ROE ${analysis.roe?.toFixed(1)}%、バランス型投資`;
  } else {
    return `ROE ${analysis.roe?.toFixed(1)}%、成長性重視`;
  }
}

// AI説明生成
async function generateAIExplanation(
  suggestions: { stocks: StockSuggestion[]; totalAmount: number; cashReserve: number },
  amount: number,
  riskTolerance: RiskTolerance,
  investmentPeriod: InvestmentPeriod
): Promise<string> {
  const riskLabel = {
    conservative: '安定志向',
    balanced: 'バランス',
    aggressive: '積極的',
  }[riskTolerance];

  const periodLabel = {
    short: '短期（1年未満）',
    medium: '中期（1-3年）',
    long: '長期（3年以上）',
  }[investmentPeriod];

  const stocksList = suggestions.stocks
    .map(s => `- ${s.name}（${s.code}）: ${s.shares}株、${s.amount.toLocaleString()}円 - ${s.reason}`)
    .join('\n');

  const prompt = `以下のポートフォリオ提案について、初心者向けに分かりやすく説明してください。

【投資条件】
- 投資金額: ${amount.toLocaleString()}円
- リスク許容度: ${riskLabel}
- 投資期間: ${periodLabel}

【提案内容】
${stocksList}
- 現金: ${suggestions.cashReserve.toLocaleString()}円

以下の構成でMarkdown形式で説明してください：

## 提案の概要
この提案の特徴を2-3文で説明

## 選定理由
各銘柄を選んだ理由を簡潔に説明

## リスクとリターン
このポートフォリオのリスクとリターンのバランスを説明

## 初心者へのアドバイス
分散投資の重要性や注意点を説明

各セクション100-150文字程度で、親しみやすく説明してください。`;

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: '初心者向け投資アドバイザーとして、分かりやすく説明してください。',
      },
      {
        role: 'user',
        content: prompt,
      },
    ],
    temperature: 0.7,
  });

  return completion.choices[0].message.content || 'AI説明の生成に失敗しました';
}
