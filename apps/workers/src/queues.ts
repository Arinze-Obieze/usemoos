import { Queue } from "bullmq";
import { redis } from "./redis.js";

export const ingestionQueue = new Queue("ingestion", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

export const syncQueue = new Queue("sync", {
  connection: redis,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: "exponential", delay: 10000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 500 },
  },
});

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
