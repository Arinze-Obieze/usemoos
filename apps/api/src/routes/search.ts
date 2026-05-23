import { zValidator } from "@hono/zod-validator";
import { getDb } from "@usemoos/db";
import { rankAndFilter, rerank, retrieve, synthesize } from "@usemoos/lib/rag";
import {
  DEFAULT_AUTHORITY_WEIGHTS,
  DEFAULT_MODEL,
  type IntegrationType,
  type ModelId,
} from "@usemoos/types";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { z } from "zod";
import { ensureWorkspace } from "../lib/workspaces.js";

type AuthEnv = { Variables: { userId: string; orgId: string | null } };

export const search = new Hono<AuthEnv>();

const SOURCE_TYPE_VALUES = [
  "google_drive",
  "notion",
  "slack",
  "github",
  "confluence",
  "jira",
  "linear",
  "asana",
  "clickup",
  "hubspot",
  "salesforce",
  "zendesk",
  "microsoft_teams",
  "sharepoint",
  "trello",
  "dropbox",
  "upload",
] as const satisfies ReadonlyArray<IntegrationType | "upload">;

search.post(
  "/",
  zValidator(
    "json",
    z.object({
      query: z.string().min(1).max(2000),
      sourceTypes: z.array(z.enum(SOURCE_TYPE_VALUES)).optional(),
      model: z.string().optional(),
    }),
  ),
  async (c) => {
    const { query, sourceTypes, model } = c.req.valid("json");
    const userId = c.get("userId");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    const effectiveModel = (model ??
      workspace.preferred_model ??
      DEFAULT_MODEL) as ModelId;
    const weights =
      (workspace.authority_weights as
        | typeof DEFAULT_AUTHORITY_WEIGHTS
        | null) ?? DEFAULT_AUTHORITY_WEIGHTS;
    const threshold = workspace.confidence_threshold ?? 40;

    const permissionGroups = [`workspace:${workspace.id}`, `user:${userId}`];

    const rawChunks = await retrieve(workspace.id, query, {
      topK: 40,
      permissionGroups,
      sourceTypes,
    });

    const reranked = await rerank(query, rawChunks);
    const scored = rankAndFilter(reranked, weights, threshold);

    return streamSSE(c, async (stream) => {
      for await (const chunk of synthesize(query, scored, effectiveModel, [])) {
        if (chunk.type === "text") {
          await stream.writeSSE({
            data: JSON.stringify({ type: "text", text: chunk.text }),
          });
        } else if (chunk.type === "citations") {
          await stream.writeSSE({
            data: JSON.stringify({
              type: "citations",
              citations: chunk.citations,
            }),
          });
        } else {
          await stream.writeSSE({ data: JSON.stringify({ type: "done" }) });
        }
      }
    });
  },
);
