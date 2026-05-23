import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  modifiedTime: string;
  createdTime: string;
  owners?: Array<{ emailAddress: string }>;
  permissions?: Array<{ emailAddress?: string; type: string; role: string }>;
}

interface DriveFilesResponse {
  files: DriveFile[];
  nextPageToken?: string;
}

// Google Docs / Sheets / Slides → export as plain text
const EXPORTABLE_MIME: Record<string, string> = {
  "application/vnd.google-apps.document":     "text/plain",
  "application/vnd.google-apps.spreadsheet":  "text/csv",
  "application/vnd.google-apps.presentation": "text/plain",
};

export const googleDriveAdapter: IntegrationAdapter = {
  type: "google_drive",
  authorityTier: 3,

  async *fetchDocuments(nangoFetch, workspaceId) {
    let pageToken: string | undefined;

    do {
      const params = new URLSearchParams({
        pageSize: "100",
        fields: "nextPageToken,files(id,name,mimeType,webViewLink,modifiedTime,createdTime,owners,permissions)",
        q: "trashed=false",
      });
      if (pageToken) params.set("pageToken", pageToken);

      const res = await nangoFetch(
        `https://www.googleapis.com/drive/v3/files?${params}`,
      );
      const data = (await res.json()) as DriveFilesResponse;
      pageToken = data.nextPageToken;

      for (const file of data.files ?? []) {
        const exportMime = EXPORTABLE_MIME[file.mimeType];
        let text = "";

        if (exportMime) {
          const exportRes = await nangoFetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}/export?mimeType=${encodeURIComponent(exportMime)}`,
          );
          text = await exportRes.text();
        } else if (file.mimeType === "text/plain") {
          const dlRes = await nangoFetch(
            `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`,
          );
          text = await dlRes.text();
        }

        if (!text.trim()) continue;

        const permissionGroups = extractPermissionGroups(file, workspaceId);

        yield {
          id: file.id,
          title: file.name,
          url: file.webViewLink ?? "",
          text,
          authorId: file.owners?.[0]?.emailAddress ?? "unknown",
          authorRole: "other",
          createdAt: Math.floor(new Date(file.createdTime).getTime() / 1000),
          updatedAt: Math.floor(new Date(file.modifiedTime).getTime() / 1000),
          permissionGroups,
          documentType: mimeToDocType(file.mimeType),
          engagementSignals: 0,
          isOfficial: false,
        } satisfies RawDocument;
      }
    } while (pageToken);
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "google_drive",
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
      source_type: "google_drive",
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

function mimeToDocType(mime: string): RawDocument["documentType"] {
  if (mime.includes("document")) return "doc";
  if (mime.includes("spreadsheet")) return "spreadsheet";
  if (mime.includes("presentation")) return "doc";
  return "other";
}

function extractPermissionGroups(file: DriveFile, workspaceId: string): string[] {
  const groups = [`workspace:${workspaceId}`];
  for (const perm of file.permissions ?? []) {
    if (perm.type === "domain") groups.push(`domain:${workspaceId}`);
    if (perm.type === "user" && perm.emailAddress) groups.push(`user:${perm.emailAddress}`);
    if (perm.type === "anyone") groups.push("public");
  }
  return [...new Set(groups)];
}
