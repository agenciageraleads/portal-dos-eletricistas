/*
  Warnings:

  - You are about to drop the column `photo_url` on the `users` table. All the data in the column will be lost.
  - You are about to drop the column `skills` on the `users` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" DROP COLUMN "photo_url",
DROP COLUMN "skills",
ADD COLUMN     "logo_url" TEXT,
ADD COLUMN     "pix_key" TEXT,
ADD COLUMN     "reset_token" TEXT,
ADD COLUMN     "reset_token_expires" TIMESTAMP(3);
