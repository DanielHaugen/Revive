-- CreateTable
CREATE TABLE "CachedInstance" (
    "instanceId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedInstance_pkey" PRIMARY KEY ("instanceId")
);

-- CreateTable
CREATE TABLE "CachedVolume" (
    "volumeId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedVolume_pkey" PRIMARY KEY ("volumeId")
);

-- CreateTable
CREATE TABLE "CachedSnapshot" (
    "snapshotId" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CachedSnapshot_pkey" PRIMARY KEY ("snapshotId")
);

-- CreateTable
CREATE TABLE "SyncStatus" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "lastSyncAt" TIMESTAMP(3),
    "lastError" TEXT,
    "inProgress" BOOLEAN NOT NULL DEFAULT false,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SyncStatus_pkey" PRIMARY KEY ("id")
);
