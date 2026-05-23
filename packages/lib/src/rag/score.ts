import type { AuthorityWeights, ChunkMetadata, DEFAULT_AUTHORITY_WEIGHTS } from "@usemoos/types";
import type { RetrievedChunk } from "./retrieve.js";

const TIER_SCORE: Record<number, number> = { 1: 1.0, 2: 0.75, 3: 0.5, 4: 0.25 };
const ROLE_SCORE: Record<string, number> = {
  executive: 1.0,
  manager: 0.85,
  engineer: 0.75,
  designer: 0.65,
  sales: 0.6,
  support: 0.55,
  other: 0.5,
};
const DOC_TYPE_BOOST: Record<string, number> = {
  policy: 1.0,
  architecture: 0.95,
  doc: 0.85,
  pr: 0.75,
  ticket: 0.7,
  conversation: 0.55,
  spreadsheet: 0.6,
  code: 0.7,
  other: 0.5,
};

/**
 * Recency decay: full score for content < 30 days old, half-life of 180 days.
 */
function recencyScore(updatedAt: number): number {
  const ageMs = Date.now() - updatedAt * 1000;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.exp((-ageDays * Math.LN2) / 180);
}

/**
 * Composite authority score combining Cohere relevance with domain signals.
 * Weights are workspace-configurable.
 */
export function authorityScore(
  chunk: RetrievedChunk,
  weights: AuthorityWeights,
): number {
  const m = chunk.metadata;

  const semantic    = chunk.score; // already 0-1 from Cohere
  const tier        = TIER_SCORE[m.source_authority_tier] ?? 0.5;
  const recency     = recencyScore(m.updated_at);
  const role        = ROLE_SCORE[m.author_role] ?? 0.5;
  const docType     = DOC_TYPE_BOOST[m.document_type] ?? 0.5;
  const engagement  = Math.min(m.engagement_signals / 100, 1);

  const official_boost = m.is_official ? 1.15 : 1.0;

  const raw =
    weights.semantic_relevance    * semantic  +
    weights.source_authority_tier * tier      +
    weights.recency_decay         * recency   +
    weights.role_relevance        * role      +
    weights.document_type_boost   * docType   +
    weights.engagement_signals    * engagement;

  return Math.min(raw * official_boost, 1);
}

/**
 * Sort chunks by composite authority score and apply confidence threshold.
 * threshold is 0-100 (stored in DB as integer, e.g. 40 = 0.40).
 */
export function rankAndFilter(
  chunks: RetrievedChunk[],
  weights: AuthorityWeights,
  confidenceThreshold: number,
): RetrievedChunk[] {
  const threshold = confidenceThreshold / 100;

  return chunks
    .map((c) => ({ ...c, score: authorityScore(c, weights) }))
    .filter((c) => c.score >= threshold)
    .sort((a, b) => b.score - a.score);
}
