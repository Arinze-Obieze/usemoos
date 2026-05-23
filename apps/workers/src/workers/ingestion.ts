import { GetObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { freshnessScore } from "@usemoos/adapters";
import { documents, eq, getDb, sourceChunks, syncJobs } from "@usemoos/db";
import { splitText } from "@usemoos/lib/chunking";
import { embedBatch, upsertChunks } from "@usemoos/lib/rag";
import { type Job, Worker } from "bullmq";
import type { IngestionJobData } from "../queues.js";
import { redis } from "../redis.js";

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

export function createIngestionWorker() {
  return new Worker<IngestionJobData>(
    "ingestion",
    async (job: Job<IngestionJobData>) => {
      const { workspaceId, documentId, s3Key, mimeType, uploadedBy } = job.data;
      const db = getDb();

      await db
        .update(documents)
        .set({ status: "processing", error_message: null })
        .where(eq(documents.id, documentId));
      await db
        .update(syncJobs)
        .set({ status: "running", started_at: new Date(), error_message: null })
        .where(eq(syncJobs.document_id, documentId));

      try {
        const text = await downloadAndExtract(s3Key, mimeType);
        if (!text.trim()) {
          throw new Error("No extractable text found in uploaded document");
        }

        const chunks = splitText(text, { chunkSize: 512, chunkOverlap: 64 });
        const now = Math.floor(Date.now() / 1000);
        const freshness = freshnessScore(now);

        const texts = chunks.map((c) => c.text);
        const embeddings = await embedBatch(texts);

        const pineconeRecords = chunks.map((chunk, i) => ({
          id: `doc_${documentId}_${chunk.index}`,
          vector: embeddings[i],
          text: chunk.text,
          metadata: {
            workspace_id: workspaceId,
            source_type: "upload" as const,
            source_id: documentId,
            source_url: "",
            source_title: s3Key.split("/").pop() ?? documentId,
            source_authority_tier: 2 as const,
            author_role: "other" as const,
            author_id: uploadedBy,
            created_at: now,
            updated_at: now,
            permission_groups: [`workspace:${workspaceId}`],
            document_type: "doc" as const,
            freshness_score: freshness,
            engagement_signals: 0,
            is_official: false,
            section_hierarchy: chunk.sectionHierarchy,
            chunk_index: chunk.index,
            total_chunks: chunks.length,
          },
        }));

        await upsertChunks(workspaceId, pineconeRecords);

        await db.insert(sourceChunks).values(
          pineconeRecords.map((r) => ({
            pinecone_id: r.id,
            workspace_id: workspaceId,
            source_type: "upload" as const,
            source_id: documentId,
            source_title: r.metadata.source_title,
            source_url: "",
            authority_tier: 2 as const,
            document_type: "doc" as const,
            author_role: "other" as const,
            is_official: false,
            permission_groups: [`workspace:${workspaceId}`],
          })),
        );

        await db
          .update(documents)
          .set({ status: "indexed", chunks_indexed: chunks.length })
          .where(eq(documents.id, documentId));

        await db
          .update(syncJobs)
          .set({ status: "done", completed_at: new Date() })
          .where(eq(syncJobs.document_id, documentId));
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Document ingestion failed";
        await db
          .update(documents)
          .set({ status: "error", error_message: errorMessage })
          .where(eq(documents.id, documentId));
        await db
          .update(syncJobs)
          .set({
            status: "failed",
            error_message: errorMessage,
            completed_at: new Date(),
          })
          .where(eq(syncJobs.document_id, documentId));
        throw err;
      }
    },
    {
      connection: redis,
      concurrency: 4,
    },
  );
}

async function downloadAndExtract(
  s3Key: string,
  mimeType: string,
): Promise<string> {
  const cmd = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: s3Key,
  });
  const res = await s3.send(cmd);
  const bytes = await res.Body?.transformToByteArray();
  if (!bytes) return "";

  if (mimeType === "text/plain" || mimeType === "text/markdown") {
    return new TextDecoder("utf-8").decode(bytes);
  }

  if (!process.env.UNSTRUCTURED_API_URL) {
    throw new Error("UNSTRUCTURED_API_URL is required for non-text uploads");
  }

  const form = new FormData();
  const fileBytes = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(fileBytes).set(bytes);
  form.append("files", new Blob([fileBytes]), s3Key.split("/").pop() ?? "file");
  form.append("strategy", "hi_res");
  const uRes = await fetch(
    `${process.env.UNSTRUCTURED_API_URL}/general/v0/general`,
    {
      method: "POST",
      headers: {
        "unstructured-api-key": process.env.UNSTRUCTURED_API_KEY ?? "",
      },
      body: form,
    },
  );
  if (!uRes.ok) {
    throw new Error(`Unstructured parsing failed with ${uRes.status}`);
  }
  const elements = (await uRes.json()) as Array<{ text?: string }>;
  return elements.map((e) => e.text ?? "").join("\n");
}
