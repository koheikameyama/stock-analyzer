-- Add new fields to stocks table for all-stocks support
-- AlterTable
ALTER TABLE "stocks" ADD COLUMN IF NOT EXISTS "industry" TEXT,
ADD COLUMN IF NOT EXISTS "is_ai_analysis_target" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "market_cap" DECIMAL;

-- CreateIndex
CREATE INDEX IF NOT EXISTS "stocks_is_ai_analysis_target_idx" ON "stocks"("is_ai_analysis_target");
