import { verifyToken } from "@clerk/backend";
import { createMiddleware } from "hono/factory";

type AuthEnv = {
  Variables: {
    userId: string;
    orgId: string | null;
  };
};

export const clerkAuth = createMiddleware<AuthEnv>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const token = authHeader.slice(7);

  const payload = await verifyToken(token, {
    secretKey: process.env.CLERK_SECRET_KEY ?? "",
  }).catch(() => null);

  if (!payload) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  c.set("userId", payload.sub);
  c.set("orgId", (payload.org_id as string | undefined) ?? null);

  await next();
});
