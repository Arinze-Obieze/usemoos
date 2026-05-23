import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { zValidator } from "@hono/zod-validator";
import {
  and,
  desc,
  documents,
  eq,
  getDb,
  sourceChunks,
  syncJobs,
} from "@usemoos/db";
import { deleteBySourceId } from "@usemoos/lib/rag";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { ensureWorkspace } from "../lib/workspaces.js";
import { ingestionQueue } from "../queues.js";

type AuthEnv = { Variables: { userId: string; orgId: string | null } };

const s3 = new S3Client({ region: process.env.AWS_REGION ?? "us-east-1" });

export const upload = new Hono<AuthEnv>();

const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/markdown",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
] as const;

upload.post(
  "/presign",
  zValidator(
    "json",
    z.object({
      fileName: z.string().min(1).max(255),
      mimeType: z.enum(ALLOWED_MIME_TYPES),
      fileSize: z
        .number()
        .int()
        .positive()
        .max(100 * 1024 * 1024),
    }),
  ),
  async (c) => {
    const { fileName, mimeType, fileSize } = c.req.valid("json");
    const userId = c.get("userId");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    const documentId = uuidv4();
    const s3Key = `${workspace.id}/${documentId}/${fileName}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: s3Key,
      ContentType: mimeType,
      ContentLength: fileSize,
      Metadata: { workspaceId: workspace.id, documentId, uploadedBy: userId },
    });

    const presignedUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    const [doc] = await db
      .insert(documents)
      .values({
        id: documentId,
        workspace_id: workspace.id,
        filename: fileName,
        s3_key: s3Key,
        mime_type: mimeType,
        size_bytes: fileSize,
        status: "pending",
        uploaded_by: userId,
      })
      .returning();

    return c.json({ presignedUrl, documentId: doc.id, s3Key });
  },
);

upload.post(
  "/confirm",
  zValidator("json", z.object({ documentId: z.string().uuid() })),
  async (c) => {
    const { documentId } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    const [doc] = await db
      .select()
      .from(documents)
      .where(eq(documents.id, documentId));
    if (!doc || doc.workspace_id !== workspace.id)
      return c.json({ error: "Document not found" }, 404);

    const job = await ingestionQueue.add("ingest", {
      workspaceId: workspace.id,
      documentId: doc.id,
      s3Key: doc.s3_key,
      mimeType: doc.mime_type,
      uploadedBy: doc.uploaded_by,
    });

    await db.insert(syncJobs).values({
      workspace_id: workspace.id,
      document_id: doc.id,
      job_type: "ingest_document",
      bullmq_job_id: job.id ?? "",
      status: "queued",
    });

    return c.json({ ok: true, jobId: job.id });
  },
);

upload.get("/status/:documentId", async (c) => {
  const documentId = c.req.param("documentId");
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const [doc] = await db
    .select()
    .from(documents)
    .where(eq(documents.id, documentId));
  if (!doc || doc.workspace_id !== workspace.id)
    return c.json({ error: "Not found" }, 404);

  return c.json({ status: doc.status, chunksIndexed: doc.chunks_indexed });
});

upload.get("/documents", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const docs = await db
    .select({
      id: documents.id,
      filename: documents.filename,
      mime_type: documents.mime_type,
      size_bytes: documents.size_bytes,
      status: documents.status,
      chunks_indexed: documents.chunks_indexed,
      error_message: documents.error_message,
      created_at: documents.created_at,
    })
    .from(documents)
    .where(eq(documents.workspace_id, workspace.id))
    .orderBy(desc(documents.created_at));

  return c.json(docs);
});

upload.delete("/documents/:documentId", async (c) => {
  const documentId = c.req.param("documentId");
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const [doc] = await db
    .select()
    .from(documents)
    .where(
      and(
        eq(documents.id, documentId),
        eq(documents.workspace_id, workspace.id),
      ),
    );
  if (!doc) return c.json({ error: "Not found" }, 404);

  try {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: doc.s3_key,
      }),
    );
  } catch {
    // ignore — object may already be gone
  }

  await deleteBySourceId(workspace.id, documentId);
  await db
    .delete(sourceChunks)
    .where(
      and(
        eq(sourceChunks.workspace_id, workspace.id),
        eq(sourceChunks.source_id, documentId),
      ),
    );
  await db.delete(documents).where(eq(documents.id, documentId));

  return c.json({ ok: true });
});
