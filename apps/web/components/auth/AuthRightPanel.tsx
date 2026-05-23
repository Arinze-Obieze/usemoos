"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import MoosLogo from "@/components/marketing/MoosLogo";

const signupFeatures = [
  {
    title: "A private workspace, isolated from every other tenant.",
    sub: "Your knowledge graph, integration credentials, and billing are scoped to your org only.",
  },
  {
    title: "Connect Slack, Notion, Drive, GitHub in one click each.",
    sub: "OAuth-based. No data migration. Nothing to install on employee machines.",
  },
  {
    title: "Permission-aware retrieval from day one.",
    sub: "usemoos mirrors source-level access controls. Employees only see what they were allowed to see.",
  },
  {
    title: "Every answer cited and traceable.",
    sub: "Inline source previews on every response. No black-box guesses.",
  },
];

function CitBadge({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center justify-center min-w-4.25 h-4 px-1 rounded-xs font-mono text-[10.5px] font-bold align-[0.2em] mx-px"
      style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
    >
      {children}
    </span>
  );
}

function SourcePill({ num, label }: { num: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.75 rounded-full font-mono text-[10.5px] text-muted border border-line bg-bg-2">
      <span
        className="inline-flex items-center justify-center w-3.25 h-3.25 rounded-xs text-[9px] font-bold"
        style={{ background: "var(--accent)", color: "var(--accent-ink)" }}
      >
        {num}
      </span>
      {label}
    </span>
  );
}

function PreviewCard() {
  return (
    <div className="rounded-[14px] p-[18px_20px] max-w-110 bg-surface border border-line shadow-(--shadow-md)">
      <div className="flex items-center gap-2.5 font-mono text-[11px] tracking-[0.02em] mb-3.5 text-muted">
        <span className="text-accent-ink text-[14px]">✦</span>
        <span>Ask usemoos</span>
        <span className="flex-1" />
        <span className="px-1.75 py-0.5 rounded-[4px] text-[10px] font-semibold text-accent-ink bg-accent border border-accent-2">
          Live
        </span>
      </div>
      <div className="text-[14px] mb-3.5 pb-3.5 text-muted text-wrap-pretty border-b border-dashed border-line">
        What&apos;s our refund policy for annual enterprise contracts?
      </div>
      <div className="text-[14.5px] leading-[1.55] text-ink">
        Annual contracts are{" "}
        <strong className="font-semibold">non-refundable after 30 days</strong>,
        but customers can pause for up to 90 days <CitBadge>1</CitBadge>.
        Exceptions above $10k require{" "}
        <strong className="font-semibold">VP Finance</strong> approval{" "}
        <CitBadge>2</CitBadge>.
        <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3.5 border-t border-dashed border-line">
          <SourcePill num="1" label="Customer Agreement v4.2 · Notion" />
          <SourcePill num="2" label="#finance-approvals · Slack" />
        </div>
      </div>
    </div>
  );
}

function QuoteCard() {
  return (
    <div className="flex flex-col gap-3.5 max-w-110">
      <p className="text-[16px] leading-normal text-ink text-wrap-pretty">
        &ldquo;We started usemoos because we kept watching brilliant teams ask
        the same questions twice.{" "}
        <em
          className="not-italic"
          style={{
            background:
              "linear-gradient(180deg, transparent 60%, var(--accent) 60%, var(--accent) 92%, transparent 92%)",
            padding: "0 0.06em",
          }}
        >
          Org knowledge shouldn&apos;t be a scavenger hunt.
        </em>
        &rdquo;
      </p>
      <div className="flex items-center gap-2.5 font-mono text-[11.5px] text-muted">
        <span
          className="w-7 h-7 rounded-full grid place-items-center text-[11px] font-semibold border"
          style={{
            background: "var(--accent)",
            borderColor: "var(--accent-2)",
            color: "var(--accent-ink)",
          }}
        >
          AO
        </span>
        <span>
          <strong className="font-semibold text-ink">Arinze Obieze</strong> ·
          Founder, usemoos
        </span>
      </div>
    </div>
  );
}

export default function AuthRightPanel() {
  const pathname = usePathname();
  const isSignUp = pathname.startsWith("/sign-up");

  return (
    <div className="relative bg-bg-2 border-l border-line flex flex-col px-14 py-9 overflow-hidden max-[900px]:hidden">
      <div
        className="absolute pointer-events-none"
        style={{
          top: "-20%",
          right: "-20%",
          width: 500,
          height: 500,
          background:
            "radial-gradient(circle at center, rgba(200,255,123,0.12) 0%, transparent 60%)",
          filter: "blur(24px)",
        }}
      />
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(15,17,8,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,17,8,0.025) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
          maskImage:
            "radial-gradient(ellipse at 70% 30%, black 0%, transparent 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse at 70% 30%, black 0%, transparent 70%)",
        }}
      />

      <div className="relative z-10 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.25 no-underline">
          <MoosLogo size={26} />
          <span className="font-bold text-[18px] tracking-tight text-ink">
            usemoos
          </span>
        </Link>
        <span className="flex items-center gap-1.75 px-3 py-1.25 rounded-full font-mono text-[11px] tracking-[0.02em] text-ink-2 bg-surface border border-line">
          <span
            className="w-1.5 h-1.5 rounded-full bg-accent-2"
            style={{ boxShadow: "0 0 6px rgba(166,224,77,0.6)" }}
          />
          app.usemoos.ai · live
        </span>
      </div>

      <div className="relative z-10 flex-1 flex flex-col justify-center gap-8">
        <h2 className="text-[38px] leading-[1.05] tracking-tight font-semibold text-ink text-wrap-balance max-w-[18ch]">
          {isSignUp ? (
            <>
              What you get in the{" "}
              <em
                className="not-italic"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 62%, var(--accent) 62%, var(--accent) 94%, transparent 94%)",
                  padding: "0 0.06em",
                }}
              >
                first 60 seconds
              </em>
              .
            </>
          ) : (
            <>
              Org knowledge,{" "}
              <em
                className="not-italic"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 62%, var(--accent) 62%, var(--accent) 94%, transparent 94%)",
                  padding: "0 0.06em",
                }}
              >
                one prompt away
              </em>
              .
            </>
          )}
        </h2>

        {isSignUp ? (
          <ul className="list-none p-0 m-0 flex flex-col gap-3.5 max-w-110">
            {signupFeatures.map((f) => (
              <li key={f.title} className="flex gap-3 items-start">
                <span
                  className="w-5.5 h-5.5 rounded-full grid place-items-center text-[11px] font-bold shrink-0 mt-px"
                  style={{
                    background: "var(--accent)",
                    color: "var(--accent-ink)",
                  }}
                >
                  ✓
                </span>
                <div>
                  <div className="text-[15px] font-semibold tracking-[-0.01em] mb-0.75 text-ink">
                    {f.title}
                  </div>
                  <div className="text-[13.5px] leading-[1.45] text-muted">
                    {f.sub}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <PreviewCard />
            <QuoteCard />
          </>
        )}
      </div>

      <div className="relative z-10 flex items-center justify-between font-mono text-[11px] text-muted">
        <span>© 2026 usemoos, Inc.</span>
        <div className="flex gap-4.5">
          {["Security", "Status", "Help"].map((item) => (
            <a
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-muted hover:text-ink [transition:color_0.15s]"
            >
              {item}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
