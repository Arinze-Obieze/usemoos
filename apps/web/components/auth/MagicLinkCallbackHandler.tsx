"use client";

import { useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

export default function MagicLinkCallbackHandler() {
  const clerk = useClerk();
  const router = useRouter();
  const hasRun = useRef(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const verifyMagicLink = async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;

      try {
        await clerk.handleEmailLinkVerification(
          {
            redirectUrl: "/sign-in",
            redirectUrlComplete: "/workspace",
          },
          async (to) => {
            router.push(to);
          },
        );
      } catch {
        setError("This sign-in link is invalid or expired.");
      }
    };

    void verifyMagicLink();
  }, [clerk, router]);

  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-[14px] bg-accent border border-accent-2 grid place-items-center mx-auto mb-5.5 shadow-[var(--shadow-md)]">
        <svg
          viewBox="0 0 24 24"
          width={26}
          height={26}
          fill="none"
          stroke="var(--accent-ink)"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M20 6 9 17l-5-5" />
        </svg>
      </div>
      <h1 className="text-[32px] leading-[1.08] tracking-tight font-semibold text-ink mb-3 text-wrap-balance">
        Finishing sign in.
      </h1>
      <p className="text-[15px] text-ink-2 leading-normal text-wrap-pretty">
        {error || "Hang tight while we verify your link."}
      </p>
    </div>
  );
}
