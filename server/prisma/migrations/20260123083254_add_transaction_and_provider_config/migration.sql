-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "provider" TEXT NOT NULL,
    "externalTransId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "taskType" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_configs" (
    "id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "taskType" TEXT NOT NULL,
    "rewardFixed" DOUBLE PRECISION NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "provider_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "transactions_userId_idx" ON "transactions"("userId");

-- CreateIndex
CREATE INDEX "transactions_externalTransId_idx" ON "transactions"("externalTransId");

-- CreateIndex
CREATE UNIQUE INDEX "transactions_provider_externalTransId_key" ON "transactions"("provider", "externalTransId");

-- CreateIndex
CREATE UNIQUE INDEX "provider_configs_provider_key" ON "provider_configs"("provider");

-- CreateIndex
CREATE UNIQUE INDEX "provider_configs_provider_taskType_key" ON "provider_configs"("provider", "taskType");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
