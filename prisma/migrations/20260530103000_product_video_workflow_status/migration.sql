-- CreateEnum
CREATE TYPE "ProductVideoWorkflowStatus" AS ENUM ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "ProductVideo"
ADD COLUMN "workflowStatus" "ProductVideoWorkflowStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN "errorMessage" TEXT;
