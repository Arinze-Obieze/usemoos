"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AuthNavHint() {
  const pathname = usePathname();
  const isSignUp = pathname.startsWith("/sign-up");

  return (
    <p className="font-mono text-[12px] text-muted">
      {isSignUp ? (
        <>
          Have an account?{" "}
          <Link
            href="/sign-in"
            className="text-ink underline underline-offset-[3px] decoration-line-2 hover:decoration-ink [transition:text-decoration-color_0.15s]"
          >
            Sign in
          </Link>
        </>
      ) : (
        <>
          New to moos?{" "}
          <Link
            href="/sign-up"
            className="text-ink underline underline-offset-[3px] decoration-line-2 hover:decoration-ink [transition:text-decoration-color_0.15s]"
          >
            Request access
          </Link>
        </>
      )}
    </p>
  );
}
