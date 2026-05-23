import { splitText } from "@usemoos/lib/chunking";
import type { ChunkMetadata } from "@usemoos/types";
import { freshnessScore, type IntegrationAdapter, type ProcessedChunk, type RawDocument } from "./base.js";

interface MsTeam { id: string; displayName: string; }
interface MsChannel { id: string; displayName: string; }
interface MsMessage {
  id: string; body: { content: string; contentType: string };
  from?: { user?: { id: string; displayName: string } };
  createdDateTime: string; lastModifiedDateTime: string;
  webUrl: string;
}
interface MsResponse<T> { value: T[]; "@odata.nextLink"?: string; }

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s{2,}/g, " ").trim();
}

export const microsoftTeamsAdapter: IntegrationAdapter = {
  type: "microsoft_teams",
  authorityTier: 4,

  async *fetchDocuments(nangoFetch, workspaceId) {
    let teamsUrl: string | null = "https://graph.microsoft.com/v1.0/me/joinedTeams";
    const teams: MsTeam[] = [];
    while (teamsUrl) {
      const res = await nangoFetch(teamsUrl);
      const data = (await res.json()) as MsResponse<MsTeam>;
      teams.push(...data.value);
      teamsUrl = data["@odata.nextLink"] ?? null;
    }

    for (const team of teams) {
      const chRes = await nangoFetch(`https://graph.microsoft.com/v1.0/teams/${team.id}/channels`);
      const chData = (await chRes.json()) as MsResponse<MsChannel>;

      for (const channel of chData.value) {
        let msgsUrl: string | null =
          `https://graph.microsoft.com/v1.0/teams/${team.id}/channels/${channel.id}/messages?$top=50&$orderby=lastModifiedDateTime desc`;

        while (msgsUrl) {
          const mRes = await nangoFetch(msgsUrl);
          const mData = (await mRes.json()) as MsResponse<MsMessage>;

          for (const msg of mData.value) {
            const raw = msg.body.contentType === "html"
              ? stripHtml(msg.body.content)
              : msg.body.content;
            const text = raw.trim();
            if (!text || text === "<systemEventMessage/>") continue;

            const author = msg.from?.user?.displayName ?? "";
            const title = `${team.displayName} > #${channel.displayName}: ${text.slice(0, 80)}`;

            yield {
              id: msg.id,
              title,
              url: msg.webUrl,
              text: author ? `${author}:\n${text}` : text,
              authorId: msg.from?.user?.id ?? "unknown",
              authorRole: "other",
              createdAt: Math.floor(new Date(msg.createdDateTime).getTime() / 1000),
              updatedAt: Math.floor(new Date(msg.lastModifiedDateTime).getTime() / 1000),
              permissionGroups: [`workspace:${workspaceId}`],
              documentType: "conversation",
              engagementSignals: 0,
              isOfficial: false,
            } satisfies RawDocument;
          }
          msgsUrl = mData["@odata.nextLink"] ?? null;
        }
      }
    }
  },

  chunkDocument(doc) {
    const chunks = splitText(doc.text, { chunkSize: 256, chunkOverlap: 32 });
    return chunks.map((chunk): ProcessedChunk => ({
      chunk,
      metadata: {
        workspace_id: "",
        source_type: "microsoft_teams",
        source_id: doc.id,
        source_url: doc.url,
        source_title: doc.title,
        source_authority_tier: 4,
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
      source_type: "microsoft_teams",
      source_id: doc.id,
      source_url: doc.url,
      source_title: doc.title,
      source_authority_tier: 4,
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
