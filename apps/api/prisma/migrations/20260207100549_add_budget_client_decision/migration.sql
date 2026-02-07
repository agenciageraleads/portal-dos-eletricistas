-- Add new status values
ALTER TYPE "BudgetStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "BudgetStatus" ADD VALUE IF NOT EXISTS 'NEGOTIATING';

-- Add client decision/contract fields
ALTER TABLE "budgets"
  ADD COLUMN IF NOT EXISTS "client_accept_name" TEXT,
  ADD COLUMN IF NOT EXISTS "client_accept_cpf" TEXT,
  ADD COLUMN IF NOT EXISTS "client_accept_signature" TEXT,
  ADD COLUMN IF NOT EXISTS "client_accept_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "client_reject_reasons" TEXT,
  ADD COLUMN IF NOT EXISTS "client_reject_note" TEXT,
  ADD COLUMN IF NOT EXISTS "client_reject_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "client_negotiation_at" TIMESTAMP(3);
