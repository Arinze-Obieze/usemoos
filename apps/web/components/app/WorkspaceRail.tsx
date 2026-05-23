import type { Citation } from "@usemoos/types";
import SrcIcon from "@/components/app/SrcIcon";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import type { Screen } from "@usemoos/types";
import { integrationTypeToSrcKey } from "@/lib/api";

interface WorkspaceRailProps {
  screen: Screen;
  citations?: Citation[];
}

const SYNC_ACTIVITY = [
  { src: "slack", t: "live", note: "#fleet-ops · 14 new messages" },
  { src: "notion", t: "2m", note: "Field runbook · updated by Sara" },
  { src: "github", t: "8m", note: "moos-planner · 3 PRs merged" },
  { src: "linear", t: "live", note: "Perception · 2 issues closed" },
  { src: "drive", t: "12h", note: "Q3 strategy.docx · re-indexed", warn: true },
] as const;

const TRENDING = [
  "Q3 OKR alignment",
  "Dock calibration",
  "Firmware v2.4 rollout",
  "Customer SLA terms",
];

const SHORTCUTS: [string, string][] = [
  ["Open Ask", "⌘K"],
  ["New thread", "⌘N"],
  ["Switch source filter", "⌘⇧F"],
  ["Pin answer", "⌘D"],
];

function RailLabel({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="font-mono text-[10.5px] text-dim tracking-[0.08em] uppercase font-medium m-0 mb-3">
      {children}
    </h4>
  );
}

function RailBlock({ children }: { children: React.ReactNode }) {
  return <div className="mb-7">{children}</div>;
}

function AskRail({ citations }: { citations: Citation[] }) {
  if (citations.length === 0) {
    return (
      <RailBlock>
        <RailLabel>Sources cited</RailLabel>
        <p className="text-[12.5px] text-muted">
          Citations will appear here as the answer streams in.
        </p>
      </RailBlock>
    );
  }

  return (
    <RailBlock>
      <RailLabel>Sources cited</RailLabel>
      {citations.map((c, i) => {
        const src = integrationTypeToSrcKey(c.source_type);
        return (
          <button
            type="button"
            key={c.source_id}
            className="w-full text-left flex gap-2.5 items-start bg-surface border border-line rounded-[10px] px-3.5 py-3 mb-2 cursor-pointer hover:border-line-2 [transition:border-color_0.15s]"
            onClick={() => c.source_url && window.open(c.source_url, "_blank")}
          >
            <SrcIcon src={src} size={14} />
            <div className="flex-1 min-w-0">
              <div className="text-ink text-[13px] font-medium leading-[1.35] line-clamp-2">
                {c.source_title}
              </div>
              <div className="flex items-center gap-1.5 text-muted font-mono text-[11px] mt-0.75">
                {src}
              </div>
              {c.excerpt && (
                <p className="text-[12px] text-ink-3 leading-[1.5] mt-2 px-2.5 py-2 bg-bg-2 rounded-[6px] border-l-2 border-accent italic m-0">
                  &quot;{c.excerpt}&quot;
                </p>
              )}
            </div>
            <div className="shrink-0 w-[18px] h-[18px] rounded-[4px] bg-accent text-accent-ink grid place-items-center font-mono text-[10.5px] font-bold">
              {i + 1}
            </div>
          </button>
        );
      })}
    </RailBlock>
  );
}

function DefaultRail() {
  return (
    <>
      <RailBlock>
        <RailLabel>Sync activity</RailLabel>
        <div className="flex flex-col gap-2">
          {SYNC_ACTIVITY.map((s) => (
            <div
              key={s.note}
              className="flex items-center gap-2.5 py-2 bg-surface border border-line rounded-[8px] text-[12px]"
            >
              <SrcIcon src={s.src} size={11} />
              <div className="flex-1 min-w-0 text-ink-2 truncate">{s.note}</div>
              <span
                className={`font-mono text-[10.5px] whitespace-nowrap ${"warn" in s && s.warn ? "text-warning" : "text-muted"}`}
              >
                {s.t}
              </span>
            </div>
          ))}
        </div>
      </RailBlock>

      <RailBlock>
        <RailLabel>Trending in Lumen</RailLabel>
        <div className="flex flex-col gap-1.5">
          {TRENDING.map((t, i) => (
            <div
              key={t}
              className="flex items-center gap-2 py-[6px] rounded-[6px] text-[12.5px] text-ink-2 cursor-pointer bg-surface border border-line hover:border-line-2 transition-colors"
            >
              <span className="font-mono text-muted text-[11px]">0{i + 1}</span>
              <span className="flex-1">{t}</span>
              <WorkspaceIcon name="chev-r" size={11} />
            </div>
          ))}
        </div>
      </RailBlock>

      <RailBlock>
        <RailLabel>Your shortcuts</RailLabel>
        <div className="flex flex-col gap-1 text-[12.5px]">
          {SHORTCUTS.map(([label, kbd]) => (
            <div
              key={label}
              className="flex items-center px-2 py-[5px] text-ink-3"
            >
              <span className="flex-1">{label}</span>
              <span className="font-mono text-[11px] text-muted bg-surface border border-line px-[6px] py-[1px] rounded-[4px]">
                {kbd}
              </span>
            </div>
          ))}
        </div>
      </RailBlock>
    </>
  );
}

/** Shared content — used in both the desktop grid rail and the mobile/tablet overlay. */
export function RailContent({ screen, citations = [] }: WorkspaceRailProps) {
  return screen === "ask" ? <AskRail citations={citations} /> : <DefaultRail />;
}

export default function WorkspaceRail({
  screen,
  citations = [],
}: WorkspaceRailProps) {
  return (
    <div className="border-l border-line bg-bg-2 overflow-y-auto px-[22px] pt-7 pb-10 min-h-0 [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent]">
      <RailContent screen={screen} citations={citations} />
    </div>
  );
}
