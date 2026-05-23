import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface SpSite { id: string; displayName: string; webUrl: string; }
interface SpPage {
  id: string; name: string; title: string; webUrl: string;
  createdBy?: { user?: { id: string } };
  createdDateTime: string; lastModifiedDateTime: string;
}
interface SpPageContent { canvasLayout?: { horizontalSections?: Array<{ columns?: Array<{ webparts?: Array<{ innerHtml?: string }> }> }> }; }
interface MsResponse<T> { value: T[]; "@odata.nextLink"?: string; }

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

function extractPageText(content: SpPageContent): string {
  const lines: string[] = [];
  for (const section of content.canvasLayout?.horizontalSections ?? []) {
    for (const col of section.columns ?? []) {
      for (const part of col.webparts ?? []) {
        if (part.innerHtml) lines.push(stripHtml(part.innerHtml));
      }
    }
  }
  return lines.join("\n");
}

export const sharepointAdapter: IntegrationAdapter = {
  type: "sharepoint",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    let sitesUrl: string | null = "https://graph.microsoft.com/v1.0/sites?search=*";
    const sites: SpSite[] = [];
    while (sitesUrl) {
      const res = await nangoFetch(sitesUrl);
      const data = (await res.json()) as MsResponse<SpSite>;
      sites.push(...data.value);
      sitesUrl = data["@odata.nextLink"] ?? null;
    }

    for (const site of sites) {
      let pagesUrl: string | null =
        `https://graph.microsoft.com/v1.0/sites/${site.id}/pages?$orderby=lastModifiedDateTime desc&$top=100`;

      while (pagesUrl) {
        const pRes = await nangoFetch(pagesUrl);
        const pData = (await pRes.json()) as MsResponse<SpPage>;

        for (const page of pData.value) {
          const contentRes = await nangoFetch(
            `https://graph.microsoft.com/v1.0/sites/${site.id}/pages/${page.id}?$expand=canvasLayout`,
          );
          const content = (await contentRes.json()) as SpPageContent;
          const bodyText = extractPageText(content);
          const text = `${page.title ?? page.name}\n\n${bodyText}`.trim();
          if (!text) continue;

          yield {
            id: `${site.id}:${page.id}`,
            title: page.title ?? page.name,
            url: page.webUrl,
            text,
            authorId: page.createdBy?.user?.id ?? "unknown",
            authorRole: "other",
            createdAt: Math.floor(new Date(page.createdDateTime).getTime() / 1000),
            updatedAt: Math.floor(new Date(page.lastModifiedDateTime).getTime() / 1000),
            permissionGroups: [`workspace:${workspaceId}`],
            documentType: "doc",
            engagementSignals: 0,
            isOfficial: true,
          } satisfies RawDocument;
        }
        pagesUrl = pData["@odata.nextLink"] ?? null;
      }
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "sharepoint",
        source_id: doc.id,
        source_url: doc.url,
        source_title: doc.title,
        source_authority_tier: 2,
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
      source_type: "sharepoint",
      source_id: doc.id,
      source_url: doc.url,
      source_title: doc.title,
      source_authority_tier: 2,
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
