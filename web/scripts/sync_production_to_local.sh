#!/bin/bash
<<<<<<< HEAD

###############################################################################
# 本番データをローカルデータベースに同期するスクリプト
#
# 使い方:
#   npm run db:sync
#
# 処理内容:
#   1. 本番データベースからデータをダンプ
#   2. ローカルデータベースを初期化
#   3. ダンプしたデータをローカルにリストア
###############################################################################

set -e  # エラーが発生したら即座に終了

# カラー出力
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}本番データ → ローカルデータベース 同期${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# 本番データベース接続情報
PROD_HOST="aws-0-ap-northeast-1.pooler.supabase.com"
PROD_PORT="6543"
PROD_USER="postgres.ppxrgwxesjlqvbifcczv"
PROD_DB="postgres"
PROD_PASSWORD="hwS\$3-S\$JMV+S\$y"

# ローカルデータベース接続情報
=======
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
>>>>>>> develop
LOCAL_HOST="localhost"
LOCAL_PORT="5432"
LOCAL_USER="kouheikameyama"
LOCAL_DB="stock_analyzer_dev"

<<<<<<< HEAD
# 一時ファイル
DUMP_FILE="/tmp/stock_analyzer_dump_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${YELLOW}⚠️  警告: ローカルデータベースの既存データは削除されます${NC}"
echo ""
read -p "続行しますか？ (y/N): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}キャンセルしました${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}[1/3] 本番データベースからダンプ中...${NC}"

# pgbouncerを経由せず、直接接続用のホストとポート
DIRECT_HOST="aws-0-ap-northeast-1.pooler.supabase.com"
DIRECT_PORT="5432"

# pg_dumpでデータをダンプ（スキーマを除外し、データのみ）
PGPASSWORD="$PROD_PASSWORD" pg_dump \
  -h "$DIRECT_HOST" \
  -p "$DIRECT_PORT" \
  -U "$PROD_USER" \
  -d "$PROD_DB" \
  --no-owner \
  --no-acl \
  --data-only \
  --inserts \
  -f "$DUMP_FILE" \
  -t "Stock" \
  -t "Analysis" \
  -t "PriceHistory" \
  -t "BatchJobLog" \
  -t "PushSubscription"
=======
# ダンプファイル名
DUMP_FILE="/tmp/stock_analyzer_dump_$(date +%Y%m%d_%H%M%S).sql"

echo -e "${GREEN}1. 本番DBからデータをダンプ中...${NC}"
# Prismaを使ってデータをエクスポート（バージョン問題を回避）
echo "本番DBからデータを取得中..."
>>>>>>> develop

echo -e "${GREEN}✓ ダンプ完了: $DUMP_FILE${NC}"
echo ""

<<<<<<< HEAD
echo -e "${BLUE}[2/3] ローカルデータベースをクリア中...${NC}"

# ローカルデータベースの既存データを削除
psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" -c "
  TRUNCATE TABLE \"PriceHistory\" CASCADE;
  TRUNCATE TABLE \"Analysis\" CASCADE;
  TRUNCATE TABLE \"Stock\" CASCADE;
  TRUNCATE TABLE \"BatchJobLog\" CASCADE;
  TRUNCATE TABLE \"PushSubscription\" CASCADE;
" 2>/dev/null || echo -e "${YELLOW}  （一部テーブルが空の可能性があります）${NC}"

echo -e "${GREEN}✓ クリア完了${NC}"
echo ""

echo -e "${BLUE}[3/3] ローカルデータベースにリストア中...${NC}"

# ダンプしたデータをローカルにリストア
psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" -f "$DUMP_FILE" > /dev/null 2>&1

echo -e "${GREEN}✓ リストア完了${NC}"
echo ""

# 一時ファイルを削除
rm -f "$DUMP_FILE"

echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ 同期完了！${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# データ件数を表示
echo -e "${BLUE}📊 データ件数:${NC}"
psql -h "$LOCAL_HOST" -p "$LOCAL_PORT" -U "$LOCAL_USER" -d "$LOCAL_DB" -c "
  SELECT
    'Stock' as table_name, COUNT(*) as count FROM \"Stock\"
  UNION ALL
  SELECT 'Analysis', COUNT(*) FROM \"Analysis\"
  UNION ALL
  SELECT 'PriceHistory', COUNT(*) FROM \"PriceHistory\"
  UNION ALL
  SELECT 'BatchJobLog', COUNT(*) FROM \"BatchJobLog\"
  UNION ALL
  SELECT 'PushSubscription', COUNT(*) FROM \"PushSubscription\";
"

echo ""
echo -e "${GREEN}ローカル開発環境で本番データを使用できます 🎉${NC}"
=======
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
>>>>>>> develop
