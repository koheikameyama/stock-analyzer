/**
 * OpenAI APIサービス
 * GPT-4o miniを使用した株式分析
 */

import OpenAI from 'openai';

// OpenAI クライアントの初期化
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000, // 30秒タイムアウト
});

/**
 * AI分析結果の型定義
 */
export interface AIAnalysisResult {
  recommendation: 'Buy' | 'Sell' | 'Hold';
  confidence_score: number;
  reason_short: string;
  reason_detailed: string;
}

/**
 * 株式分析の入力データ
 */
export interface StockAnalysisInput {
  ticker: string;
  name: string;
  currentPrice: number;
  sector: string | null;
  priceHistory: Array<{ date: string; close: number }>;
  peRatio: number | null;
  pbRatio: number | null;
  roe: number | null;
  dividendYield: number | null;
}

/**
 * OpenAI APIサービスクラス
 */
export class OpenAIService {
  /**
   * 株式分析プロンプトの生成
   */
  private static generateAnalysisPrompt(input: StockAnalysisInput): string {
    const priceHistoryText = input.priceHistory
      .map((p) => `${p.date}: ${p.close}`)
      .join('\n');

    return `あなたは投資初心者に優しく教える株式アナリストです。以下のデータを基に、この銘柄に対する投資推奨（Buy/Sell/Hold）と信頼度スコア（0-100%）、理由を提供してください。

銘柄: ${input.ticker}
銘柄名: ${input.name}
現在株価: ${input.currentPrice}
セクター: ${input.sector || 'N/A'}

過去30日の株価データ（終値）:
${priceHistoryText}

財務指標:
- PER（株価収益率）: ${input.peRatio ?? 'N/A'}
- PBR（株価純資産倍率）: ${input.pbRatio ?? 'N/A'}
- ROE（自己資本利益率）: ${input.roe ? `${input.roe}%` : 'N/A'}
- 配当利回り: ${input.dividendYield ? `${input.dividendYield}%` : 'N/A'}

以下のJSON形式で出力してください。JSON以外のテキストは含めないでください:
{
  "recommendation": "Buy" | "Sell" | "Hold",
  "confidence_score": 85,
  "reason_short": "投資初心者向けに親しみやすく、わかりやすい理由（150-200文字程度。専門用語は避け、なぜそう判断したのかを簡潔に説明）",
  "reason_detailed": "詳細な理由（500-1000文字程度、財務指標や株価トレンドを基に具体的に説明）"
}`;
  }

  /**
   * 株式を分析してAI推奨を取得
   * @param input 株式分析の入力データ
   * @param retries リトライ回数（デフォルト: 3）
   * @returns AI分析結果
   */
  static async analyzeStock(
    input: StockAnalysisInput,
    retries: number = 3
  ): Promise<AIAnalysisResult> {
    const prompt = this.generateAnalysisPrompt(input);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        // OpenAI API呼び出し
        const response = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content:
                'あなたは投資初心者に優しく教える株式アナリストです。難しい専門用語を避け、わかりやすい言葉で説明します。財務データと株価データを分析し、投資推奨を提供します。常にJSON形式で回答してください。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 1500,
        });

        // レスポンスの取得
        const content = response.choices[0]?.message?.content;
        if (!content) {
          throw new Error('OpenAI APIからのレスポンスが空です');
        }

        // JSONパース
        const result = this.parseAIResponse(content);

        // バリデーション
        this.validateAnalysisResult(result);

        return result;
      } catch (error) {
        console.error(
          `OpenAI API呼び出しエラー (試行 ${attempt}/${retries}):`,
          error
        );

        // 最後の試行でエラーの場合は例外をスロー
        if (attempt === retries) {
          throw new Error(
            `OpenAI API呼び出しに失敗しました: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }

        // 指数バックオフ: 1秒、2秒、4秒
        const backoffMs = Math.pow(2, attempt - 1) * 1000;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    throw new Error('OpenAI API呼び出しに失敗しました（予期しないエラー）');
  }

  /**
   * AIレスポンスのパース
   */
  private static parseAIResponse(content: string): AIAnalysisResult {
    try {
      // JSON抽出（コードブロックに囲まれている場合を考慮）
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('JSON形式のレスポンスが見つかりません');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed as AIAnalysisResult;
    } catch (error) {
      console.error('AIレスポンスのパースエラー:', content);
      throw new Error(
        `AIレスポンスのパースに失敗しました: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }

  /**
   * 分析結果のバリデーション
   */
  private static validateAnalysisResult(result: AIAnalysisResult): void {
    // recommendation チェック
    if (!['Buy', 'Sell', 'Hold'].includes(result.recommendation)) {
      throw new Error(`無効な recommendation: ${result.recommendation}`);
    }

    // confidence_score チェック
    if (
      typeof result.confidence_score !== 'number' ||
      result.confidence_score < 0 ||
      result.confidence_score > 100
    ) {
      throw new Error(
        `無効な confidence_score: ${result.confidence_score}`
      );
    }

    // reason_short チェック
    if (!result.reason_short || typeof result.reason_short !== 'string') {
      throw new Error('reason_short が不正です');
    }

    // reason_detailed チェック
    if (
      !result.reason_detailed ||
      typeof result.reason_detailed !== 'string'
    ) {
      throw new Error('reason_detailed が不正です');
    }
  }

  /**
   * APIキーが設定されているかチェック
   */
  static checkApiKey(): boolean {
    return !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here';
  }
}
