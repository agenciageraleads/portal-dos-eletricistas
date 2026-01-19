-- AlterTable
ALTER TABLE "budgets" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "show_labor_total" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "show_unit_prices" BOOLEAN NOT NULL DEFAULT true;
