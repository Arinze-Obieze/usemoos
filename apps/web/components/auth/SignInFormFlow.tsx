"use client";
import { useSignIn } from "@clerk/nextjs";
import { useState } from "react";
import { HiChevronLeft } from "react-icons/hi";
import { Field } from "@/components/auth/Field";
import { OrDivider } from "@/components/auth/OrDivider";
import { SSOButtons } from "@/components/auth/SSOButtons";
import { usePostAuthNavigation } from "@/components/auth/usePostAuthNavigation";
import { VerifyInbox } from "@/components/auth/VerifyInbox";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getClerkError } from "@/lib/clerkError";

type Mode =
  | "signin"
  | "forgot"
  | "verify-reset"
  | "new-password"
  | "verify-mfa"
  | "magic-link-sent";
type AuthProvider = "oauth_google" | "oauth_microsoft";

const emHighlight: React.CSSProperties = {
  background:
    "linear-gradient(180deg, transparent 62%, var(--accent) 62%, var(--accent) 94%, transparent 94%)",
  padding: "0 0.06em",
};

function Eyebrow({ tag, label }: { tag: string; label: string }) {
  return (
    <div className="flex items-center gap-2 pl-1.25 pr-3 py-1 bg-surface border border-line rounded-full font-mono text-[11.5px] text-ink-2 mb-5.5 shadow-(--shadow-sm) w-fit">
      <span className="flex items-center gap-1.25 px-2 py-0.5 bg-accent text-accent-ink rounded-full text-[10px] font-bold tracking-[0.04em] uppercase">
        <span
          className="w-1.25 h-1.25 rounded-full bg-accent-ink"
          aria-hidden="true"
        />
        {tag}
      </span>
      {label}
    </div>
  );
}

function PasswordField({
  id,
  value,
  onChange,
  autoComplete,
  placeholder,
  minLength,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  placeholder: string;
  minLength?: number;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="flex h-11 bg-surface border border-line rounded overflow-hidden focus-within:border-ink focus-within:shadow-[0_0_0_4px_rgba(15,17,8,0.06)] [transition:border-color_0.15s,box-shadow_0.15s]">
      <input
        id={id}
        type={show ? "text" : "password"}
        autoComplete={autoComplete}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
        minLength={minLength}
        className="flex-1 min-w-0 bg-transparent px-3.5 text-[14.5px] text-ink placeholder:text-muted outline-none"
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label="Toggle password visibility"
        className="font-mono text-[11px] text-muted px-3.5 border-l border-line hover:text-ink [transition:color_0.15s] shrink-0"
      >
        {show ? "hide" : "show"}
      </button>
    </div>
  );
}

// ── Sign-in form ──────────────────────────────────────────────────────

function SignInForm({
  onForgot,
  onSecondFactorEmail,
  onNewPassword,
  onMagicLinkSent,
}: {
  onForgot: () => void;
  onSecondFactorEmail: (email: string) => void;
  onNewPassword: () => void;
  onMagicLinkSent: (email: string) => void;
}) {
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigateAfterAuth = usePostAuthNavigation();
  const isBusy = loading || fetchStatus === "fetching";

  const handleSSO = async (provider: AuthProvider) => {
    setLoading(true);
    setError("");
    try {
      const { error } = await signIn.sso({
        strategy: provider,
        redirectCallbackUrl: "/sign-in/sso-callback",
        redirectUrl: "/workspace",
      });
      if (error) setError(getClerkError(error));
    } catch (err) {
      setError(getClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error } = await signIn.password({
        emailAddress: email,
        password,
      });
      if (error) {
        setError(getClerkError(error));
        return;
      }
      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize({
          navigate: navigateAfterAuth,
        });
        if (finalizeError) setError(getClerkError(finalizeError));
      } else if (signIn.status === "needs_second_factor") {
        const emailCodeFactor = signIn.supportedSecondFactors.some(
          (factor) => factor.strategy === "email_code",
        );

        if (!emailCodeFactor) {
          setError(
            "This account requires a second factor that is not available in this flow yet.",
          );
          return;
        }

        const { error: sendCodeError } = await signIn.mfa.sendEmailCode();
        if (sendCodeError) {
          setError(getClerkError(sendCodeError));
          return;
        }
        onSecondFactorEmail(email);
      } else if (signIn.status === "needs_new_password") {
        onNewPassword();
      } else if (signIn.status === "needs_client_trust") {
        setError(
          "This device needs verification. Use the magic link option to finish signing in.",
        );
      } else {
        setError(
          "This sign-in needs another step. Try the magic link option or use SSO.",
        );
      }
    } catch (err) {
      setError(getClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleMagicLink = async () => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Enter your work email first.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const verificationUrl = `${window.location.origin}/sign-in/magic-link`;
      const { error: sendLinkError } = await signIn.emailLink.sendLink({
        emailAddress: trimmedEmail,
        verificationUrl,
      });

      if (sendLinkError) {
        setError(getClerkError(sendLinkError));
        return;
      }

      onMagicLinkSent(trimmedEmail);
    } catch (err) {
      setError(getClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Eyebrow tag="Sign in" label="Welcome back to usemoos" />
      <h1 className="text-[36px] leading-[1.05] tracking-tight font-semibold text-ink mb-3 text-wrap-balance">
        Sign in to your{" "}
        <em className="not-italic" style={emHighlight}>
          workspace
        </em>
        .
      </h1>
      <p className="text-[15px] text-ink-2 leading-normal mb-8 text-wrap-pretty">
        Pick up where you left off. Threads, sources, and answers stay where you
        left them.
      </p>

      <SSOButtons onSelect={handleSSO} disabled={isBusy} />
      <OrDivider />

      <form onSubmit={handleSubmit}>
        <Field label="Work email" id="si-email">
          <Input
            id="si-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>

        <Field
          label="Password"
          id="si-password"
          helper={
            <button
              type="button"
              onClick={onForgot}
              className="text-ink underline underline-offset-[3px] decoration-line-2 hover:decoration-ink [transition:text-decoration-color_0.15s]"
            >
              Forgot?
            </button>
          }
        >
          <PasswordField
            id="si-password"
            value={password}
            onChange={setPassword}
            autoComplete="current-password"
            placeholder="••••••••"
          />
        </Field>

        <div className="flex items-center gap-2.25 my-[18px]">
          <Checkbox
            id="keep-signed-in"
            checked={keepSignedIn}
            onCheckedChange={(v) => setKeepSignedIn(v === true)}
          />
          <Label
            htmlFor="keep-signed-in"
            className="text-[13.5px] text-ink-2 cursor-pointer"
          >
            Keep me signed in
          </Label>
        </div>

        {error && (
          <p className="font-mono text-[12px] text-danger mb-3.5">{error}</p>
        )}

        <Button type="submit" size="lg" loading={isBusy} className="w-full">
          Sign in <span>→</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleMagicLink}
          disabled={isBusy}
          className="w-full mt-2.5 font-medium"
        >
          <svg
            viewBox="0 0 24 24"
            width={16}
            height={16}
            fill="currentColor"
            className="text-accent-ink"
            aria-hidden="true"
          >
            <path d="M12 2 L14 8 L20 10 L14 12 L12 18 L10 12 L4 10 L10 8 Z" />
          </svg>
          Send me a magic link instead
        </Button>
      </form>

      <p className="text-[12px] text-muted mt-[22px] text-center leading-[1.45]">
        Signing in means you agree to our{" "}
        <a
          href="/terms"
          className="text-ink-2 underline underline-offset-[2px] decoration-line"
        >
          Terms
        </a>{" "}
        and{" "}
        <a
          href="/privacy"
          className="text-ink-2 underline underline-offset-[2px] decoration-line"
        >
          Privacy Policy
        </a>
        .
      </p>
    </>
  );
}

function MagicLinkSent({
  email,
  onBack,
}: {
  email: string;
  onBack: () => void;
}) {
  return (
    <>
      <div className="w-14 h-14 rounded-[14px] bg-accent border border-accent-2 grid place-items-center mb-5.5 shadow-[var(--shadow-md)]">
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
          <path d="M4 4h16v16H4z" />
          <path d="m4 7 8 6 8-6" />
        </svg>
      </div>
      <h1 className="text-[36px] leading-[1.05] tracking-tight font-semibold text-ink mb-3 text-wrap-balance">
        Check your{" "}
        <em className="not-italic" style={emHighlight}>
          email
        </em>
        .
      </h1>
      <p className="text-[15px] text-ink-2 leading-normal mb-5 text-wrap-pretty">
        We sent a sign-in link to{" "}
        <span className="font-mono text-ink">{email}</span>.
      </p>
      <Button type="button" size="lg" onClick={onBack} className="w-full">
        Back to sign in
      </Button>
    </>
  );
}

// ── Forgot password form ──────────────────────────────────────────────

function ForgotForm({
  onBack,
  onSent,
}: {
  onBack: () => void;
  onSent: (email: string) => void;
}) {
  const { signIn, fetchStatus } = useSignIn();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const isBusy = loading || fetchStatus === "fetching";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { error: createError } = await signIn.create({ identifier: email });
      if (createError) {
        setError(getClerkError(createError));
        return;
      }
      const { error: sendCodeError } =
        await signIn.resetPasswordEmailCode.sendCode();
      if (sendCodeError) {
        setError(getClerkError(sendCodeError));
        return;
      }
      onSent(email);
    } catch (err) {
      setError(getClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.75 font-mono text-[12.5px] text-muted mb-6 hover:text-ink [transition:color_0.15s]"
      >
        <HiChevronLeft size={14} />
        Back to sign in
      </button>

      <h1 className="text-[36px] leading-[1.05] tracking-tight font-semibold text-ink mb-3 text-wrap-balance">
        Forgot your{" "}
        <em className="not-italic" style={emHighlight}>
          password
        </em>
        ?
      </h1>
      <p className="text-[15px] text-ink-2 leading-normal mb-8 text-wrap-pretty">
        Happens to the best of us. Enter your work email and we&apos;ll send a
        6-digit code to reset your password.
      </p>

      <form onSubmit={handleSubmit}>
        <Field label="Work email" id="fg-email" error={error}>
          <Input
            id="fg-email"
            type="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Field>
        <Button type="submit" size="lg" loading={isBusy} className="w-full">
          Send reset code <span>→</span>
        </Button>
      </form>

      <p className="text-[12px] text-muted mt-[22px] text-center leading-[1.45]">
        Reset codes expire in 15 minutes. If you didn&apos;t ask for one, you
        can safely ignore the email.
      </p>
    </>
  );
}

// ── New password form ─────────────────────────────────────────────────

function NewPasswordForm() {
  const { signIn, fetchStatus } = useSignIn();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigateAfterAuth = usePostAuthNavigation();
  const isBusy = loading || fetchStatus === "fetching";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const { error } = await signIn.resetPasswordEmailCode.submitPassword({
        password,
      });
      if (error) {
        setError(getClerkError(error));
        return;
      }
      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize({
          navigate: navigateAfterAuth,
        });
        if (finalizeError) setError(getClerkError(finalizeError));
      }
    } catch (err) {
      setError(getClerkError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 className="text-[36px] leading-[1.05] tracking-tight font-semibold text-ink mb-3 text-wrap-balance">
        Set a new{" "}
        <em className="not-italic" style={emHighlight}>
          password
        </em>
        .
      </h1>
      <p className="text-[15px] text-ink-2 leading-normal mb-8 text-wrap-pretty">
        Choose a strong password of at least 10 characters.
      </p>

      <form onSubmit={handleSubmit}>
        <Field label="New password" id="np-password">
          <PasswordField
            id="np-password"
            value={password}
            onChange={setPassword}
            autoComplete="new-password"
            placeholder="At least 10 characters"
            minLength={10}
          />
        </Field>

        <Field label="Confirm password" id="np-confirm" error={error}>
          <Input
            id="np-confirm"
            type="password"
            autoComplete="new-password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
          />
        </Field>

        <Button type="submit" size="lg" loading={isBusy} className="w-full">
          Update password <span>→</span>
        </Button>
      </form>
    </>
  );
}

// ── Orchestrator ──────────────────────────────────────────────────────

export default function SignInFormFlow() {
  const { signIn } = useSignIn();
  const [mode, setMode] = useState<Mode>("signin");
  const [forgotEmail, setForgotEmail] = useState("");
  const [mfaEmail, setMfaEmail] = useState("");
  const [magicLinkEmail, setMagicLinkEmail] = useState("");
  const navigateAfterAuth = usePostAuthNavigation();

  const handleVerifySubmit = async (code: string) => {
    try {
      const { error } = await signIn.resetPasswordEmailCode.verifyCode({
        code,
      });
      if (error) {
        throw new Error(getClerkError(error));
      }
      if (signIn.status === "needs_new_password") {
        setMode("new-password");
      }
    } catch (err) {
      throw new Error(getClerkError(err));
    }
  };

  const handleVerifyResend = async () => {
    try {
      const { error } = await signIn.resetPasswordEmailCode.sendCode();
      if (error) throw new Error(getClerkError(error));
    } catch (err) {
      throw new Error(getClerkError(err));
    }
  };

  const handleMfaSubmit = async (code: string) => {
    try {
      const { error } = await signIn.mfa.verifyEmailCode({ code });
      if (error) {
        throw new Error(getClerkError(error));
      }
      if (signIn.status === "complete") {
        const { error: finalizeError } = await signIn.finalize({
          navigate: navigateAfterAuth,
        });
        if (finalizeError) throw new Error(getClerkError(finalizeError));
      }
    } catch (err) {
      throw new Error(getClerkError(err));
    }
  };

  const handleMfaResend = async () => {
    try {
      const { error } = await signIn.mfa.sendEmailCode();
      if (error) throw new Error(getClerkError(error));
    } catch (err) {
      throw new Error(getClerkError(err));
    }
  };

  if (mode === "signin") {
    return (
      <SignInForm
        onForgot={() => setMode("forgot")}
        onSecondFactorEmail={(email) => {
          setMfaEmail(email);
          setMode("verify-mfa");
        }}
        onNewPassword={() => setMode("new-password")}
        onMagicLinkSent={(email) => {
          setMagicLinkEmail(email);
          setMode("magic-link-sent");
        }}
      />
    );
  }
  if (mode === "forgot") {
    return (
      <ForgotForm
        onBack={() => setMode("signin")}
        onSent={(email) => {
          setForgotEmail(email);
          setMode("verify-reset");
        }}
      />
    );
  }
  if (mode === "verify-reset") {
    return (
      <VerifyInbox
        email={forgotEmail}
        submitLabel="Verify code"
        onSubmit={handleVerifySubmit}
        onResend={handleVerifyResend}
        onBack={() => setMode("forgot")}
      />
    );
  }
  if (mode === "verify-mfa") {
    return (
      <VerifyInbox
        email={mfaEmail}
        submitLabel="Verify sign in"
        onSubmit={handleMfaSubmit}
        onResend={handleMfaResend}
        onBack={() => setMode("signin")}
      />
    );
  }
  if (mode === "magic-link-sent") {
    return (
      <MagicLinkSent email={magicLinkEmail} onBack={() => setMode("signin")} />
    );
  }
  return <NewPasswordForm />;
}
