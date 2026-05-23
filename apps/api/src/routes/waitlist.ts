import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

export const waitlist = new Hono();

const schema = z.object({
  email: z.string().email(),
});

waitlist.post("/", zValidator("json", schema), async (c) => {
  const { email } = c.req.valid("json");

  const airtablePromise = fetch(
    `https://api.airtable.com/v0/${process.env.AIRTABLE_BASE_ID}/Waitlist`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.AIRTABLE_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fields: { Email: email, "Signed Up": new Date().toISOString() },
      }),
    },
  );

  const loopsPromise = fetch("https://app.loops.so/api/v1/contacts/create", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LOOPS_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, source: "Waitlist", subscribed: true }),
  });

  await Promise.all([airtablePromise, loopsPromise]);

  return c.json({ ok: true });
});
