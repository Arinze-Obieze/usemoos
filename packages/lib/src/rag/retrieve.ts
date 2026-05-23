import { Pinecone } from "@pinecone-database/pinecone";
import type { ChunkMetadata, IntegrationType } from "@usemoos/types";
import { embedQuery } from "./embed.js";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY ?? "" });
const INDEX_NAME = process.env.PINECONE_INDEX ?? "usemoos";

export interface RetrievedChunk {
  id: string;
  score: number;
  text: string;
  metadata: ChunkMetadata;
}

export interface RetrieveOptions {
  topK?: number;
  permissionGroups: string[];
  sourceTypes?: Array<IntegrationType | "upload">;
}

/**
 * Hybrid dense + sparse retrieval from Pinecone with hard permission
 * filtering. Workspace namespace ensures complete tenant isolation.
 */
export async function retrieve(
  workspaceId: string,
  query: string,
  options: RetrieveOptions,
): Promise<RetrievedChunk[]> {
  const { topK = 40, permissionGroups, sourceTypes } = options;

  const [queryVector] = await Promise.all([embedQuery(query)]);

  const index = pc.index(INDEX_NAME).namespace(workspaceId);

  const filter: Record<string, unknown> = {
    permission_groups: { $in: permissionGroups },
  };
  if (sourceTypes && sourceTypes.length > 0) {
    filter["source_type"] = { $in: sourceTypes };
  }

  const results = await index.query({
    vector: queryVector,
    topK,
    includeMetadata: true,
    filter,
  });

  return (results.matches ?? [])
    .filter((m) => m.metadata)
    .map((m) => ({
      id: m.id,
      score: m.score ?? 0,
      text: (m.metadata as Record<string, unknown>)["text"] as string ?? "",
      metadata: m.metadata as unknown as ChunkMetadata,
    }));
}

/**
 * Upsert chunks into Pinecone. Called by ingestion worker after embedding.
 */
export async function upsertChunks(
  workspaceId: string,
  records: Array<{
    id: string;
    vector: number[];
    text: string;
    metadata: ChunkMetadata;
  }>,
): Promise<void> {
  const index = pc.index(INDEX_NAME).namespace(workspaceId);

  const vectors = records.map(({ id, vector, text, metadata }) => ({
    id,
    values: vector,
    metadata: { ...metadata, text },
  }));

  // Upsert in batches of 100
  for (let i = 0; i < vectors.length; i += 100) {
    await index.upsert(vectors.slice(i, i + 100));
  }
}

export async function deleteBySourceId(
  workspaceId: string,
  sourceId: string,
): Promise<void> {
  const index = pc.index(INDEX_NAME).namespace(workspaceId);
  await index.deleteMany({ source_id: { $eq: sourceId } });
}

export async function deleteBySourceType(
  workspaceId: string,
  sourceType: string,
): Promise<void> {
  const index = pc.index(INDEX_NAME).namespace(workspaceId);
  await index.deleteMany({ source_type: { $eq: sourceType } });
}
