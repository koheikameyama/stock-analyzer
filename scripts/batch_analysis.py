#!/usr/bin/env python3
"""
AI株式分析バッチスクリプト
yfinanceを使用して株価データを取得し、OpenAI APIで分析を実行
"""

import os
import sys
import time
import uuid
from datetime import datetime
from decimal import Decimal
from typing import Optional, Dict, Any, List
import json

import yfinance as yf
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from openai import OpenAI

# プロジェクトルートからの.envファイル読み込み
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# 環境変数
DATABASE_URL = os.getenv('DATABASE_URL')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# OpenAIクライアント初期化
client = OpenAI(api_key=OPENAI_API_KEY)


class StockData:
    """株式データクラス"""
    def __init__(self, ticker: str, market: str):
        self.ticker = ticker
        self.market = market
        self.current_price: Optional[Decimal] = None
        self.pe_ratio: Optional[Decimal] = None
        self.pb_ratio: Optional[Decimal] = None
        self.roe: Optional[Decimal] = None
        self.dividend_yield: Optional[Decimal] = None
        self.company_name: str = ""
        self.sector: str = ""
        self.price_history: List[Dict[str, Any]] = []
        self.error: Optional[str] = None


def fetch_stock_data(ticker: str, market: str) -> StockData:
    """
    yfinanceで株価データを取得

    Args:
        ticker: ティッカーシンボル
        market: 市場（JP/US）

    Returns:
        StockData: 取得した株価データ
    """
    stock_data = StockData(ticker, market)

    try:
        # 日本株の場合、.Tサフィックスを追加（既に.Tがある場合は追加しない）
        if market == "JP" and not ticker.endswith(".T"):
            yahoo_ticker = f"{ticker}.T"
        else:
            yahoo_ticker = ticker

        print(f"  📊 {yahoo_ticker} のデータ取得中...")

        # yfinanceでデータ取得
        stock = yf.Ticker(yahoo_ticker)
        info = stock.info

        # 基本情報
        stock_data.company_name = info.get('longName', ticker)
        stock_data.sector = info.get('sector', 'Unknown')

        # 株価データ
        stock_data.current_price = Decimal(str(info.get('currentPrice', 0)))

        # 財務指標
        stock_data.pe_ratio = Decimal(str(info.get('trailingPE', 0))) if info.get('trailingPE') else None
        stock_data.pb_ratio = Decimal(str(info.get('priceToBook', 0))) if info.get('priceToBook') else None
        stock_data.roe = Decimal(str(info.get('returnOnEquity', 0) * 100)) if info.get('returnOnEquity') else None
        stock_data.dividend_yield = Decimal(str(info.get('dividendYield', 0) * 100)) if info.get('dividendYield') else None

        # 過去30日の株価履歴を取得
        try:
            hist = stock.history(period="1mo")  # 過去1ヶ月
            if not hist.empty:
                for idx in range(len(hist)):
                    date = hist.index[idx]
                    row = hist.iloc[idx]
                    stock_data.price_history.append({
                        'date': date.strftime('%Y-%m-%d'),
                        'open': float(row['Open']),
                        'high': float(row['High']),
                        'low': float(row['Low']),
                        'close': float(row['Close']),
                        'volume': int(row['Volume'])
                    })
        except Exception as e:
            print(f"  ⚠️ 株価履歴の取得に失敗: {e}")

        print(f"  ✅ {ticker} のデータ取得完了（株価履歴: {len(stock_data.price_history)}件）")

        # レート制限対策: リクエスト間に1秒待機
        time.sleep(1)

        return stock_data

    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ {ticker} のデータ取得失敗: {error_msg}")
        stock_data.error = error_msg
        return stock_data


def analyze_with_openai(stock_data: StockData) -> Dict[str, Any]:
    """
    OpenAI APIで株式分析を実行

    Args:
        stock_data: 株式データ

    Returns:
        Dict: AI分析結果
    """
    try:
        print(f"  🤖 {stock_data.ticker} のAI分析実行中...")

        # プロンプト作成
        prompt = f"""
あなたは初心者投資家向けのAI投資アドバイザーです。
以下の銘柄データを分析し、投資推奨を提供してください。

【銘柄情報】
- ティッカー: {stock_data.ticker}
- 企業名: {stock_data.company_name}
- 市場: {'日本' if stock_data.market == 'JP' else '米国'}
- セクター: {stock_data.sector}
- 現在価格: {stock_data.current_price}円
- PER: {stock_data.pe_ratio if stock_data.pe_ratio else 'N/A'}
- PBR: {stock_data.pb_ratio if stock_data.pb_ratio else 'N/A'}
- ROE: {stock_data.roe if stock_data.roe else 'N/A'}%
- 配当利回り: {stock_data.dividend_yield if stock_data.dividend_yield else 'N/A'}%

以下のJSON形式で回答してください：
{{
  "recommendation": "Buy" | "Sell" | "Hold",
  "confidence_score": 0-100の整数,
  "reason_short": "100-200文字の簡潔な推奨理由",
  "reason_detailed": "500-1000文字の詳細な分析と推奨理由"
}}
"""

        # OpenAI APIリクエスト
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "あなたは初心者投資家向けのAI投資アドバイザーです。JSON形式で回答してください。"},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"},
            timeout=30
        )

        # レスポンス解析
        content = response.choices[0].message.content
        result = json.loads(content)

        print(f"  ✅ {stock_data.ticker} のAI分析完了: {result['recommendation']}")

        return result

    except Exception as e:
        error_msg = str(e)
        print(f"  ❌ {stock_data.ticker} のAI分析失敗: {error_msg}")
        return {
            "recommendation": "Hold",
            "confidence_score": 0,
            "reason_short": f"分析エラー: {error_msg}",
            "reason_detailed": f"AI分析中にエラーが発生しました: {error_msg}"
        }


def save_analysis_to_db(conn, stock_id: str, stock_data: StockData, analysis: Dict[str, Any]) -> bool:
    """
    分析結果をデータベースに保存（既存データがあれば更新）

    Args:
        conn: データベース接続
        stock_id: 銘柄ID
        stock_data: 株式データ
        analysis: AI分析結果

    Returns:
        bool: 保存成功の可否
    """
    try:
        with conn.cursor() as cur:
            now = datetime.now()

            # 既存の分析データを確認
            cur.execute("""
                SELECT id FROM analyses WHERE "stockId" = %s LIMIT 1
            """, (stock_id,))

            existing = cur.fetchone()

            if existing:
                # 既存データを更新
                cur.execute("""
                    UPDATE analyses SET
                        "analysisDate" = %s,
                        recommendation = %s,
                        "confidenceScore" = %s,
                        "reasonShort" = %s,
                        "reasonDetailed" = %s,
                        "currentPrice" = %s,
                        "peRatio" = %s,
                        "pbRatio" = %s,
                        roe = %s,
                        "dividendYield" = %s,
                        "updatedAt" = %s
                    WHERE id = %s
                """, (
                    now,
                    analysis['recommendation'],
                    analysis['confidence_score'],
                    analysis['reason_short'],
                    analysis['reason_detailed'],
                    stock_data.current_price,
                    stock_data.pe_ratio,
                    stock_data.pb_ratio,
                    stock_data.roe,
                    stock_data.dividend_yield,
                    now,
                    existing['id']
                ))
                print(f"  🔄 {stock_data.ticker} の分析結果を更新しました")
            else:
                # 新規作成
                analysis_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO analyses (
                        id,
                        "stockId",
                        "analysisDate",
                        recommendation,
                        "confidenceScore",
                        "reasonShort",
                        "reasonDetailed",
                        "currentPrice",
                        "peRatio",
                        "pbRatio",
                        roe,
                        "dividendYield",
                        "createdAt",
                        "updatedAt"
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    analysis_id,
                    stock_id,
                    now,
                    analysis['recommendation'],
                    analysis['confidence_score'],
                    analysis['reason_short'],
                    analysis['reason_detailed'],
                    stock_data.current_price,
                    stock_data.pe_ratio,
                    stock_data.pb_ratio,
                    stock_data.roe,
                    stock_data.dividend_yield,
                    now,
                    now
                ))
                print(f"  💾 {stock_data.ticker} の分析結果を新規保存しました")

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"  ❌ {stock_data.ticker} の保存失敗: {e}")
        return False


def save_price_history_to_db(conn, stock_id: str, stock_data: StockData) -> bool:
    """
    株価履歴をデータベースに保存

    Args:
        conn: データベース接続
        stock_id: 銘柄ID
        stock_data: 株式データ

    Returns:
        bool: 保存成功の可否
    """
    try:
        with conn.cursor() as cur:
            for price_data in stock_data.price_history:
                # 既存データがあれば更新、なければ挿入
                cur.execute("""
                    INSERT INTO price_history (
                        "stockId",
                        date,
                        open,
                        high,
                        low,
                        close,
                        volume,
                        "createdAt",
                        "updatedAt"
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
                    ON CONFLICT ("stockId", date) DO UPDATE SET
                        open = EXCLUDED.open,
                        high = EXCLUDED.high,
                        low = EXCLUDED.low,
                        close = EXCLUDED.close,
                        volume = EXCLUDED.volume,
                        "updatedAt" = NOW()
                """, (
                    stock_id,
                    price_data['date'],
                    price_data['open'],
                    price_data['high'],
                    price_data['low'],
                    price_data['close'],
                    price_data['volume']
                ))

        conn.commit()
        print(f"  📈 {stock_data.ticker} の株価履歴を保存しました（{len(stock_data.price_history)}件）")
        return True

    except Exception as e:
        conn.rollback()
        print(f"  ❌ {stock_data.ticker} の株価履歴保存失敗: {e}")
        return False


def log_batch_job(conn, start_time: datetime, total_stocks: int, success_count: int,
                  failure_count: int, error_message: Optional[str] = None):
    """
    バッチジョブログを記録

    Args:
        conn: データベース接続
        start_time: 開始時刻
        total_stocks: 対象銘柄数
        success_count: 成功数
        failure_count: 失敗数
        error_message: エラーメッセージ
    """
    try:
        duration = int((datetime.now() - start_time).total_seconds() * 1000)

        if success_count == total_stocks:
            status = 'success'
        elif success_count > 0:
            status = 'partial_success'
        else:
            status = 'failure'

        with conn.cursor() as cur:
            # UUID生成
            log_id = str(uuid.uuid4())
            now = datetime.now()

            cur.execute("""
                INSERT INTO batch_job_logs (
                    id,
                    "jobDate",
                    status,
                    "totalStocks",
                    "successCount",
                    "failureCount",
                    "errorMessage",
                    duration,
                    "createdAt"
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                log_id,
                start_time,
                status,
                total_stocks,
                success_count,
                failure_count,
                error_message,
                duration,
                now
            ))

        conn.commit()
        print("📝 バッチジョブログを記録しました")

    except Exception as e:
        conn.rollback()
        print(f"⚠️ バッチジョブログの記録失敗: {e}")


def main():
    """メイン処理"""
    start_time = datetime.now()

    print("\n" + "=" * 50)
    print("🚀 AI株式分析バッチジョブ開始 (Python + yfinance)")
    print(f"⏰ 開始時刻: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50 + "\n")

    conn = None
    success_count = 0
    failure_count = 0

    try:
        # データベース接続
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ データベース接続成功\n")

        # 銘柄リストを取得
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('SELECT id, ticker, market FROM stocks ORDER BY ticker')
            stocks = cur.fetchall()

        total_stocks = len(stocks)
        print(f"📋 対象銘柄数: {total_stocks}件\n")

        if total_stocks == 0:
            print("⚠️ 分析対象の銘柄が見つかりませんでした")
            log_batch_job(conn, start_time, 0, 0, 0, "分析対象の銘柄が見つかりませんでした")
            return

        # 各銘柄を分析
        for i, stock in enumerate(stocks, 1):
            print(f"\n[{i}/{total_stocks}] {stock['ticker']} ({stock['market']}) の分析開始")
            print("-" * 50)

            # 株価データ取得
            stock_data = fetch_stock_data(stock['ticker'], stock['market'])

            if stock_data.error or stock_data.current_price == 0:
                print(f"  ⚠️ {stock['ticker']}: データ取得失敗のためスキップ")
                failure_count += 1
                continue

            # AI分析実行
            analysis = analyze_with_openai(stock_data)

            # データベースに保存
            if save_analysis_to_db(conn, stock['id'], stock_data, analysis):
                # 株価履歴も保存
                save_price_history_to_db(conn, stock['id'], stock_data)
                success_count += 1
            else:
                failure_count += 1

        # バッチジョブログを記録
        error_message = f"{failure_count}件の銘柄分析に失敗しました" if failure_count > 0 else None
        log_batch_job(conn, start_time, total_stocks, success_count, failure_count, error_message)

    except Exception as e:
        print(f"\n❌ バッチジョブでエラーが発生しました: {e}")
        if conn:
            log_batch_job(conn, start_time, 0, 0, 0, f"バッチジョブエラー: {str(e)}")
        sys.exit(1)

    finally:
        if conn:
            conn.close()

    # 結果サマリー
    duration = (datetime.now() - start_time).total_seconds()

    print("\n" + "=" * 50)
    print("✅ バッチジョブ完了")
    print(f"⏱️  処理時間: {duration:.2f}秒")
    print("📊 結果サマリー:")
    print(f"   - 対象銘柄数: {total_stocks}")
    print(f"   - 成功: {success_count}")
    print(f"   - 失敗: {failure_count}")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()
