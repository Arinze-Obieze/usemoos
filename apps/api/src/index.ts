import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { waitlist } from "./routes/waitlist.js";

const app = new Hono();

app.use("*", logger());

app.get("/health", (c) => c.json({ ok: true }));
app.route("/waitlist", waitlist);

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3001,
});
