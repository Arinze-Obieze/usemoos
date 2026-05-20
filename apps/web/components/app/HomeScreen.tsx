"use client";
import { useState } from "react";
import SrcIcon from "@/components/app/SrcIcon";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import {
  type AccountState,
  SOURCES,
  WORKSPACE_DATA,
} from "@/components/app/workspaceData";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface HomeScreenProps {
  accountState: AccountState;
  showOnboarding: boolean;
  onDismissOnboarding: () => void;
  onAsk: (q?: string) => void;
  onOpenThread: (id: string) => void;
}

function OnboardingCard({ onDismiss }: { onDismiss: () => void }) {
  const D = WORKSPACE_DATA;
  const completed = D.onboarding.filter((s) => s.done).length;
  const total = D.onboarding.length;
  const pct = completed / total;
  const R = 14;
  const C = 2 * Math.PI * R;

  return (
    <div className="relative bg-surface border border-line rounded-[18px] p-[22px_24px] mb-6 overflow-hidden">
      <div
        className="absolute -right-20 -top-20 w-70 h-70 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, var(--accent-soft) 0%, transparent 60%)",
        }}
      />
      <div className="relative flex items-start justify-between mb-4.5">
        <div>
          <h3 className="text-[17px] font-semibold tracking-[-0.01em] text-ink mb-1">
            Finish setting up your workspace
          </h3>
          <p className="text-[13.5px] text-muted m-0">
            A few more steps and your team can start asking questions across
            every system.
          </p>
        </div>
        <div className="flex items-center gap-2.5 font-mono text-[12px] text-ink-2 ml-4 shrink-0">
          <svg className="w-9 h-9" viewBox="0 0 36 36" aria-hidden="true">
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              stroke="var(--line)"
              strokeWidth="3"
            />
            <circle
              cx="18"
              cy="18"
              r={R}
              fill="none"
              stroke="var(--accent-2)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={`${C * pct} ${C}`}
              transform="rotate(-90 18 18)"
            />
          </svg>
          {completed}/{total}
        </div>
        <button
          type="button"
          className="absolute top-0 right-0 w-7 h-7 rounded-[6px] text-muted flex items-center justify-center hover:bg-surface-2 hover:text-ink transition-colors"
          onClick={onDismiss}
        >
          <WorkspaceIcon name="close" size={14} />
        </button>
      </div>
      <ol className="list-none p-0 m-0 grid grid-cols-2 max-[440px]:grid-cols-1 gap-2">
        {D.onboarding.map((step) => (
          <li
            key={step.id}
            className={`flex items-center gap-3 px-3 py-2.5 bg-bg-2 border rounded-[10px] text-[13.5px] cursor-pointer [transition:border-color_0.15s,background_0.15s] hover:border-line-2 ${step.done ? "border-line text-muted" : "border-line text-ink-2"}`}
          >
            <span
              className={`w-4.5 h-4.5 rounded-full border-[1.5px] grid place-items-center shrink-0 transition-colors ${step.done ? "bg-accent border-accent-2 text-accent-ink" : "bg-surface border-line-2 text-transparent"}`}
            >
              {step.done && <WorkspaceIcon name="check" size={11} />}
            </span>
            <span className={step.done ? "line-through decoration-line-2" : ""}>
              {step.label}
            </span>
            {!step.done && (
              <span className="ml-auto text-dim">
                <WorkspaceIcon name="chev-r" size={12} />
              </span>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}

function Composer({ onAsk }: { onAsk: (q: string) => void }) {
  const [value, setValue] = useState("");
  const [scope, setScope] = useState("all");

  const submit = () => {
    if (!value.trim()) return;
    onAsk(value.trim());
    setValue("");
  };

  return (
    <div className="bg-surface border border-line rounded-[18px] p-[18px_20px_14px] shadow-[0_1px_3px_rgba(14,17,10,0.03)] [transition:border-color_0.18s,box-shadow_0.18s] focus-within:border-line-3 focus-within:shadow-[0_4px_18px_rgba(14,17,10,0.06)] mb-7">
      <Textarea
        rows={2}
        className="border-0 bg-transparent p-0 text-[17px] leading-[1.45] tracking-[-0.005em] min-h-14 shadow-none focus:border-transparent focus:shadow-none"
        placeholder="Ask anything across your connected knowledge…"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            submit();
          }
        }}
      />
      <div className="flex items-center gap-2 mt-2">
        <button
          type="button"
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[12px] border [transition:border-color_0.15s,background_0.15s] ${scope === "all" ? "bg-accent border-accent-2 text-accent-ink" : "bg-bg-2 border-line text-ink-2 hover:border-line-2 hover:bg-surface-2"}`}
          onClick={() => setScope("all")}
        >
          <span className={scope === "all" ? "text-accent-ink" : "text-muted"}>
            <WorkspaceIcon name="globe" size={11} />
          </span>
          All sources
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-bg-2 border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 hover:bg-surface-2 [transition:border-color_0.15s,background_0.15s] cursor-pointer"
          onClick={() => setScope("scope")}
        >
          <span className="text-muted">
            <WorkspaceIcon name="filter" size={11} />
          </span>
          Scope
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2.5 py-1 bg-bg-2 border border-line rounded-full text-[12px] text-ink-2 hover:border-line-2 hover:bg-surface-2 [transition:border-color_0.15s,background_0.15s] cursor-pointer"
          onClick={() => setScope("att")}
        >
          <span className="text-muted">
            <WorkspaceIcon name="att" size={11} />
          </span>
          Attach
        </button>
        <Button
          size="icon"
          className="ml-auto text-accent disabled:bg-surface-2 disabled:text-dim"
          onClick={submit}
          disabled={!value.trim()}
          aria-label="Send message"
        >
          <WorkspaceIcon name="send" size={14} />
        </Button>
      </div>
    </div>
  );
}

export default function HomeScreen({
  accountState,
  showOnboarding,
  onDismissOnboarding,
  onAsk,
  onOpenThread,
}: HomeScreenProps) {
  const D = WORKSPACE_DATA;
  const connections = D.connectionsByState[accountState];
  const isNew = accountState === "new";
  const showChecklist = showOnboarding && (isNew || accountState === "partial");

  const greeting = (() => {
    const hr = new Date().getHours();
    if (hr < 5) return "Working late";
    if (hr < 12) return "Good morning";
    if (hr < 18) return "Good afternoon";
    return "Good evening";
  })();

  return (
    <div className="max-w-230 mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      {/* Greeting */}
      <div className="flex items-baseline justify-between mb-6.5 gap-6">
        <h1 className="text-[30px] max-[600px]:text-[24px] font-semibold leading-[1.1] text-wrap-balance m-0">
          {greeting},{" "}
          <em
            className="not-italic"
            style={{
              background:
                "linear-gradient(180deg, transparent 60%, var(--accent) 60%, var(--accent) 90%, transparent 90%)",
              padding: "0 0.08em",
            }}
          >
            {D.user.name.split(" ")[0]}
          </em>
        </h1>
        <div className="font-mono text-[12px] text-muted whitespace-nowrap max-[600px]:hidden">
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {showChecklist && <OnboardingCard onDismiss={onDismissOnboarding} />}

      <Composer onAsk={onAsk} />

      {/* Suggested prompts */}
      <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-2.5 mb-9.5">
        {D.suggested.map((s) => (
          <button
            type="button"
            key={s.q}
            className="flex flex-col gap-1.5 p-[14px_16px] bg-surface border border-line rounded-[10px] text-left cursor-pointer [transition:border-color_0.15s,transform_0.15s] hover:border-line-2 hover:-translate-y-px overflow-hidden relative"
            onClick={() => onAsk(s.q)}
          >
            <div className="flex items-center gap-2 font-mono text-[10.5px] text-accent-ink tracking-[0.08em] uppercase">
              <span className="inline-flex items-center px-1.75 py-0.5 bg-accent rounded-[4px] text-accent-ink font-bold">
                {s.tag}
              </span>
            </div>
            <div className="text-[14.5px] text-ink tracking-[-0.005em] leading-[1.4] mt-0.5">
              {s.q}
            </div>
            <div className="flex items-center gap-2 font-mono text-[11.5px] text-muted mt-1">
              <span className="inline-flex">
                {s.srcs.map((src) => (
                  <SrcIcon key={src} src={src} size={10} />
                ))}
              </span>
              <span>
                across {s.srcs.length}{" "}
                {s.srcs.length === 1 ? "source" : "sources"}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Recent threads */}
      {!isNew && (
        <>
          <div className="flex items-baseline justify-between my-2 mb-3.5">
            <h2 className="text-[15px] tracking-[-0.005em] font-semibold text-ink m-0">
              Pick up where you left off
            </h2>
            <button
              type="button"
              className="text-[12.5px] text-muted hover:text-ink flex items-center gap-1"
            >
              All threads <WorkspaceIcon name="chev-r" size={12} />
            </button>
          </div>
          <div className="flex flex-col border border-line rounded-[10px] bg-surface mb-8 overflow-hidden">
            {D.threads.slice(0, 4).map((t) => (
              <button
                key={t.id}
                type="button"
                className="grid grid-cols-[1fr_auto_auto] max-[600px]:grid-cols-[1fr_auto] items-center gap-4 max-[600px]:gap-3 px-4.5 max-[600px]:px-4 py-3.5 border-b border-line last:border-b-0 cursor-pointer hover:bg-bg-2 transition-colors text-left"
                onClick={() => onOpenThread(t.id)}
              >
                <div className="text-[14px] text-ink tracking-[-0.005em] truncate">
                  {t.q}
                  <em className="not-italic text-muted text-[13px] ml-2 max-[600px]:hidden">
                    {t.by}
                  </em>
                </div>
                <div className="inline-flex max-[600px]:hidden">
                  {t.srcs.map((s) => (
                    <SrcIcon key={s} src={s} size={11} />
                  ))}
                </div>
                <div className="font-mono text-[11.5px] text-muted whitespace-nowrap">
                  {t.when}
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Sources health */}
      <div className="flex items-baseline justify-between my-2 mb-3.5">
        <h2 className="text-[15px] tracking-[-0.005em] font-semibold text-ink m-0">
          Connected knowledge
        </h2>
        <button
          type="button"
          className="text-[12.5px] text-muted hover:text-ink flex items-center gap-1"
        >
          Manage sources <WorkspaceIcon name="chev-r" size={12} />
        </button>
      </div>
      <div className="bg-surface border border-line rounded-[10px] p-[18px_20px] mb-8">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-[14px] font-semibold m-0 text-ink">
            {connections.length}{" "}
            {connections.length === 1 ? "source" : "sources"} ·{" "}
            {connections
              .reduce((a, c) => a + (c.docs || 0), 0)
              .toLocaleString()}{" "}
            documents indexed
          </h3>
          <div
            className={`flex items-center gap-1.5 font-mono text-[11.5px] text-muted ${connections.some((c) => c.status === "warn") ? "text-warning" : ""}`}
          >
            <span
              className={`w-1.5 h-1.5 rounded-full ${connections.some((c) => c.status === "warn") ? "bg-warning shadow-[0_0_0_2px_var(--warning-soft)]" : "bg-accent-2 shadow-[0_0_0_2px_var(--accent-soft)]"}`}
            />
            {connections.some((c) => c.status === "warn")
              ? "1 needs attention"
              : "All systems syncing"}
          </div>
        </div>
        <div className="grid grid-cols-2 max-[440px]:grid-cols-1 gap-2.5">
          {connections.length === 0 && (
            <div className="col-span-2 flex items-center justify-center gap-2.5 py-2 bg-bg-2 rounded-[8px] text-[12.5px] text-muted">
              No sources connected yet. Connect Notion, Slack, or Drive to get
              started.
            </div>
          )}
          {connections.slice(0, 6).map((c) => (
            <div
              key={c.src}
              className={`flex items-center gap-2.5 py-2 bg-bg-2 rounded-[8px] text-[12.5px] ${c.status === "warn" ? "text-warning" : ""}`}
            >
              <SrcIcon src={c.src} size={12} />
              <div>
                <div className="text-ink font-medium">
                  {SOURCES[c.src]?.label}
                </div>
                <div className="font-mono text-[11px] text-muted">
                  {c.docs.toLocaleString()} docs
                </div>
              </div>
              <div
                className={`ml-auto font-mono text-[11px] ${c.status === "warn" ? "text-warning" : "text-muted"}`}
              >
                {c.status === "warn" ? "needs attention" : c.lastSync}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Team activity */}
      {!isNew && (
        <>
          <div className="flex items-baseline justify-between my-2 mb-3.5">
            <h2 className="text-[15px] tracking-[-0.005em] font-semibold text-ink m-0">
              From your team
            </h2>
            <button
              type="button"
              className="text-[12.5px] text-muted hover:text-ink flex items-center gap-1"
            >
              Activity feed <WorkspaceIcon name="chev-r" size={12} />
            </button>
          </div>
          <div className="flex flex-col border border-line rounded-[10px] bg-surface overflow-hidden">
            {D.teamActivity.map((a) => (
              <button
                key={`${a.who}-${a.when}-${a.q}`}
                type="button"
                className="grid grid-cols-[1fr_auto_auto] max-[600px]:grid-cols-[1fr_auto] items-center gap-4 max-[600px]:gap-3 px-4.5 max-[600px]:px-4 py-3.5 border-b border-line last:border-b-0 cursor-pointer hover:bg-bg-2 transition-colors text-left"
                onClick={() => onOpenThread("t1")}
              >
                <div className="text-[14px] text-ink truncate">
                  <span className="text-muted">
                    <b className="text-ink-2 font-medium">{a.who}</b> {
                      a.action
                    }{" "}
                  </span>
                  {a.q}
                </div>
                <div className="inline-flex max-[600px]:hidden">
                  {a.srcs.map((s) => (
                    <SrcIcon key={s} src={s} size={11} />
                  ))}
                </div>
                <div className="font-mono text-[11.5px] text-muted whitespace-nowrap">
                  {a.when}
                </div>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
