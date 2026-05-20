import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { clerkAuth } from "./middleware/auth.js";
import { waitlist } from "./routes/waitlist.js";

const app = new Hono();

app.use("*", logger());

app.get("/health", (c) => c.json({ ok: true }));
app.route("/waitlist", waitlist);

const api = new Hono();
api.use("*", clerkAuth);

app.route("/api", api);

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3001,
});
