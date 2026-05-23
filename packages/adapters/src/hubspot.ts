import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface HsRecord {
  id: string;
  properties: Record<string, string | null>;
  createdAt: string;
  updatedAt: string;
}
interface HsResponse { results: HsRecord[]; paging?: { next?: { after: string } }; }

const HS_CONTACT_PROPS = ["firstname", "lastname", "email", "jobtitle", "notes_last_contacted"];
const HS_DEAL_PROPS = ["dealname", "amount", "dealstage", "description", "closedate"];
const HS_COMPANY_PROPS = ["name", "domain", "description", "industry"];

function buildText(type: string, props: Record<string, string | null>): string {
  const lines: string[] = [`[HubSpot ${type}]`];
  for (const [k, v] of Object.entries(props)) {
    if (v?.trim()) lines.push(`${k}: ${v}`);
  }
  return lines.join("\n");
}

async function* fetchHsObjects(
  nangoFetch: (url: string, opts?: RequestInit) => Promise<Response>,
  objectType: string,
  properties: string[],
  workspaceId: string,
  docType: "other",
  titleFn: (p: Record<string, string | null>) => string,
): AsyncGenerator<RawDocument> {
  let after: string | undefined;
  while (true) {
    const body = JSON.stringify({
      limit: 100,
      properties,
      after,
      sorts: [{ propertyName: "hs_lastmodifieddate", direction: "DESCENDING" }],
    });
    const res = await nangoFetch(`https://api.hubapi.com/crm/v3/objects/${objectType}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
    });
    const data = (await res.json()) as HsResponse;
    if (!data.results?.length) break;

    for (const record of data.results) {
      const text = buildText(objectType, record.properties);
      yield {
        id: `${objectType}:${record.id}`,
        title: titleFn(record.properties),
        url: `https://app.hubspot.com/${objectType}/${record.id}`,
        text,
        authorId: "hubspot",
        authorRole: "sales",
        createdAt: Math.floor(new Date(record.createdAt).getTime() / 1000),
        updatedAt: Math.floor(new Date(record.updatedAt).getTime() / 1000),
        permissionGroups: [`workspace:${workspaceId}`],
        documentType: docType,
        engagementSignals: 0,
        isOfficial: false,
      } satisfies RawDocument;
    }
    if (!data.paging?.next?.after) break;
    after = data.paging.next.after;
  }
}

export const hubspotAdapter: IntegrationAdapter = {
  type: "hubspot",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    yield* fetchHsObjects(nangoFetch, "contacts", HS_CONTACT_PROPS, workspaceId, "other",
      (p) => `${p.firstname ?? ""} ${p.lastname ?? ""}`.trim() || (p.email ?? "Contact"));

    yield* fetchHsObjects(nangoFetch, "deals", HS_DEAL_PROPS, workspaceId, "other",
      (p) => p.dealname ?? "Deal");

    yield* fetchHsObjects(nangoFetch, "companies", HS_COMPANY_PROPS, workspaceId, "other",
      (p) => p.name ?? "Company");
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "hubspot",
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
      source_type: "hubspot",
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
