-- AlterTable
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "bio" TEXT,
ADD COLUMN IF NOT EXISTS "deletedAt" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "emailVerified" TIMESTAMP(3),
ADD COLUMN IF NOT EXISTS "image" TEXT,
ADD COLUMN IF NOT EXISTS "isVerified" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT,
ADD COLUMN IF NOT EXISTS "provider" TEXT DEFAULT 'credentials',
ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'USER',
ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'ACTIVE',
ADD COLUMN IF NOT EXISTS "verificationCode" TEXT,
ADD COLUMN IF NOT EXISTS "verificationExpires" TIMESTAMP(3);

ALTER TABLE "User" ALTER COLUMN "password" DROP NOT NULL;

-- CreateTable
CREATE TABLE IF NOT EXISTS "FinancialHealth" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "tier" TEXT NOT NULL,
    "pillars" JSONB NOT NULL,
    "summary" TEXT NOT NULL,
    "insights" JSONB NOT NULL,
    "calculatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialHealth_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE IF NOT EXISTS "CategoryKeyword" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "userId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CategoryKeyword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "FinancialHealth_userId_key" ON "FinancialHealth"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CategoryKeyword_keyword_idx" ON "CategoryKeyword"("keyword");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CategoryKeyword_userId_idx" ON "CategoryKeyword"("userId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "CategoryKeyword_category_idx" ON "CategoryKeyword"("category");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "CategoryKeyword_keyword_userId_key" ON "CategoryKeyword"("keyword", "userId");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "FinancialHealth" ADD CONSTRAINT "FinancialHealth_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "CategoryKeyword" ADD CONSTRAINT "CategoryKeyword_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
