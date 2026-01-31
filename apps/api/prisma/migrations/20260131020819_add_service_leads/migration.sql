-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceStatus" ADD VALUE 'LIMIT_REACHED';
ALTER TYPE "ServiceStatus" ADD VALUE 'CLOSED_HIRED';
ALTER TYPE "ServiceStatus" ADD VALUE 'CLOSED_CANCELED';
ALTER TYPE "ServiceStatus" ADD VALUE 'EXPIRED';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ServiceType" ADD VALUE 'CLIENT_SERVICE';
ALTER TYPE "ServiceType" ADD VALUE 'PRO_SUBCONTRACT';
ALTER TYPE "ServiceType" ADD VALUE 'PRO_HELPER_JOB';

-- AlterTable
ALTER TABLE "service_listings" ADD COLUMN     "leadsCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "maxLeads" INTEGER NOT NULL DEFAULT 3;

-- CreateTable
CREATE TABLE "service_leads" (
    "id" TEXT NOT NULL,
    "serviceListingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_leads_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_leads_serviceListingId_userId_key" ON "service_leads"("serviceListingId", "userId");

-- AddForeignKey
ALTER TABLE "service_leads" ADD CONSTRAINT "service_leads_serviceListingId_fkey" FOREIGN KEY ("serviceListingId") REFERENCES "service_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_leads" ADD CONSTRAINT "service_leads_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
