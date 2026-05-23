import { zValidator } from "@hono/zod-validator";
import {
  and,
  desc,
  eq,
  getDb,
  integrationConnections,
  sourceChunks,
  syncJobs,
} from "@usemoos/db";
import { deleteBySourceType } from "@usemoos/lib/rag";
import {
  INTEGRATION_META,
  type IntegrationType,
  PHASE_ONE_INTEGRATIONS,
} from "@usemoos/types";
import { Hono } from "hono";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { ensureWorkspace } from "../lib/workspaces.js";
import { syncQueue } from "../queues.js";

type AuthEnv = { Variables: { userId: string; orgId: string | null } };

export const integrations = new Hono<AuthEnv>();
const integrationSchema = z.enum(PHASE_ONE_INTEGRATIONS);

integrations.get("/", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const connections = await db
    .select()
    .from(integrationConnections)
    .where(eq(integrationConnections.workspace_id, workspace.id));

  return c.json(connections);
});

integrations.post(
  "/connect",
  zValidator(
    "json",
    z.object({
      integrationType: integrationSchema,
      nangoConnectionId: z.string(),
    }),
  ),
  async (c) => {
    const { integrationType, nangoConnectionId } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const meta = INTEGRATION_META[integrationType as IntegrationType];
    if (!meta) return c.json({ error: "Unknown integration type" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    // Upsert by querying first
    const [existing] = await db
      .select({ id: integrationConnections.id })
      .from(integrationConnections)
      .where(
        and(
          eq(integrationConnections.workspace_id, workspace.id),
          eq(
            integrationConnections.integration_type,
            integrationType as IntegrationType,
          ),
        ),
      );

    let connectionId: string;
    if (existing) {
      connectionId = existing.id;
      await db
        .update(integrationConnections)
        .set({ nango_connection_id: nangoConnectionId, status: "idle" })
        .where(eq(integrationConnections.id, connectionId));
    } else {
      connectionId = uuidv4();
      await db.insert(integrationConnections).values({
        id: connectionId,
        workspace_id: workspace.id,
        integration_type: integrationType as IntegrationType,
        nango_connection_id: nangoConnectionId,
        nango_provider_config_key: meta.nangoProvider,
        status: "idle",
      });
    }

    const syncJobId = uuidv4();
    const job = await syncQueue.add("sync", {
      syncJobId,
      workspaceId: workspace.id,
      connectionId,
      integrationType,
      nangoConnectionId,
      nangoProviderConfigKey: meta.nangoProvider,
    });

    await db.insert(syncJobs).values({
      id: syncJobId,
      workspace_id: workspace.id,
      connection_id: connectionId,
      job_type: "sync_integration",
      bullmq_job_id: job.id ?? "",
      status: "queued",
    });

    return c.json({ ok: true, connectionId });
  },
);

integrations.post(
  "/disconnect",
  zValidator("json", z.object({ integrationType: z.string() })),
  async (c) => {
    const { integrationType } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    await deleteBySourceType(workspace.id, integrationType as IntegrationType);
    await db
      .delete(sourceChunks)
      .where(
        and(
          eq(sourceChunks.workspace_id, workspace.id),
          eq(sourceChunks.source_type, integrationType as IntegrationType),
        ),
      );
    await db
      .delete(integrationConnections)
      .where(
        and(
          eq(integrationConnections.workspace_id, workspace.id),
          eq(
            integrationConnections.integration_type,
            integrationType as IntegrationType,
          ),
        ),
      );

    return c.json({ ok: true });
  },
);

integrations.get("/sync-log", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const jobs = await db
    .select({
      id: syncJobs.id,
      job_type: syncJobs.job_type,
      status: syncJobs.status,
      error_message: syncJobs.error_message,
      started_at: syncJobs.started_at,
      completed_at: syncJobs.completed_at,
      created_at: syncJobs.created_at,
      connection_id: syncJobs.connection_id,
    })
    .from(syncJobs)
    .where(eq(syncJobs.workspace_id, workspace.id))
    .orderBy(desc(syncJobs.created_at))
    .limit(50);

  const connections = await db
    .select({
      id: integrationConnections.id,
      integration_type: integrationConnections.integration_type,
    })
    .from(integrationConnections)
    .where(eq(integrationConnections.workspace_id, workspace.id));

  const connMap = new Map(
    connections.map((conn) => [conn.id, conn.integration_type]),
  );

  return c.json(
    jobs.map((j) => ({
      ...j,
      integration_type: j.connection_id
        ? (connMap.get(j.connection_id) ?? null)
        : null,
    })),
  );
});

integrations.post(
  "/sync",
  zValidator("json", z.object({ integrationType: integrationSchema })),
  async (c) => {
    const { integrationType } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    const [connection] = await db
      .select()
      .from(integrationConnections)
      .where(
        and(
          eq(integrationConnections.workspace_id, workspace.id),
          eq(
            integrationConnections.integration_type,
            integrationType as IntegrationType,
          ),
        ),
      );

    if (!connection) return c.json({ error: "Integration not connected" }, 404);

    const syncJobId = uuidv4();
    const job = await syncQueue.add("sync", {
      syncJobId,
      workspaceId: workspace.id,
      connectionId: connection.id,
      integrationType,
      nangoConnectionId: connection.nango_connection_id,
      nangoProviderConfigKey: connection.nango_provider_config_key,
    });

    await db.insert(syncJobs).values({
      id: syncJobId,
      workspace_id: workspace.id,
      connection_id: connection.id,
      job_type: "sync_integration",
      bullmq_job_id: job.id ?? "",
      status: "queued",
    });

    return c.json({ ok: true, jobId: job.id });
  },
);
