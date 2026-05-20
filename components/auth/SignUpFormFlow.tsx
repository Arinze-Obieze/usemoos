"use client";
import { useState } from "react";
import { useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { SSOButtons } from "@/components/auth/SSOButtons";
import { OrDivider } from "@/components/auth/OrDivider";
import { Field } from "@/components/auth/Field";
import { VerifyInbox } from "@/components/auth/VerifyInbox";
import { getClerkError } from "@/lib/clerkError";

type Mode = "form" | "verify";

const emHighlight: React.CSSProperties = {
  background:
    "linear-gradient(180deg, transparent 62%, var(--accent) 62%, var(--accent) 94%, transparent 94%)",
  padding: "0 0.06em",
};


// ── Sign-up form ──────────────────────────────────────────────────────

function SignUpForm({ onVerify }: { onVerify: () => void }) {
  const { signUp, isLoaded, setActive } = useSignUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [workspace, setWorkspace] = useState("");
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSSO = async (provider: "oauth_google" | "oauth_microsoft") => {
    if (!isLoaded) return;
    try {
      await signUp!.authenticateWithRedirect({
        strategy: provider,
        redirectUrl: "/sign-in/sso-callback",
        redirectUrlComplete: "/workspace",
      });
    } catch (err) {
      setError(getClerkError(err));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isLoaded) {
      setError("Auth is still loading — please try again in a moment.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const parts = name.trim().split(/\s+/);
      const result = await signUp!.create({
        emailAddress: email,
        password,
        firstName: parts[0],
        lastName: parts.slice(1).join(" ") || undefined,
        unsafeMetadata: { workspace_name: workspace },
      });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        router.push("/workspace");
      } else {
        await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
        onVerify();
      }
    } catch (err) {
      setError(getClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 pl-1.25 pr-3 py-1 bg-surface border border-line rounded-full font-mono text-[11.5px] text-ink-2 mb-5.5 shadow-(--shadow-sm) w-fit">
        <span className="flex items-center gap-1.25 px-2 py-0.5 bg-accent text-accent-ink rounded-full text-[10px] font-bold tracking-[0.04em] uppercase">
          <span className="w-1.25 h-1.25 rounded-full bg-accent-ink" aria-hidden="true" />
          Private beta
        </span>
        You&apos;ve been invited
      </div>

      <h1 className="text-[36px] leading-[1.05] tracking-tight font-semibold text-ink mb-3 text-wrap-balance">
        Set up your <em className="not-italic" style={emHighlight}>workspace</em>.
      </h1>
      <p className="text-[15px] text-ink-2 leading-normal mb-8 text-wrap-pretty">
        Takes about a minute. You can invite teammates and connect integrations right after.
      </p>

      <SSOButtons onSelect={handleSSO} />
      <OrDivider />

      <form onSubmit={handleSubmit}>
        <Field label="Your full name" id="su-name">
          <Input
            id="su-name"
            type="text"
            autoComplete="name"
            placeholder="Jordan Lee"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </Field>

        <Field label="Work email" id="su-email">
          <Input
            id="su-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field label="Workspace name" id="su-workspace">
          <Input
            id="su-workspace"
            type="text"
            placeholder="Acme Corp"
            value={workspace}
            onChange={(e) => setWorkspace(e.target.value)}
            required
          />
        </Field>

        <Field label="Password" id="su-password">
          <Input
            id="su-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 10 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={10}
            required
          />
        </Field>

        <div className="flex items-start gap-2.25 mb-5.5 mt-4.5">
          <Checkbox
            id="su-terms"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(v === true)}
            className="mt-0.5"
          />
          <Label
            htmlFor="su-terms"
            className="text-[13.5px] text-ink-2 leading-[1.45] cursor-pointer"
          >
            {"I accept the "}
            <a
              href="#"
              className="text-ink underline underline-offset-[3px] decoration-line-2 hover:decoration-ink [transition:text-decoration-color_0.15s]"
            >
              Terms
            </a>
            {" & "}
            <a
              href="#"
              className="text-ink underline underline-offset-[3px] decoration-line-2 hover:decoration-ink [transition:text-decoration-color_0.15s]"
            >
              DPA
            </a>
            {" and confirm I'm authorized to create this workspace."}
          </Label>
        </div>

        {error && <p className="font-mono text-[12px] text-danger mb-3.5">{error}</p>}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Create workspace <span>→</span>
        </Button>
      </form>

      <p className="text-[12px] text-muted mt-5.5 text-center leading-[1.45]">
        SOC 2 in progress · Your workspace is isolated from every other tenant by default.
      </p>
    </>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────

export default function SignUpFormFlow() {
  const { signUp, isLoaded, setActive } = useSignUp();
  const [mode, setMode] = useState<Mode>("form");
  const router = useRouter();

  const handleVerifySubmit = async (code: string) => {
    if (!isLoaded) return;
    try {
      const result = await signUp!.attemptEmailAddressVerification({ code });
      if (result.status === "complete") {
        await setActive!({ session: result.createdSessionId });
        router.push("/workspace");
      }
    } catch (err) {
      throw new Error(getClerkError(err));
    }
  };

  const handleVerifyResend = async () => {
    if (!isLoaded) return;
    try {
      await signUp!.prepareEmailAddressVerification({ strategy: "email_code" });
    } catch (err) {
      throw new Error(getClerkError(err));
    }
  };

  if (mode === "verify") {
    return (
      <VerifyInbox
        email={signUp?.emailAddress ?? ""}
        submitLabel="Verify email"
        onSubmit={handleVerifySubmit}
        onResend={handleVerifyResend}
        onBack={() => setMode("form")}
      />
    );
  }
  return <SignUpForm onVerify={() => setMode("verify")} />;
}
