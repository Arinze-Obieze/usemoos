import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const EMBEDDING_MODEL = "text-embedding-3-large";
const EMBEDDING_DIMS = 3072;

export { EMBEDDING_DIMS };

/**
 * Embed a single string. Used at query time.
 */
export async function embedQuery(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.slice(0, 8000), // stay well within token limit
  });
  return response.data[0]?.embedding ?? [];
}

/**
 * Batch embed up to 100 strings. Used during ingestion.
 * Pinecone recommends batches of 100 for upserts.
 */
export async function embedBatch(texts: string[]): Promise<number[][]> {
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += 100) {
    batches.push(texts.slice(i, i + 100));
  }

  const results: number[][] = [];
  for (const batch of batches) {
    const response = await openai.embeddings.create({
      model: EMBEDDING_MODEL,
      input: batch.map((t) => t.slice(0, 8000)),
    });
    results.push(...response.data.map((d) => d.embedding));
  }
  return results;
}
