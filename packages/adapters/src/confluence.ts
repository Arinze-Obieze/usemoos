import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface ConfSpace { key: string; name: string; type: string; }
interface ConfPage {
  id: string; title: string; type: string;
  _links: { webui: string };
  version: { when: string; by?: { accountId: string } };
  history: { createdDate: string; createdBy?: { accountId: string } };
  body?: { storage?: { value: string } };
}
interface ConfResults<T> { results: T[]; _links: { next?: string }; }

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export const confluenceAdapter: IntegrationAdapter = {
  type: "confluence",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    const sRes = await nangoFetch(
      "https://api.atlassian.com/ex/confluence/cloud/rest/api/space?limit=100&type=global",
    );
    const spaces = (await sRes.json()) as ConfResults<ConfSpace>;

    for (const space of spaces.results) {
      let start = 0;
      while (true) {
        const url = `https://api.atlassian.com/ex/confluence/cloud/rest/api/content?spaceKey=${space.key}&type=page&limit=100&start=${start}&expand=body.storage,version,history`;
        const pRes = await nangoFetch(url);
        const data = (await pRes.json()) as ConfResults<ConfPage>;
        if (!data.results?.length) break;

        for (const page of data.results) {
          const html = page.body?.storage?.value ?? "";
          const text = `${page.title}\n\n${stripHtml(html)}`.trim();
          if (!text) continue;

          const authorId =
            page.version.by?.accountId ??
            page.history.createdBy?.accountId ??
            "unknown";

          yield {
            id: page.id,
            title: page.title,
            url: `https://your-domain.atlassian.net/wiki${page._links.webui}`,
            text,
            authorId,
            authorRole: "other",
            createdAt: Math.floor(new Date(page.history.createdDate).getTime() / 1000),
            updatedAt: Math.floor(new Date(page.version.when).getTime() / 1000),
            permissionGroups: [`workspace:${workspaceId}`],
            documentType: "doc",
            engagementSignals: 0,
            isOfficial: space.type === "global",
          } satisfies RawDocument;
        }
        if (data.results.length < 100) break;
        start += 100;
      }
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "confluence",
        source_id: doc.id,
        source_url: doc.url,
        source_title: doc.title,
        source_authority_tier: doc.isOfficial ? 1 : 2,
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
      source_type: "confluence",
      source_id: doc.id,
      source_url: doc.url,
      source_title: doc.title,
      source_authority_tier: doc.isOfficial ? 1 : 2,
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
