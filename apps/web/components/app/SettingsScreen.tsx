"use client";
import { useAuth } from "@clerk/nextjs";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  type AuthorityWeights,
  DEFAULT_MODEL,
  type ModelId,
} from "@usemoos/types";
import type { ReactNode } from "react";
import { useState } from "react";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import { apiJson } from "@/lib/api";

interface SettingsData {
  workspaceId: string;
  preferredModel: ModelId | null;
  authorityWeights: AuthorityWeights;
  confidenceThreshold: number;
  availableModels: Array<{
    id: ModelId;
    name: string;
    costPer1kInputTokens: number;
    costPer1kOutputTokens: number;
  }>;
}

interface BillingData {
  plan: string;
  seats: number;
  status: string;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean | null;
}

type Tab = "settings" | "billing";

const WEIGHT_LABELS: Record<keyof AuthorityWeights, string> = {
  semantic_relevance: "Semantic relevance",
  source_authority_tier: "Source authority tier",
  recency_decay: "Recency decay",
  role_relevance: "Role relevance",
  document_type_boost: "Document type boost",
  engagement_signals: "Engagement signals",
};

export default function SettingsScreen() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [tab, setTab] = useState<Tab>("settings");
  const [draftModel, setDraftModel] = useState<ModelId | null>(null);
  const [draftWeights, setDraftWeights] = useState<AuthorityWeights | null>(
    null,
  );
  const [draftThreshold, setDraftThreshold] = useState<number | null>(null);

  const { data: settings, isLoading: loadingSettings } = useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return apiJson<SettingsData>("/settings", token);
    },
  });

  const { data: billing, isLoading: loadingBilling } = useQuery({
    queryKey: ["billing-status"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return apiJson<BillingData>("/billing/status", token);
    },
    enabled: tab === "billing",
  });

  const modelMutation = useMutation({
    mutationFn: async (model: ModelId) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return apiJson<{ ok: boolean }>("/settings/model", token, {
        method: "PATCH",
        body: JSON.stringify({ model }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const weightsMutation = useMutation({
    mutationFn: async (authorityWeights: AuthorityWeights) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return apiJson<{ ok: boolean }>("/settings/authority-weights", token, {
        method: "PATCH",
        body: JSON.stringify(authorityWeights),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const thresholdMutation = useMutation({
    mutationFn: async (threshold: number) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return apiJson<{ ok: boolean }>("/settings/confidence-threshold", token, {
        method: "PATCH",
        body: JSON.stringify({ threshold }),
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["settings"] }),
  });

  const checkoutMutation = useMutation({
    mutationFn: async (planId: "pro") => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return apiJson<{ url: string | null }>("/billing/checkout", token, {
        method: "POST",
        body: JSON.stringify({ planId, seats: 1 }),
      });
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const portalMutation = useMutation({
    mutationFn: async () => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      return apiJson<{ url: string }>("/billing/portal", token, {
        method: "POST",
      });
    },
    onSuccess: (data) => {
      if (data.url) window.location.href = data.url;
    },
  });

  const activeModel = draftModel ?? settings?.preferredModel ?? DEFAULT_MODEL;
  const activeWeights = draftWeights ?? settings?.authorityWeights ?? null;
  const activeThreshold = draftThreshold ?? settings?.confidenceThreshold ?? 40;

  return (
    <div className="max-w-[680px] mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      <div className="mb-7">
        <h1 className="text-[26px] tracking-[-0.02em] font-semibold m-0 mb-1 text-ink">
          Settings
        </h1>
        <p className="text-[14px] text-muted m-0">
          Manage workspace AI preferences and billing.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-bg-2 border border-line rounded-[10px] w-fit mb-8">
        {(["settings", "billing"] as Tab[]).map((t) => (
          <button
            key={t}
            type="button"
            className={`px-3.5 py-1.5 rounded-[7px] text-[13px] font-medium transition-colors ${
              tab === t
                ? "bg-surface text-ink shadow-[inset_0_0_0_1px_var(--line)]"
                : "text-ink-2 hover:text-ink hover:bg-surface-2"
            }`}
            onClick={() => setTab(t)}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)}
          </button>
        ))}
      </div>

      {tab === "settings" &&
        (loadingSettings ? (
          <LoadingSkeleton />
        ) : (
          <div className="flex flex-col gap-10">
            {/* Model */}
            <SettingRow
              title="AI Model"
              desc="The Claude model used to synthesize answers from your workspace knowledge."
            >
              <div className="flex items-center gap-3 mt-4">
                <select
                  className="flex-1 bg-surface border border-line rounded-[9px] px-3.5 py-2.5 text-[14px] text-ink outline-none cursor-pointer hover:border-line-2 focus:border-line-2 [transition:border-color_0.15s]"
                  value={activeModel}
                  onChange={(e) => setDraftModel(e.target.value as ModelId)}
                >
                  {(settings?.availableModels ?? []).map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
                <SaveBtn
                  pending={modelMutation.isPending}
                  success={modelMutation.isSuccess}
                  onClick={() => modelMutation.mutate(activeModel)}
                />
              </div>
              {settings?.availableModels &&
                (() => {
                  const m = settings.availableModels.find(
                    (x) => x.id === activeModel,
                  );
                  return m ? (
                    <div className="mt-2 font-mono text-[11.5px] text-muted">
                      ${m.costPer1kInputTokens}/1K in · $
                      {m.costPer1kOutputTokens}/1K out
                    </div>
                  ) : null;
                })()}
            </SettingRow>

            {/* Retrieval weights */}
            <SettingRow
              title="Retrieval Weights"
              desc="How the RAG pipeline balances different signals when ranking retrieved chunks. Values are relative — the engine normalises them automatically."
            >
              {activeWeights && (
                <div className="flex flex-col gap-5 mt-4">
                  {(
                    Object.keys(WEIGHT_LABELS) as Array<keyof AuthorityWeights>
                  ).map((key) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex items-center justify-between text-[13px]">
                        <span className="text-ink-2">{WEIGHT_LABELS[key]}</span>
                        <span className="font-mono text-ink">
                          {Math.round(activeWeights[key] * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={activeWeights[key]}
                        onChange={(e) =>
                          setDraftWeights({
                            ...activeWeights,
                            [key]: Number(e.target.value),
                          })
                        }
                        className="w-full accent-accent"
                      />
                    </div>
                  ))}
                </div>
              )}
            </SettingRow>

            {/* Confidence threshold */}
            <SettingRow
              title="Confidence Threshold"
              desc="Chunks scoring below this value are dropped before synthesis. Higher values produce more focused but potentially less complete answers."
            >
              <div className="flex flex-col gap-2 mt-4">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-ink-2">Minimum score</span>
                  <span className="font-mono text-ink font-medium">
                    {Math.round(activeThreshold)}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={1}
                  value={activeThreshold}
                  onChange={(e) => setDraftThreshold(Number(e.target.value))}
                  className="w-full accent-accent"
                />
                <div className="flex justify-between font-mono text-[11px] text-muted">
                  <span>0 — include all</span>
                  <span>100 — strict</span>
                </div>
              </div>
            </SettingRow>

            {/* Save retrieval + threshold together */}
            <div className="flex items-center gap-3 pt-2 border-t border-line">
              <SaveBtn
                label="Save retrieval settings"
                pending={
                  weightsMutation.isPending || thresholdMutation.isPending
                }
                success={
                  weightsMutation.isSuccess && thresholdMutation.isSuccess
                }
                onClick={() => {
                  if (activeWeights) weightsMutation.mutate(activeWeights);
                  thresholdMutation.mutate(Math.round(activeThreshold));
                }}
              />
            </div>
          </div>
        ))}

      {tab === "billing" &&
        (loadingBilling ? (
          <LoadingSkeleton />
        ) : (
          <BillingTab
            data={billing ?? { plan: "free", seats: 1, status: "active" }}
            upgrading={checkoutMutation.isPending}
            portaling={portalMutation.isPending}
            onUpgrade={() => checkoutMutation.mutate("pro")}
            onPortal={() => portalMutation.mutate()}
          />
        ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex flex-col gap-3">
          <div className="h-4 w-32 bg-surface-2 rounded-[6px]" />
          <div className="h-3 w-56 bg-surface-2 rounded-[6px]" />
          <div className="h-10 bg-surface-2 rounded-[9px] mt-2" />
        </div>
      ))}
    </div>
  );
}

interface SettingRowProps {
  title: string;
  desc: string;
  children: ReactNode;
}

function SettingRow({ title, desc, children }: SettingRowProps) {
  return (
    <div>
      <div className="text-[15px] font-semibold text-ink mb-1">{title}</div>
      <div className="text-[13px] text-muted leading-[1.5]">{desc}</div>
      {children}
    </div>
  );
}

interface SaveBtnProps {
  label?: string;
  pending: boolean;
  success: boolean;
  onClick: () => void;
}

function SaveBtn({ label = "Save", pending, success, onClick }: SaveBtnProps) {
  return (
    <button
      type="button"
      disabled={pending}
      onClick={onClick}
      className="inline-flex items-center gap-2 px-4 py-2 bg-ink text-accent text-[13.5px] font-medium rounded-[8px] hover:bg-ink-2 [transition:background_0.15s] disabled:opacity-50"
    >
      {pending && (
        <span className="w-3.5 h-3.5 border-2 border-accent/30 border-t-accent rounded-full animate-spin" />
      )}
      {!pending && success && <WorkspaceIcon name="check" size={13} />}
      {success && !pending ? "Saved" : label}
    </button>
  );
}

interface BillingTabProps {
  data: BillingData;
  upgrading: boolean;
  portaling: boolean;
  onUpgrade: () => void;
  onPortal: () => void;
}

function BillingTab({
  data,
  upgrading,
  portaling,
  onUpgrade,
  onPortal,
}: BillingTabProps) {
  const isPaid = data.plan !== "free";
  const isActive = data.status === "active" || data.status === "trialing";

  return (
    <div className="flex flex-col gap-6">
      {/* Current plan */}
      <div className="flex items-start justify-between p-5 bg-surface border border-line rounded-[14px]">
        <div>
          <div className="font-mono text-[11px] text-dim tracking-[0.08em] uppercase mb-1">
            Current plan
          </div>
          <div className="text-[22px] font-bold text-ink capitalize tracking-[-0.02em]">
            {data.plan}
          </div>
          <div className="flex items-center gap-2 mt-1.5">
            <span
              className={`inline-flex items-center gap-1.5 text-[12px] font-medium ${
                isActive ? "text-accent-ink" : "text-warning"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-accent-2" : "bg-warning"}`}
              />
              {data.status.replace(/_/g, " ")}
            </span>
            {data.seats > 1 && (
              <span className="text-[12px] text-muted">
                · {data.seats} seats
              </span>
            )}
          </div>
          {data.cancelAtPeriodEnd && data.currentPeriodEnd && (
            <div className="mt-2 text-[12px] text-warning">
              Cancels {new Date(data.currentPeriodEnd).toLocaleDateString()}
            </div>
          )}
        </div>
        {isPaid && (
          <button
            type="button"
            disabled={portaling}
            onClick={onPortal}
            className="inline-flex items-center gap-2 px-3.5 py-2 border border-line text-[13px] text-ink-2 rounded-[8px] hover:border-line-2 hover:text-ink [transition:border-color_0.15s,color_0.15s] disabled:opacity-50"
          >
            {portaling && (
              <span className="w-3 h-3 border-2 border-ink/20 border-t-ink rounded-full animate-spin" />
            )}
            Manage billing
          </button>
        )}
      </div>

      {!isPaid && (
        <div className="flex flex-col gap-4">
          <div className="text-[14px] font-semibold text-ink">
            Upgrade your plan
          </div>
          <div className="grid grid-cols-2 max-[600px]:grid-cols-1 gap-3">
            <UpgradeCard
              name="Pro"
              price="$49"
              period="/mo"
              features={[
                "25 seats",
                "50,000 documents",
                "5,000 queries/mo",
                "All integrations",
              ]}
              cta="Upgrade to Pro"
              loading={upgrading}
              onClick={onUpgrade}
            />
            <UpgradeCard
              name="Enterprise"
              price="Custom"
              period=""
              features={[
                "Unlimited seats",
                "Unlimited docs",
                "SSO & SAML",
                "Priority support",
              ]}
              cta="Contact sales"
              loading={false}
              onClick={() => window.open("mailto:sales@usemoos.com", "_blank")}
              outline
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface UpgradeCardProps {
  name: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  loading: boolean;
  onClick: () => void;
  outline?: boolean;
}

function UpgradeCard({
  name,
  price,
  period,
  features,
  cta,
  loading,
  onClick,
  outline = false,
}: UpgradeCardProps) {
  return (
    <div className="flex flex-col p-5 bg-surface border border-line rounded-[14px]">
      <div className="text-[14px] font-semibold text-ink mb-0.5">{name}</div>
      <div className="flex items-baseline gap-1 mb-4">
        <span className="text-[24px] font-bold text-ink tracking-[-0.02em]">
          {price}
        </span>
        {period && <span className="text-[13px] text-muted">{period}</span>}
      </div>
      <ul className="flex flex-col gap-2 mb-5 flex-1">
        {features.map((f) => (
          <li
            key={f}
            className="flex items-center gap-2 text-[13px] text-ink-2"
          >
            <WorkspaceIcon name="check" size={12} />
            {f}
          </li>
        ))}
      </ul>
      <button
        type="button"
        disabled={loading}
        onClick={onClick}
        className={`w-full py-2.5 rounded-[9px] text-[13.5px] font-medium [transition:background_0.15s,border-color_0.15s] disabled:opacity-50 ${
          outline
            ? "border border-line text-ink hover:bg-surface-2 hover:border-line-2"
            : "bg-ink text-accent hover:bg-ink-2"
        }`}
      >
        {loading ? "Redirecting…" : cta}
      </button>
    </div>
  );
}
