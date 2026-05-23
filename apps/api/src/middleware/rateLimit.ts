import type { Context, Next } from "hono";

interface WindowEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, WindowEntry>();

setInterval(
  () => {
    const now = Date.now();
    for (const [key, entry] of store.entries()) {
      if (now > entry.resetAt) store.delete(key);
    }
  },
  5 * 60 * 1000,
);

export function rateLimit(maxRequests: number, windowMs: number) {
  return async (c: Context, next: Next) => {
    const userId: string | undefined = c.get("userId");
    const orgId: string | undefined = c.get("orgId");
    const key = `${orgId ?? "anon"}:${userId ?? "anon"}:${c.req.path}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 1, resetAt: now + windowMs };
      store.set(key, entry);
    } else {
      entry.count++;
      if (entry.count > maxRequests) {
        const retryAfter = Math.ceil((entry.resetAt - now) / 1000);
        c.header("Retry-After", String(retryAfter));
        return c.json({ error: "Rate limit exceeded" }, 429);
      }
    }

    await next();
  };
}
