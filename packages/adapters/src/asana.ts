import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface AsanaWorkspace { gid: string; name: string; }
interface AsanaProject { gid: string; name: string; }
interface AsanaTask {
  gid: string; name: string; notes: string; permalink_url: string;
  assignee?: { gid: string };
  created_at: string; modified_at: string;
}
interface AsanaResponse<T> { data: T[]; next_page: { offset: string } | null; }

export const asanaAdapter: IntegrationAdapter = {
  type: "asana",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    const wsRes = await nangoFetch("https://app.asana.com/api/1.0/workspaces");
    const wsData = (await wsRes.json()) as AsanaResponse<AsanaWorkspace>;

    for (const ws of wsData.data) {
      let offset: string | undefined;
      while (true) {
        const qp = new URLSearchParams({
          workspace: ws.gid,
          limit: "100",
          opt_fields: "gid,name",
          ...(offset ? { offset } : {}),
        });
        const pRes = await nangoFetch(`https://app.asana.com/api/1.0/projects?${qp}`);
        const pData = (await pRes.json()) as AsanaResponse<AsanaProject>;

        for (const project of pData.data) {
          let taskOffset: string | undefined;
          while (true) {
            const tqp = new URLSearchParams({
              project: project.gid,
              limit: "100",
              opt_fields: "gid,name,notes,permalink_url,assignee.gid,created_at,modified_at",
              ...(taskOffset ? { offset: taskOffset } : {}),
            });
            const tRes = await nangoFetch(`https://app.asana.com/api/1.0/tasks?${tqp}`);
            const tData = (await tRes.json()) as AsanaResponse<AsanaTask>;

            for (const task of tData.data) {
              const text = `${task.name}\n\n${task.notes}`.trim();
              if (!text) continue;
              yield {
                id: task.gid,
                title: task.name,
                url: task.permalink_url,
                text,
                authorId: task.assignee?.gid ?? "unknown",
                authorRole: "other",
                createdAt: Math.floor(new Date(task.created_at).getTime() / 1000),
                updatedAt: Math.floor(new Date(task.modified_at).getTime() / 1000),
                permissionGroups: [`workspace:${workspaceId}`],
                documentType: "ticket",
                engagementSignals: 0,
                isOfficial: false,
              } satisfies RawDocument;
            }
            if (!tData.next_page) break;
            taskOffset = tData.next_page.offset;
          }
        }

        if (!pData.next_page) break;
        offset = pData.next_page.offset;
      }
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "asana",
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
      source_type: "asana",
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
