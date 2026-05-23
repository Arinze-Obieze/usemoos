import { Queue } from "bullmq";
import { Redis } from "ioredis";

const redis = new Redis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null,
});

export const ingestionQueue = new Queue("ingestion", { connection: redis });
export const syncQueue = new Queue("sync", { connection: redis });

export interface IngestionJobData {
  workspaceId: string;
  documentId: string;
  s3Key: string;
  mimeType: string;
  uploadedBy: string;
}

export interface SyncJobData {
  syncJobId: string;
  workspaceId: string;
  connectionId: string;
  integrationType: string;
  nangoConnectionId: string;
  nangoProviderConfigKey: string;
}
