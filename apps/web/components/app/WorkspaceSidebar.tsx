"use client";
import SrcIcon from "@/components/app/SrcIcon";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import {
  type AccountState,
  type Screen,
  SOURCES,
  WORKSPACE_DATA,
} from "@/components/app/workspaceData";

interface WorkspaceSidebarProps {
  screen: Screen;
  activeThreadId: string;
  accountState: AccountState;
  onNavigate: (screen: Screen) => void;
  onOpenThread: (id: string) => void;
  /** Cycle to next desktop mode (full→compact→none). Desktop only. */
  onCycleMode?: () => void;
  /** Expand tablet icon-bar to full overlay. Shown only at 600–900 px. */
  onTabletExpand?: () => void;
  /** Force icon-only layout regardless of screen width (desktop compact mode). */
  compact?: boolean;
  /** Force full layout regardless of screen width (mobile/tablet overlay). */
  forceExpanded?: boolean;
}

const NAV_ITEMS: { screen: Screen; icon: string; label: string }[] = [
  { screen: "home", icon: "home", label: "Home" },
  { screen: "library", icon: "library", label: "Library" },
  { screen: "search", icon: "search", label: "Search" },
  { screen: "connections", icon: "sources", label: "Sources" },
];

export default function WorkspaceSidebar({
  screen,
  activeThreadId,
  accountState,
  onNavigate,
  onOpenThread,
  onCycleMode,
  onTabletExpand,
  compact = false,
  forceExpanded = false,
}: WorkspaceSidebarProps) {
  const D = WORKSPACE_DATA;
  const conns = D.connectionsByState[accountState];

  const navCount: Partial<Record<Screen, number>> = {
    ask: D.threads.length,
    library: D.pinned.length,
    connections: conns.length,
  };

  // isCompact: icon-only forced on desktop (not CSS-breakpoint driven)
  const isCompact = compact && !forceExpanded;

  // Responsive helpers — three cases: forceExpanded, isCompact, default (CSS breakpoint)
  const hideInCompact = forceExpanded
    ? ""
    : isCompact
      ? "hidden"
      : "max-[900px]:hidden";
  const switcherCompact = forceExpanded
    ? ""
    : isCompact
      ? "px-0 justify-center mb-2"
      : "max-[900px]:px-0 max-[900px]:justify-center max-[900px]:mb-2";
  const ctaCompact = forceExpanded
    ? ""
    : isCompact
      ? "px-0 py-0 w-10 h-10 justify-center mx-auto"
      : "max-[900px]:px-0 max-[900px]:py-0 max-[900px]:w-10 max-[900px]:h-10 max-[900px]:justify-center max-[900px]:mx-auto";
  const navItemCompact = forceExpanded
    ? ""
    : isCompact
      ? "justify-center px-0 py-2"
      : "max-[900px]:justify-center max-[900px]:px-0 max-[900px]:py-2";
  const userCardCompact = forceExpanded
    ? ""
    : isCompact
      ? "px-0 justify-center -mx-2"
      : "max-[900px]:px-0 max-[900px]:justify-center max-[900px]:-mx-2";
  const spacer = forceExpanded
    ? ""
    : isCompact
      ? "flex-1"
      : "min-[901px]:hidden flex-1";
  const asidePx = forceExpanded
    ? "px-3"
    : isCompact
      ? "px-2"
      : "px-3 max-[900px]:px-2";

  const toggleBtnClass =
    "w-8 h-8 rounded-[8px] bg-surface border border-line text-ink-2 grid place-items-center hover:bg-surface-2 hover:text-ink [transition:background_0.15s,color_0.15s] shrink-0";

  return (
    <aside
      className={`bg-bg-2 border-r border-line flex flex-col h-full pt-[14px] pb-[14px] gap-1 overflow-hidden min-h-0 ${asidePx}`}
    >
      {/* ── Tablet expand button — 600–900 px only ── */}
      {onTabletExpand && !forceExpanded && !isCompact && (
        <button
          type="button"
          className={`${toggleBtnClass} mx-auto mb-2 min-[901px]:hidden max-[600px]:hidden`}
          onClick={onTabletExpand}
          title="Expand sidebar"
        >
          <WorkspaceIcon name="chev-r" size={14} />
        </button>
      )}

      {/* ── Desktop compact-mode expand button ── */}
      {onCycleMode && isCompact && (
        <button
          type="button"
          className={`${toggleBtnClass} mx-auto mb-2 max-[900px]:hidden`}
          onClick={onCycleMode}
          title="Expand sidebar"
        >
          <WorkspaceIcon name="chev-r" size={14} />
        </button>
      )}

      {/* ── Workspace switcher ── */}
      <div
        className={`flex items-center gap-[10px] px-2 py-2 rounded-[10px] mb-3.5 cursor-pointer hover:bg-surface-2 [transition:background_0.15s] ${switcherCompact}`}
      >
        <div className="w-[30px] h-[30px] rounded-[8px] bg-ink grid place-items-center shrink-0">
          <svg
            width="22"
            height="22"
            viewBox="0 0 32 32"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="16" cy="16" r="13" stroke="#C8FF7B" strokeWidth="2" />
            <circle cx="12" cy="14" r="1.6" fill="#C8FF7B" />
            <circle cx="20" cy="14" r="1.6" fill="#C8FF7B" />
            <path
              d="M11 19c1.5 1.6 3.2 2.2 5 2.2s3.5-.6 5-2.2"
              stroke="#C8FF7B"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
          </svg>
        </div>
        <div className={`flex flex-col min-w-0 flex-1 ${hideInCompact}`}>
          <div className="text-[14px] font-semibold text-ink tracking-[-0.01em] truncate">
            {D.org.name}
          </div>
          <div className="text-[11px] text-muted font-mono">{D.org.plan}</div>
        </div>
        {/* Desktop full-mode collapse — always visible, has background + border */}
        {onCycleMode && !isCompact && !forceExpanded && (
          <button
            type="button"
            className="w-7 h-7 rounded-[7px] bg-surface border border-line text-ink-2 grid place-items-center shrink-0 hover:bg-surface-2 hover:text-ink [transition:background_0.15s,color_0.15s] max-[900px]:hidden"
            onClick={(e) => {
              e.stopPropagation();
              onCycleMode();
            }}
            title="Collapse sidebar"
          >
            <WorkspaceIcon name="chev-l" size={13} />
          </button>
        )}
        {(forceExpanded || (!onCycleMode && !isCompact)) && (
          <span className={`text-muted shrink-0 ${hideInCompact}`}>
            <WorkspaceIcon name="chev-d" size={12} />
          </span>
        )}
      </div>

      {/* ── Ask CTA ── */}
      <button
        type="button"
        className={`flex items-center gap-[10px] px-3 py-[10px] bg-ink text-accent rounded-[10px] text-[13.5px] font-medium mb-3 hover:bg-ink-2 transition-colors ${ctaCompact}`}
        onClick={() => onOpenThread(activeThreadId)}
      >
        <WorkspaceIcon name="sparkle" size={13} />
        <span className={hideInCompact}>Ask anything</span>
        <span
          className={`ml-auto font-mono text-[11px] text-dim bg-white/[0.06] px-[6px] py-[1px] rounded-[4px] ${hideInCompact}`}
        >
          ⌘K
        </span>
      </button>

      {/* ── Primary nav ── */}
      <div className="flex flex-col gap-[2px]">
        {NAV_ITEMS.map((item) => {
          const active = screen === item.screen;
          const count = navCount[item.screen];
          return (
            <button
              key={item.screen}
              type="button"
              className={`flex items-center gap-[10px] px-2 py-[7px] rounded-[7px] text-[13.5px] cursor-pointer [transition:background_0.12s,color_0.12s] ${navItemCompact} ${active ? "bg-surface text-ink font-medium shadow-[0_1px_2px_rgba(14,17,10,0.04),inset_0_0_0_1px_var(--line)]" : "text-ink-2 hover:bg-surface-2 hover:text-ink"}`}
              onClick={() => onNavigate(item.screen)}
            >
              <span
                className={`w-4 h-4 grid place-items-center shrink-0 ${active ? "text-accent-ink" : "text-muted"}`}
              >
                <WorkspaceIcon name={item.icon} />
              </span>
              <span className={hideInCompact}>{item.label}</span>
              {count !== undefined && (
                <span
                  className={`ml-auto font-mono text-[10.5px] px-[6px] py-[1px] rounded-[4px] ${hideInCompact} ${active ? "bg-accent text-accent-ink" : "bg-surface-2 text-muted"}`}
                >
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Recent threads ── */}
      <div
        className={`font-mono text-[10.5px] text-dim tracking-[0.08em] uppercase px-2 pt-[14px] pb-[6px] font-medium ${hideInCompact}`}
      >
        Recent
      </div>
      <div
        className={`flex-1 overflow-y-auto min-h-[60px] mt-1 [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent] ${hideInCompact}`}
      >
        {D.threads.map((thr) => {
          const active = screen === "ask" && activeThreadId === thr.id;
          return (
            <button
              key={thr.id}
              type="button"
              className={`flex items-center gap-[10px] px-2 py-[6px] rounded-[6px] text-[13px] cursor-pointer truncate hover:bg-surface-2 hover:text-ink [transition:background_0.12s] text-left ${active ? "text-ink" : "text-ink-3"}`}
              onClick={() => onOpenThread(thr.id)}
            >
              <span
                className={`w-[5px] h-[5px] rounded-full shrink-0 ${active ? "bg-accent-2" : "bg-line-3"}`}
              />
              <span className="truncate flex-1">{thr.q}</span>
            </button>
          );
        })}
      </div>

      {/* ── Connected sources ── */}
      <div
        className={`flex items-center justify-between px-2 pt-[14px] pb-[6px] ${hideInCompact}`}
      >
        <span className="font-mono text-[10.5px] text-dim tracking-[0.08em] uppercase font-medium">
          Connected
        </span>
        <button
          type="button"
          className="text-muted hover:text-ink transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("connections");
          }}
        >
          <WorkspaceIcon name="plus" size={13} />
        </button>
      </div>
      <div className={`flex flex-col gap-[1px] pb-2 ${hideInCompact}`}>
        {conns.length === 0 && (
          <div className="px-2 text-[12px] text-muted">
            No sources connected.
            <div className="mt-1">
              <button
                type="button"
                className="text-accent-ink bg-accent px-[10px] py-1 rounded-[6px] font-mono text-[11px]"
                onClick={() => onNavigate("connections")}
              >
                Connect →
              </button>
            </div>
          </div>
        )}
        {conns.slice(0, 5).map((c) => (
          <div
            key={c.src}
            className="flex items-center gap-[10px] px-2 py-[6px] rounded-[6px] text-[12.5px] text-ink-3"
          >
            <span className="w-4 h-4 grid place-items-center shrink-0">
              <SrcIcon src={c.src} size={11} />
            </span>
            <span className="flex-1">{SOURCES[c.src]?.label}</span>
            <span
              className={`w-[6px] h-[6px] rounded-full ${c.status === "warn" ? "bg-warning shadow-[0_0_0_2px_var(--warning-soft)]" : "bg-accent-2 shadow-[0_0_0_2px_var(--accent-soft)]"}`}
            />
          </div>
        ))}
        {conns.length > 5 && (
          <button
            type="button"
            className="flex items-center gap-[10px] px-2 py-[6px] text-muted text-[12.5px] cursor-pointer hover:text-ink text-left"
            onClick={() => onNavigate("connections")}
          >
            <span className="w-4 h-4 shrink-0" />
            <span>+ {conns.length - 5} more</span>
          </button>
        )}
      </div>

      {/* Spacer — pushes user card to bottom in icon-only modes */}
      {spacer && <div className={spacer} />}

      {/* ── User card ── */}
      <div
        className={`flex items-center gap-[10px] px-3 py-3 border-t border-line -mx-3 mt-[6px] cursor-pointer hover:bg-surface-2 [transition:background_0.15s] ${userCardCompact}`}
      >
        <div className="w-7 h-7 rounded-full bg-accent text-accent-ink grid place-items-center text-[12px] font-semibold shrink-0">
          {D.user.initials}
        </div>
        <div className={`flex flex-col flex-1 min-w-0 ${hideInCompact}`}>
          <div className="text-[13px] font-medium text-ink truncate">
            {D.user.name}
          </div>
          <div className="text-[11.5px] text-muted truncate">{D.user.role}</div>
        </div>
        <button
          type="button"
          className={`w-7 h-7 rounded-[7px] text-ink-2 grid place-items-center hover:bg-surface-3 transition-colors ${hideInCompact}`}
        >
          <WorkspaceIcon name="settings" size={13} />
        </button>
      </div>
    </aside>
  );
}
