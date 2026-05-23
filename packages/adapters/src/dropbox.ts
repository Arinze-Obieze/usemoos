import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface DbxEntry {
  ".tag": "file" | "folder";
  id: string; name: string; path_display: string;
  server_modified?: string; client_modified?: string;
  size?: number;
}
interface DbxListResponse { entries: DbxEntry[]; cursor: string; has_more: boolean; }

const TEXT_EXTENSIONS = new Set([".txt", ".md", ".csv", ".json", ".xml", ".html", ".htm", ".rst"]);

function hasTextExtension(name: string): boolean {
  const ext = name.slice(name.lastIndexOf(".")).toLowerCase();
  return TEXT_EXTENSIONS.has(ext);
}

export const dropboxAdapter: IntegrationAdapter = {
  type: "dropbox",
  authorityTier: 3,

  async *fetchDocuments(nangoFetch, workspaceId) {
    let cursor: string | null = null;

    while (true) {
      const res = cursor
        ? await nangoFetch("https://api.dropboxapi.com/2/files/list_folder/continue", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cursor }),
          })
        : await nangoFetch("https://api.dropboxapi.com/2/files/list_folder", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ path: "", recursive: true, include_media_info: false, limit: 1000 }),
          });

      const data = (await res.json()) as DbxListResponse;

      for (const entry of data.entries) {
        if (entry[".tag"] !== "file") continue;
        if (!hasTextExtension(entry.name)) continue;
        if ((entry.size ?? 0) > 5 * 1024 * 1024) continue;

        let text = "";
        try {
          const dlRes = await nangoFetch("https://content.dropboxapi.com/2/files/download", {
            method: "POST",
            headers: { "Dropbox-API-Arg": JSON.stringify({ path: entry.id }) },
          });
          text = await dlRes.text();
        } catch {
          continue;
        }
        if (!text.trim()) continue;

        const modifiedAt = entry.server_modified ?? entry.client_modified ?? new Date().toISOString();
        const ts = Math.floor(new Date(modifiedAt).getTime() / 1000);

        yield {
          id: entry.id,
          title: entry.name,
          url: `https://www.dropbox.com/home${entry.path_display}`,
          text: `${entry.name}\n\n${text}`.trim(),
          authorId: "dropbox",
          authorRole: "other",
          createdAt: ts,
          updatedAt: ts,
          permissionGroups: [`workspace:${workspaceId}`],
          documentType: "doc",
          engagementSignals: 0,
          isOfficial: false,
        } satisfies RawDocument;
      }

      if (!data.has_more) break;
      cursor = data.cursor;
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "dropbox",
        source_id: doc.id,
        source_url: doc.url,
        source_title: doc.title,
        source_authority_tier: 3,
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
      source_type: "dropbox",
      source_id: doc.id,
      source_url: doc.url,
      source_title: doc.title,
      source_authority_tier: 3,
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
