import { zValidator } from "@hono/zod-validator";
import {
  and,
  asc,
  conversations,
  desc,
  eq,
  getDb,
  messages,
} from "@usemoos/db";
import { rankAndFilter, rerank, retrieve, synthesize } from "@usemoos/lib/rag";
import {
  DEFAULT_AUTHORITY_WEIGHTS,
  DEFAULT_MODEL,
  type ModelId,
} from "@usemoos/types";
import { Hono } from "hono";
import { streamSSE } from "hono/streaming";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { ensureWorkspace } from "../lib/workspaces.js";

type AuthEnv = { Variables: { userId: string; orgId: string | null } };

export const chat = new Hono<AuthEnv>();

chat.get("/conversations", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const convs = await db
    .select()
    .from(conversations)
    .where(eq(conversations.workspace_id, workspace.id))
    .orderBy(desc(conversations.updated_at));

  return c.json(convs);
});

chat.get("/conversations/pinned", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const convs = await db
    .select()
    .from(conversations)
    .where(
      and(
        eq(conversations.workspace_id, workspace.id),
        eq(conversations.is_pinned, true),
      ),
    )
    .orderBy(desc(conversations.updated_at));

  return c.json(convs);
});

chat.get("/activity", async (c) => {
  const userId = c.get("userId");
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  // Return recent conversations from all users, excluding current user, limited to 10
  const allConvs = await db
    .select({
      id: conversations.id,
      title: conversations.title,
      user_id: conversations.user_id,
      user_display_name: conversations.user_display_name,
      updated_at: conversations.updated_at,
    })
    .from(conversations)
    .where(eq(conversations.workspace_id, workspace.id))
    .orderBy(desc(conversations.updated_at))
    .limit(50);

  const activity = allConvs
    .filter(
      (conversation) => conversation.title && conversation.user_id !== userId,
    )
    .slice(0, 10)
    .map(({ user_id: _userId, ...conversation }) => conversation);

  return c.json(activity);
});

chat.get("/conversations/:id/messages", async (c) => {
  const convId = c.req.param("id");
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const [conv] = await db
    .select()
    .from(conversations)
    .where(eq(conversations.id, convId));
  if (!conv || conv.workspace_id !== workspace.id)
    return c.json({ error: "Not found" }, 404);

  const msgs = await db
    .select()
    .from(messages)
    .where(eq(messages.conversation_id, convId))
    .orderBy(asc(messages.created_at));

  return c.json(msgs);
});

chat.patch(
  "/conversations/:id/pin",
  zValidator("json", z.object({ pinned: z.boolean() })),
  async (c) => {
    const convId = c.req.param("id");
    const { pinned } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    const [conv] = await db
      .select()
      .from(conversations)
      .where(eq(conversations.id, convId));
    if (!conv || conv.workspace_id !== workspace.id)
      return c.json({ error: "Not found" }, 404);

    await db
      .update(conversations)
      .set({ is_pinned: pinned })
      .where(eq(conversations.id, convId));

    return c.json({ ok: true, pinned });
  },
);

chat.post(
  "/message",
  zValidator(
    "json",
    z.object({
      conversationId: z.string().uuid().optional(),
      message: z.string().min(1).max(8000),
      model: z.string().optional(),
      userDisplayName: z.string().max(120).optional(),
    }),
  ),
  async (c) => {
    const { conversationId, message, model, userDisplayName } =
      c.req.valid("json");
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

    let convId = conversationId;
    if (!convId) {
      const [conv] = await db
        .insert(conversations)
        .values({
          id: uuidv4(),
          workspace_id: workspace.id,
          user_id: userId,
          user_display_name: userDisplayName ?? null,
          title: message.slice(0, 80),
        })
        .returning();
      if (!conv) return c.json({ error: "Could not create conversation" }, 500);
      convId = conv.id;
    }
    const activeConversationId = convId;

    await db.insert(messages).values({
      id: uuidv4(),
      conversation_id: activeConversationId,
      role: "user",
      content: message,
    });

    const history = await db
      .select()
      .from(messages)
      .where(eq(messages.conversation_id, activeConversationId))
      .orderBy(asc(messages.created_at));

    const conversationHistory = history.slice(-20).map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    const permissionGroups = [`workspace:${workspace.id}`, `user:${userId}`];
    const rawChunks = await retrieve(workspace.id, message, {
      topK: 40,
      permissionGroups,
    });
    const reranked = await rerank(message, rawChunks);
    const scored = rankAndFilter(reranked, weights, threshold);

    const assistantId = uuidv4();
    let fullText = "";
    let citations: unknown[] = [];
    const startMs = Date.now();

    return streamSSE(c, async (stream) => {
      await stream.writeSSE({
        data: JSON.stringify({
          type: "meta",
          conversationId: activeConversationId,
        }),
      });

      for await (const chunk of synthesize(
        message,
        scored,
        effectiveModel,
        conversationHistory,
      )) {
        if (chunk.type === "text") {
          fullText += chunk.text ?? "";
          await stream.writeSSE({
            data: JSON.stringify({ type: "text", text: chunk.text }),
          });
        } else if (chunk.type === "citations") {
          citations = chunk.citations ?? [];
          await stream.writeSSE({
            data: JSON.stringify({ type: "citations", citations }),
          });
        } else {
          await stream.writeSSE({ data: JSON.stringify({ type: "done" }) });
        }
      }

      await db.insert(messages).values({
        id: assistantId,
        conversation_id: activeConversationId,
        role: "assistant",
        content: fullText,
        citations,
        model_used: effectiveModel,
        latency_ms: Date.now() - startMs,
      });
    });
  },
);
