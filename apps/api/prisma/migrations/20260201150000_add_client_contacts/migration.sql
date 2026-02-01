CREATE TABLE "client_contacts" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "normalized_name" TEXT NOT NULL,
    "normalized_phone" TEXT NOT NULL DEFAULT '',
    "last_used_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "client_contacts_userId_idx" ON "client_contacts"("userId");
CREATE INDEX "client_contacts_userId_normalized_name_idx" ON "client_contacts"("userId", "normalized_name");
CREATE INDEX "client_contacts_userId_normalized_phone_idx" ON "client_contacts"("userId", "normalized_phone");

CREATE UNIQUE INDEX "client_contacts_userId_normalized_name_normalized_phone_key" ON "client_contacts"("userId", "normalized_name", "normalized_phone");

ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
