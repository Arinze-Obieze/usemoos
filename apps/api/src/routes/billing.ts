import { zValidator } from "@hono/zod-validator";
import { eq, getDb, subscriptions, workspaces } from "@usemoos/db";
import { PLANS, type PlanId } from "@usemoos/types";
import { Hono } from "hono";
import Stripe from "stripe";
import { z } from "zod";
import { ensureWorkspace } from "../lib/workspaces.js";

type AuthEnv = { Variables: { userId: string; orgId: string | null } };

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "");

export const billing = new Hono<AuthEnv>();

billing.post(
  "/checkout",
  zValidator(
    "json",
    z.object({
      planId: z.enum(["pro", "enterprise"]),
      seats: z.number().int().min(1).default(1),
    }),
  ),
  async (c) => {
    const { planId, seats } = c.req.valid("json");
    const orgId = c.get("orgId");
    if (!orgId) return c.json({ error: "No organization" }, 400);

    const db = getDb();
    const workspace = await ensureWorkspace(db, orgId);

    const plan = PLANS[planId as PlanId];
    if (!plan || plan.monthlyPrice === 0)
      return c.json({ error: "Invalid plan" }, 400);

    let customerId: string;
    const [sub] = await db
      .select()
      .from(subscriptions)
      .where(eq(subscriptions.workspace_id, workspace.id));

    if (sub?.stripe_customer_id) {
      customerId = sub.stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({
        metadata: { workspaceId: workspace.id, orgId },
      });
      customerId = customer.id;
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: { name: `usemoos ${plan.name}` },
            unit_amount: plan.monthlyPrice,
            recurring: { interval: "month" },
          },
          quantity: seats,
        },
      ],
      metadata: { workspaceId: workspace.id, planId, seats: String(seats) },
      success_url: `${process.env.APP_URL}/workspace/settings?billing=success`,
      cancel_url: `${process.env.APP_URL}/workspace/settings`,
    });

    return c.json({ url: session.url });
  },
);

billing.post("/portal", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const workspace = await ensureWorkspace(db, orgId);

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspace_id, workspace.id));
  if (!sub?.stripe_customer_id)
    return c.json({ error: "No subscription" }, 404);

  const session = await stripe.billingPortal.sessions.create({
    customer: sub.stripe_customer_id,
    return_url: `${process.env.APP_URL}/workspace/settings`,
  });

  return c.json({ url: session.url });
});

billing.get("/status", async (c) => {
  const orgId = c.get("orgId");
  if (!orgId) return c.json({ error: "No organization" }, 400);

  const db = getDb();
  const [workspace] = await db
    .select()
    .from(workspaces)
    .where(eq(workspaces.clerk_org_id, orgId));
  if (!workspace) return c.json({ plan: "free", seats: 1, status: "active" });

  const [sub] = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.workspace_id, workspace.id));
  if (!sub) return c.json({ plan: "free", seats: 1, status: "active" });

  return c.json({
    plan: sub.plan,
    seats: sub.seat_count,
    status: sub.status,
    currentPeriodEnd: sub.current_period_end,
    cancelAtPeriodEnd: sub.cancel_at_period_end,
  });
});

// Stripe webhook — no auth middleware, raw body needed
export const stripeWebhook = new Hono();

stripeWebhook.post("/", async (c) => {
  const sig = c.req.header("stripe-signature");
  if (!sig) return c.json({ error: "Missing signature" }, 400);

  const rawBody = await c.req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET ?? "",
    );
  } catch {
    return c.json({ error: "Invalid signature" }, 400);
  }

  const db = getDb();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const { workspaceId, planId, seats } = session.metadata ?? {};
      if (!workspaceId || !planId) break;

      const stripeSubId = session.subscription as string;

      const [existing] = await db
        .select({ id: subscriptions.id })
        .from(subscriptions)
        .where(eq(subscriptions.workspace_id, workspaceId));

      if (existing) {
        await db
          .update(subscriptions)
          .set({
            stripe_subscription_id: stripeSubId,
            plan: planId as PlanId,
            status: "active",
            seat_count: Number(seats ?? 1),
            cancel_at_period_end: false,
          })
          .where(eq(subscriptions.workspace_id, workspaceId));
      } else {
        await db.insert(subscriptions).values({
          workspace_id: workspaceId,
          stripe_customer_id: session.customer as string,
          stripe_subscription_id: stripeSubId,
          plan: planId as PlanId,
          status: "active",
          seat_count: Number(seats ?? 1),
          billing_interval: "month",
          cancel_at_period_end: false,
        });
      }
      break;
    }

    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const sub = event.data.object as Stripe.Subscription;
      const status =
        sub.status === "active"
          ? "active"
          : sub.status === "trialing"
            ? "trialing"
            : sub.status === "past_due"
              ? "past_due"
              : sub.status === "canceled"
                ? "canceled"
                : "unpaid";

      // cancel_at is the period end for subscriptions scheduled to cancel
      const periodEnd = sub.cancel_at ? new Date(sub.cancel_at * 1000) : null;

      await db
        .update(subscriptions)
        .set({
          status,
          cancel_at_period_end: sub.cancel_at_period_end,
          ...(periodEnd && { current_period_end: periodEnd }),
        })
        .where(eq(subscriptions.stripe_subscription_id, sub.id));
      break;
    }
  }

  return c.json({ received: true });
});
