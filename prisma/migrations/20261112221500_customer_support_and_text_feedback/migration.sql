-- Chat, text-only product reviews, FAQ and moderation.
-- Additive and safe for existing products, orders and reviews.
ALTER TABLE "Review" ADD COLUMN IF NOT EXISTS "adminReply" TEXT;
ALTER TABLE "Review" ALTER COLUMN "rating" SET DEFAULT 0;

CREATE TABLE IF NOT EXISTS "SupportThread" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "visitorName" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "tokenHash" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX IF NOT EXISTS "SupportThread_tokenHash_key" ON "SupportThread"("tokenHash");
CREATE INDEX IF NOT EXISTS "SupportThread_status_updatedAt_idx" ON "SupportThread"("status","updatedAt");

CREATE TABLE IF NOT EXISTS "SupportMessage" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "threadId" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "SupportMessage_threadId_fkey" FOREIGN KEY ("threadId") REFERENCES "SupportThread"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX IF NOT EXISTS "SupportMessage_threadId_createdAt_idx" ON "SupportMessage"("threadId","createdAt");

CREATE TABLE IF NOT EXISTS "FaqItem" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "question" TEXT NOT NULL,
  "answer" TEXT,
  "published" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "FaqItem_published_updatedAt_idx" ON "FaqItem"("published","updatedAt");

CREATE TABLE IF NOT EXISTS "SupportSettings" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "welcome" TEXT NOT NULL DEFAULT 'سلام! چطور می‌توانیم کمکتان کنیم؟',
  "expectedResponse" TEXT NOT NULL DEFAULT 'پشتیبان به‌محض امکان پاسخ می‌دهد.',
  "workingHours" TEXT NOT NULL DEFAULT 'ساعات پاسخ‌گویی را مدیر فروشگاه تعیین می‌کند.',
  "enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
