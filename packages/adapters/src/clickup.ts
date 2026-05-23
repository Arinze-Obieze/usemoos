import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface CuTeam { id: string; name: string; }
interface CuSpace { id: string; name: string; }
interface CuList { id: string; name: string; }
interface CuTask {
  id: string; name: string; description: string; url: string;
  creator?: { id: string };
  date_created: string; date_updated: string;
}
interface CuTasksResponse { tasks: CuTask[]; last_page: boolean; }

export const clickupAdapter: IntegrationAdapter = {
  type: "clickup",
  authorityTier: 2,

  async *fetchDocuments(nangoFetch, workspaceId) {
    const teamsRes = await nangoFetch("https://api.clickup.com/api/v2/team");
    const { teams } = (await teamsRes.json()) as { teams: CuTeam[] };

    for (const team of teams) {
      const spacesRes = await nangoFetch(`https://api.clickup.com/api/v2/team/${team.id}/space?archived=false`);
      const { spaces } = (await spacesRes.json()) as { spaces: CuSpace[] };

      for (const space of spaces) {
        const listsRes = await nangoFetch(`https://api.clickup.com/api/v2/space/${space.id}/list?archived=false`);
        const { lists } = (await listsRes.json()) as { lists: CuList[] };

        for (const list of lists) {
          let page = 0;
          while (true) {
            const tasksRes = await nangoFetch(
              `https://api.clickup.com/api/v2/list/${list.id}/task?archived=false&page=${page}&order_by=updated&subtasks=true`,
            );
            const data = (await tasksRes.json()) as CuTasksResponse;

            for (const task of data.tasks) {
              const text = `${task.name}\n\n${task.description ?? ""}`.trim();
              if (!text) continue;
              yield {
                id: task.id,
                title: task.name,
                url: task.url,
                text,
                authorId: task.creator?.id ? String(task.creator.id) : "unknown",
                authorRole: "other",
                createdAt: Math.floor(Number(task.date_created) / 1000),
                updatedAt: Math.floor(Number(task.date_updated) / 1000),
                permissionGroups: [`workspace:${workspaceId}`],
                documentType: "ticket",
                engagementSignals: 0,
                isOfficial: false,
              } satisfies RawDocument;
            }
            if (data.last_page) break;
            page++;
          }
        }
      }
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 512, chunkOverlap: 64 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "clickup",
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
      source_type: "clickup",
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
