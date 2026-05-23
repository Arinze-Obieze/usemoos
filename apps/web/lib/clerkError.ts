import {
  isClerkAPIResponseError,
  isClerkRuntimeError,
} from "@clerk/nextjs/errors";

interface ClerkErrorLike {
  errors?: Array<{
    longMessage?: string;
    message?: string;
  }>;
  longMessage?: string;
  message?: string;
}

function isClerkErrorLike(err: unknown): err is ClerkErrorLike {
  return typeof err === "object" && err !== null;
}

export function getClerkError(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    return (
      err.errors[0]?.longMessage ??
      err.errors[0]?.message ??
      "Something went wrong."
    );
  }
  if (isClerkRuntimeError(err)) {
    return err.longMessage ?? err.message;
  }
  if (isClerkErrorLike(err)) {
    return (
      err.errors?.[0]?.longMessage ??
      err.errors?.[0]?.message ??
      err.longMessage ??
      err.message ??
      "Something went wrong. Please try again."
    );
  }
  return "Something went wrong. Please try again.";
}
