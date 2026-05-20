"use client";
import { useClerk, useSignIn, useSignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import { usePostAuthNavigation } from "@/components/auth/usePostAuthNavigation";

export default function SSOCallbackHandler() {
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const router = useRouter();
  const hasRun = useRef(false);
  const navigateAfterAuth = usePostAuthNavigation();

  const finalizeSignIn = useCallback(async () => {
    const { error } = await signIn.finalize({ navigate: navigateAfterAuth });
    if (error) router.push("/sign-in");
  }, [navigateAfterAuth, router, signIn]);

  const finalizeSignUp = useCallback(async () => {
    const { error } = await signUp.finalize({ navigate: navigateAfterAuth });
    if (error) router.push("/sign-up");
  }, [navigateAfterAuth, router, signUp]);

  useEffect(() => {
    const completeSSO = async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;

      if (signIn.status === "complete") {
        await finalizeSignIn();
        return;
      }

      if (signUp.isTransferable) {
        const { error } = await signIn.create({ transfer: true });
        if (error) {
          router.push("/sign-in");
          return;
        }
        const signInStatus = signIn.status as typeof signIn.status | "complete";
        if (signInStatus === "complete") {
          await finalizeSignIn();
        } else {
          router.push("/sign-in");
        }
        return;
      }

      if (
        signIn.status === "needs_first_factor" &&
        !signIn.supportedFirstFactors?.every(
          (factor) => factor.strategy === "enterprise_sso",
        )
      ) {
        router.push("/sign-in");
        return;
      }

      if (signIn.isTransferable) {
        const { error } = await signUp.create({ transfer: true });
        if (error) {
          router.push("/sign-up");
          return;
        }
        const signUpStatus = signUp.status as typeof signUp.status | "complete";
        if (signUpStatus === "complete") {
          await finalizeSignUp();
        } else {
          router.push("/sign-up");
        }
        return;
      }

      if (signUp.status === "complete") {
        await finalizeSignUp();
        return;
      }

      if (
        signIn.status === "needs_second_factor" ||
        signIn.status === "needs_new_password"
      ) {
        router.push("/sign-in");
        return;
      }

      const sessionId =
        signIn.existingSession?.sessionId ?? signUp.existingSession?.sessionId;
      if (sessionId) {
        await clerk.setActive({
          session: sessionId,
          navigate: navigateAfterAuth,
        });
      }
    };

    void completeSSO();
  }, [
    clerk,
    finalizeSignIn,
    finalizeSignUp,
    navigateAfterAuth,
    router,
    signIn,
    signUp,
  ]);

  return (
    <div>
      <div id="clerk-captcha" />
    </div>
  );
}
