-- DropForeignKey
ALTER TABLE "service_listings" DROP CONSTRAINT "service_listings_userId_fkey";

-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "execution_time" TEXT,
ADD COLUMN     "payment_terms" TEXT,
ADD COLUMN     "validity" TEXT,
ADD COLUMN     "warranty" TEXT;

-- AlterTable
ALTER TABLE "feedbacks" ADD COLUMN     "repliedAt" TIMESTAMP(3),
ADD COLUMN     "reply" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'OPEN';

-- AlterTable
ALTER TABLE "service_listings" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activatedAt" TIMESTAMP(3),
ADD COLUMN     "average_ticket" DECIMAL(10,2),
ADD COLUMN     "cadastro_finalizado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "commercial_index" DECIMAL(10,2),
ADD COLUMN     "pre_cadastrado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "registration_origin" TEXT DEFAULT 'MANUAL',
ADD COLUMN     "sankhya_partner_id" INTEGER,
ADD COLUMN     "sankhya_synced_at" TIMESTAMP(3),
ADD COLUMN     "sankhya_vendor_id" INTEGER,
ADD COLUMN     "total_orders" INTEGER,
ADD COLUMN     "total_revenue" DECIMAL(12,2),
ADD COLUMN     "view_count" INTEGER NOT NULL DEFAULT 0;

-- AddForeignKey
ALTER TABLE "service_listings" ADD CONSTRAINT "service_listings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
