"use client";
import { useAuth, useUser } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import { apiFetch, apiJson, formatRelativeTime } from "@/lib/api";

interface Conversation {
  id: string;
  title: string | null;
  user_id: string;
  user_display_name: string | null;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

interface LibraryScreenProps {
  onOpenThread: (id: string) => void;
}

type LibTab = "spaces" | "pinned" | "saved";

export default function LibraryScreen({ onOpenThread }: LibraryScreenProps) {
  const { getToken } = useAuth();
  const { user } = useUser();
  const qc = useQueryClient();
  const [tab, setTab] = useState<LibTab>("spaces");

  const { data: allConvs = [] } = useQuery({
    queryKey: ["conversations"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return [];
      return apiJson<Conversation[]>("/chat/conversations", token);
    },
  });

  const pinMutation = useMutation({
    mutationFn: async ({ id, pinned }: { id: string; pinned: boolean }) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch(`/chat/conversations/${id}/pin`, token, {
        method: "PATCH",
        body: JSON.stringify({ pinned }),
      });
      if (!res.ok) throw new Error("Pin failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["conversations"] }),
  });

  const currentUserId = user?.id;
  const savedConvs = allConvs.filter(
    (c) => c.user_id === currentUserId && c.title,
  );
  const pinnedConvs = allConvs.filter((c) => c.is_pinned && c.title);

  return (
    <div className="max-w-295 mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      <div className="mb-7">
        <h1 className="text-[26px] tracking-[-0.02em] font-semibold m-0 mb-1 text-ink">
          Library
        </h1>
        <p className="text-[14px] text-muted m-0">
          Save trusted answers, pin what your team needs to find fast.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4.5 border-b border-line overflow-x-auto">
        {(["spaces", "pinned", "saved"] as LibTab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`px-3.5 py-2 text-[13px] border-b-2 -mb-px cursor-pointer [transition:color_0.12s] ${
              tab === t
                ? "text-ink font-medium border-ink"
                : "text-muted border-transparent hover:text-ink-2"
            }`}
            onClick={() => setTab(t)}
          >
            {t === "spaces"
              ? "Spaces"
              : t === "pinned"
                ? `Pinned answers`
                : "Saved"}
            {t === "pinned" && pinnedConvs.length > 0 && (
              <span className="ml-1.5 font-mono text-[11px] text-dim">
                {pinnedConvs.length}
              </span>
            )}
            {t === "saved" && savedConvs.length > 0 && (
              <span className="ml-1.5 font-mono text-[11px] text-dim">
                {savedConvs.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "spaces" && (
        <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
          <div className="w-12 h-12 rounded-[12px] bg-bg-2 border border-line grid place-items-center text-[22px]">
            🗂️
          </div>
          <div>
            <div className="text-[15px] font-semibold text-ink mb-1">
              Spaces are coming soon
            </div>
            <p className="text-[13.5px] text-muted m-0 max-w-90">
              Group related answers and documents into shared spaces your team
              can browse and reference. For now, pin answers to surface them
              quickly.
            </p>
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-ink text-accent text-[13.5px] font-medium rounded-[8px] hover:bg-ink-2 transition-colors"
            onClick={() => setTab("pinned")}
          >
            View pinned answers
          </button>
        </div>
      )}

      {/* Pinned tab */}
      {tab === "pinned" &&
        (pinnedConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-10 h-10 rounded-[10px] bg-bg-2 border border-line grid place-items-center text-muted">
              <WorkspaceIcon name="pin" size={18} />
            </div>
            <p className="text-[14px] text-muted m-0">
              No pinned answers yet. Open a conversation and pin it to surface
              it for your team.
            </p>
          </div>
        ) : (
          <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden">
            {pinnedConvs.map((conv) => (
              <div
                key={conv.id}
                className="grid items-center gap-3.5 px-4.5 py-3.5 border-b border-line last:border-b-0 hover:bg-bg-2 transition-colors"
                style={{ gridTemplateColumns: "auto 1fr auto auto" }}
              >
                <span className="text-accent-3">
                  <WorkspaceIcon name="pin" size={14} />
                </span>
                <button
                  type="button"
                  className="text-[14px] text-ink truncate text-left"
                  onClick={() => onOpenThread(conv.id)}
                >
                  {conv.title}
                  <em className="not-italic text-muted text-[13px] ml-2">
                    {conv.user_display_name ?? "Teammate"} ·{" "}
                    {formatRelativeTime(conv.updated_at)}
                  </em>
                </button>
                <button
                  type="button"
                  title="Unpin"
                  className="text-muted hover:text-danger transition-colors"
                  onClick={() =>
                    pinMutation.mutate({ id: conv.id, pinned: false })
                  }
                >
                  <WorkspaceIcon name="close" size={12} />
                </button>
                <button
                  type="button"
                  className="text-muted hover:text-ink transition-colors"
                  onClick={() => onOpenThread(conv.id)}
                >
                  <WorkspaceIcon name="chev-r" size={12} />
                </button>
              </div>
            ))}
          </div>
        ))}

      {/* Saved tab — current user's conversations */}
      {tab === "saved" &&
        (savedConvs.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="w-10 h-10 rounded-[10px] bg-bg-2 border border-line grid place-items-center text-muted">
              <WorkspaceIcon name="ask" size={18} />
            </div>
            <p className="text-[14px] text-muted m-0">
              Your conversations will appear here once you start asking
              questions.
            </p>
          </div>
        ) : (
          <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden">
            {savedConvs.map((conv) => (
              <div
                key={conv.id}
                className="grid items-center gap-3.5 px-4.5 py-3.5 border-b border-line last:border-b-0 hover:bg-bg-2 transition-colors"
                style={{ gridTemplateColumns: "auto 1fr auto auto" }}
              >
                <span className="text-muted">
                  <WorkspaceIcon name="file" size={14} />
                </span>
                <button
                  type="button"
                  className="text-[14px] text-ink truncate text-left"
                  onClick={() => onOpenThread(conv.id)}
                >
                  {conv.title}
                  <em className="not-italic text-muted text-[13px] ml-2">
                    {formatRelativeTime(conv.updated_at)}
                  </em>
                </button>
                <button
                  type="button"
                  title={conv.is_pinned ? "Unpin" : "Pin for team"}
                  className={`transition-colors ${conv.is_pinned ? "text-accent-3" : "text-muted hover:text-ink"}`}
                  onClick={() =>
                    pinMutation.mutate({
                      id: conv.id,
                      pinned: !conv.is_pinned,
                    })
                  }
                >
                  <WorkspaceIcon name="pin" size={13} />
                </button>
                <button
                  type="button"
                  className="text-muted hover:text-ink transition-colors"
                  onClick={() => onOpenThread(conv.id)}
                >
                  <WorkspaceIcon name="chev-r" size={12} />
                </button>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
}
