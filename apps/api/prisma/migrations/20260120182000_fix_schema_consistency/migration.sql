-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('MATERIAL', 'SERVICE');

-- CreateEnum
CREATE TYPE "ServiceStatus" AS ENUM ('OPEN', 'FILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('REQUEST', 'OFFER');

-- AlterTable
ALTER TABLE "products" ADD COLUMN "type" "ProductType" NOT NULL DEFAULT 'MATERIAL';

-- CreateTable
CREATE TABLE "ai_match_feedbacks" (
    "id" TEXT NOT NULL,
    "original_text" TEXT NOT NULL,
    "ai_model" TEXT NOT NULL,
    "suggested_pid" TEXT,
    "correct_pid" TEXT,
    "correction_type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT,

    CONSTRAINT "ai_match_feedbacks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_listings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "city" TEXT,
    "state" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "whatsapp" TEXT,
    "type" "ServiceType" NOT NULL DEFAULT 'REQUEST',
    "status" "ServiceStatus" NOT NULL DEFAULT 'OPEN',
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_listings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ai_match_feedbacks_original_text_idx" ON "ai_match_feedbacks"("original_text");

-- AddForeignKey
ALTER TABLE "ai_match_feedbacks" ADD CONSTRAINT "ai_match_feedbacks_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_listings" ADD CONSTRAINT "service_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
