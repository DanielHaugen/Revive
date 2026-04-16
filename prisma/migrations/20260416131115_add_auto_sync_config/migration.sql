-- AlterTable
ALTER TABLE "SyncStatus" ADD COLUMN     "autoSyncEnabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "autoSyncIntervalSecs" INTEGER NOT NULL DEFAULT 30;
