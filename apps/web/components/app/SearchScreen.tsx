"use client";
import { useAuth } from "@clerk/nextjs";
import { useCallback, useRef, useState } from "react";
import SrcIcon from "@/components/app/SrcIcon";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import { buildApiUrl, integrationTypeToSrcKey } from "@/lib/api";

interface Citation {
  source_id: string;
  source_title: string;
  source_url: string;
  source_type: string;
  authority_tier: number;
  excerpt: string;
  rank: number;
}

interface SearchState {
  status: "idle" | "streaming" | "done" | "error";
  answer: string;
  citations: Citation[];
  error: string | null;
}

const SOURCE_FILTERS = [
  { id: "all", label: "All sources" },
  { id: "notion", label: "Notion" },
  { id: "google_drive", label: "Drive" },
  { id: "slack", label: "Slack" },
  { id: "upload", label: "Uploads" },
];

export default function SearchScreen() {
  const { getToken } = useAuth();
  const [query, setQuery] = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [state, setState] = useState<SearchState>({
    status: "idle",
    answer: "",
    citations: [],
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);

  const runSearch = useCallback(
    async (q: string, filter: string) => {
      if (!q.trim()) return;

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setSubmittedQuery(q);
      setState({ status: "streaming", answer: "", citations: [], error: null });

      try {
        const token = await getToken();
        const sourceTypes = filter !== "all" ? [filter] : undefined;

        const res = await fetch(buildApiUrl("/search"), {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ query: q, sourceTypes }),
          signal: controller.signal,
        });

        if (!res.ok || !res.body) {
          setState((s) => ({
            ...s,
            status: "error",
            error: `Search failed (${res.status})`,
          }));
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buf = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buf += decoder.decode(value, { stream: true });

          const lines = buf.split("\n");
          buf = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const raw = line.slice(6).trim();
            if (!raw) continue;
            try {
              const event = JSON.parse(raw) as {
                type: string;
                text?: string;
                citations?: Citation[];
              };
              if (event.type === "text" && event.text) {
                setState((s) => ({ ...s, answer: s.answer + event.text }));
              } else if (event.type === "citations" && event.citations) {
                const citations = event.citations;
                setState((s) => ({ ...s, citations }));
              } else if (event.type === "done") {
                setState((s) => ({ ...s, status: "done" }));
              }
            } catch {
              // malformed SSE line — skip
            }
          }
        }

        setState((s) =>
          s.status === "streaming" ? { ...s, status: "done" } : s,
        );
      } catch (err) {
        if ((err as Error).name === "AbortError") return;
        setState((s) => ({
          ...s,
          status: "error",
          error: "Something went wrong. Try again.",
        }));
      }
    },
    [getToken],
  );

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runSearch(query, activeFilter);
  }

  function handleFilterChange(id: string) {
    setActiveFilter(id);
    if (submittedQuery) runSearch(submittedQuery, id);
  }

  const isStreaming = state.status === "streaming";
  const hasAnswer = state.answer.length > 0;
  const hasResults = state.status !== "idle";

  return (
    <div className="max-w-295 mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      <div className="mb-7">
        <h1 className="text-[26px] tracking-[-0.02em] font-semibold m-0 mb-1 text-ink">
          Search
        </h1>
        <p className="text-[14px] text-muted m-0">
          Find any document, message, ticket, or code reference across your
          connected sources.
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-3 bg-surface border border-line-2 rounded-[12px] px-4.5 py-3.5 mb-4.5 focus-within:border-line-3 [transition:border-color_0.15s]">
          <WorkspaceIcon name="search" size={18} />
          <input
            className="flex-1 border-0 outline-none bg-transparent text-[16px] text-ink placeholder:text-dim"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across all knowledge…"
          />
          {isStreaming ? (
            <button
              type="button"
              onClick={() => abortRef.current?.abort()}
              className="font-mono text-[11px] text-danger border border-danger/30 px-2 py-0.5 rounded-[4px] cursor-pointer hover:bg-danger/5"
            >
              stop
            </button>
          ) : (
            <span className="font-mono text-[11px] text-muted border border-line px-2 py-0.5 rounded-[4px]">
              ↵
            </span>
          )}
        </div>
      </form>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap mb-4.5">
        {SOURCE_FILTERS.map((f) => (
          <button
            type="button"
            key={f.id}
            className={`inline-flex items-center gap-2 px-3 py-1.25 rounded-full text-[12px] border cursor-pointer transition-colors ${
              activeFilter === f.id
                ? "bg-ink text-accent border-ink"
                : "bg-surface border-line text-ink-2 hover:border-line-2"
            }`}
            onClick={() => handleFilterChange(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Idle empty state */}
      {!hasResults && (
        <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
          <div className="w-10 h-10 rounded-[10px] bg-bg-2 border border-line grid place-items-center text-muted">
            <WorkspaceIcon name="search" size={18} />
          </div>
          <p className="text-[14px] text-muted m-0">
            Type a question or keyword to search across your connected sources.
          </p>
        </div>
      )}

      {/* Error */}
      {state.status === "error" && (
        <div className="flex items-center gap-2.5 px-4 py-3 bg-danger/5 border border-danger/20 rounded-[10px] mb-5 text-[13.5px] text-danger">
          <WorkspaceIcon name="warn" size={14} />
          {state.error}
        </div>
      )}

      {/* AI answer card */}
      {hasResults && state.status !== "error" && (
        <div className="flex gap-3 px-4.5 py-4 bg-linear-to-b from-surface to-bg-2 border border-line rounded-[18px] mb-5.5">
          <div className="w-7.5 h-7.5 rounded-full bg-ink text-accent grid place-items-center shrink-0">
            <WorkspaceIcon name="sparkle" size={14} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-mono text-[10.5px] text-accent-ink tracking-[0.08em] uppercase mb-1.5">
              AI answer · grounded in your sources
            </div>

            {isStreaming && !hasAnswer && (
              <div className="flex items-center gap-1.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.15s]" />
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse [animation-delay:0.3s]" />
              </div>
            )}

            {hasAnswer && (
              <p className="text-[14.5px] leading-[1.55] text-ink m-0 whitespace-pre-wrap">
                {state.answer}
              </p>
            )}

            {state.citations.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {state.citations.map((cit) => (
                  <a
                    key={cit.rank}
                    href={cit.source_url || undefined}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-1.25 pl-2 pr-3 bg-surface border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 hover:bg-bg-2 [transition:border-color_0.15s] no-underline"
                  >
                    <span className="w-4 h-4 rounded-[4px] bg-accent text-accent-ink grid place-items-center font-mono text-[10px] font-bold shrink-0">
                      {cit.rank}
                    </span>
                    <SrcIcon
                      src={integrationTypeToSrcKey(cit.source_type)}
                      size={10}
                    />
                    <span className="truncate max-w-40">
                      {cit.source_title}
                    </span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Citation excerpt list */}
      {state.citations.length > 0 && (
        <div className="flex flex-col">
          {state.citations.map((cit) => (
            <a
              key={cit.rank}
              href={cit.source_url || undefined}
              target="_blank"
              rel="noopener noreferrer"
              className="grid items-start gap-3.5 py-3.5 px-1 border-t border-line cursor-pointer hover:bg-bg-2 transition-colors no-underline"
              style={{ gridTemplateColumns: "auto 1fr auto" }}
            >
              <SrcIcon
                src={integrationTypeToSrcKey(cit.source_type)}
                size={14}
              />
              <div>
                <div className="text-[14.5px] text-ink font-medium tracking-[-0.005em] leading-[1.4]">
                  {cit.source_title}
                </div>
                <div className="text-[13px] text-muted leading-[1.55] mt-1">
                  {cit.excerpt}
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-muted mt-1.5">
                  <SrcIcon
                    src={integrationTypeToSrcKey(cit.source_type)}
                    size={9}
                  />
                  <span className="capitalize">
                    {cit.source_type.replace(/_/g, " ")}
                  </span>
                  <span>·</span>
                  <span>Tier {cit.authority_tier}</span>
                </div>
              </div>
              <WorkspaceIcon name="chev-r" size={12} />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
