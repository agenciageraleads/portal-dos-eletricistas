-- AlterTable
ALTER TABLE "service_listings" ADD COLUMN     "contract_type" TEXT,
ADD COLUMN     "installation_type" TEXT,
ADD COLUMN     "needs_infra" BOOLEAN,
ADD COLUMN     "urgency" TEXT;

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "certifications" TEXT,
ADD COLUMN     "certifications_public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "experience_public" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "experience_years" INTEGER,
ADD COLUMN     "specialties" TEXT,
ADD COLUMN     "specialties_public" BOOLEAN NOT NULL DEFAULT true;
