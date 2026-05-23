// ─── Subscription ────────────────────────────────────────────────────────────

export type PlanId = "free" | "pro" | "enterprise";

export interface Plan {
  id: PlanId;
  name: string;
  monthlyPrice: number; // cents
  yearlyPrice: number; // cents
  maxSeats: number;
  maxDocuments: number;
  maxQueriesPerMonth: number;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxSeats: 3,
    maxDocuments: 500,
    maxQueriesPerMonth: 100,
  },
  pro: {
    id: "pro",
    name: "Pro",
    monthlyPrice: 4900,
    yearlyPrice: 47040,
    maxSeats: 25,
    maxDocuments: 50000,
    maxQueriesPerMonth: 5000,
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    monthlyPrice: 0,
    yearlyPrice: 0,
    maxSeats: 999999,
    maxDocuments: 999999,
    maxQueriesPerMonth: 999999,
  },
};

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "past_due"
  | "canceled"
  | "unpaid";

export type BillingInterval = "month" | "year";

// ─── AI Models ───────────────────────────────────────────────────────────────

export type ModelId =
  | "claude-opus-4-7"
  | "claude-sonnet-4-6"
  | "claude-haiku-4-5-20251001";

export interface ModelMeta {
  id: ModelId;
  name: string;
  provider: "anthropic";
  contextWindow: number;
  costPer1kInputTokens: number;
  costPer1kOutputTokens: number;
  supportsStreaming: boolean;
}

export const MODELS: Record<ModelId, ModelMeta> = {
  "claude-opus-4-7": {
    id: "claude-opus-4-7",
    name: "Claude Opus 4.7",
    provider: "anthropic",
    contextWindow: 200000,
    costPer1kInputTokens: 0.015,
    costPer1kOutputTokens: 0.075,
    supportsStreaming: true,
  },
  "claude-sonnet-4-6": {
    id: "claude-sonnet-4-6",
    name: "Claude Sonnet 4.6",
    provider: "anthropic",
    contextWindow: 200000,
    costPer1kInputTokens: 0.003,
    costPer1kOutputTokens: 0.015,
    supportsStreaming: true,
  },
  "claude-haiku-4-5-20251001": {
    id: "claude-haiku-4-5-20251001",
    name: "Claude Haiku 4.5",
    provider: "anthropic",
    contextWindow: 200000,
    costPer1kInputTokens: 0.0008,
    costPer1kOutputTokens: 0.004,
    supportsStreaming: true,
  },
};

export const DEFAULT_MODEL: ModelId = "claude-sonnet-4-6";

// ─── Integrations ─────────────────────────────────────────────────────────────

export type IntegrationType =
  | "google_drive"
  | "notion"
  | "slack"
  | "github"
  | "confluence"
  | "jira"
  | "linear"
  | "asana"
  | "clickup"
  | "hubspot"
  | "salesforce"
  | "zendesk"
  | "microsoft_teams"
  | "sharepoint"
  | "trello"
  | "dropbox";

export type SourceAuthorityTier = 1 | 2 | 3 | 4;

export const INTEGRATION_META: Record<
  IntegrationType,
  { label: string; nangoProvider: string; authorityTier: SourceAuthorityTier }
> = {
  google_drive: {
    label: "Google Drive",
    nangoProvider: "google-drive",
    authorityTier: 3,
  },
  notion: { label: "Notion", nangoProvider: "notion", authorityTier: 3 },
  slack: { label: "Slack", nangoProvider: "slack", authorityTier: 4 },
  github: { label: "GitHub", nangoProvider: "github", authorityTier: 2 },
  confluence: {
    label: "Confluence",
    nangoProvider: "confluence",
    authorityTier: 2,
  },
  jira: { label: "Jira", nangoProvider: "jira", authorityTier: 2 },
  linear: { label: "Linear", nangoProvider: "linear", authorityTier: 2 },
  asana: { label: "Asana", nangoProvider: "asana", authorityTier: 2 },
  clickup: { label: "ClickUp", nangoProvider: "clickup", authorityTier: 2 },
  hubspot: { label: "HubSpot", nangoProvider: "hubspot", authorityTier: 2 },
  salesforce: {
    label: "Salesforce",
    nangoProvider: "salesforce",
    authorityTier: 2,
  },
  zendesk: { label: "Zendesk", nangoProvider: "zendesk", authorityTier: 2 },
  microsoft_teams: {
    label: "Microsoft Teams",
    nangoProvider: "microsoft-teams",
    authorityTier: 4,
  },
  sharepoint: {
    label: "SharePoint",
    nangoProvider: "sharepoint",
    authorityTier: 2,
  },
  trello: { label: "Trello", nangoProvider: "trello", authorityTier: 3 },
  dropbox: { label: "Dropbox", nangoProvider: "dropbox", authorityTier: 3 },
};

export const PHASE_ONE_INTEGRATIONS = [
  "google_drive",
  "notion",
  "slack",
] as const satisfies ReadonlyArray<IntegrationType>;

export type SyncStatus = "idle" | "syncing" | "success" | "error";

// ─── RAG / Knowledge ─────────────────────────────────────────────────────────

export type DocumentType =
  | "policy"
  | "architecture"
  | "conversation"
  | "ticket"
  | "pr"
  | "doc"
  | "spreadsheet"
  | "code"
  | "other";

export type AuthorRole =
  | "executive"
  | "manager"
  | "engineer"
  | "designer"
  | "sales"
  | "support"
  | "other";

export interface ChunkMetadata {
  workspace_id: string;
  source_type: IntegrationType | "upload";
  source_id: string;
  source_url: string;
  source_title: string;
  source_authority_tier: SourceAuthorityTier;
  author_role: AuthorRole;
  author_id: string;
  created_at: number;
  updated_at: number;
  permission_groups: string[];
  document_type: DocumentType;
  freshness_score: number;
  engagement_signals: number;
  is_official: boolean;
  section_hierarchy: string;
  chunk_index: number;
  total_chunks: number;
}

export interface AuthorityWeights {
  semantic_relevance: number;
  source_authority_tier: number;
  recency_decay: number;
  role_relevance: number;
  document_type_boost: number;
  engagement_signals: number;
}

export const DEFAULT_AUTHORITY_WEIGHTS: AuthorityWeights = {
  semantic_relevance: 0.35,
  source_authority_tier: 0.25,
  recency_decay: 0.15,
  role_relevance: 0.1,
  document_type_boost: 0.1,
  engagement_signals: 0.05,
};

// ─── API shapes ───────────────────────────────────────────────────────────────

export interface Citation {
  source_id: string;
  source_title: string;
  source_url: string;
  source_type: IntegrationType | "upload";
  authority_tier: SourceAuthorityTier;
  excerpt: string;
  rank: number;
}

export interface SearchResult {
  answer: string;
  citations: Citation[];
  model_used: ModelId;
  latency_ms: number;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
}

export interface WorkspaceSettings {
  preferred_model: ModelId;
  authority_weights: AuthorityWeights;
  confidence_threshold: number;
}

// ─── Workspace UI ─────────────────────────────────────────────────────────────

export type AccountState = "new" | "partial" | "mature";

export type Screen =
  | "home"
  | "ask"
  | "connections"
  | "library"
  | "search"
  | "settings";

export interface Connection {
  src: string;
  status: "ok" | "warn" | "err" | "idle";
  docs: number;
  lastSync: string;
  connectedBy: string;
  note?: string;
}

export interface Thread {
  id: string;
  q: string;
  srcs: string[];
  when: string;
  by: string;
}

export interface SuggestedPrompt {
  tag: string;
  q: string;
  srcs: string[];
}

export interface PinnedItem {
  q: string;
  srcs: string[];
  when: string;
}

export interface Space {
  name: string;
  emoji: string;
  desc: string;
  count: number;
  members: string[];
  updated: string;
}

export interface OnboardingStep {
  id: string;
  label: string;
  done: boolean;
}

export interface TeamActivity {
  who: string;
  initials: string;
  action: string;
  q: string;
  when: string;
  srcs: string[];
}

export interface SourceMeta {
  label: string;
  cls: string;
}
