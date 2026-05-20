"use client";
import { useState } from "react";
import { WORKSPACE_DATA } from "@/components/app/workspaceData";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import SrcIcon from "@/components/app/SrcIcon";

interface LibraryScreenProps {
  onOpenThread: (id: string) => void;
}

type LibTab = "spaces" | "pinned" | "saved";

export default function LibraryScreen({ onOpenThread }: LibraryScreenProps) {
  const D = WORKSPACE_DATA;
  const [tab, setTab] = useState<LibTab>("spaces");

  return (
    <div className="max-w-295 mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      <div className="mb-7">
        <h1 className="text-[26px] tracking-[-0.02em] font-semibold m-0 mb-1 text-ink">Library</h1>
        <p className="text-[14px] text-muted m-0">Save trusted answers, group knowledge into spaces, pin what your team needs to find fast.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4.5 border-b border-line overflow-x-auto scrollbar-none">
        {(["spaces", "pinned", "saved"] as LibTab[]).map((t) => (
          <button key={t}
            className={`px-3.5 py-2 text-[13px] border-b-2 -mb-px cursor-pointer [transition:color_0.12s] ${tab === t ? "text-ink font-medium border-ink" : "text-muted border-transparent hover:text-ink-2"}`}
            onClick={() => setTab(t)}
          >
            {t === "spaces" ? "Spaces" : t === "pinned" ? "Pinned answers" : "Saved"}
          </button>
        ))}
      </div>

      {tab === "spaces" && (
        <div className="grid grid-cols-3 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-3.5">
          {D.spaces.map((space, i) => (
            <div key={i} className="flex flex-col gap-2.5 p-5 bg-surface border border-line rounded-[10px] cursor-pointer min-h-37.5 [transition:border-color_0.15s,transform_0.15s] hover:border-line-2 hover:-translate-y-px">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-(--accent-soft) grid place-items-center text-[16px]">{space.emoji}</div>
                <div className="text-[15px] font-semibold tracking-[-0.005em] text-ink">{space.name}</div>
              </div>
              <div className="text-[12.5px] text-muted leading-[1.45] flex-1">{space.desc}</div>
              <div className="flex items-center gap-2.5 font-mono text-[11px] text-muted mt-auto">
                <span>{space.count} items</span>
                <span className="text-line-2">·</span>
                <span>{space.updated}</span>
                <div className="ml-auto flex">
                  {space.members.map((m, j) => (
                    <span key={j} className="w-[18px] h-[18px] rounded-full bg-surface-2 border-[1.5px] border-surface -ml-[5px] first:ml-0 grid place-items-center text-[9px] text-ink-2 font-semibold">{m}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
          <button className="flex flex-col items-center justify-center gap-3 p-5 bg-transparent border border-dashed border-line rounded-[10px] text-muted text-[13px] min-h-[150px] cursor-pointer hover:text-ink hover:border-line-3 [transition:color_0.15s,border-color_0.15s]">
            <WorkspaceIcon name="plus" size={18} />
            <div>Create new space</div>
          </button>
        </div>
      )}

      {tab === "pinned" && (
        <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden">
          {D.pinned.map((p, i) => (
            <div key={i}
              className="grid items-center gap-[14px] px-[18px] py-3.5 border-b border-line last:border-b-0 cursor-pointer hover:bg-bg-2 transition-colors"
              style={{ gridTemplateColumns: "auto 1fr auto auto" }}
              onClick={() => onOpenThread("t1")}
            >
              <span className="text-accent-3"><WorkspaceIcon name="pin" size={14} /></span>
              <div className="text-[14px] text-ink truncate">
                {p.q}<em className="not-italic text-muted text-[13px] ml-2">{p.when}</em>
              </div>
              <div className="inline-flex">
                {p.srcs.map((s) => <SrcIcon key={s} src={s} size={11} />)}
              </div>
              <div className="font-mono text-[11.5px] text-muted"><WorkspaceIcon name="chev-r" size={12} /></div>
            </div>
          ))}
        </div>
      )}

      {tab === "saved" && (
        <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden">
          {D.threads.slice(0, 5).map((t) => (
            <div key={t.id}
              className="grid items-center gap-3.5 px-[18px] py-3.5 border-b border-line last:border-b-0 cursor-pointer hover:bg-bg-2 transition-colors"
              style={{ gridTemplateColumns: "auto 1fr auto auto" }}
              onClick={() => onOpenThread(t.id)}
            >
              <span className="text-muted"><WorkspaceIcon name="file" size={14} /></span>
              <div className="text-[14px] text-ink truncate">
                {t.q}<em className="not-italic text-muted text-[13px] ml-2">saved by you</em>
              </div>
              <div className="inline-flex">
                {t.srcs.map((s) => <SrcIcon key={s} src={s} size={11} />)}
              </div>
              <div className="font-mono text-[11.5px] text-muted">{t.when}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
