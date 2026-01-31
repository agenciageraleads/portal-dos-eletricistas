-- Add ambassador flags
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "is_ambassador" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS "ambassador_rank" INTEGER;
