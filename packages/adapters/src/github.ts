import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface GhRepo { id: number; full_name: string; html_url: string; pushed_at: string; created_at: string; }
interface GhIssue {
  id: number; number: number; title: string; body: string | null; html_url: string;
  state: string; pull_request?: object; user: { login: string } | null;
  created_at: string; updated_at: string;
}

export const githubAdapter: IntegrationAdapter = {
  type: "github",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    let repoPage = 1;
    while (true) {
      const res = await nangoFetch(`https://api.github.com/user/repos?per_page=100&page=${repoPage}&sort=pushed`);
      const repos = (await res.json()) as GhRepo[];
      if (!repos.length) break;

      for (const repo of repos) {
        let issuePage = 1;
        while (true) {
          const iRes = await nangoFetch(
            `https://api.github.com/repos/${repo.full_name}/issues?state=all&per_page=100&page=${issuePage}`,
          );
          const issues = (await iRes.json()) as GhIssue[];
          if (!issues.length) break;

          for (const issue of issues) {
            const body = issue.body?.trim() ?? "";
            if (!issue.title && !body) continue;
            const isPr = Boolean(issue.pull_request);
            const text = `${issue.title}\n\n${body}`.trim();

            yield {
              id: `${repo.full_name}#${issue.number}`,
              title: `${repo.full_name}#${issue.number}: ${issue.title}`,
              url: issue.html_url,
              text,
              authorId: issue.user?.login ?? "unknown",
              authorRole: "engineer",
              createdAt: Math.floor(new Date(issue.created_at).getTime() / 1000),
              updatedAt: Math.floor(new Date(issue.updated_at).getTime() / 1000),
              permissionGroups: [`workspace:${workspaceId}`],
              documentType: isPr ? "pr" : "ticket",
              engagementSignals: 0,
              isOfficial: false,
            } satisfies RawDocument;
          }
          if (issues.length < 100) break;
          issuePage++;
        }
      }
      if (repos.length < 100) break;
      repoPage++;
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "github",
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
      source_type: "github",
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
