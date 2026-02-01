-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bankAccountName" TEXT,
ADD COLUMN     "bankAccountNumber" TEXT,
ADD COLUMN     "bankMethod" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "isAdmin" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "withdrawals" ADD COLUMN     "adminNote" TEXT,
ADD COLUMN     "processedAt" TIMESTAMP(3),
ADD COLUMN     "transferredAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "withdrawals_status_idx" ON "withdrawals"("status");
