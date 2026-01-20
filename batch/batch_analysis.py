#!/usr/bin/env python3
"""
AI株式分析バッチスクリプト
yfinanceを使用して株価データを取得し、OpenAI APIで分析を実行
"""

import os
import sys
import time
import uuid
import argparse
from datetime import datetime, timezone
from decimal import Decimal
from typing import Optional, Dict, Any, List
from collections import deque
from concurrent.futures import ThreadPoolExecutor, as_completed
import threading
import json
from zoneinfo import ZoneInfo

import yfinance as yf
import psycopg2
from psycopg2.extras import RealDictCursor
from dotenv import load_dotenv
from openai import OpenAI
from datetime import timezone

# プロジェクトルートからの.envファイル読み込み
env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
load_dotenv(env_path)

# 環境変数
DATABASE_URL = os.getenv('DATABASE_URL')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# OpenAIクライアント初期化
client = OpenAI(api_key=OPENAI_API_KEY)

# OpenAI API料金（gpt-4o-mini）
PRICING = {
    'input_per_1m_tokens': 0.150,  # $0.150 / 1M tokens
    'output_per_1m_tokens': 0.600,  # $0.600 / 1M tokens
}


class APIUsageTracker:
    """OpenAI API使用量トラッカー（スレッドセーフ）"""
    def __init__(self):
        self.total_input_tokens = 0
        self.total_output_tokens = 0
        self.total_requests = 0
        self.lock = threading.Lock()

    def add_usage(self, input_tokens: int, output_tokens: int):
        """使用量を追加"""
        with self.lock:
            self.total_input_tokens += input_tokens
            self.total_output_tokens += output_tokens
            self.total_requests += 1

    def get_cost(self) -> float:
        """総費用を計算（USD）"""
        input_cost = (self.total_input_tokens / 1_000_000) * PRICING['input_per_1m_tokens']
        output_cost = (self.total_output_tokens / 1_000_000) * PRICING['output_per_1m_tokens']
        return input_cost + output_cost

    def print_summary(self):
        """費用サマリーを表示"""
        with self.lock:
            input_cost = (self.total_input_tokens / 1_000_000) * PRICING['input_per_1m_tokens']
            output_cost = (self.total_output_tokens / 1_000_000) * PRICING['output_per_1m_tokens']
            total_cost = input_cost + output_cost

            print("\n" + "=" * 50)
            print("💰 OpenAI API使用量サマリー")
            print("=" * 50)
            print(f"🔢 総リクエスト数: {self.total_requests:,}")
            print(f"📥 入力トークン数: {self.total_input_tokens:,} tokens")
            print(f"📤 出力トークン数: {self.total_output_tokens:,} tokens")
            print(f"💵 入力費用: ${input_cost:.4f}")
            print(f"💵 出力費用: ${output_cost:.4f}")
            print(f"💰 総費用: ${total_cost:.4f} (約¥{total_cost * 150:.2f})")
            print("=" * 50)


class StockQueue:
    """株式分析キュー管理（スレッドセーフ）"""
    def __init__(self, stocks: List[Dict[str, Any]]):
        self.queue = deque(stocks)
        self.total = len(stocks)
        self.processed = 0
        self.success = 0
        self.failed = 0
        self.lock = threading.Lock()

    def get_next(self) -> Optional[Dict[str, Any]]:
        """次の銘柄を取得"""
        with self.lock:
            if self.queue:
                return self.queue.popleft()
            return None

    def mark_success(self):
        """成功をカウント"""
        with self.lock:
            self.processed += 1
            self.success += 1

    def mark_failure(self):
        """失敗をカウント"""
        with self.lock:
            self.processed += 1
            self.failed += 1

    def get_progress(self) -> str:
        """進捗状況を取得"""
        with self.lock:
            return f"[{self.processed}/{self.total}] 成功:{self.success} 失敗:{self.failed}"

    def is_empty(self) -> bool:
        """キューが空か確認"""
        with self.lock:
            return len(self.queue) == 0


# グローバルトラッカー
usage_tracker = APIUsageTracker()


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


def fetch_stock_data(ticker: str, market: str, max_retries: int = 3) -> StockData:
    """
    yfinanceで株価データを取得（リトライあり）

    Args:
        ticker: ティッカーシンボル
        market: 市場（JP/US）
        max_retries: 最大リトライ回数

    Returns:
        StockData: 取得した株価データ
    """
    stock_data = StockData(ticker, market)

    # 日本株の場合、.Tサフィックスを追加
    if market == "JP" and not ticker.endswith(".T"):
        yahoo_ticker = f"{ticker}.T"
    else:
        yahoo_ticker = ticker

    for attempt in range(max_retries + 1):
        try:
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
                hist = stock.history(period="1mo")
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
            except Exception:
                pass  # 履歴取得失敗は致命的ではないので続行

            # 成功したらループを抜ける
            time.sleep(2)  # 成功後も少し待機
            return stock_data

        except Exception as e:
            error_msg = str(e)
            
            # リトライ上限到達
            if attempt == max_retries:
                stock_data.error = f"データ取得失敗: {error_msg}"
                return stock_data

            # 429エラーなどの場合は長めに待機
            wait_time = (attempt + 1) * 5  # 5秒, 10秒, 15秒...
            print(f"⚠️ {ticker}: データ取得エラー (リトライ {attempt+1}/{max_retries} - {wait_time}秒待機): {error_msg}")
            time.sleep(wait_time)
    
    return stock_data


def analyze_with_openai(stock_data: StockData, max_retries: int = 2) -> Dict[str, Any]:
    """
    OpenAI APIで株式分析を実行（リトライあり）

    Args:
        stock_data: 株式データ
        max_retries: 最大リトライ回数（デフォルト: 2回）

    Returns:
        Dict: AI分析結果
    """
    # プロンプト作成
    prompt = f"""
あなたは初心者投資家向けのAI投資アドバイザーです。
以下の銘柄データを分析し、投資推奨を提供してください。

【銘柄情報】
- ティッカー: {stock_data.ticker}
- 企業名: {stock_data.company_name}
- 市場: {'日本' if stock_data.market == 'JP' else '米国'}
- セクター: {stock_data.sector}
- 現在価格: {stock_data.current_price}{'円' if stock_data.market == 'JP' else 'ドル'}
- PER: {stock_data.pe_ratio if stock_data.pe_ratio else 'N/A'}
- PBR: {stock_data.pb_ratio if stock_data.pb_ratio else 'N/A'}
- ROE: {stock_data.roe if stock_data.roe else 'N/A'}%
- 配当利回り: {float(stock_data.dividend_yield) / 100 if stock_data.dividend_yield else 'N/A'}%

以下のJSON形式で回答してください：
{{
  "recommendation": "Buy" | "Sell" | "Hold",
  "confidence_score": 0-100の整数,
  "reason": "推奨理由を300文字程度で記述。財務指標の評価、業績動向、投資判断の根拠を含める。"
}}
"""

    # リトライロジック
    for attempt in range(max_retries + 1):  # 初回 + リトライ2回 = 最大3回
        try:
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

            # 使用量を追跡
            if response.usage:
                usage_tracker.add_usage(
                    response.usage.prompt_tokens,
                    response.usage.completion_tokens
                )

            # レスポンス解析
            content = response.choices[0].message.content
            result = json.loads(content)

            return result

        except Exception as e:
            error_msg = str(e)

            # 最後の試行でもエラーの場合
            if attempt == max_retries:
                return {
                    "recommendation": "Hold",
                    "confidence_score": 0,
                    "reason": f"AI分析中にエラーが発生しました: {error_msg}"
                }

            # リトライ前に遅延（エクスポネンシャルバックオフ: 1秒、2秒）
            delay = 2 ** attempt  # 1秒、2秒
            time.sleep(delay)


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
            # UTC時刻を取得（フロントエンドで日本時間に変換）
            now = datetime.now(timezone.utc)

            # 既存の分析データを確認
            cur.execute("""
                SELECT id FROM analyses WHERE stock_id = %s LIMIT 1
            """, (stock_id,))

            existing = cur.fetchone()

            if existing:
                # 既存データを更新
                cur.execute("""
                    UPDATE analyses SET
                        analysis_date = %s,
                        recommendation = %s,
                        confidence_score = %s,
                        reason = %s,
                        current_price = %s,
                        pe_ratio = %s,
                        pb_ratio = %s,
                        roe = %s,
                        dividend_yield = %s,
                        updated_at = %s
                    WHERE id = %s
                """, (
                    now,
                    analysis['recommendation'],
                    analysis['confidence_score'],
                    analysis['reason'],
                    stock_data.current_price,
                    stock_data.pe_ratio,
                    stock_data.pb_ratio,
                    stock_data.roe,
                    stock_data.dividend_yield,
                    now,
                    existing[0]  # タプルなのでインデックスでアクセス
                ))
            else:
                # 新規作成
                analysis_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO analyses (
                        id,
                        stock_id,
                        analysis_date,
                        recommendation,
                        confidence_score,
                        reason,
                        current_price,
                        pe_ratio,
                        pb_ratio,
                        roe,
                        dividend_yield,
                        created_at,
                        updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """, (
                    analysis_id,
                    stock_id,
                    now,
                    analysis['recommendation'],
                    analysis['confidence_score'],
                    analysis['reason'],
                    stock_data.current_price,
                    stock_data.pe_ratio,
                    stock_data.pb_ratio,
                    stock_data.roe,
                    stock_data.dividend_yield,
                    now,
                    now
                ))

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"❌ DB保存エラー: {str(e)}")
        return False


def save_price_history_to_db(conn, stock_id: str, stock_data: StockData) -> bool:
    """
    株価履歴をデータベースに保存（N+1問題を防ぐため一括処理）

    Args:
        conn: データベース接続
        stock_id: 銘柄ID
        stock_data: 株式データ

    Returns:
        bool: 保存成功の可否
    """
    try:
        if not stock_data.price_history:
            return True

        with conn.cursor() as cur:
            # まず該当日付の既存データを削除
            dates = [p['date'] for p in stock_data.price_history]
            cur.execute("""
                DELETE FROM price_history
                WHERE stock_id = %s AND date = ANY(%s)
            """, (stock_id, dates))

            # 一括挿入用のデータを準備
            values = []
            for price_data in stock_data.price_history:
                values.append((
                    str(uuid.uuid4()),  # id
                    stock_id,
                    price_data['date'],
                    price_data['open'],
                    price_data['high'],
                    price_data['low'],
                    price_data['close'],
                    price_data['volume']
                ))

            # 一括挿入（1クエリ）
            execute_values_query = """
                INSERT INTO price_history (
                    id, stock_id, date, open, high, low, close, volume,
                    created_at, updated_at
                ) VALUES %s
            """
            from psycopg2.extras import execute_values
            execute_values(
                cur,
                execute_values_query,
                [(v[0], v[1], v[2], v[3], v[4], v[5], v[6], v[7], 'NOW()', 'NOW()') for v in values],
                template="(%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())"
            )

        conn.commit()
        return True

    except Exception as e:
        conn.rollback()
        print(f"❌ DB保存エラー: {str(e)}")
        return False


def process_single_stock(stock: Dict[str, Any], force: bool = False) -> bool:
    """
    単一銘柄を処理

    Args:
        stock: 銘柄データ
        force: 既存データを無視して強制的に再実行

    Returns:
        bool: 処理が成功したかどうか
    """
    conn = None
    ticker = stock['ticker']

    try:
        # データベース接続
        conn = psycopg2.connect(DATABASE_URL)

        # 今日の日付を取得（日本時間、日付のみ）
        today = datetime.now(ZoneInfo("Asia/Tokyo")).date()

        # 今日の分析データが既に存在するかチェック（forceフラグがfalseの場合のみ）
        if not force:
            with conn.cursor() as cur:
                # analysisDateはUTC保存なので、日本時間に変換して日付比較
                cur.execute("""
                    SELECT id FROM analyses
                    WHERE stock_id = %s
                    AND DATE(analysis_date AT TIME ZONE 'Asia/Tokyo') = %s
                """, (stock['id'], today))
                existing_today = cur.fetchone()

            if existing_today:
                print(f"⏭️  {ticker}: 本日分の分析済み（スキップ）")
                return True

        if force:
            print(f"🔄 {ticker}: 強制再実行モード - 処理開始...")
        else:
            print(f"🔄 {ticker}: 処理開始...")

        # 株価データ取得
        stock_data = fetch_stock_data(ticker, stock['market'])

        if stock_data.error or stock_data.current_price == 0:
            print(f"⚠️  {ticker}: データ取得失敗")
            return False

        # AI分析実行
        analysis = analyze_with_openai(stock_data)

        # データベースに保存
        if save_analysis_to_db(conn, stock['id'], stock_data, analysis):
            # 株価履歴も保存
            save_price_history_to_db(conn, stock['id'], stock_data)
            print(f"✅ {ticker}: {analysis['recommendation']} ({analysis['confidence_score']}%) 完了")
            return True
        else:
            print(f"❌ {ticker}: DB保存失敗")
            return False

    except Exception as e:
        print(f"❌ {ticker}: エラー - {str(e)[:50]}")
        return False
    finally:
        if conn:
            conn.close()


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
            # UTC時刻を取得（フロントエンドで日本時間に変換）
            now = datetime.now(timezone.utc)

            cur.execute("""
                INSERT INTO batch_job_logs (
                    id,
                    job_date,
                    status,
                    total_stocks,
                    success_count,
                    failure_count,
                    error_message,
                    duration,
                    created_at
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
    # コマンドライン引数の解析
    parser = argparse.ArgumentParser(description='AI株式分析バッチ処理')
    parser.add_argument('--force', action='store_true',
                        help='既存データを無視して強制的に再実行')
    args = parser.parse_args()

    start_time = datetime.now()

    print("\n" + "=" * 50)
    print("🚀 AI株式分析バッチジョブ開始 (Python + yfinance)")
    print(f"⏰ 開始時刻: {start_time.strftime('%Y-%m-%d %H:%M:%S')}")
    print("🔄 順次処理モード")
    if args.force:
        print("⚡ 強制再実行モード有効")
    print("=" * 50 + "\n")

    conn = None
    success_count = 0
    failure_count = 0

    try:
        # データベース接続
        conn = psycopg2.connect(DATABASE_URL)
        print("✅ データベース接続成功\n")

        # 銘柄リストを取得（is_ai_analysis_target=trueのみ）
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute('''
                SELECT id, ticker, market
                FROM stocks
                WHERE is_ai_analysis_target = true
                ORDER BY ticker
            ''')
            stocks = cur.fetchall()

        total_stocks = len(stocks)
        print(f"📋 分析対象銘柄数: {total_stocks}件\n")

        if total_stocks == 0:
            print("⚠️ 分析対象の銘柄が見つかりませんでした")
            log_batch_job(conn, start_time, 0, 0, 0, "分析対象の銘柄が見つかりませんでした")
            return

        # 順次処理
        for i, stock in enumerate(stocks):
            print(f"[{i + 1}/{total_stocks}] ", end="")
            success = process_single_stock(stock, force=args.force)

            if success:
                success_count += 1
            else:
                failure_count += 1

            # 少し待機（レート制限対策）
            if i < total_stocks - 1:
                time.sleep(1)

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
    if failure_count > 0:
        print(f"⚠️  バッチジョブ完了（{failure_count}件失敗）")
    else:
        print("✅ バッチジョブ完了")
    print(f"⏱️  処理時間: {duration:.2f}秒")
    print("📊 結果サマリー:")
    print(f"   - 対象銘柄数: {len(stocks)}")
    print(f"   - 成功: {success_count}")
    print(f"   - 失敗: {failure_count}")
    print("=" * 50)

    # OpenAI API費用サマリーを表示
    usage_tracker.print_summary()

    # 失敗があった場合は終了コード1を返す
    if failure_count > 0:
        sys.exit(1)


if __name__ == "__main__":
    main()
