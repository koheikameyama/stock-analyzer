#!/usr/bin/env python3
"""
JPX公式サイトから全銘柄リストを取得してデータベースに登録するスクリプト
"""

import os
import sys
import requests
import pandas as pd
import psycopg2
from datetime import datetime
from io import BytesIO
from urllib.parse import urlparse, parse_qs, urlencode, urlunparse
import uuid

# 色付き出力
class Colors:
    GREEN = '\033[0;32m'
    YELLOW = '\033[1;33m'
    RED = '\033[0;31m'
    NC = '\033[0m'

def print_color(color, message):
    print(f"{color}{message}{Colors.NC}")

# JPX銘柄リストURL
JPX_URL = "https://www.jpx.co.jp/markets/statistics-equities/misc/tvdivq0000001vg2-att/data_j.xls"

# データベース接続情報（環境変数から取得、ローカル環境の場合はデフォルト値を使用）
def get_database_url():
    """DATABASE_URLを取得し、psycopg2非対応のパラメータを削除"""
    url = os.getenv('DATABASE_URL', 'postgresql://kouheikameyama@localhost:5432/stock_analyzer_dev')

    # URLをパース
    parsed = urlparse(url)

    # クエリパラメータをパース
    query_params = parse_qs(parsed.query)

    # pgbouncerパラメータを削除
    if 'pgbouncer' in query_params:
        del query_params['pgbouncer']

    # 新しいクエリ文字列を構築
    new_query = urlencode(query_params, doseq=True)

    # URLを再構築
    new_parsed = parsed._replace(query=new_query)
    return urlunparse(new_parsed)

DATABASE_URL = get_database_url()

def download_jpx_data():
    """JPXから銘柄リストをダウンロード"""
    print_color(Colors.YELLOW, "1. JPXから銘柄リストをダウンロード中...")

    try:
        response = requests.get(JPX_URL, timeout=30)
        response.raise_for_status()
        print_color(Colors.GREEN, f"   ✓ ダウンロード完了 ({len(response.content)} bytes)")
        return response.content
    except Exception as e:
        print_color(Colors.RED, f"   ✗ ダウンロード失敗: {e}")
        sys.exit(1)

def parse_excel(content):
    """Excelファイルを解析してプライム市場の銘柄を抽出"""
    print_color(Colors.YELLOW, "2. Excelファイルを解析中...")

    try:
        # Excelファイルを読み込み（.xlsファイル用のエンジンを指定）
        df = pd.read_excel(BytesIO(content), engine='xlrd')

        print_color(Colors.GREEN, f"   ✓ 全銘柄数: {len(df)}件")
        print_color(Colors.YELLOW, f"   利用可能なカラム: {list(df.columns)}")

        # プライム市場のみフィルタリング（市場区分が「プライム」）
        # カラム名は実際のExcelファイルに合わせて調整が必要
        # 一般的には「市場・商品区分」などのカラム名
        prime_df = df[df['市場・商品区分'].str.contains('プライム', na=False)]

        print_color(Colors.GREEN, f"   ✓ プライム市場: {len(prime_df)}件")

        return prime_df
    except Exception as e:
        print_color(Colors.RED, f"   ✗ 解析失敗: {e}")
        sys.exit(1)

def import_to_database(df):
    """データベースに銘柄を登録"""
    print_color(Colors.YELLOW, "3. データベースに登録中...")

    try:
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()

        inserted = 0
        updated = 0
        skipped = 0

        for _, row in df.iterrows():
            # 証券コード（4桁の数字）
            ticker = str(row['コード']).strip()

            # 銘柄名
            name = row['銘柄名'].strip()

            # 33業種コード・33業種区分から業種を取得
            sector = row.get('33業種区分', None)
            if pd.isna(sector):
                sector = None

            # 既存データを確認
            cur.execute("SELECT id FROM stocks WHERE ticker = %s", (ticker,))
            existing = cur.fetchone()

            if existing:
                # 既存データを更新
                cur.execute("""
                    UPDATE stocks SET
                        name = %s,
                        sector = %s,
                        updated_at = NOW()
                    WHERE ticker = %s
                """, (name, sector, ticker))
                updated += 1
            else:
                # 新規登録（UUIDを生成）
                new_id = str(uuid.uuid4())
                cur.execute("""
                    INSERT INTO stocks (
                        id,
                        ticker,
                        name,
                        market,
                        sector,
                        is_ai_analysis_target,
                        created_at,
                        updated_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
                """, (new_id, ticker, name, 'JP', sector, False))
                inserted += 1

        conn.commit()

        print_color(Colors.GREEN, f"   ✓ 新規登録: {inserted}件")
        print_color(Colors.GREEN, f"   ✓ 更新: {updated}件")
        print_color(Colors.GREEN, f"   ✓ 合計: {inserted + updated}件")

        cur.close()
        conn.close()

    except Exception as e:
        print_color(Colors.RED, f"   ✗ 登録失敗: {e}")
        sys.exit(1)

def main():
    print_color(Colors.YELLOW, "=" * 60)
    print_color(Colors.YELLOW, "JPX全銘柄リスト取得・登録")
    print_color(Colors.YELLOW, "=" * 60)
    print()
    print_color(Colors.YELLOW, f"接続先DB: {DATABASE_URL}")
    print()

    # ダウンロード
    content = download_jpx_data()

    # 解析
    prime_df = parse_excel(content)

    # 登録
    import_to_database(prime_df)

    print()
    print_color(Colors.GREEN, "=" * 60)
    print_color(Colors.GREEN, "完了！")
    print_color(Colors.GREEN, "=" * 60)

if __name__ == '__main__':
    main()
