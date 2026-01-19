-- Rename all columns to snake_case for consistency
-- This migration ensures both local and production DBs use snake_case

-- analyses table
ALTER TABLE "analyses" RENAME COLUMN "stockId" TO "stock_id";
ALTER TABLE "analyses" RENAME COLUMN "analysisDate" TO "analysis_date";
ALTER TABLE "analyses" RENAME COLUMN "confidenceScore" TO "confidence_score";
ALTER TABLE "analyses" RENAME COLUMN "currentPrice" TO "current_price";
ALTER TABLE "analyses" RENAME COLUMN "peRatio" TO "pe_ratio";
ALTER TABLE "analyses" RENAME COLUMN "pbRatio" TO "pb_ratio";
ALTER TABLE "analyses" RENAME COLUMN "dividendYield" TO "dividend_yield";
ALTER TABLE "analyses" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "analyses" RENAME COLUMN "updatedAt" TO "updated_at";

-- price_history table
ALTER TABLE "price_history" RENAME COLUMN "stockId" TO "stock_id";
ALTER TABLE "price_history" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "price_history" RENAME COLUMN "updatedAt" TO "updated_at";

-- batch_job_logs table
ALTER TABLE "batch_job_logs" RENAME COLUMN "jobDate" TO "job_date";
ALTER TABLE "batch_job_logs" RENAME COLUMN "totalStocks" TO "total_stocks";
ALTER TABLE "batch_job_logs" RENAME COLUMN "successCount" TO "success_count";
ALTER TABLE "batch_job_logs" RENAME COLUMN "failureCount" TO "failure_count";
ALTER TABLE "batch_job_logs" RENAME COLUMN "errorMessage" TO "error_message";
ALTER TABLE "batch_job_logs" RENAME COLUMN "createdAt" TO "created_at";

-- stocks table (skip if already snake_case - for production DB)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='stocks' AND column_name='createdAt') THEN
    ALTER TABLE "stocks" RENAME COLUMN "createdAt" TO "created_at";
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns
             WHERE table_name='stocks' AND column_name='updatedAt') THEN
    ALTER TABLE "stocks" RENAME COLUMN "updatedAt" TO "updated_at";
  END IF;
END $$;

-- push_subscriptions table
ALTER TABLE "push_subscriptions" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "push_subscriptions" RENAME COLUMN "updatedAt" TO "updated_at";
