"use client";
import { useState } from "react";
import { SEARCH_RESULTS } from "@/components/app/workspaceData";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import SrcIcon from "@/components/app/SrcIcon";

export default function SearchScreen() {
  const S = SEARCH_RESULTS;
  const [query, setQuery] = useState(S.query);
  const [activeFilter, setActiveFilter] = useState("all");

  return (
    <div className="max-w-[1180px] mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      <div className="mb-7">
        <h1 className="text-[26px] tracking-[-0.02em] font-semibold m-0 mb-1 text-ink">Search</h1>
        <p className="text-[14px] text-muted m-0">Find any document, message, ticket, or code reference across your connected sources.</p>
      </div>

      {/* Search bar */}
      <div className="flex items-center gap-3 bg-surface border border-line-2 rounded-[12px] px-[18px] py-3.5 mb-[18px]">
        <WorkspaceIcon name="search" size={18} />
        <input
          className="flex-1 border-0 outline-none bg-transparent text-[16px] text-ink placeholder:text-dim"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search across all knowledge…"
        />
        <span className="font-mono text-[11px] text-muted border border-line px-2 py-0.5 rounded-[4px]">esc</span>
      </div>

      {/* Filters */}
      <div className="flex gap-1.5 flex-wrap mb-[18px]">
        {S.filters.map((f) => (
          <button key={f.id}
            className={`inline-flex items-center gap-1.5 gap-2.5 py-[5px] rounded-full text-[12px] border cursor-pointer transition-colors ${activeFilter === f.id ? "bg-ink text-accent border-ink" : "bg-surface border-line text-ink-2 hover:border-line-2"}`}
            onClick={() => setActiveFilter(f.id)}
          >
            {f.label}
            <span className={`font-mono text-[10.5px] px-[5px] rounded-[3px] ${activeFilter === f.id ? "bg-white/10 text-accent" : "bg-bg-2 text-muted"}`}>{f.count}</span>
          </button>
        ))}
      </div>

      {/* AI answer card */}
      <div className="flex gap-3 px-[18px] py-4 bg-gradient-to-b from-surface to-bg-2 border border-line rounded-[18px] mb-[22px]">
        <div className="w-[30px] h-[30px] rounded-full bg-ink text-accent grid place-items-center text-[12px] font-semibold shrink-0">
          <WorkspaceIcon name="sparkle" size={14} />
        </div>
        <div className="flex-1">
          <div className="font-mono text-[10.5px] text-accent-ink tracking-[0.08em] uppercase mb-[6px]">AI answer · grounded in your sources</div>
          <p className="text-[14.5px] leading-[1.55] text-ink m-0" dangerouslySetInnerHTML={{ __html: S.ai }} />
          <div className="flex gap-2 mt-3 flex-wrap">
            {[
              { n: 1, src: "notion",     title: "Customer FAQ — Dock alignment offset" },
              { n: 2, src: "github",     title: "moos-planner / dock_approach.cpp" },
              { n: 3, src: "confluence", title: "Dock calibration procedure (rev 4)" },
            ].map((item) => (
              <button key={item.n} className="inline-flex items-center gap-2 gap-2.5 py-[5px] pl-2 bg-surface border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 hover:bg-bg-2 [transition:border-color_0.15s]">
                <span className="w-4 h-4 rounded-[4px] bg-accent text-accent-ink grid place-items-center font-mono text-[10px] font-bold">{item.n}</span>
                <SrcIcon src={item.src} size={10} />
                <span>{item.title}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="flex flex-col">
        {S.results.map((r, i) => (
          <div key={i} className="grid items-start gap-[14px] py-3.5 px-1 border-t border-line cursor-pointer hover:bg-bg-2 transition-colors"
            style={{ gridTemplateColumns: "auto 1fr auto" }}>
            <SrcIcon src={r.src} size={14} />
            <div>
              <div className="text-[14.5px] text-ink font-medium tracking-[-0.005em] leading-[1.4]"
                dangerouslySetInnerHTML={{ __html: r.title }} />
              <div className="text-[13px] text-ink-3 leading-[1.55] mt-1 text-wrap-pretty"
                dangerouslySetInnerHTML={{ __html: r.snippet }} />
              <div className="flex items-center gap-2 font-mono text-[11px] text-muted mt-[6px]">
                <SrcIcon src={r.src} size={9} />
                <span>{r.meta}</span>
              </div>
            </div>
            <div className="font-mono text-[11.5px] text-muted whitespace-nowrap">{r.when}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
