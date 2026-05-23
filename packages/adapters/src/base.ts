import type {
  AuthorRole,
  ChunkMetadata,
  DocumentType,
  IntegrationType,
  SourceAuthorityTier,
} from "@usemoos/types";
import type { Chunk } from "@usemoos/lib/chunking";

export interface RawDocument {
  id: string;
  title: string;
  url: string;
  text: string;
  authorId: string;
  authorRole: AuthorRole;
  createdAt: number;   // unix seconds
  updatedAt: number;
  permissionGroups: string[];
  documentType: DocumentType;
  engagementSignals: number;
  isOfficial: boolean;
}

export interface ProcessedChunk {
  chunk: Chunk;
  metadata: Omit<ChunkMetadata, "chunk_index" | "total_chunks">;
}

export interface IntegrationAdapter {
  type: IntegrationType;
  authorityTier: SourceAuthorityTier;

  /**
   * Fetch all documents accessible via this Nango connection.
   * The adapter receives a pre-authenticated fetch function from Nango.
   */
  fetchDocuments(
    nangoFetch: (url: string, options?: RequestInit) => Promise<Response>,
    workspaceId: string,
  ): AsyncGenerator<RawDocument>;

  /**
   * Chunk a raw document using the strategy appropriate for this source type.
   */
  chunkDocument(doc: RawDocument): ProcessedChunk[];

  /**
   * Build full ChunkMetadata from a processed chunk and its parent doc.
   */
  buildMetadata(
    workspaceId: string,
    doc: RawDocument,
    chunk: Chunk,
    totalChunks: number,
  ): ChunkMetadata;
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

export function freshnessScore(updatedAtSeconds: number): number {
  const ageMs = Date.now() - updatedAtSeconds * 1000;
  const ageDays = ageMs / (1000 * 60 * 60 * 24);
  return Math.exp((-ageDays * Math.LN2) / 180);
}
