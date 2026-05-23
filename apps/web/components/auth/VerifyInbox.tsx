"use client";
import { useEffect, useState } from "react";
import { HiMail } from "react-icons/hi";
import { SiGmail } from "react-icons/si";
import { Field } from "@/components/auth/Field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const emHighlight: React.CSSProperties = {
  background:
    "linear-gradient(180deg, transparent 62%, var(--accent) 62%, var(--accent) 94%, transparent 94%)",
  padding: "0 0.06em",
};

const OutlookIcon = () => (
  <svg viewBox="0 0 24 24" width={18} height={18} aria-hidden="true">
    <path
      fill="#0078D4"
      d="M12.5 4h7.5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-7.5V4z"
    />
    <rect x="2" y="5" width="11" height="14" fill="#106EBE" rx="1" />
    <ellipse cx="7.5" cy="12" rx="2.8" ry="3.3" fill="#FFFFFF" />
    <ellipse cx="7.5" cy="12" rx="1.3" ry="1.7" fill="#106EBE" />
  </svg>
);

const mailClients = [
  {
    href: "https://mail.google.com",
    label: "Open Gmail",
    icon: <SiGmail size={18} style={{ color: "#EA4335" }} />,
  },
  {
    href: "https://outlook.live.com",
    label: "Open Outlook",
    icon: <OutlookIcon />,
  },
] as const;

interface VerifyInboxProps {
  email: string;
  submitLabel: string;
  onSubmit: (code: string) => Promise<void>;
  onResend: () => Promise<void>;
  onBack: () => void;
}

export function VerifyInbox({
  email,
  submitLabel,
  onSubmit,
  onResend,
  onBack,
}: VerifyInboxProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(32);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const handleResend = async () => {
    try {
      await onResend();
      setCountdown(32);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await onSubmit(code);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="w-14 h-14 rounded-[14px] bg-accent border border-accent-2 grid place-items-center mb-5.5 shadow-[0_8px_24px_-8px_rgba(166,224,77,0.5)]">
        <HiMail size={26} className="text-accent-ink" />
      </div>

      <h1 className="text-[36px] leading-[1.05] tracking-tight font-semibold text-ink mb-3 text-wrap-balance">
        Check your{" "}
        <em className="not-italic" style={emHighlight}>
          inbox
        </em>
        .
      </h1>
      <p className="text-[15px] text-ink-2 leading-normal mb-2 text-wrap-pretty">
        We sent a 6-digit code to:
      </p>
      <div className="inline-flex items-center gap-2 px-3 py-1.75 bg-surface border border-line rounded-full font-mono text-[12.5px] text-ink mb-5 max-w-full">
        <svg
          viewBox="0 0 24 24"
          width={14}
          height={14}
          fill="none"
          stroke="var(--accent-ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="20 6 9 17 4 12" />
        </svg>
        <span className="truncate min-w-0">{email}</span>
      </div>

      <div className="flex gap-2 mb-6">
        {mailClients.map(({ href, label, icon }) => (
          <a
            key={href}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2.5 h-11 bg-surface border border-line rounded text-[14px] font-medium text-ink hover:border-line-2 hover:bg-surface-2 [transition:border-color_0.15s,background_0.15s] no-underline"
          >
            {icon}
            {label}
          </a>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <Field label="6-digit code" id="verify-code" error={error}>
          <Input
            id="verify-code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            required
            className="text-[18px] font-mono tracking-[0.4em] text-center"
          />
        </Field>
        <Button
          type="submit"
          size="lg"
          loading={loading}
          className="w-full mt-1"
        >
          {submitLabel} <span>→</span>
        </Button>
      </form>

      <div className="flex items-center gap-1.5 mt-4.5 text-[13px] text-muted">
        Didn&apos;t get it?
        {countdown > 0 ? (
          <span className="font-mono text-muted">
            Resend in <span className="text-ink">{countdown}s</span>
          </span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            className="text-ink underline underline-offset-[3px] decoration-line-2 hover:decoration-ink [transition:text-decoration-color_0.15s] font-medium"
          >
            Resend code
          </button>
        )}
      </div>

      <div className="mt-3 text-[13px] text-muted">
        Wrong email?{" "}
        <button
          type="button"
          onClick={onBack}
          className="text-ink underline underline-offset-[3px] decoration-line-2 hover:decoration-ink [transition:text-decoration-color_0.15s] font-medium"
        >
          Use a different one
        </button>
      </div>
    </>
  );
}
