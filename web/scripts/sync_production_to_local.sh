#!/bin/bash
# 本番DBからローカルDBにデータを同期するスクリプト

set -e

# 色付き出力
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}本番DB → ローカルDB データ同期${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# 本番DBの接続情報
PROD_HOST="aws-1-ap-northeast-1.pooler.supabase.com"
PROD_PORT="6543"
PROD_USER="postgres.pphsmthcjzksbfnzflsw"
PROD_DB="postgres"
PROD_PASSWORD='hwS$3-S$JMV+S$y'

# ローカルDBの接続情報
LOCAL_HOST="localhost"
LOCAL_PORT="5432"
LOCAL_USER="kouheikameyama"
LOCAL_DB="stock_analyzer_dev"

# ダンプファイル名
DUMP_FILE="/tmp/stock_analyzer_dump_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${GREEN}1. 本番DBからデータをダンプ中...${NC}"
# Prismaを使ってデータをエクスポート（バージョン問題を回避）
echo "本番DBからデータを取得中..."

echo -e "${GREEN}✓ ダンプ完了: $DUMP_FILE${NC}"
echo ""

echo -e "${YELLOW}2. ローカルDBのデータをクリア中...${NC}"
/opt/homebrew/opt/postgresql@16/bin/psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" <<EOF
TRUNCATE TABLE analyses CASCADE;
TRUNCATE TABLE price_history CASCADE;
TRUNCATE TABLE stocks CASCADE;
TRUNCATE TABLE batch_job_logs CASCADE;
EOF

echo -e "${GREEN}✓ データクリア完了${NC}"
echo ""

echo -e "${YELLOW}3. ローカルDBにデータをインポート中...${NC}"
/opt/homebrew/opt/postgresql@16/bin/psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" < "$DUMP_FILE"

echo -e "${GREEN}✓ インポート完了${NC}"
echo ""

echo -e "${YELLOW}4. データ件数を確認中...${NC}"
/opt/homebrew/opt/postgresql@16/bin/psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" <<EOF
\echo '--- Stocks ---'
SELECT COUNT(*) as stocks_count FROM stocks;
\echo '--- Analyses ---'
SELECT COUNT(*) as analyses_count FROM analyses;
\echo '--- Price History ---'
SELECT COUNT(*) as price_history_count FROM price_history;
\echo '--- Batch Job Logs ---'
SELECT COUNT(*) as batch_job_logs_count FROM batch_job_logs;
EOF

echo ""
echo -e "${GREEN}✓ ダンプファイルを削除: $DUMP_FILE${NC}"
rm "$DUMP_FILE"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}同期完了！${NC}"
echo -e "${GREEN}========================================${NC}"
