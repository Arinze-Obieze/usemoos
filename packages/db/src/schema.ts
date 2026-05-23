import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import type {
  AuthorityWeights,
  BillingInterval,
  DocumentType,
  IntegrationType,
  ModelId,
  PlanId,
  SubscriptionStatus,
  SyncStatus,
  AuthorRole,
  SourceAuthorityTier,
} from "@usemoos/types";

// ─── Workspaces ───────────────────────────────────────────────────────────────

export const workspaces = pgTable("workspaces", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerk_org_id: text("clerk_org_id").notNull().unique(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  preferred_model: text("preferred_model").$type<ModelId>().notNull().default("claude-sonnet-4-6"),
  authority_weights: jsonb("authority_weights").$type<AuthorityWeights>(),
  confidence_threshold: integer("confidence_threshold").notNull().default(40), // 0-100
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
});

// ─── Subscriptions ────────────────────────────────────────────────────────────

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  stripe_customer_id: text("stripe_customer_id").notNull().unique(),
  stripe_subscription_id: text("stripe_subscription_id").unique(),
  stripe_price_id: text("stripe_price_id"),
  plan: text("plan").$type<PlanId>().notNull().default("free"),
  status: text("status").$type<SubscriptionStatus>().notNull().default("active"),
  billing_interval: text("billing_interval").$type<BillingInterval>(),
  seat_count: integer("seat_count").notNull().default(1),
  current_period_start: timestamp("current_period_start"),
  current_period_end: timestamp("current_period_end"),
  cancel_at_period_end: boolean("cancel_at_period_end").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("sub_workspace_idx").on(t.workspace_id)]);

// ─── Integration connections ───────────────────────────────────────────────────

export const integrationConnections = pgTable("integration_connections", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  integration_type: text("integration_type").$type<IntegrationType>().notNull(),
  nango_connection_id: text("nango_connection_id").notNull(),
  nango_provider_config_key: text("nango_provider_config_key").notNull(),
  status: text("status").$type<SyncStatus>().notNull().default("idle"),
  last_synced_at: timestamp("last_synced_at"),
  docs_indexed: integer("docs_indexed").notNull().default(0),
  error_message: text("error_message"),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("conn_workspace_idx").on(t.workspace_id),
  index("conn_nango_idx").on(t.nango_connection_id),
  uniqueIndex("conn_workspace_type_unique").on(t.workspace_id, t.integration_type),
]);

// ─── Documents (uploaded files) ───────────────────────────────────────────────

export const documents = pgTable("documents", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  filename: text("filename").notNull(),
  s3_key: text("s3_key").notNull(),
  mime_type: text("mime_type").notNull(),
  size_bytes: integer("size_bytes").notNull(),
  document_type: text("document_type").$type<DocumentType>().notNull().default("doc"),
  is_official: boolean("is_official").notNull().default(false),
  status: text("status").$type<"pending" | "processing" | "indexed" | "error">().notNull().default("pending"),
  chunks_indexed: integer("chunks_indexed").notNull().default(0),
  error_message: text("error_message"),
  uploaded_by: text("uploaded_by").notNull(), // clerk user_id
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [index("doc_workspace_idx").on(t.workspace_id)]);

// ─── Sync jobs ────────────────────────────────────────────────────────────────

export const syncJobs = pgTable("sync_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  connection_id: uuid("connection_id").references(() => integrationConnections.id, { onDelete: "cascade" }),
  document_id: uuid("document_id").references(() => documents.id, { onDelete: "cascade" }),
  job_type: text("job_type").$type<"ingest_document" | "sync_integration">().notNull(),
  bullmq_job_id: text("bullmq_job_id"),
  status: text("status").$type<"queued" | "running" | "done" | "failed">().notNull().default("queued"),
  error_message: text("error_message"),
  started_at: timestamp("started_at"),
  completed_at: timestamp("completed_at"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("sync_workspace_idx").on(t.workspace_id)]);

// ─── Conversations ────────────────────────────────────────────────────────────

export const conversations = pgTable("conversations", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  user_id: text("user_id").notNull(), // clerk user_id
  user_display_name: text("user_display_name"),
  title: text("title"),
  is_pinned: boolean("is_pinned").notNull().default(false),
  created_at: timestamp("created_at").notNull().defaultNow(),
  updated_at: timestamp("updated_at").notNull().defaultNow(),
}, (t) => [
  index("conv_workspace_idx").on(t.workspace_id),
  index("conv_user_idx").on(t.user_id),
]);

// ─── Messages ─────────────────────────────────────────────────────────────────

export const messages = pgTable("messages", {
  id: uuid("id").primaryKey().defaultRandom(),
  conversation_id: uuid("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").$type<"user" | "assistant">().notNull(),
  content: text("content").notNull(),
  citations: jsonb("citations"),
  model_used: text("model_used").$type<ModelId>(),
  latency_ms: integer("latency_ms"),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (t) => [index("msg_conv_idx").on(t.conversation_id)]);

// ─── Source chunks (metadata mirror — Pinecone holds the vectors) ─────────────

export const sourceChunks = pgTable("source_chunks", {
  id: uuid("id").primaryKey().defaultRandom(),
  workspace_id: uuid("workspace_id").notNull().references(() => workspaces.id, { onDelete: "cascade" }),
  pinecone_id: text("pinecone_id").notNull(),
  source_type: text("source_type").$type<IntegrationType | "upload">().notNull(),
  source_id: text("source_id").notNull(),
  source_title: text("source_title").notNull(),
  source_url: text("source_url").notNull(),
  authority_tier: integer("authority_tier").$type<SourceAuthorityTier>().notNull(),
  document_type: text("document_type").$type<DocumentType>().notNull(),
  author_role: text("author_role").$type<AuthorRole>().notNull().default("other"),
  is_official: boolean("is_official").notNull().default(false),
  permission_groups: jsonb("permission_groups").$type<string[]>().notNull().default([]),
  created_at: timestamp("created_at").notNull().defaultNow(),
}, (t) => [
  index("chunk_workspace_idx").on(t.workspace_id),
  index("chunk_source_idx").on(t.source_id),
  index("chunk_pinecone_idx").on(t.pinecone_id),
]);
