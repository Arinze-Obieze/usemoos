import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface TrelloBoard { id: string; name: string; shortUrl: string; closed: boolean; }
interface TrelloCard {
  id: string; name: string; desc: string; shortUrl: string;
  idMemberCreator: string; dateLastActivity: string;
  labels: Array<{ name: string }>;
}

export const trelloAdapter: IntegrationAdapter = {
  type: "trello",
  authorityTier: 3,

  async *fetchDocuments(nangoFetch, workspaceId) {
    const res = await nangoFetch("https://api.trello.com/1/members/me/boards?filter=open&fields=id,name,shortUrl,closed");
    const boards = (await res.json()) as TrelloBoard[];

    for (const board of boards) {
      if (board.closed) continue;
      const cardsRes = await nangoFetch(
        `https://api.trello.com/1/boards/${board.id}/cards?filter=open&fields=id,name,desc,shortUrl,idMemberCreator,dateLastActivity,labels`,
      );
      const cards = (await cardsRes.json()) as TrelloCard[];

      for (const card of cards) {
        const labelText = card.labels.map((l) => l.name).filter(Boolean).join(", ");
        const text = [
          `Board: ${board.name}`,
          card.name,
          labelText ? `Labels: ${labelText}` : "",
          card.desc,
        ].filter(Boolean).join("\n\n");

        if (!text.trim()) continue;

        yield {
          id: card.id,
          title: `${board.name} / ${card.name}`,
          url: card.shortUrl,
          text,
          authorId: card.idMemberCreator,
          authorRole: "other",
          createdAt: Math.floor(new Date(card.dateLastActivity).getTime() / 1000),
          updatedAt: Math.floor(new Date(card.dateLastActivity).getTime() / 1000),
          permissionGroups: [`workspace:${workspaceId}`],
          documentType: "ticket",
          engagementSignals: 0,
          isOfficial: false,
        } satisfies RawDocument;
      }
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "trello",
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
      source_type: "trello",
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
