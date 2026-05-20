import { isClerkAPIResponseError } from "@clerk/nextjs/errors";

export function getClerkError(err: unknown): string {
  if (isClerkAPIResponseError(err)) {
    return err.errors[0]?.longMessage ?? err.errors[0]?.message ?? "Something went wrong.";
  }
  return "Something went wrong. Please try again.";
}
