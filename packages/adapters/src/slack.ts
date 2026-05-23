import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface SlackChannel {
  id: string;
  name: string;
  is_private: boolean;
  is_archived: boolean;
  num_members: number;
}

interface SlackMessage {
  ts: string;
  user?: string;
  bot_id?: string;
  text: string;
  thread_ts?: string;
  reply_count?: number;
  reactions?: Array<{ name: string; count: number }>;
  subtype?: string;
}

interface SlackChannelsResponse {
  ok: boolean;
  channels: SlackChannel[];
  response_metadata?: { next_cursor?: string };
}

interface SlackHistoryResponse {
  ok: boolean;
  messages: SlackMessage[];
  has_more: boolean;
  response_metadata?: { next_cursor?: string };
}

interface SlackRepliesResponse {
  ok: boolean;
  messages: SlackMessage[];
  has_more: boolean;
  response_metadata?: { next_cursor?: string };
}

interface SlackUsersResponse {
  ok: boolean;
  members: Array<{ id: string; profile: { email?: string }; is_bot: boolean }>;
  response_metadata?: { next_cursor?: string };
}

export const slackAdapter: IntegrationAdapter = {
  type: "slack",
  authorityTier: 4,

  async *fetchDocuments(nangoFetch, workspaceId) {
    const botUserIds = await fetchBotUserIds(nangoFetch);
    let channelCursor: string | undefined;

    do {
      const params = new URLSearchParams({ limit: "200", types: "public_channel,private_channel" });
      if (channelCursor) params.set("cursor", channelCursor);

      const res = await nangoFetch(`https://slack.com/api/conversations.list?${params}`);
      const data = (await res.json()) as SlackChannelsResponse;
      channelCursor = data.response_metadata?.next_cursor || undefined;

      for (const channel of data.channels ?? []) {
        if (channel.is_archived) continue;

        yield* fetchChannelDocuments(nangoFetch, workspaceId, channel, botUserIds);
      }
    } while (channelCursor);
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "slack",
        source_id: doc.id,
        source_url: doc.url,
        source_title: doc.title,
        source_authority_tier: 4,
        author_role: doc.authorRole,
        author_id: doc.authorId,
        created_at: doc.createdAt,
        updated_at: doc.updatedAt,
        permission_groups: doc.permissionGroups,
        document_type: doc.documentType,
        freshness_score: freshnessScore(doc.updatedAt),
        engagement_signals: doc.engagementSignals,
        is_official: doc.isOfficial,
        section_hierarchy: chunk.sectionHierarchy,
      },
    }));
  },

  buildMetadata(workspaceId, doc, chunk, totalChunks): ChunkMetadata {
    return {
      workspace_id: workspaceId,
      source_type: "slack",
      source_id: doc.id,
      source_url: doc.url,
      source_title: doc.title,
      source_authority_tier: 4,
      author_role: doc.authorRole,
      author_id: doc.authorId,
      created_at: doc.createdAt,
      updated_at: doc.updatedAt,
      permission_groups: doc.permissionGroups,
      document_type: doc.documentType,
      freshness_score: freshnessScore(doc.updatedAt),
      engagement_signals: doc.engagementSignals,
      is_official: doc.isOfficial,
      section_hierarchy: chunk.sectionHierarchy,
      chunk_index: chunk.index,
      total_chunks: totalChunks,
    };
  },
};

async function* fetchChannelDocuments(
  nangoFetch: (url: string, opts?: RequestInit) => Promise<Response>,
  workspaceId: string,
  channel: SlackChannel,
  botUserIds: Set<string>,
): AsyncGenerator<RawDocument> {
  // Fetch last 30 days of messages
  const oldest = String(Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000));
  let cursor: string | undefined;
  const threads = new Map<string, SlackMessage[]>();
  let channelLastTs = 0;

  do {
    const params = new URLSearchParams({ channel: channel.id, limit: "200", oldest });
    if (cursor) params.set("cursor", cursor);

    const res = await nangoFetch(`https://slack.com/api/conversations.history?${params}`);
    const data = (await res.json()) as SlackHistoryResponse;
    cursor = data.has_more ? data.response_metadata?.next_cursor : undefined;

    for (const msg of data.messages ?? []) {
      if (!isIndexable(msg, botUserIds)) continue;

      const ts = parseFloat(msg.ts);
      if (ts > channelLastTs) channelLastTs = ts;

      const threadKey = msg.thread_ts ?? msg.ts;
      if (!threads.has(threadKey)) threads.set(threadKey, []);
      threads.get(threadKey)!.push(msg);
    }
  } while (cursor);

  // Fetch replies for threaded messages
  for (const [threadTs, rootMessages] of threads) {
    if (rootMessages[0]?.reply_count && rootMessages[0].reply_count > 0) {
      const replies = await fetchThreadReplies(nangoFetch, channel.id, threadTs, botUserIds);
      for (const reply of replies) {
        if (!rootMessages.find((m) => m.ts === reply.ts)) {
          rootMessages.push(reply);
        }
      }
    }

    rootMessages.sort((a, b) => parseFloat(a.ts) - parseFloat(b.ts));

    const text = rootMessages.map((m) => `${m.user ?? "bot"}: ${m.text}`).join("\n---\n");
    if (!text.trim()) continue;

    const firstMsg = rootMessages[0];
    const lastMsg = rootMessages[rootMessages.length - 1];
    const engagementSignals = rootMessages.reduce(
      (sum, m) => sum + (m.reactions?.reduce((r, rx) => r + rx.count, 0) ?? 0),
      0,
    );

    const isPrivate = channel.is_private;
    const permissionGroups = isPrivate
      ? [`workspace:${workspaceId}`, `slack_channel:${channel.id}`]
      : [`workspace:${workspaceId}`];

    const docId = `slack_${channel.id}_${threadTs}`;
    const url = `https://slack.com/archives/${channel.id}/p${threadTs.replace(".", "")}`;

    yield {
      id: docId,
      title: `#${channel.name}: ${firstMsg?.text?.slice(0, 80) ?? "thread"}`,
      url,
      text,
      authorId: firstMsg?.user ?? "unknown",
      authorRole: "other",
      createdAt: Math.floor(parseFloat(firstMsg?.ts ?? "0")),
      updatedAt: Math.floor(parseFloat(lastMsg?.ts ?? "0")),
      permissionGroups,
      documentType: "conversation",
      engagementSignals,
      isOfficial: false,
    } satisfies RawDocument;
  }
}

async function fetchThreadReplies(
  nangoFetch: (url: string, opts?: RequestInit) => Promise<Response>,
  channelId: string,
  threadTs: string,
  botUserIds: Set<string>,
): Promise<SlackMessage[]> {
  const replies: SlackMessage[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ channel: channelId, ts: threadTs, limit: "200" });
    if (cursor) params.set("cursor", cursor);

    const res = await nangoFetch(`https://slack.com/api/conversations.replies?${params}`);
    const data = (await res.json()) as SlackRepliesResponse;
    cursor = data.has_more ? data.response_metadata?.next_cursor : undefined;

    for (const msg of data.messages ?? []) {
      if (isIndexable(msg, botUserIds)) replies.push(msg);
    }
  } while (cursor);

  return replies;
}

async function fetchBotUserIds(
  nangoFetch: (url: string, opts?: RequestInit) => Promise<Response>,
): Promise<Set<string>> {
  const botIds = new Set<string>();
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams({ limit: "200" });
    if (cursor) params.set("cursor", cursor);

    const res = await nangoFetch(`https://slack.com/api/users.list?${params}`);
    const data = (await res.json()) as SlackUsersResponse;
    cursor = data.response_metadata?.next_cursor || undefined;

    for (const member of data.members ?? []) {
      if (member.is_bot) botIds.add(member.id);
    }
  } while (cursor);

  return botIds;
}

function isIndexable(msg: SlackMessage, botUserIds: Set<string>): boolean {
  if (msg.subtype) return false;
  if (!msg.text?.trim()) return false;
  if (msg.bot_id) return false;
  if (msg.user && botUserIds.has(msg.user)) return false;
  return true;
}
