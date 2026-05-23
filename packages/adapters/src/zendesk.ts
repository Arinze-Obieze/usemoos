import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface ZdTicket {
  id: number; subject: string; description: string;
  url: string; status: string; requester_id: number;
  created_at: string; updated_at: string;
}
interface ZdArticle {
  id: number; title: string; body: string; html_url: string;
  author_id: number; created_at: string; updated_at: string; promoted: boolean;
}
interface ZdTicketsResponse { tickets: ZdTicket[]; next_page: string | null; }
interface ZdArticlesResponse { articles: ZdArticle[]; next_page: string | null; }

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export const zendeskAdapter: IntegrationAdapter = {
  type: "zendesk",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    // Tickets
    let ticketsUrl: string | null =
      "https://your-subdomain.zendesk.com/api/v2/tickets.json?page[size]=100&sort=-updated_at";
    while (ticketsUrl) {
      const res = await nangoFetch(ticketsUrl);
      const data = (await res.json()) as ZdTicketsResponse;
      for (const ticket of data.tickets) {
        const text = `${ticket.subject}\n\n${ticket.description}`.trim();
        if (!text) continue;
        yield {
          id: `ticket:${ticket.id}`,
          title: ticket.subject,
          url: ticket.url,
          text,
          authorId: String(ticket.requester_id),
          authorRole: "support",
          createdAt: Math.floor(new Date(ticket.created_at).getTime() / 1000),
          updatedAt: Math.floor(new Date(ticket.updated_at).getTime() / 1000),
          permissionGroups: [`workspace:${workspaceId}`],
          documentType: "ticket",
          engagementSignals: 0,
          isOfficial: false,
        } satisfies RawDocument;
      }
      ticketsUrl = data.next_page;
    }

    // Help Center articles
    let articlesUrl: string | null =
      "https://your-subdomain.zendesk.com/api/v2/help_center/articles.json?per_page=100&sort_by=updated_at&sort_order=desc";
    while (articlesUrl) {
      const res = await nangoFetch(articlesUrl);
      const data = (await res.json()) as ZdArticlesResponse;
      for (const article of data.articles) {
        const text = `${article.title}\n\n${stripHtml(article.body)}`.trim();
        if (!text) continue;
        yield {
          id: `article:${article.id}`,
          title: article.title,
          url: article.html_url,
          text,
          authorId: String(article.author_id),
          authorRole: "support",
          createdAt: Math.floor(new Date(article.created_at).getTime() / 1000),
          updatedAt: Math.floor(new Date(article.updated_at).getTime() / 1000),
          permissionGroups: [`workspace:${workspaceId}`],
          documentType: "doc",
          engagementSignals: article.promoted ? 10 : 0,
          isOfficial: article.promoted,
        } satisfies RawDocument;
      }
      articlesUrl = data.next_page;
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "zendesk",
        source_id: doc.id,
        source_url: doc.url,
        source_title: doc.title,
        source_authority_tier: doc.isOfficial ? 1 : 2,
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
      source_type: "zendesk",
      source_id: doc.id,
      source_url: doc.url,
      source_title: doc.title,
      source_authority_tier: doc.isOfficial ? 1 : 2,
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
