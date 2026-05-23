import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface JiraProject { id: string; key: string; name: string; }
interface JiraIssue {
  id: string; key: string; self: string;
  fields: {
    summary: string;
    description?: { content?: Array<{ content?: Array<{ text?: string }> }> } | null;
    creator?: { accountId: string };
    created: string;
    updated: string;
    issuetype: { name: string };
    status: { name: string };
  };
}
interface JiraSearchResponse { issues: JiraIssue[]; total: number; startAt: number; maxResults: number; }

function extractJiraText(description: JiraIssue["fields"]["description"]): string {
  if (!description?.content) return "";
  const lines: string[] = [];
  for (const block of description.content) {
    if (block.content) {
      lines.push(block.content.map((n) => n.text ?? "").join(""));
    }
  }
  return lines.filter(Boolean).join("\n");
}

export const jiraAdapter: IntegrationAdapter = {
  type: "jira",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    const pRes = await nangoFetch("https://api.atlassian.com/ex/jira/cloud/rest/api/3/project?maxResults=100");
    const projects = (await pRes.json()) as JiraProject[];

    for (const project of projects) {
      let startAt = 0;
      while (true) {
        const body = JSON.stringify({
          jql: `project = "${project.key}" ORDER BY updated DESC`,
          startAt,
          maxResults: 100,
          fields: ["summary", "description", "creator", "created", "updated", "issuetype", "status"],
        });
        const iRes = await nangoFetch(
          "https://api.atlassian.com/ex/jira/cloud/rest/api/3/issue/search",
          { method: "POST", headers: { "Content-Type": "application/json" }, body },
        );
        const data = (await iRes.json()) as JiraSearchResponse;
        if (!data.issues?.length) break;

        for (const issue of data.issues) {
          const bodyText = extractJiraText(issue.fields.description);
          const text = `${issue.fields.summary}\n\n${bodyText}`.trim();
          if (!text) continue;

          yield {
            id: issue.id,
            title: `${issue.key}: ${issue.fields.summary}`,
            url: `https://your-domain.atlassian.net/browse/${issue.key}`,
            text,
            authorId: issue.fields.creator?.accountId ?? "unknown",
            authorRole: "engineer",
            createdAt: Math.floor(new Date(issue.fields.created).getTime() / 1000),
            updatedAt: Math.floor(new Date(issue.fields.updated).getTime() / 1000),
            permissionGroups: [`workspace:${workspaceId}`],
            documentType: "ticket",
            engagementSignals: 0,
            isOfficial: false,
          } satisfies RawDocument;
        }
        if (data.issues.length < 100) break;
        startAt += 100;
      }
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "jira",
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
      source_type: "jira",
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
