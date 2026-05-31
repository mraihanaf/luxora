ALTER TABLE "ProductVideo"
ADD COLUMN "triggerRunId" TEXT,
ADD COLUMN "progressPercent" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "progressLabel" TEXT;
