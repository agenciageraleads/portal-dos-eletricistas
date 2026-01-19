-- DropForeignKey
ALTER TABLE "budget_items" DROP CONSTRAINT "budget_items_productId_fkey";

-- AlterTable
ALTER TABLE "budget_items" ADD COLUMN     "custom_name" TEXT,
ADD COLUMN     "custom_photo_url" TEXT,
ADD COLUMN     "is_external" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "suggested_source" TEXT,
ALTER COLUMN "productId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;
