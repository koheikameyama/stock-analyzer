-- CreateTable
CREATE TABLE IF NOT EXISTS "analysis_requests" (
    "id" TEXT NOT NULL,
    "stock_id" TEXT NOT NULL,
    "request_count" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "analysis_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "analysis_requests_stock_id_key" ON "analysis_requests"("stock_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "analysis_requests_stock_id_idx" ON "analysis_requests"("stock_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "analysis_requests_request_count_idx" ON "analysis_requests"("request_count");

-- AddForeignKey
ALTER TABLE "analysis_requests" ADD CONSTRAINT "analysis_requests_stock_id_fkey" FOREIGN KEY ("stock_id") REFERENCES "stocks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
