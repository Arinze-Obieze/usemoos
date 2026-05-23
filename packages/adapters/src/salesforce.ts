import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface SfRecord { Id: string; [key: string]: unknown; }
interface SfQueryResponse { records: SfRecord[]; nextRecordsUrl?: string; done: boolean; }

function soqlUrl(query: string) {
  return `https://login.salesforce.com/services/data/v57.0/query?q=${encodeURIComponent(query)}`;
}

function sfText(type: string, record: SfRecord, fields: string[]): string {
  const lines = [`[Salesforce ${type}]`];
  for (const f of fields) {
    const v = record[f];
    if (typeof v === "string" && v.trim()) lines.push(`${f}: ${v}`);
  }
  return lines.join("\n");
}

async function* fetchSfObject(
  nangoFetch: (url: string, opts?: RequestInit) => Promise<Response>,
  soql: string,
  workspaceId: string,
  type: string,
  fields: string[],
  titleFn: (r: SfRecord) => string,
  urlFn: (r: SfRecord) => string,
): AsyncGenerator<RawDocument> {
  let url: string | null = soqlUrl(soql);
  while (url) {
    const res = await nangoFetch(url);
    const data = (await res.json()) as SfQueryResponse;

    for (const record of data.records) {
      const text = sfText(type, record, fields);
      const updatedAt = record["LastModifiedDate"] as string | undefined;
      const createdAt = record["CreatedDate"] as string | undefined;

      yield {
        id: `${type}:${record.Id}`,
        title: titleFn(record),
        url: urlFn(record),
        text,
        authorId: (record["OwnerId"] as string | undefined) ?? "unknown",
        authorRole: "sales",
        createdAt: Math.floor(new Date(createdAt ?? Date.now()).getTime() / 1000),
        updatedAt: Math.floor(new Date(updatedAt ?? Date.now()).getTime() / 1000),
        permissionGroups: [`workspace:${workspaceId}`],
        documentType: "other",
        engagementSignals: 0,
        isOfficial: false,
      } satisfies RawDocument;
    }
    url = data.done ? null : data.nextRecordsUrl
      ? `https://login.salesforce.com${data.nextRecordsUrl}`
      : null;
  }
}

export const salesforceAdapter: IntegrationAdapter = {
  type: "salesforce",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    yield* fetchSfObject(
      nangoFetch,
      "SELECT Id, Name, Description, Industry, OwnerId, CreatedDate, LastModifiedDate FROM Account ORDER BY LastModifiedDate DESC LIMIT 1000",
      workspaceId, "Account", ["Name", "Description", "Industry"],
      (r) => (r["Name"] as string) ?? "Account",
      (r) => `https://login.salesforce.com/${r.Id}`,
    );

    yield* fetchSfObject(
      nangoFetch,
      "SELECT Id, Name, Description, StageName, Amount, OwnerId, CreatedDate, LastModifiedDate FROM Opportunity ORDER BY LastModifiedDate DESC LIMIT 1000",
      workspaceId, "Opportunity", ["Name", "Description", "StageName"],
      (r) => (r["Name"] as string) ?? "Opportunity",
      (r) => `https://login.salesforce.com/${r.Id}`,
    );

    yield* fetchSfObject(
      nangoFetch,
      "SELECT Id, Subject, Description, Status, OwnerId, CreatedDate, LastModifiedDate FROM Case ORDER BY LastModifiedDate DESC LIMIT 1000",
      workspaceId, "Case", ["Subject", "Description", "Status"],
      (r) => (r["Subject"] as string) ?? "Case",
      (r) => `https://login.salesforce.com/${r.Id}`,
    );
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "salesforce",
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
      source_type: "salesforce",
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
