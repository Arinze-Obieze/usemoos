"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ConnectionsScreen from "@/components/app/ConnectionsScreen";
import HomeScreen from "@/components/app/HomeScreen";
import LibraryScreen from "@/components/app/LibraryScreen";
import SearchScreen from "@/components/app/SearchScreen";
import ThreadScreen from "@/components/app/ThreadScreen";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import WorkspaceRail, { RailContent } from "@/components/app/WorkspaceRail";
import WorkspaceSidebar from "@/components/app/WorkspaceSidebar";
import {
  ACTIVE_THREAD,
  type AccountState,
  type Screen,
} from "@/components/app/workspaceData";

type SidebarMode = "full" | "compact" | "none";

interface WorkspaceShellProps {
  initialScreen?: Screen;
}

const CRUMB_LABELS: Record<Screen, string> = {
  home: "Home",
  ask: ACTIVE_THREAD.q,
  connections: "Sources",
  library: "Library",
  search: "Search",
};

const SCREEN_HREFS: Record<Screen, string> = {
  home: "/workspace",
  ask: "/workspace/ask",
  connections: "/workspace/sources",
  library: "/workspace/library",
  search: "/workspace/search",
};

export default function WorkspaceShell({
  initialScreen = "home",
}: WorkspaceShellProps) {
  const router = useRouter();
  const [screen, setScreen] = useState<Screen>(initialScreen);
  const [sidebarMode, setSidebarMode] = useState<SidebarMode>("full");
  const [showRail, setShowRail] = useState(true);
  const [accountState] = useState<AccountState>("partial");
  const [showOnboarding, setShowOnboarding] = useState(true);
  const [activeThreadId, setActiveThreadId] = useState("t1");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [tabletSidebarOpen, setTabletSidebarOpen] = useState(false);
  const [mobileRailOpen, setMobileRailOpen] = useState(false);

  useEffect(() => {
    setScreen(initialScreen);
    setMobileNavOpen(false);
    setTabletSidebarOpen(false);
    setMobileRailOpen(false);
  }, [initialScreen]);

  const cycleSidebar = () =>
    setSidebarMode((m) =>
      m === "full" ? "compact" : m === "compact" ? "none" : "full",
    );

  const goTo = (s: Screen) => {
    setScreen(s);
    setMobileNavOpen(false);
    setTabletSidebarOpen(false);
    setMobileRailOpen(false);
    router.push(SCREEN_HREFS[s]);
  };
  const onAsk = (_q?: string) => {
    setActiveThreadId("t1");
    goTo("ask");
  };
  const onOpenThread = (id: string) => {
    setActiveThreadId(id);
    goTo("ask");
  };
  const showDesktopContextRail = screen === "ask" && showRail;

  const shellClass = [
    "ws-shell",
    sidebarMode === "compact" ? "ws-shell--compact" : "",
    sidebarMode === "none" ? "ws-shell--none" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const mainGridStyle = {
    gridTemplateColumns: showDesktopContextRail ? "1fr var(--rail-w)" : "1fr",
    gridTemplateRows: "var(--top-h) 1fr",
  };

  const topBtn =
    "w-[34px] h-[34px] rounded-[8px] text-ink-2 grid place-items-center hover:bg-surface-2 hover:text-ink transition-colors shrink-0";

  return (
    <>
      {/* ── App shell ── */}
      <div className={shellClass}>
        {/* Sidebar — hidden on mobile */}
        <div
          className="max-[600px]:hidden flex flex-col min-h-0 overflow-hidden"
          style={{ height: "100dvh" }}
        >
          <WorkspaceSidebar
            screen={screen}
            activeThreadId={activeThreadId}
            accountState={accountState}
            onNavigate={goTo}
            onOpenThread={onOpenThread}
            onCycleMode={cycleSidebar}
            onTabletExpand={() => setTabletSidebarOpen(true)}
            compact={sidebarMode === "compact"}
          />
        </div>

        {/* Main area */}
        <div
          className="ws-main grid overflow-hidden min-h-0"
          style={mainGridStyle}
        >
          {/* Top bar */}
          <header
            className="col-span-full flex items-center gap-2 px-4 max-[600px]:px-3 border-b border-line bg-bg"
            style={{ height: "var(--top-h)" }}
          >
            {/* Desktop: sidebar cycle toggle — always visible, cycles full→compact→none */}
            <button
              type="button"
              className={`${topBtn} max-[900px]:hidden`}
              title="Toggle sidebar"
              onClick={cycleSidebar}
            >
              <WorkspaceIcon name="sidebar" size={15} />
            </button>

            {/* Tablet: sidebar expand — opens full overlay */}
            <button
              type="button"
              className={`${topBtn} min-[901px]:hidden max-[600px]:hidden`}
              title="Expand sidebar"
              onClick={() => setTabletSidebarOpen(true)}
            >
              <WorkspaceIcon name="sidebar" size={15} />
            </button>

            {/* Mobile: hamburger */}
            <button
              type="button"
              className={`${topBtn} hidden max-[600px]:grid`}
              onClick={() => setMobileNavOpen(true)}
              aria-label="Open navigation"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h7" />
              </svg>
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-[13px] text-muted min-w-0 ml-1">
              <span className="text-ink font-medium truncate max-w-[200px] max-[600px]:max-w-[140px]">
                {CRUMB_LABELS[screen]}
              </span>
            </div>

            {/* Search trigger */}
            <button
              type="button"
              className="ml-auto flex items-center gap-[10px] w-[260px] max-[900px]:w-[200px] max-[600px]:w-8 max-[600px]:justify-center px-3 py-[7px] max-[600px]:px-0 bg-surface border border-line rounded-[8px] text-[13px] text-muted cursor-pointer hover:border-line-2 [transition:border-color_0.15s]"
              onClick={() => goTo("search")}
            >
              <WorkspaceIcon name="search" size={13} />
              <span className="max-[600px]:hidden">Search Lumen…</span>
              <span className="ml-auto font-mono text-[11px] bg-bg-2 border border-line px-[6px] py-[1px] rounded-[4px] max-[600px]:hidden">
                ⌘K
              </span>
            </button>

            {/* Context rail — tablet + mobile opens overlay */}
            {screen === "ask" && (
              <button
                type="button"
                className={`${topBtn} min-[901px]:hidden`}
                title="Sources & context"
                onClick={() => setMobileRailOpen(true)}
              >
                <WorkspaceIcon name="panel-r" size={15} />
              </button>
            )}

            {/* Bell */}
            <button
              type="button"
              className="relative w-[34px] h-[34px] rounded-[8px] text-ink-2 grid place-items-center hover:bg-surface-2 hover:text-ink transition-colors after:content-[''] after:absolute after:top-[7px] after:right-2 after:w-[6px] after:h-[6px] after:rounded-full after:bg-accent-2 after:border-2 after:border-bg"
            >
              <WorkspaceIcon name="bell" size={15} />
            </button>

            {/* Rail toggle — desktop only */}
            {screen === "ask" && (
              <button
                type="button"
                className={`${topBtn} max-[900px]:hidden`}
                title={showRail ? "Hide context panel" : "Show context panel"}
                onClick={() => setShowRail((v) => !v)}
              >
                <WorkspaceIcon name="panel-r" size={15} />
              </button>
            )}
          </header>

          {/* Canvas */}
          <main
            className={`min-h-0 bg-bg [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent] ${screen === "ask" ? "relative flex flex-col overflow-hidden" : "overflow-y-auto"}`}
          >
            {screen === "home" && (
              <HomeScreen
                accountState={accountState}
                showOnboarding={showOnboarding}
                onDismissOnboarding={() => setShowOnboarding(false)}
                onAsk={onAsk}
                onOpenThread={onOpenThread}
              />
            )}
            {screen === "ask" && <ThreadScreen onAsk={onAsk} />}
            {screen === "connections" && (
              <ConnectionsScreen accountState={accountState} />
            )}
            {screen === "library" && (
              <LibraryScreen onOpenThread={onOpenThread} />
            )}
            {screen === "search" && <SearchScreen />}
          </main>

          {/* Context rail — desktop grid */}
          {showDesktopContextRail && (
            <div className="max-[900px]:hidden min-h-0 overflow-hidden">
              <WorkspaceRail screen={screen} />
            </div>
          )}
        </div>
      </div>

      {/* ── Mobile sidebar overlay (<600px) ── */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-50 hidden max-[600px]:block">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            onClick={() => setMobileNavOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] shadow-[var(--shadow-xl)]">
            <WorkspaceSidebar
              screen={screen}
              activeThreadId={activeThreadId}
              accountState={accountState}
              onNavigate={goTo}
              onOpenThread={onOpenThread}
              forceExpanded
            />
          </div>
        </div>
      )}

      {/* ── Tablet sidebar overlay (600–900px) ── */}
      {tabletSidebarOpen && (
        <div className="fixed inset-0 z-50 min-[901px]:hidden max-[600px]:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            onClick={() => setTabletSidebarOpen(false)}
            aria-label="Close navigation"
          />
          <div className="absolute left-0 top-0 bottom-0 w-[280px] shadow-[var(--shadow-xl)]">
            <WorkspaceSidebar
              screen={screen}
              activeThreadId={activeThreadId}
              accountState={accountState}
              onNavigate={goTo}
              onOpenThread={onOpenThread}
              forceExpanded
            />
          </div>
        </div>
      )}

      {/* ── Mobile/tablet context rail overlay (≤900px) ── */}
      {screen === "ask" && mobileRailOpen && (
        <div className="fixed inset-0 z-50 min-[901px]:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-ink/30 backdrop-blur-[2px]"
            onClick={() => setMobileRailOpen(false)}
            aria-label="Close context panel"
          />
          <div className="absolute right-0 top-0 bottom-0 w-[300px] max-[440px]:w-[88vw] bg-bg-2 shadow-[var(--shadow-xl)] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-line shrink-0">
              <span className="text-[13px] font-semibold text-ink">
                Context
              </span>
              <button
                type="button"
                className="w-7 h-7 rounded-[7px] text-ink-2 grid place-items-center hover:bg-surface-2 hover:text-ink transition-colors"
                onClick={() => setMobileRailOpen(false)}
              >
                <WorkspaceIcon name="close" size={13} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-[22px] pt-6 pb-10 [scrollbar-width:thin] [scrollbar-color:var(--line-2)_transparent]">
              <RailContent screen={screen} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
