"use client";
import { type ReactNode, useState } from "react";
import SrcIcon from "@/components/app/SrcIcon";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import { ACTIVE_THREAD, WORKSPACE_DATA } from "@/components/app/workspaceData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ParaWithCitsProps {
  html: string;
}

function ParaWithCits({ html }: ParaWithCitsProps) {
  const tokens = html
    .split(/(<CIT n="\d+" \/>|<\/?b>|<\/?code>)/g)
    .filter(Boolean);
  const nodes: ReactNode[] = [];
  let bold = false;
  let code = false;
  let offset = 0;

  for (const token of tokens) {
    const key = `${offset}-${token}`;
    offset += token.length;

    const citation = token.match(/^<CIT n="(\d+)" \/>$/);
    if (citation) {
      nodes.push(
        <span
          key={key}
          className="inline-flex items-center px-[6px] mx-[2px] h-[17px] min-w-[17px] rounded-[4px] bg-accent text-accent-ink font-mono text-[10.5px] font-bold align-[0.06em] cursor-pointer hover:bg-accent-ink hover:text-accent transition-colors"
        >
          {citation[1]}
        </span>,
      );
      continue;
    }

    if (token === "<b>") {
      bold = true;
      continue;
    }

    if (token === "</b>") {
      bold = false;
      continue;
    }

    if (token === "<code>") {
      code = true;
      continue;
    }

    if (token === "</code>") {
      code = false;
      continue;
    }

    if (code) {
      nodes.push(
        <code
          key={key}
          className="rounded-sm bg-bg-2 px-1 py-0.5 font-mono text-[0.92em] text-ink"
        >
          {token}
        </code>,
      );
      continue;
    }

    if (bold) {
      nodes.push(<b key={key}>{token}</b>);
      continue;
    }

    nodes.push(<span key={key}>{token}</span>);
  }

  return (
    <p className="m-0 mb-3.5 last:mb-0 text-wrap-pretty leading-[1.75] max-[600px]:leading-[1.8] text-[15.5px] max-[600px]:text-[16px]">
      {nodes}
    </p>
  );
}

function ThreadComposer({ onAsk }: { onAsk: (q: string) => void }) {
  const [value, setValue] = useState("");
  return (
    <div className="w-full pb-6 max-[600px]:pb-4 pt-4 bg-bg z-10 flex justify-center shrink-0 border-t border-line/50">
      <div className="w-full max-w-[760px] px-8 max-[600px]:px-4 flex gap-[14px]">
        <div className="w-[30px] shrink-0 max-[600px]:hidden" />
        <div className="flex-1 bg-surface border border-line rounded-[14px] px-3.5 py-3 shadow-[0_12px_32px_-12px_rgba(14,17,10,0.16),0_4px_8px_-2px_rgba(14,17,10,0.04)] min-w-0 mr-[44px] max-[600px]:mr-0">
          <Textarea
            rows={1}
            className="border-0 bg-transparent p-0 text-[14.5px] leading-[1.5] min-h-[22px] shadow-none focus:border-transparent focus:shadow-none"
            placeholder="Ask a follow-up…"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (value.trim()) {
                  onAsk(value.trim());
                  setValue("");
                }
              }
            }}
          />
          <div className="flex items-center gap-1.5 mt-[6px]">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 gap-2.5 py-1 bg-bg-2 border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 cursor-pointer"
            >
              <span className="text-muted">
                <WorkspaceIcon name="globe" size={11} />
              </span>
              All sources
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 gap-2.5 py-1 bg-bg-2 border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 cursor-pointer"
            >
              <span className="text-muted">
                <WorkspaceIcon name="att" size={11} />
              </span>
              Attach
            </button>
            <Button
              size="icon-sm"
              className="ml-auto text-accent"
              onClick={() => {
                if (value.trim()) {
                  onAsk(value.trim());
                  setValue("");
                }
              }}
              aria-label="Send follow-up"
            >
              <WorkspaceIcon name="send" size={12} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ThreadScreenProps {
  onAsk: (q?: string) => void;
}

export default function ThreadScreen({ onAsk }: ThreadScreenProps) {
  const T = ACTIVE_THREAD;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent]">
        <div className="flex flex-col max-w-[760px] mx-auto px-8 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-6 w-full">
          {T.messages.map((msg) => (
            <div
              key={`${msg.role}-${msg.text ?? msg.paragraphs?.[0]?.html}`}
              className={`flex gap-[14px] mb-7 group ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-[30px] h-[30px] rounded-full grid place-items-center shrink-0 text-[12px] font-semibold ${msg.role === "ai" ? "bg-ink text-accent" : "bg-accent text-accent-ink"}`}
              >
                {msg.role === "ai" ? (
                  <WorkspaceIcon name="sparkle" size={14} />
                ) : (
                  WORKSPACE_DATA.user.initials
                )}
              </div>

              {/* User message — bubble, right-aligned */}
              {msg.role === "user" && msg.text && (
                <p className="max-w-[72%] max-[600px]:max-w-[88%] bg-surface-2 border border-line/60 rounded-[14px] px-4 py-[10px] text-[15.5px] max-[600px]:text-[16px] leading-[1.75] text-ink font-medium m-0">
                  {msg.text}
                </p>
              )}

              {/* AI message */}
              {msg.role === "ai" && (
                <div className="flex-1 min-w-0 pr-[44px] max-[600px]:pr-0 text-[15.5px] max-[600px]:text-[16px] leading-[1.75] max-[600px]:leading-[1.8] pt-1">
                  {msg.paragraphs && (
                    <div className="text-ink-2">
                      {msg.paragraphs.map((p) => (
                        <ParaWithCits key={p.html} html={p.html} />
                      ))}
                    </div>
                  )}
                  {msg.sources && (
                    <div className="flex gap-2 mt-4 overflow-x-auto pb-2 [scrollbar-width:none] -mx-4 px-4 sm:mx-0 sm:px-0">
                      {msg.sources.map((src) => (
                        <button
                          type="button"
                          key={src.n}
                          className="shrink-0 inline-flex items-center gap-2 gap-2.5 py-[5px] pl-2 bg-surface border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 hover:bg-bg-2 [transition:border-color_0.15s,background_0.15s]"
                        >
                          <span className="w-4 h-4 rounded-[4px] bg-accent text-accent-ink grid place-items-center font-mono text-[10px] font-bold">
                            {src.n}
                          </span>
                          <SrcIcon src={src.src} size={10} />
                          <span className="whitespace-nowrap">{src.title}</span>
                        </button>
                      ))}
                      <div
                        className="shrink-0 flex items-center gap-1 text-[11.5px] text-muted font-mono px-3 py-1 bg-surface-2 rounded-full border border-line-2"
                        title="Permission-aware retrieval"
                      >
                        <WorkspaceIcon name="shield" size={11} />
                      </div>
                    </div>
                  )}
                  <div className="flex gap-1 mt-[14px] opacity-0 group-hover:opacity-100 transition-opacity">
                    {(["copy", "share", "thumb-u", "refresh"] as const).map(
                      (act) => (
                        <button
                          type="button"
                          key={act}
                          className="w-7 h-7 rounded-[6px] text-muted grid place-items-center hover:bg-surface-2 hover:text-ink"
                        >
                          <WorkspaceIcon name={act} size={13} />
                        </button>
                      ),
                    )}
                  </div>
                  {msg.followups && (
                    <div className="mt-[26px] pt-[22px] border-t border-dashed border-line-2">
                      <div className="font-mono text-[10.5px] text-dim tracking-[0.08em] uppercase mb-[10px]">
                        Follow-up questions
                      </div>
                      <div className="flex flex-col">
                        {msg.followups.map((f) => (
                          <button
                            key={f}
                            type="button"
                            className="flex w-full items-center gap-2.5 py-[10px] border-t border-line first:border-t-0 text-[14px] text-ink-2 cursor-pointer hover:text-ink transition-colors text-left"
                            onClick={() => onAsk(f)}
                          >
                            <span>{f}</span>
                            <span className="ml-auto text-dim group-hover:text-ink">
                              <WorkspaceIcon name="arrow-tl" size={12} />
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      <ThreadComposer onAsk={onAsk} />
    </div>
  );
}
