import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { clerkAuth } from "./middleware/auth.js";
import { rateLimit } from "./middleware/rateLimit.js";
import { billing, stripeWebhook } from "./routes/billing.js";
import { chat } from "./routes/chat.js";
import { integrations } from "./routes/integrations.js";
import { search } from "./routes/search.js";
import { settings } from "./routes/settings.js";
import { upload } from "./routes/upload.js";
import { waitlist } from "./routes/waitlist.js";

const app = new Hono();
const allowedOrigins = (process.env.APP_URL ?? "http://localhost:3004")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use("*", logger());
app.use(
  "*",
  cors({
    origin: allowedOrigins,
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  }),
);

// Public routes
app.get("/health", (c) => c.json({ ok: true }));
app.route("/waitlist", waitlist);
app.route("/stripe/webhook", stripeWebhook);

// Authenticated routes
const api = new Hono();
api.use("*", clerkAuth);

api.route("/billing", billing);
api.use("/upload/presign", rateLimit(10, 60_000));
api.route("/upload", upload);
api.use("/search", rateLimit(30, 60_000));
api.route("/search", search);
api.use("/chat/message", rateLimit(20, 60_000));
api.route("/chat", chat);
api.route("/integrations", integrations);
api.route("/settings", settings);

app.route("/api", api);

serve({
  fetch: app.fetch,
  port: Number(process.env.PORT) || 3001,
});
