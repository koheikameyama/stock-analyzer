#!/usr/bin/env python3
"""
本番DBからローカルDBにデータを同期するスクリプト
PostgreSQLのバージョン違いによる問題を回避するため、Pythonで直接データをコピーする
"""

import os
import sys
from urllib.parse import quote_plus
import psycopg2
# psycopg2のみ使用

# 色付き出力
class Colors:
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    NC = '\033[0m'

def print_color(color, message):
    print(f"{color}{message}{Colors.NC}")

# 本番DBの接続情報
PROD_CONN = {
    'host': 'aws-1-ap-northeast-1.pooler.supabase.com',
    'port': 6543,
    'user': 'postgres.pphsmthcjzksbfnzflsw',
    'password': 'hwS$3-S$JMV+S$y',
    'database': 'postgres'
}

# ローカルDBの接続情報
LOCAL_CONN = {
    'host': 'localhost',
    'port': 5432,
    'user': 'kouheikameyama',
    'database': 'stock_analyzer_dev',
    'password': ''  # ローカルは認証不要
}

def sync_table(prod_cursor, local_cursor, table_name, prod_columns, local_columns):
    """テーブルのデータを同期"""
    print_color(Colors.YELLOW, f"  - {table_name} テーブルを同期中...")

    # 本番DBからデータ取得
    prod_cursor.execute(f"SELECT {', '.join(prod_columns)} FROM {table_name}")
    rows = prod_cursor.fetchall()

    if not rows:
        print_color(Colors.GREEN, f"    ✓ {table_name}: データなし")
        return 0

    # ローカルDBのデータをクリア
    local_cursor.execute(f"TRUNCATE TABLE {table_name} CASCADE")

    # ローカルDBにデータ挿入
    placeholders = ', '.join(['%s'] * len(local_columns))
    insert_query = f"INSERT INTO {table_name} ({', '.join(local_columns)}) VALUES ({placeholders})"
    local_cursor.executemany(insert_query, rows)

    count = len(rows)
    print_color(Colors.GREEN, f"    ✓ {table_name}: {count}件")
    return count

def main():
    print_color(Colors.YELLOW, "=" * 50)
    print_color(Colors.YELLOW, "本番DB → ローカルDB データ同期")
    print_color(Colors.YELLOW, "=" * 50)
    print()

    try:
        # 本番DBに接続
        print_color(Colors.GREEN, "1. 本番DBに接続中...")
        prod_conn = psycopg2.connect(**PROD_CONN)
        prod_cursor = prod_conn.cursor()
        print_color(Colors.GREEN, "   ✓ 本番DB接続成功")
        print()

        # ローカルDBに接続
        print_color(Colors.GREEN, "2. ローカルDBに接続中...")
        local_conn = psycopg2.connect(**LOCAL_CONN)
        local_cursor = local_conn.cursor()
        print_color(Colors.GREEN, "   ✓ ローカルDB接続成功")
        print()

        # テーブル定義（prod_columns: 本番DB, local_columns: ローカルDB）
        tables = [
            ('stocks',
             ['id', 'ticker', 'name', 'market', 'sector', 'industry', 'is_ai_analysis_target', 'market_cap', '"createdAt"', '"updatedAt"'],
             ['id', 'ticker', 'name', 'market', 'sector', 'industry', 'is_ai_analysis_target', 'market_cap', 'created_at', 'updated_at']),
            ('analyses',
             ['id', 'stock_id', 'analysis_date', 'recommendation', 'confidence_score', 'reason', 'current_price', 'pe_ratio', 'pb_ratio', 'roe', 'dividend_yield', 'created_at', 'updated_at'],
             ['id', 'stock_id', 'analysis_date', 'recommendation', 'confidence_score', 'reason', 'current_price', 'pe_ratio', 'pb_ratio', 'roe', 'dividend_yield', 'created_at', 'updated_at']),
            ('price_history',
             ['id', 'stock_id', 'date', 'open', 'high', 'low', 'close', 'volume', 'created_at', 'updated_at'],
             ['id', 'stock_id', 'date', 'open', 'high', 'low', 'close', 'volume', 'created_at', 'updated_at']),
            ('batch_job_logs',
             ['id', 'job_date', 'status', 'total_stocks', 'success_count', 'failure_count', 'error_message', 'duration', 'created_at'],
             ['id', 'job_date', 'status', 'total_stocks', 'success_count', 'failure_count', 'error_message', 'duration', 'created_at']),
        ]

        # データ同期
        print_color(Colors.GREEN, "3. データを同期中...")
        total_rows = 0
        for table_name, prod_columns, local_columns in tables:
            count = sync_table(prod_cursor, local_cursor, table_name, prod_columns, local_columns)
            total_rows += count

        # コミット
        local_conn.commit()
        print()
        print_color(Colors.GREEN, "=" * 50)
        print_color(Colors.GREEN, f"同期完了！ 合計 {total_rows}件のレコードを同期しました")
        print_color(Colors.GREEN, "=" * 50)

    except Exception as e:
        print_color(Colors.RED, f"エラー: {e}")
        sys.exit(1)
    finally:
        if 'prod_cursor' in locals():
            prod_cursor.close()
        if 'prod_conn' in locals():
            prod_conn.close()
        if 'local_cursor' in locals():
            local_cursor.close()
        if 'local_conn' in locals():
            local_conn.close()

if __name__ == '__main__':
    main()
