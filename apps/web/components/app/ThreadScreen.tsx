"use client";
import { useUser } from "@clerk/nextjs";
import type { Citation } from "@usemoos/types";
import { type ReactNode, useEffect, useRef, useState } from "react";
import SrcIcon from "@/components/app/SrcIcon";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { integrationTypeToSrcKey } from "@/lib/api";
import { type AssistantMessage, useChatStream } from "@/lib/useChatStream";

function PulsingDots() {
  return (
    <span className="inline-flex gap-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-muted animate-pulse"
          style={{ animationDelay: `${i * 150}ms` }}
        />
      ))}
    </span>
  );
}

function CitationBadge({ n }: { n: number }) {
  return (
    <span className="inline-flex items-center px-[6px] mx-[2px] h-[17px] min-w-[17px] rounded-[4px] bg-accent text-accent-ink font-mono text-[10.5px] font-bold align-[0.06em]">
      {n}
    </span>
  );
}

function ParaWithCits({ text }: { text: string }) {
  // Parse [N] citation markers from Claude's output
  const tokens = text.split(/(\[\d+\])/g).filter(Boolean);
  const nodes: ReactNode[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const match = token.match(/^\[(\d+)\]$/);
    if (match) {
      nodes.push(<CitationBadge key={`cit-${i}`} n={Number(match[1])} />);
    } else {
      nodes.push(<span key={`t-${i}`}>{token}</span>);
    }
  }

  return (
    <p className="m-0 mb-3.5 last:mb-0 text-wrap-pretty leading-[1.75] max-[600px]:leading-[1.8] text-[15.5px] max-[600px]:text-[16px]">
      {nodes}
    </p>
  );
}

function CitationRow({ n, c }: { n: number; c: Citation }) {
  const src = integrationTypeToSrcKey(c.source_type);
  return (
    <button
      type="button"
      className="shrink-0 inline-flex items-center gap-2 py-[5px] pl-2 pr-3 bg-surface border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 hover:bg-bg-2 [transition:border-color_0.15s,background_0.15s]"
      onClick={() => c.source_url && window.open(c.source_url, "_blank")}
    >
      <span className="w-4 h-4 rounded-[4px] bg-accent text-accent-ink grid place-items-center font-mono text-[10px] font-bold shrink-0">
        {n}
      </span>
      <SrcIcon src={src} size={10} />
      <span className="whitespace-nowrap">{c.source_title}</span>
    </button>
  );
}

function AiMessage({ msg }: { msg: AssistantMessage }) {
  const paragraphs = msg.content.split(/\n\n+/).filter(Boolean);

  return (
    <div className="flex-1 min-w-0 pr-[44px] max-[600px]:pr-0 text-[15.5px] max-[600px]:text-[16px] leading-[1.75] max-[600px]:leading-[1.8] pt-1">
      {msg.isStreaming && !msg.content && (
        <div className="flex items-center gap-2 text-muted text-[14px]">
          <PulsingDots />
          <span>Thinking…</span>
        </div>
      )}

      {msg.content && (
        <div className="text-ink-2">
          {paragraphs.map((para) => (
            <ParaWithCits key={para} text={para} />
          ))}
        </div>
      )}

      {msg.citations.length > 0 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-2 [scrollbar-width:none] max-[600px]:-mx-4 max-[600px]:px-4">
          {msg.citations.map((c, i) => (
            <CitationRow key={c.source_id} n={i + 1} c={c} />
          ))}
          <div
            className="shrink-0 flex items-center gap-1 text-[11.5px] text-muted font-mono px-3 py-1 bg-surface-2 rounded-full border border-line-2"
            title="Permission-aware retrieval"
          >
            <WorkspaceIcon name="shield" size={11} />
          </div>
        </div>
      )}

      {!msg.isStreaming && (
        <div className="flex gap-1 mt-[14px] opacity-0 group-hover:opacity-100 transition-opacity">
          {(["copy", "thumb-u"] as const).map((act) => (
            <button
              type="button"
              key={act}
              className="w-7 h-7 rounded-[6px] text-muted grid place-items-center hover:bg-surface-2 hover:text-ink"
            >
              <WorkspaceIcon name={act} size={13} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ThreadComposer({
  onSend,
  disabled,
}: {
  onSend: (q: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState("");

  const submit = () => {
    if (!value.trim() || disabled) return;
    onSend(value.trim());
    setValue("");
  };

  return (
    <div className="w-full pb-6 max-[600px]:pb-4 pt-4 bg-bg z-10 flex justify-center shrink-0 border-t border-line/50">
      <div className="w-full max-w-[760px] px-8 max-[600px]:px-4 flex gap-[14px]">
        <div className="w-[30px] shrink-0 max-[600px]:hidden" />
        <div className="flex-1 bg-surface border border-line rounded-[14px] px-3.5 py-3 shadow-[0_12px_32px_-12px_rgba(14,17,10,0.16),0_4px_8px_-2px_rgba(14,17,10,0.04)] min-w-0 mr-[44px] max-[600px]:mr-0">
          <Textarea
            rows={1}
            className="border-0 bg-transparent p-0 text-[14.5px] leading-[1.5] min-h-[22px] shadow-none focus:border-transparent focus:shadow-none"
            placeholder={
              disabled ? "Waiting for response…" : "Ask a follow-up…"
            }
            value={value}
            disabled={disabled}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
          />
          <div className="flex items-center gap-1.5 mt-[6px]">
            <button
              type="button"
              className="inline-flex items-center gap-1.5 py-1 bg-bg-2 border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 cursor-pointer"
            >
              <span className="text-muted">
                <WorkspaceIcon name="globe" size={11} />
              </span>
              All sources
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 py-1 bg-bg-2 border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 cursor-pointer"
            >
              <span className="text-muted">
                <WorkspaceIcon name="att" size={11} />
              </span>
              Attach
            </button>
            <Button
              size="icon-sm"
              className="ml-auto text-accent"
              disabled={disabled || !value.trim()}
              onClick={submit}
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
  initialQuery?: string | null;
  initialConversationId?: string | null;
  onCitationsUpdate?: (citations: Citation[]) => void;
}

export default function ThreadScreen({
  onAsk: _onAsk,
  initialQuery,
  initialConversationId,
  onCitationsUpdate,
}: ThreadScreenProps) {
  const { user } = useUser();
  const initials = user
    ? `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase() ||
      "Y"
    : "Y";

  const userDisplayName = user
    ? [user.firstName, user.lastName].filter(Boolean).join(" ") ||
      user.primaryEmailAddress?.emailAddress
    : undefined;

  const { messages, isStreaming, isLoadingHistory, sendMessage } =
    useChatStream({
      conversationId: initialConversationId,
      initialQuery,
      userDisplayName,
      onCitationsUpdate,
    });

  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  if (isLoadingHistory) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted text-[14px]">
        <PulsingDots />
        <span>Loading conversation…</span>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="flex-1 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent]">
        <div className="flex flex-col max-w-[760px] mx-auto px-8 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-6 w-full">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-[14px] mb-7 group ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`w-[30px] h-[30px] rounded-full grid place-items-center shrink-0 text-[12px] font-semibold ${msg.role === "assistant" ? "bg-ink text-accent" : "bg-accent text-accent-ink"}`}
              >
                {msg.role === "assistant" ? (
                  <WorkspaceIcon name="sparkle" size={14} />
                ) : (
                  initials
                )}
              </div>

              {msg.role === "user" && (
                <p className="max-w-[72%] max-[600px]:max-w-[88%] bg-surface-2 border border-line/60 rounded-[14px] px-4 py-[10px] text-[15.5px] max-[600px]:text-[16px] leading-[1.75] text-ink font-medium m-0">
                  {msg.content}
                </p>
              )}

              {msg.role === "assistant" && (
                <AiMessage msg={msg as AssistantMessage} />
              )}
            </div>
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <ThreadComposer onSend={sendMessage} disabled={isStreaming} />
    </div>
  );
}
