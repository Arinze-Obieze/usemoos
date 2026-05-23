import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface LinearIssueNode {
  id: string; title: string; description: string | null;
  url: string; createdAt: string; updatedAt: string;
  creator?: { id: string };
  state: { name: string };
}
interface LinearResponse {
  data: {
    issues: {
      nodes: LinearIssueNode[];
      pageInfo: { hasNextPage: boolean; endCursor: string | null };
    };
  };
}

const ISSUES_QUERY = `
query Issues($after: String) {
  issues(first: 100, after: $after, orderBy: updatedAt) {
    nodes {
      id title description url createdAt updatedAt
      creator { id }
      state { name }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

export const linearAdapter: IntegrationAdapter = {
  type: "linear",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    let after: string | null = null;

    while (true) {
      const res = await nangoFetch("https://api.linear.app/graphql", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: ISSUES_QUERY, variables: { after } }),
      });
      const data = (await res.json()) as LinearResponse;
      const { nodes, pageInfo } = data.data.issues;

      for (const issue of nodes) {
        const text = `${issue.title}\n\n${issue.description ?? ""}`.trim();
        if (!text) continue;

        yield {
          id: issue.id,
          title: issue.title,
          url: issue.url,
          text,
          authorId: issue.creator?.id ?? "unknown",
          authorRole: "engineer",
          createdAt: Math.floor(new Date(issue.createdAt).getTime() / 1000),
          updatedAt: Math.floor(new Date(issue.updatedAt).getTime() / 1000),
          permissionGroups: [`workspace:${workspaceId}`],
          documentType: "ticket",
          engagementSignals: 0,
          isOfficial: false,
        } satisfies RawDocument;
      }

      if (!pageInfo.hasNextPage) break;
      after = pageInfo.endCursor;
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "linear",
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
      source_type: "linear",
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
