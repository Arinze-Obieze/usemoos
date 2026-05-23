import { CohereClient } from "cohere-ai";
import type { RetrievedChunk } from "./retrieve.js";

const cohere = new CohereClient({ token: process.env.COHERE_API_KEY ?? "" });

/**
 * Re-rank retrieved chunks using Cohere Rerank for semantic quality.
 * Returns the top N chunks ordered by Cohere's relevance score.
 */
export async function rerank(
  query: string,
  chunks: RetrievedChunk[],
  topN = 15,
): Promise<RetrievedChunk[]> {
  if (chunks.length === 0) return [];
  if (chunks.length <= topN) return chunks;

  const response = await cohere.rerank({
    model: "rerank-v3.5",
    query,
    documents: chunks.map((c) => c.text),
    topN,
    returnDocuments: false,
  });

  return response.results.map((r) => {
    const chunk = chunks[r.index];
    if (!chunk) throw new Error(`Rerank index ${r.index} out of range`);
    return { ...chunk, score: r.relevanceScore };
  });
}
