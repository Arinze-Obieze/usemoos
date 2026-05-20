"use client";

import { useState } from "react";

interface WaitlistFormProps {
  id: string;
  buttonLabel?: string;
  style?: React.CSSProperties;
}

export default function WaitlistForm({
  id,
  buttonLabel = "Request access →",
  style,
}: WaitlistFormProps) {
  const [submitted, setSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [showErr, setShowErr] = useState(false);
  const [serverErr, setServerErr] = useState(false);
  const [loading, setLoading] = useState(false);
  const [value, setValue] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = value.trim();
    const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!valid) {
      setShowErr(true);
      return;
    }
    setShowErr(false);
    setServerErr(false);
    setLoading(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error("failed");
      setSubmittedEmail(email);
      setSubmitted(true);
    } catch {
      setServerErr(true);
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <div
        className="flex justify-center items-center gap-3 max-w-[460px] mx-auto px-[22px] py-[14px] bg-accent border border-accent-2 rounded-full text-accent-ink text-[14px] font-medium max-[440px]:rounded-[14px] max-[440px]:max-w-full max-[440px]:px-[18px]"
        style={style}
      >
        <span className="w-5 h-5 shrink-0 rounded-full bg-accent-ink text-accent grid place-items-center font-bold text-[11px]">
          ✓
        </span>
        <span>
          You&apos;re in line. We&apos;ll email <b>{submittedEmail}</b> when a
          slot opens.
        </span>
      </div>
    );
  }

  return (
    <>
      <form
        className="flex gap-[6px] max-w-[460px] mx-auto p-[5px] bg-surface border border-line rounded-full shadow-[var(--shadow-md)] transition-[border-color,box-shadow] duration-150 focus-within:border-ink focus-within:shadow-[var(--shadow-lg)] max-[440px]:flex-col max-[440px]:rounded-[14px] max-[440px]:p-2 max-[440px]:gap-2 max-[440px]:max-w-full"
        data-id={id}
        noValidate
        onSubmit={handleSubmit}
        style={style}
      >
        <input
          className="flex-1 min-w-0 bg-transparent border-0 outline-none px-4 text-[15px] text-ink placeholder:text-muted max-[440px]:w-full max-[440px]:px-[14px] max-[440px]:py-[10px] max-[440px]:bg-bg-2 max-[440px]:rounded-[8px]"
          type="email"
          name="email"
          placeholder="you@company.com"
          autoComplete="email"
          required
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setShowErr(false);
          }}
        />
        <button
          className="h-[42px] px-[18px] bg-ink text-bg rounded-full text-[14px] font-semibold transition-[background] duration-150 hover:bg-ink-2 disabled:opacity-70 max-[440px]:w-full max-[440px]:rounded-[8px] max-[440px]:h-11"
          type="submit"
          disabled={loading}
        >
          {loading ? "Joining…" : buttonLabel}
        </button>
      </form>
      <div
        className={`mt-[10px] font-mono text-[12.5px] text-danger ${showErr ? "visible" : "invisible"}`}
        data-err={id}
      >
        ↳ that doesn&apos;t look like a valid email
      </div>
      <div
        className={`mt-[10px] font-mono text-[12.5px] text-danger ${serverErr ? "visible" : "invisible"}`}
      >
        ↳ something went wrong, please try again
      </div>
    </>
  );
}
