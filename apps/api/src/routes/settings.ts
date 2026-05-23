import { zValidator } from "@hono/zod-validator";
import { eq, getDb, workspaces } from "@usemoos/db";
import {
  DEFAULT_AUTHORITY_WEIGHTS,
  MODELS,
  type ModelId,
} from "@usemoos/types";
import { Hono } from "hono";
import { z } from "zod";
import { ensureWorkspace } from "../lib/workspaces.js";

type AuthEnv = { Variables: { userId: string; orgId: string | null } };

export const settings = new Hono<AuthEnv>();

settings.get("/", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  return c.json({
    workspaceId: workspace.id,
    preferredModel: workspace.preferred_model,
    authorityWeights: workspace.authority_weights ?? DEFAULT_AUTHORITY_WEIGHTS,
    confidenceThreshold: workspace.confidence_threshold ?? 40,
    availableModels: Object.values(MODELS),
  });
});

settings.patch(
  "/model",
  zValidator(
    "json",
    z.object({ model: z.enum(Object.keys(MODELS) as [ModelId, ...ModelId[]]) }),
  ),
  async (c) => {
    const { model } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    await ensureWorkspace(db, orgId);
    await db
      .update(workspaces)
      .set({ preferred_model: model })
      .where(eq(workspaces.clerk_org_id, orgId));

    return c.json({ ok: true, model });
  },
);

settings.patch(
  "/authority-weights",
  zValidator(
    "json",
    z.object({
      semantic_relevance: z.number().min(0).max(1).optional(),
      source_authority_tier: z.number().min(0).max(1).optional(),
      recency_decay: z.number().min(0).max(1).optional(),
      role_relevance: z.number().min(0).max(1).optional(),
      document_type_boost: z.number().min(0).max(1).optional(),
      engagement_signals: z.number().min(0).max(1).optional(),
    }),
  ),
  async (c) => {
    const patch = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    const current =
      (workspace.authority_weights as
        | typeof DEFAULT_AUTHORITY_WEIGHTS
        | null) ?? DEFAULT_AUTHORITY_WEIGHTS;
    const updated = { ...current, ...patch };

    await db
      .update(workspaces)
      .set({ authority_weights: updated })
      .where(eq(workspaces.clerk_org_id, orgId));

    return c.json({ ok: true, authorityWeights: updated });
  },
);

settings.patch(
  "/confidence-threshold",
  zValidator("json", z.object({ threshold: z.number().int().min(0).max(100) })),
  async (c) => {
    const { threshold } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    await ensureWorkspace(db, orgId);
    await db
      .update(workspaces)
      .set({ confidence_threshold: threshold })
      .where(eq(workspaces.clerk_org_id, orgId));

    return c.json({ ok: true, threshold });
  },
);
