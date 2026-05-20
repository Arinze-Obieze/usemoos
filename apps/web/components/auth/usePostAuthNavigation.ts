"use client";

import type { SetActiveNavigate } from "@clerk/nextjs/types";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

export function usePostAuthNavigation(): SetActiveNavigate {
  const router = useRouter();

  return useCallback<SetActiveNavigate>(
    async ({ session, decorateUrl }) => {
      const destination = session?.currentTask ? "/tasks" : "/workspace";
      const url = decorateUrl(destination);

      if (url.startsWith("http")) {
        window.location.href = url;
      } else {
        router.push(url);
      }
    },
    [router],
  );
}
