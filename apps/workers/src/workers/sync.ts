import { ADAPTERS } from "@usemoos/adapters";
import {
  and,
  eq,
  getDb,
  integrationConnections,
  sourceChunks,
  syncJobs,
} from "@usemoos/db";
import { deleteBySourceId, embedBatch, upsertChunks } from "@usemoos/lib/rag";
import type { IntegrationType } from "@usemoos/types";
import { type Job, Worker } from "bullmq";
import type { SyncJobData } from "../queues.js";
import { redis } from "../redis.js";

export function createSyncWorker() {
  return new Worker<SyncJobData>(
    "sync",
    async (job: Job<SyncJobData>) => {
      const {
        syncJobId,
        workspaceId,
        connectionId,
        integrationType,
        nangoConnectionId,
        nangoProviderConfigKey,
      } = job.data;
      const db = getDb();

      const adapter = ADAPTERS[integrationType as IntegrationType];
      if (!adapter) throw new Error(`No adapter for ${integrationType}`);

      await db
        .update(integrationConnections)
        .set({ status: "syncing" })
        .where(eq(integrationConnections.id, connectionId));
      await db
        .update(syncJobs)
        .set({ status: "running", started_at: new Date(), error_message: null })
        .where(eq(syncJobs.id, syncJobId));

      let docsIndexed = 0;

      try {
        const nangoFetch = buildNangoFetch(
          nangoConnectionId,
          nangoProviderConfigKey,
        );

        for await (const doc of adapter.fetchDocuments(
          nangoFetch,
          workspaceId,
        )) {
          const chunks = adapter.chunkDocument(doc);
          if (!chunks.length) continue;

          // Remove stale vectors and DB records for this source before re-indexing
          await deleteBySourceId(workspaceId, doc.id);
          await db
            .delete(sourceChunks)
            .where(
              and(
                eq(sourceChunks.workspace_id, workspaceId),
                eq(sourceChunks.source_id, doc.id),
              ),
            );

          const texts = chunks.map((c) => c.chunk.text);
          const embeddings = await embedBatch(texts);

          const pineconeRecords = chunks.map((c, i) => ({
            id: `${integrationType}_${doc.id}_${c.chunk.index}`,
            vector: embeddings[i],
            text: c.chunk.text,
            metadata: adapter.buildMetadata(
              workspaceId,
              doc,
              c.chunk,
              chunks.length,
            ),
          }));

          await upsertChunks(workspaceId, pineconeRecords);

          await db.insert(sourceChunks).values(
            pineconeRecords.map((r) => ({
              pinecone_id: r.id,
              workspace_id: workspaceId,
              source_type: integrationType as IntegrationType,
              source_id: doc.id,
              source_title: doc.title,
              source_url: doc.url,
              authority_tier: adapter.authorityTier,
              document_type: doc.documentType,
              author_role: doc.authorRole,
              is_official: doc.isOfficial,
              permission_groups: doc.permissionGroups,
            })),
          );

          docsIndexed++;
          await job.updateProgress(docsIndexed);
        }

        await db
          .update(integrationConnections)
          .set({
            status: "success",
            docs_indexed: docsIndexed,
            last_synced_at: new Date(),
          })
          .where(eq(integrationConnections.id, connectionId));

        await db
          .update(syncJobs)
          .set({ status: "done", completed_at: new Date() })
          .where(eq(syncJobs.id, syncJobId));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Integration sync failed";
        await db
          .update(integrationConnections)
          .set({ status: "error", error_message: errorMessage })
          .where(eq(integrationConnections.id, connectionId));
        await db
          .update(syncJobs)
          .set({
            status: "failed",
            error_message: errorMessage,
            completed_at: new Date(),
          })
          .where(eq(syncJobs.id, syncJobId));
        throw err;
      }
    },
    {
      connection: redis,
      concurrency: 2,
    },
  );
}

function buildNangoFetch(connectionId: string, providerConfigKey: string) {
  return async (url: string, opts?: RequestInit): Promise<Response> => {
    const nangoApiUrl = process.env.NANGO_API_URL ?? "https://api.nango.dev";
    const proxyUrl = `${nangoApiUrl}/proxy/${encodeURIComponent(url)}`;

    return fetch(proxyUrl, {
      ...opts,
      headers: {
        ...((opts?.headers as Record<string, string>) ?? {}),
        Authorization: `Bearer ${process.env.NANGO_SECRET_KEY}`,
        "Connection-Id": connectionId,
        "Provider-Config-Key": providerConfigKey,
      },
    });
  };
}
