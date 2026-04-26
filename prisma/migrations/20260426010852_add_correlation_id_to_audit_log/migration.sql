-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "correlationId" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_correlationId_idx" ON "AuditLog"("correlationId");
