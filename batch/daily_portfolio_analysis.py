#!/usr/bin/env python3
"""
日次ポートフォリオ分析バッチ

全ユーザーの保有銘柄を分析し、アクション提案を生成する。
毎日18:00（日本時間）に自動実行。
"""

import os
import sys
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import yfinance as yf
from openai import OpenAI

# 環境変数からデータベース接続情報を取得
DATABASE_URL = os.getenv("DATABASE_URL")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")


def get_db_connection():
    """データベース接続を取得"""
    return psycopg2.connect(DATABASE_URL)


def get_all_holdings():
    """全ユーザーの保有銘柄を取得"""
    conn = get_db_connection()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("""
                SELECT
                    h.id as holding_id,
                    h.user_id,
                    h.stock_id,
                    h.shares,
                    h.purchase_price,
                    h.purchase_date,
                    s.ticker,
                    s.name,
                    s.sector
                FROM holdings h
                JOIN stocks s ON h.stock_id = s.id
                JOIN portfolios p ON h.portfolio_id = p.id
                WHERE h.sold_date IS NULL
                ORDER BY h.user_id, h.purchase_date DESC
            """)
            return cur.fetchall()
    finally:
        conn.close()


def get_latest_price(ticker: str) -> float:
    """最新株価を取得"""
    try:
        stock = yf.Ticker(f"{ticker}.T")  # 東証の場合
        hist = stock.history(period="5d")

        if hist.empty:
            print(f"⚠️ {ticker}: 株価データが取得できませんでした")
            return None

        return float(hist["Close"].iloc[-1])
    except Exception as e:
        print(f"❌ {ticker}: 株価取得エラー - {str(e)}")
        return None


def calculate_technical_indicators(ticker: str):
    """テクニカル指標を計算"""
    try:
        stock = yf.Ticker(f"{ticker}.T")
        hist = stock.history(period="3mo")

        if hist.empty or len(hist) < 25:
            return None

        # 移動平均
        ma5 = hist["Close"].rolling(window=5).mean().iloc[-1]
        ma25 = hist["Close"].rolling(window=25).mean().iloc[-1]

        # RSI計算
        delta = hist["Close"].diff()
        gain = (delta.where(delta > 0, 0)).rolling(window=14).mean()
        loss = (-delta.where(delta < 0, 0)).rolling(window=14).mean()
        rs = gain / loss
        rsi = 100 - (100 / (1 + rs))
        rsi_value = rsi.iloc[-1] if not rsi.empty else 50

        return {
            "ma5": float(ma5),
            "ma25": float(ma25),
            "rsi": float(rsi_value),
            "current_price": float(hist["Close"].iloc[-1]),
        }
    except Exception as e:
        print(f"❌ {ticker}: テクニカル指標計算エラー - {str(e)}")
        return None


def analyze_with_ai(holding, current_price, technical_data):
    """AIで分析してBuy/Hold/Sell判定"""
    client = OpenAI(api_key=OPENAI_API_KEY)

    purchase_price = float(holding["purchase_price"])
    price_change_pct = ((current_price - purchase_price) / purchase_price) * 100

    prompt = f"""あなたは投資初心者向けのアドバイザーです。
以下の保有銘柄について、売却すべきか判断してください。

【銘柄情報】
- 銘柄: {holding['name']} ({holding['ticker']})
- セクター: {holding['sector']}
- 購入単価: ¥{purchase_price:,.0f}
- 現在価格: ¥{current_price:,.0f}
- 損益: {price_change_pct:+.2f}%

【テクニカル指標】
- 5日移動平均: ¥{technical_data['ma5']:,.0f}
- 25日移動平均: ¥{technical_data['ma25']:,.0f}
- RSI: {technical_data['rsi']:.1f}

【判断基準】
- 利益が+15%以上 → 利確を検討
- 損失が-10%以上 → 損切りを検討
- RSI 70以上 → 買われすぎ（売却検討）
- RSI 30以下 → 売られすぎ（保有継続）
- デッドクロス（MA5 < MA25で下落傾向）→ 売却検討

以下のJSON形式のみで回答してください。
{{
  "recommendation": "Hold" or "Sell",
  "reason": "判断理由（100文字以内）",
  "confidence": 0-100の整数
}}"""

    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.5,
        )

        response_text = completion.choices[0].message.content.strip()
        import json

        result = json.loads(response_text)

        return result
    except Exception as e:
        print(f"❌ AI分析エラー: {str(e)}")
        # フォールバック
        if price_change_pct > 15:
            return {
                "recommendation": "Sell",
                "reason": f"利益が{price_change_pct:+.1f}%に達しました。利確を検討してください。",
                "confidence": 70,
            }
        elif price_change_pct < -10:
            return {
                "recommendation": "Sell",
                "reason": f"損失が{price_change_pct:.1f}%です。損切りを検討してください。",
                "confidence": 65,
            }
        else:
            return {
                "recommendation": "Hold",
                "reason": "現状は保有継続を推奨します。",
                "confidence": 60,
            }


def should_create_proposal(holding, analysis_result, current_price):
    """アクション提案を作成すべきか判定"""
    purchase_price = float(holding["purchase_price"])
    price_change_pct = abs(((current_price - purchase_price) / purchase_price) * 100)

    # 条件1: Sell推奨
    if analysis_result["recommendation"] == "Sell":
        return True

    # 条件2: 株価が±10%以上変動
    if price_change_pct >= 10:
        return True

    return False


def create_action_proposal(holding, analysis_result, current_price):
    """アクション提案を作成"""
    conn = get_db_connection()
    try:
        with conn.cursor() as cur:
            # 既存の未読提案があれば削除（重複防止）
            cur.execute(
                """
                DELETE FROM action_proposals
                WHERE user_id = %s
                AND stock_id = %s
                AND is_read = false
                AND created_at > NOW() - INTERVAL '1 day'
            """,
                (holding["user_id"], holding["stock_id"]),
            )

            # 新しい提案を作成
            action_type = (
                "SELL" if analysis_result["recommendation"] == "Sell" else "HOLD_ALERT"
            )

            cur.execute(
                """
                INSERT INTO action_proposals
                (user_id, stock_id, "actionType", reason, confidence,
                 is_read, created_at)
                VALUES (%s, %s, %s, %s, %s, false, NOW())
            """,
                (
                    holding["user_id"],
                    holding["stock_id"],
                    action_type,
                    analysis_result["reason"],
                    analysis_result["confidence"],
                ),
            )

            conn.commit()
            print(f"✅ 提案作成: {holding['name']} ({action_type})")
    except Exception as e:
        conn.rollback()
        print(f"❌ 提案作成エラー: {str(e)}")
    finally:
        conn.close()


def main():
    """メイン処理"""
    print("=" * 60)
    print("📊 日次ポートフォリオ分析バッチ開始")
    print(f"⏰ 実行日時: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 60)

    # 全保有銘柄を取得
    holdings = get_all_holdings()
    print(f"\n📈 対象銘柄数: {len(holdings)}件")

    if not holdings:
        print("✅ 分析対象の銘柄がありません")
        return

    analyzed_count = 0
    proposal_count = 0

    # 各銘柄を分析
    for holding in holdings:
        print(f"\n--- {holding['name']} ({holding['ticker']}) ---")

        # テクニカル指標を取得
        technical_data = calculate_technical_indicators(holding["ticker"])
        if not technical_data:
            continue

        current_price = technical_data["current_price"]

        # AI分析
        analysis_result = analyze_with_ai(holding, current_price, technical_data)
        analyzed_count += 1

        print(
            f"判定: {analysis_result['recommendation']} "
            f"(確信度: {analysis_result['confidence']}%)"
        )
        print(f"理由: {analysis_result['reason']}")

        # アクション提案の生成判定
        if should_create_proposal(holding, analysis_result, current_price):
            create_action_proposal(holding, analysis_result, current_price)
            proposal_count += 1

    print("\n" + "=" * 60)
    print("✅ 日次ポートフォリオ分析完了")
    print(f"📊 分析完了: {analyzed_count}件")
    print(f"💡 提案作成: {proposal_count}件")
    print("=" * 60)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ バッチ実行エラー: {str(e)}")
        sys.exit(1)
