-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "stocks" (
    "id" TEXT NOT NULL,
    "ticker" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "market" TEXT NOT NULL,
    "sector" TEXT,
    "industry" TEXT,
    "is_ai_analysis_target" BOOLEAN NOT NULL DEFAULT false,
    "market_cap" DECIMAL(65,30),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analyses" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "analysis_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recommendation" TEXT NOT NULL,
    "confidence_score" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "current_price" DOUBLE PRECISION,
    "pe_ratio" DOUBLE PRECISION,
    "pb_ratio" DOUBLE PRECISION,
    "roe" DOUBLE PRECISION,
    "dividend_yield" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analyses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "price_history" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "open" DOUBLE PRECISION NOT NULL,
    "high" DOUBLE PRECISION NOT NULL,
    "low" DOUBLE PRECISION NOT NULL,
    "close" DOUBLE PRECISION NOT NULL,
    "volume" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "price_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "batch_job_logs" (
    "id" TEXT NOT NULL,
    "job_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "total_stocks" INTEGER NOT NULL,
    "success_count" INTEGER NOT NULL,
    "failure_count" INTEGER NOT NULL,
    "error_message" TEXT,
    "duration" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "batch_job_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "push_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "stocks_ticker_key" ON "stocks"("ticker");

-- CreateIndex
CREATE INDEX "stocks_market_idx" ON "stocks"("market");

-- CreateIndex
CREATE INDEX "stocks_sector_idx" ON "stocks"("sector");

-- CreateIndex
CREATE INDEX "stocks_is_ai_analysis_target_idx" ON "stocks"("is_ai_analysis_target");

-- CreateIndex
CREATE INDEX "analyses_stock_id_analysis_date_idx" ON "analyses"("stock_id", "analysis_date");

-- CreateIndex
CREATE INDEX "analyses_analysis_date_idx" ON "analyses"("analysis_date");

-- CreateIndex
CREATE INDEX "analyses_recommendation_idx" ON "analyses"("recommendation");

-- CreateIndex
CREATE INDEX "price_history_stock_id_date_idx" ON "price_history"("stock_id", "date");

-- CreateIndex
CREATE UNIQUE INDEX "price_history_stock_id_date_key" ON "price_history"("stock_id", "date");

-- CreateIndex
CREATE INDEX "batch_job_logs_job_date_idx" ON "batch_job_logs"("job_date");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_endpoint_key" ON "push_subscriptions"("endpoint");

-- CreateIndex
CREATE INDEX "push_subscriptions_endpoint_idx" ON "push_subscriptions"("endpoint");

-- AddForeignKey
ALTER TABLE "analyses" ADD CONSTRAINT "analyses_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "price_history" ADD CONSTRAINT "price_history_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

