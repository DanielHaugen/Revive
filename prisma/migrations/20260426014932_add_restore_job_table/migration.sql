-- CreateTable
CREATE TABLE "RestoreJob" (
    "id" SERIAL NOT NULL,
    "instanceId" TEXT NOT NULL,
    "instanceName" TEXT,
    "snapshotId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'running',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "correlationId" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RestoreJob_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RestoreJob_correlationId_key" ON "RestoreJob"("correlationId");

-- CreateIndex
CREATE INDEX "RestoreJob_status_idx" ON "RestoreJob"("status");

-- CreateIndex
CREATE INDEX "RestoreJob_instanceId_idx" ON "RestoreJob"("instanceId");
