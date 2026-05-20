"use client";
import { WORKSPACE_DATA, SOURCES, DISCOVER_CONNECTORS, type AccountState } from "@/components/app/workspaceData";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import SrcIcon from "@/components/app/SrcIcon";

interface ConnectionsScreenProps {
  accountState: AccountState;
}

const STATUS_STYLES: Record<string, string> = {
  ok:   "text-accent-ink bg-[var(--accent-soft)]",
  warn: "text-warning bg-[var(--warning-soft)]",
  err:  "text-danger bg-[var(--danger-soft)]",
  idle: "text-muted bg-surface-2",
};
const STATUS_DOT: Record<string, string> = {
  ok:   "bg-accent-3",
  warn: "bg-warning",
  err:  "bg-danger",
  idle: "bg-dim",
};
const STATUS_LABEL: Record<string, string> = {
  ok: "Syncing", warn: "Warn", err: "Error", idle: "Idle",
};

export default function ConnectionsScreen({ accountState }: ConnectionsScreenProps) {
  const D = WORKSPACE_DATA;
  const conns = D.connectionsByState[accountState];
  const totalDocs = conns.reduce((a, c) => a + (c.docs || 0), 0);
  const warns = conns.filter((c) => c.status === "warn").length;
  const ok = conns.filter((c) => c.status === "ok").length;

  return (
    <div className="max-w-295 mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      <div className="mb-7">
        <h1 className="text-[26px] tracking-[-0.02em] font-semibold m-0 mb-1 text-ink">Sources</h1>
        <p className="text-[14px] text-muted m-0">Connect the systems your team works in. Every answer is grounded in what's indexed here.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[440px]:grid-cols-2 gap-3 mb-6">
        {[
          { label: "Connected",        value: conns.length, badge: "active" },
          { label: "Documents indexed", value: totalDocs.toLocaleString(), badge: null },
          { label: "Healthy",          value: ok, badge: `of ${conns.length}` },
          { label: "Needs attention",  value: warns, badge: warns > 0 ? "investigate" : "all good", warn: warns > 0 },
        ].map((stat, i) => (
          <div key={i} className={`px-4 py-3.5 bg-surface border rounded-[10px] ${stat.warn ? "border-line" : "border-line"}`}>
            <div className="font-mono text-[10.5px] text-dim tracking-[0.08em] uppercase mb-1.5">{stat.label}</div>
            <div className="text-[26px] font-semibold tracking-[-0.02em] text-ink leading-none">
              {stat.value}
              {stat.badge && (
                <em className={`not-italic text-[18px] ml-1.5 px-[0.18em] rounded-[4px] align-[4px] ${stat.warn ? "bg-(--warning-soft) text-warning" : "bg-accent text-accent-ink"}`}>
                  {stat.badge}
                </em>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-line overflow-x-auto scrollbar-none">
        {[
          { label: "Connected", count: conns.length, active: true },
          { label: "Discover",  count: D.discover.length, active: false },
          { label: "Permissions", count: null, active: false },
          { label: "Sync log",    count: null, active: false },
        ].map((tab) => (
          <button key={tab.label}
            className={`px-3.5 py-2 text-[13px] border-b-2 -mb-px [transition:color_0.12s] ${tab.active ? "text-ink font-medium border-ink" : "text-muted border-transparent hover:text-ink-2"}`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`ml-1.5 font-mono text-[11px] ${tab.active ? "text-accent-ink" : "text-dim"}`}>{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Connection list */}
      {conns.length === 0 ? (
        <div className="py-12 px-8 bg-surface border border-dashed border-line-2 rounded-[10px] text-center text-muted text-[14px]">
          No sources connected yet. Pick one below to get started.
        </div>
      ) : (
        <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden mb-7">
          {conns.map((c) => (
            <div key={c.src} className="grid items-center gap-4.5 max-[600px]:gap-3 px-5 max-[600px]:px-4 py-4 border-b border-line last:border-b-0 grid-cols-[auto_1fr_auto_auto_auto] max-[600px]:grid-cols-[auto_1fr_auto]">
              <SrcIcon src={c.src} size={18} />
              <div>
                <div className="text-[15px] font-medium text-ink tracking-[-0.005em]">{SOURCES[c.src]?.label}</div>
                <div className="flex items-center gap-2 font-mono text-[11.5px] text-muted mt-0.5 flex-wrap">
                  <span>connected by {c.connectedBy}</span>
                  <span className="text-line-2 max-[600px]:hidden">·</span>
                  <span className="max-[600px]:hidden">last sync {c.lastSync}</span>
                  {c.note && <><span className="text-line-2 max-[600px]:hidden">·</span><span className="text-warning max-[600px]:hidden">{c.note}</span></>}
                </div>
              </div>
              <div className="text-right max-[600px]:hidden">
                <div className="font-mono text-[13px] text-ink font-medium">{c.docs.toLocaleString()}</div>
                <div className="font-mono text-[11px] text-muted">indexed</div>
              </div>
              <div className={`inline-flex items-center gap-1.5 font-mono text-[11.5px] px-2.5 py-1 rounded-full max-[600px]:hidden ${STATUS_STYLES[c.status] ?? STATUS_STYLES.idle}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.status] ?? STATUS_DOT.idle}`} />
                {STATUS_LABEL[c.status] ?? "Idle"}
              </div>
              <button className="px-3 py-1.5 border border-line rounded-full text-[12px] text-ink-2 bg-bg hover:border-line-2 hover:text-ink [transition:border-color_0.15s,color_0.15s]">
                Manage
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Discover more */}
      <div>
        <div className="flex items-baseline justify-between mb-3.5">
          <h2 className="text-[15px] tracking-[-0.005em] font-semibold text-ink m-0">Discover more</h2>
          <button className="flex items-center gap-1 text-[12.5px] text-muted hover:text-ink">Browse all 28 <WorkspaceIcon name="chev-r" size={12} /></button>
        </div>
        <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-3">
          {D.discover.map((s) => (
            <button key={s} className="flex flex-col gap-2 p-4.5 bg-surface border border-line rounded-[10px] text-left cursor-pointer [transition:border-color_0.15s,transform_0.15s] hover:border-line-2 hover:-translate-y-px">
              <SrcIcon src={s} size={16} />
              <div className="text-[14px] font-medium text-ink">{SOURCES[s]?.label}</div>
              <div className="text-[12.5px] text-muted leading-[1.4]">{DISCOVER_CONNECTORS[s]}</div>
              <button className="mt-auto self-start px-3 py-1.5 bg-ink text-accent border-0 rounded-full text-[12px] font-medium">Connect</button>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
