-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "labor_description" TEXT;

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "specs" JSONB;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "terms_accepted_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "failed_searches" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "failed_searches_pkey" PRIMARY KEY ("id")
);
