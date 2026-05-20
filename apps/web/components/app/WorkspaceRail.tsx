import { ACTIVE_THREAD } from "@/components/app/workspaceData";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import SrcIcon from "@/components/app/SrcIcon";
import type { Screen } from "@/components/app/workspaceData";

interface WorkspaceRailProps {
  screen: Screen;
}

const SYNC_ACTIVITY = [
  { src: "slack",  t: "live", note: "#fleet-ops · 14 new messages" },
  { src: "notion", t: "2m",   note: "Field runbook · updated by Sara" },
  { src: "github", t: "8m",   note: "moos-planner · 3 PRs merged" },
  { src: "linear", t: "live", note: "Perception · 2 issues closed" },
  { src: "drive",  t: "12h",  note: "Q3 strategy.docx · re-indexed", warn: true },
] as const;

const TRENDING = [
  "Q3 OKR alignment",
  "Dock calibration",
  "Firmware v2.4 rollout",
  "Customer SLA terms",
];

const SHORTCUTS: [string, string][] = [
  ["Open Ask",             "⌘K"],
  ["New thread",           "⌘N"],
  ["Switch source filter", "⌘⇧F"],
  ["Pin answer",           "⌘D"],
];

function RailLabel({ children }: { children: React.ReactNode }) {
  return <h4 className="font-mono text-[10.5px] text-dim tracking-[0.08em] uppercase font-medium m-0 mb-3">{children}</h4>;
}

function RailBlock({ children }: { children: React.ReactNode }) {
  return <div className="mb-7">{children}</div>;
}

function AskRail() {
  const T = ACTIVE_THREAD;
  const aiMsg = T.messages.find((m) => m.role === "ai");

  return (
    <>
      <RailBlock>
        <RailLabel>Sources cited</RailLabel>
        {aiMsg?.sources?.map((src) => (
          <div key={src.n} className="flex gap-2.5 items-start bg-surface border border-line rounded-[10px] px-3.5 py-3 mb-2 cursor-pointer hover:border-line-2 [transition:border-color_0.15s]">
            <SrcIcon src={src.src} size={14} />
            <div className="flex-1 min-w-0">
              <div className="text-ink text-[13px] font-medium leading-[1.35] line-clamp-2">{src.title}</div>
              <div className="flex items-center gap-1.5 text-muted font-mono text-[11px] mt-0.75">{src.meta}</div>
              <p className="text-[12px] text-ink-3 leading-[1.5] mt-2 gap-2.5 py-2 bg-bg-2 rounded-[6px] border-l-2 border-accent italic m-0">
                &quot;{src.excerpt}&quot;
              </p>
            </div>
            <div className="shrink-0 w-[18px] h-[18px] rounded-[4px] bg-accent text-accent-ink grid place-items-center font-mono text-[10.5px] font-bold">{src.n}</div>
          </div>
        ))}
      </RailBlock>

      <RailBlock>
        <RailLabel>Who to ask</RailLabel>
        <div className="flex flex-col gap-2">
          {T.people.map((p, i) => (
            <div key={i} className="flex items-center gap-2.5 gap-2.5 py-2 bg-surface border border-line rounded-[10px] text-[12.5px]">
              <div className="w-[26px] h-[26px] rounded-full bg-surface-2 text-ink-2 grid place-items-center text-[11px] font-semibold shrink-0">{p.initials}</div>
              <div>
                <div className="text-ink font-medium">{p.name}</div>
                <div className="text-muted text-[11px]">{p.role}</div>
              </div>
              <div className="ml-auto font-mono text-[10.5px] text-muted">{p.meta}</div>
            </div>
          ))}
        </div>
      </RailBlock>

      <RailBlock>
        <RailLabel>Permission check</RailLabel>
        <div className="bg-surface border border-line rounded-[10px] px-3.5 py-3">
          {T.perms.map((p, i) => (
            <div key={i} className="flex items-center gap-2 py-[6px] border-b border-dashed border-line last:border-b-0 text-[12px] text-ink-2">
              <WorkspaceIcon name={p.ok ? "check" : "lock"} size={12} />
              <span>{p.label}</span>
              <span className={`ml-auto font-mono text-[10px] font-semibold px-1.75 py-0.5 rounded-full ${p.ok ? "bg-accent text-accent-ink" : "bg-[var(--danger-soft)] text-danger"}`}>
                {p.ok ? "ALLOWED" : "FILTERED"}
              </span>
            </div>
          ))}
        </div>
      </RailBlock>
    </>
  );
}

function DefaultRail() {
  return (
    <>
      <RailBlock>
        <RailLabel>Sync activity</RailLabel>
        <div className="flex flex-col gap-2">
          {SYNC_ACTIVITY.map((s, i) => (
            <div key={i} className="flex items-center gap-2.5 gap-2.5 py-2 bg-surface border border-line rounded-[8px] text-[12px]">
              <SrcIcon src={s.src} size={11} />
              <div className="flex-1 min-w-0 text-ink-2 truncate">{s.note}</div>
              <span className={`font-mono text-[10.5px] whitespace-nowrap ${"warn" in s && s.warn ? "text-warning" : "text-muted"}`}>{s.t}</span>
            </div>
          ))}
        </div>
      </RailBlock>

      <RailBlock>
        <RailLabel>Trending in Lumen</RailLabel>
        <div className="flex flex-col gap-1.5">
          {TRENDING.map((t, i) => (
            <div key={i} className="flex items-center gap-2 gap-2.5 py-[6px] rounded-[6px] text-[12.5px] text-ink-2 cursor-pointer bg-surface border border-line hover:border-line-2 transition-colors">
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
            <div key={label} className="flex items-center px-2 py-[5px] text-ink-3">
              <span className="flex-1">{label}</span>
              <span className="font-mono text-[11px] text-muted bg-surface border border-line px-[6px] py-[1px] rounded-[4px]">{kbd}</span>
            </div>
          ))}
        </div>
      </RailBlock>
    </>
  );
}

/** Shared content — used in both the desktop grid rail and the mobile/tablet overlay. */
export function RailContent({ screen }: WorkspaceRailProps) {
  return screen === "ask" ? <AskRail /> : <DefaultRail />;
}

export default function WorkspaceRail({ screen }: WorkspaceRailProps) {
  return (
    <div className="border-l border-line bg-bg-2 overflow-y-auto px-[22px] pt-7 pb-10 min-h-0 [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent]">
      <RailContent screen={screen} />
    </div>
  );
}
