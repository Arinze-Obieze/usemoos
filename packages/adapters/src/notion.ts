import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface NotionPage {
  id: string;
  url: string;
  created_time: string;
  last_edited_time: string;
  created_by: { id: string };
  properties: Record<string, unknown>;
  parent: { type: string; workspace?: boolean; page_id?: string; database_id?: string };
}

interface NotionSearchResponse {
  results: NotionPage[];
  next_cursor?: string;
  has_more: boolean;
}

interface NotionBlock {
  type: string;
  [key: string]: unknown;
}

export const notionAdapter: IntegrationAdapter = {
  type: "notion",
  authorityTier: 3,

  async *fetchDocuments(nangoFetch, workspaceId) {
    let cursor: string | undefined;

    do {
      const body: Record<string, unknown> = {
        filter: { value: "page", property: "object" },
        page_size: 100,
      };
      if (cursor) body["start_cursor"] = cursor;

      const res = await nangoFetch("https://api.notion.com/v1/search", {
        method: "POST",
        headers: { "Notion-Version": "2022-06-28", "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as NotionSearchResponse;
      cursor = data.has_more ? data.next_cursor : undefined;

      for (const page of data.results) {
        const text = await fetchPageText(nangoFetch, page.id);
        if (!text.trim()) continue;

        const title = extractPageTitle(page);
        const isOfficial = page.parent.workspace === true;

        yield {
          id: page.id,
          title,
          url: page.url,
          text,
          authorId: page.created_by.id,
          authorRole: "other",
          createdAt: Math.floor(new Date(page.created_time).getTime() / 1000),
          updatedAt: Math.floor(new Date(page.last_edited_time).getTime() / 1000),
          permissionGroups: [`workspace:${workspaceId}`],
          documentType: "doc",
          engagementSignals: 0,
          isOfficial,
        } satisfies RawDocument;
      }
    } while (cursor);
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "notion",
        source_id: doc.id,
        source_url: doc.url,
        source_title: doc.title,
        source_authority_tier: doc.isOfficial ? 1 : 3,
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
      source_type: "notion",
      source_id: doc.id,
      source_url: doc.url,
      source_title: doc.title,
      source_authority_tier: doc.isOfficial ? 1 : 3,
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

async function fetchPageText(
  nangoFetch: (url: string, opts?: RequestInit) => Promise<Response>,
  pageId: string,
): Promise<string> {
  const lines: string[] = [];
  let cursor: string | undefined;

  do {
    const url = `https://api.notion.com/v1/blocks/${pageId}/children?page_size=100${cursor ? `&start_cursor=${cursor}` : ""}`;
    const res = await nangoFetch(url, {
      headers: { "Notion-Version": "2022-06-28" },
    });
    const data = (await res.json()) as { results: NotionBlock[]; has_more: boolean; next_cursor?: string };
    cursor = data.has_more ? data.next_cursor : undefined;

    for (const block of data.results) {
      const text = extractBlockText(block);
      if (text) lines.push(text);
    }
  } while (cursor);

  return lines.join("\n");
}

function extractBlockText(block: NotionBlock): string {
  const richTextTypes = [
    "paragraph", "heading_1", "heading_2", "heading_3",
    "bulleted_list_item", "numbered_list_item", "quote", "callout", "toggle",
  ];
  for (const t of richTextTypes) {
    const content = block[t] as { rich_text?: Array<{ plain_text: string }> } | undefined;
    if (content?.rich_text) {
      const prefix = t === "heading_1" ? "# " : t === "heading_2" ? "## " : t === "heading_3" ? "### " : "";
      return prefix + content.rich_text.map((r) => r.plain_text).join("");
    }
  }
  if (block.type === "code") {
    const code = block["code"] as { rich_text?: Array<{ plain_text: string }>; language?: string } | undefined;
    return code?.rich_text?.map((r) => r.plain_text).join("") ?? "";
  }
  return "";
}

function extractPageTitle(page: NotionPage): string {
  for (const prop of Object.values(page.properties)) {
    const p = prop as { type?: string; title?: Array<{ plain_text: string }> };
    if (p.type === "title" && p.title) {
      return p.title.map((t) => t.plain_text).join("");
    }
  }
  return "Untitled";
}
