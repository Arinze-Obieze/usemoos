"use client";
import { useAuth } from "@clerk/nextjs";
import Nango from "@nangohq/frontend";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  INTEGRATION_META,
  type IntegrationType,
  PHASE_ONE_INTEGRATIONS,
} from "@usemoos/types";
import { useRef, useState } from "react";
import SrcIcon from "@/components/app/SrcIcon";
import WorkspaceIcon from "@/components/app/WorkspaceIcon";
import { DISCOVER_CONNECTORS, SOURCES } from "@/components/app/workspaceData";
import {
  apiFetch,
  apiJson,
  formatRelativeTime,
  integrationTypeToSrcKey,
} from "@/lib/api";

// ─── Shared types ─────────────────────────────────────────────────────────────

interface IntegrationConnection {
  id: string;
  integration_type: string;
  status: string;
  docs_indexed: number | null;
  last_synced_at: string | null;
  nango_connection_id: string | null;
}

interface UploadedDocument {
  id: string;
  filename: string;
  mime_type: string;
  size_bytes: number;
  status: "pending" | "processing" | "indexed" | "error";
  chunks_indexed: number;
  error_message: string | null;
  created_at: string;
}

interface InFlightUpload {
  localId: string;
  name: string;
  size: number;
  progress: number;
  error?: string;
}

interface SyncJob {
  id: string;
  job_type: string;
  status: string;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  integration_type: string | null;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

type DisplayStatus = "ok" | "warn" | "err" | "idle" | "syncing";
type ConnTab = "connected" | "discover" | "permissions" | "sync-log";

function apiStatusToDisplay(s: string): DisplayStatus {
  if (s === "success") return "ok";
  if (s === "error") return "err";
  if (s === "syncing") return "syncing";
  return "idle";
}

const STATUS_STYLES: Record<DisplayStatus, string> = {
  ok: "text-accent-ink bg-(--accent-soft)",
  warn: "text-warning bg-(--warning-soft)",
  err: "text-danger bg-(--danger-soft)",
  idle: "text-muted bg-surface-2",
  syncing: "text-accent-ink bg-(--accent-soft)",
};
const STATUS_DOT: Record<DisplayStatus, string> = {
  ok: "bg-accent-3",
  warn: "bg-warning",
  err: "bg-danger",
  idle: "bg-dim",
  syncing: "bg-accent-2",
};
const STATUS_LABEL: Record<DisplayStatus, string> = {
  ok: "Connected",
  warn: "Warning",
  err: "Error",
  idle: "Idle",
  syncing: "Syncing…",
};

const DOC_STATUS_STYLES: Record<UploadedDocument["status"], string> = {
  pending: "text-muted bg-surface-2",
  processing: "text-accent-ink bg-(--accent-soft)",
  indexed: "text-accent-ink bg-(--accent-soft)",
  error: "text-danger bg-(--danger-soft)",
};

const DOC_STATUS_LABELS: Record<UploadedDocument["status"], string> = {
  pending: "Queued",
  processing: "Processing…",
  indexed: "Indexed",
  error: "Error",
};

const JOB_STATUS_STYLES: Record<string, string> = {
  queued: "text-muted bg-surface-2",
  running: "text-accent-ink bg-(--accent-soft)",
  done: "text-accent-ink bg-(--accent-soft)",
  failed: "text-danger bg-(--danger-soft)",
};

const AUTHORITY_TIER_LABELS: Record<number, string> = {
  1: "Tier 1 — Authoritative",
  2: "Tier 2 — Structured",
  3: "Tier 3 — Collaborative",
  4: "Tier 4 — Conversational",
};

const ACCEPTED_MIME: Record<string, string> = {
  "text/plain": ".txt",
  "text/markdown": ".md",
  "application/pdf": ".pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
    ".docx",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": ".xlsx",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation":
    ".pptx",
};

const ACCEPT_ATTR = Object.values(ACCEPTED_MIME).join(",");

function formatBytes(b: number): string {
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Upload section ────────────────────────────────────────────────────────────

function UploadSection() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [inFlight, setInFlight] = useState<InFlightUpload[]>([]);

  const { data: docs = [] } = useQuery({
    queryKey: ["documents"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return [];
      return apiJson<UploadedDocument[]>("/upload/documents", token);
    },
    refetchInterval: (query) => {
      const d = query.state.data ?? [];
      return d.some(
        (doc) => doc.status === "pending" || doc.status === "processing",
      )
        ? 3000
        : false;
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (docId: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch(`/upload/documents/${docId}`, token, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["documents"] }),
  });

  async function uploadFiles(files: File[]) {
    const token = await getToken();
    if (!token) return;

    for (const file of files) {
      const mimeType = file.type;
      if (!ACCEPTED_MIME[mimeType]) continue;
      if (file.size > 100 * 1024 * 1024) continue;

      const localId = crypto.randomUUID();
      setInFlight((prev) => [
        { localId, name: file.name, size: file.size, progress: 0 },
        ...prev,
      ]);

      try {
        const { presignedUrl, documentId } = await apiJson<{
          presignedUrl: string;
          documentId: string;
          s3Key: string;
        }>("/upload/presign", token, {
          method: "POST",
          body: JSON.stringify({
            fileName: file.name,
            mimeType,
            fileSize: file.size,
          }),
        });

        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.upload.onprogress = (e) => {
            if (e.lengthComputable) {
              const pct = Math.round((e.loaded / e.total) * 90);
              setInFlight((prev) =>
                prev.map((u) =>
                  u.localId === localId ? { ...u, progress: pct } : u,
                ),
              );
            }
          };
          xhr.onload = () =>
            xhr.status >= 200 && xhr.status < 300
              ? resolve()
              : reject(new Error("S3 upload failed"));
          xhr.onerror = () => reject(new Error("Network error"));
          xhr.open("PUT", presignedUrl);
          xhr.setRequestHeader("Content-Type", mimeType);
          xhr.send(file);
        });

        setInFlight((prev) =>
          prev.map((u) => (u.localId === localId ? { ...u, progress: 95 } : u)),
        );

        await apiFetch("/upload/confirm", token, {
          method: "POST",
          body: JSON.stringify({ documentId }),
        });

        setInFlight((prev) => prev.filter((u) => u.localId !== localId));
        qc.invalidateQueries({ queryKey: ["documents"] });
      } catch (err) {
        setInFlight((prev) =>
          prev.map((u) =>
            u.localId === localId ? { ...u, error: (err as Error).message } : u,
          ),
        );
      }
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    uploadFiles(Array.from(files));
  }

  function resetFileInput(e: React.MouseEvent<HTMLInputElement>) {
    e.currentTarget.value = "";
  }

  const isEmpty = docs.length === 0 && inFlight.length === 0;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-[15px] tracking-[-0.005em] font-semibold text-ink m-0">
            Uploaded files
          </h2>
          <p className="text-[12.5px] text-muted m-0 mt-0.5">
            PDF, Word, Excel, PowerPoint, plain text — up to 100 MB each
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 px-3.5 py-2 bg-ink text-accent rounded-[8px] text-[13px] font-medium hover:bg-ink-2 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <WorkspaceIcon name="plus" size={12} />
          Upload files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          hidden
          accept={ACCEPT_ATTR}
          onChange={(e) => handleFiles(e.target.files)}
          onClick={resetFileInput}
        />
      </div>

      {isEmpty ? (
        <button
          type="button"
          className={`flex flex-col items-center justify-center gap-3 py-10 px-6 bg-surface border-2 border-dashed rounded-[12px] text-center [transition:border-color_0.15s,background_0.15s] cursor-pointer ${isDragging ? "border-accent-2 bg-(--accent-soft)" : "border-line-2 hover:border-line-3 hover:bg-bg-2"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-10 h-10 rounded-[10px] bg-bg-2 border border-line grid place-items-center text-muted">
            <WorkspaceIcon name="att" size={18} />
          </div>
          <div>
            <p className="text-[14px] font-medium text-ink m-0">
              Drop files here or click to browse
            </p>
            <p className="text-[12.5px] text-muted mt-1 m-0">
              .txt · .md · .pdf · .docx · .xlsx · .pptx
            </p>
          </div>
        </button>
      ) : (
        <section
          aria-label="Uploaded files"
          className={`bg-surface border-2 border-dashed rounded-[12px] overflow-hidden [transition:border-color_0.15s] ${isDragging ? "border-accent-2" : "border-line-2"}`}
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
        >
          {inFlight.map((u) => (
            <div
              key={u.localId}
              className="relative flex items-center gap-3.5 px-5 py-3.5 border-b border-line last:border-b-0 overflow-hidden"
            >
              {!u.error && (
                <div
                  className="absolute inset-0 bg-accent/6 origin-left transition-transform duration-300"
                  style={{ transform: `scaleX(${u.progress / 100})` }}
                />
              )}
              <div className="relative w-8 h-8 rounded-[8px] bg-bg-2 border border-line grid place-items-center text-muted shrink-0">
                <WorkspaceIcon name="att" size={14} />
              </div>
              <div className="relative flex-1 min-w-0">
                <div className="text-[14px] font-medium text-ink truncate">
                  {u.name}
                </div>
                <div className="font-mono text-[11.5px] text-muted mt-0.5">
                  {u.error ? (
                    <span className="text-danger">{u.error}</span>
                  ) : (
                    `${formatBytes(u.size)} · ${u.progress < 95 ? `uploading ${u.progress}%` : "queuing…"}`
                  )}
                </div>
              </div>
              {u.error && (
                <button
                  type="button"
                  className="relative text-muted hover:text-danger transition-colors"
                  onClick={() =>
                    setInFlight((prev) =>
                      prev.filter((x) => x.localId !== u.localId),
                    )
                  }
                >
                  <WorkspaceIcon name="close" size={14} />
                </button>
              )}
            </div>
          ))}
          {docs.map((doc) => (
            <div
              key={doc.id}
              className="flex items-center gap-3.5 px-5 py-3.5 border-b border-line last:border-b-0"
            >
              <div className="w-8 h-8 rounded-[8px] bg-bg-2 border border-line grid place-items-center text-muted shrink-0">
                <WorkspaceIcon name="att" size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-ink truncate">
                  {doc.filename}
                </div>
                <div className="font-mono text-[11.5px] text-muted mt-0.5">
                  {formatBytes(doc.size_bytes)}
                  {doc.status === "indexed" &&
                    ` · ${doc.chunks_indexed.toLocaleString()} chunks`}
                  {doc.error_message && (
                    <span className="text-danger ml-1.5">
                      {doc.error_message}
                    </span>
                  )}
                  <span className="ml-1.5">
                    {formatRelativeTime(doc.created_at)}
                  </span>
                </div>
              </div>
              <div
                className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full max-[600px]:hidden ${DOC_STATUS_STYLES[doc.status]}`}
              >
                {doc.status === "processing" && (
                  <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                )}
                {DOC_STATUS_LABELS[doc.status]}
              </div>
              <button
                type="button"
                className="w-7 h-7 rounded-[7px] text-muted grid place-items-center hover:bg-surface-2 hover:text-danger [transition:background_0.15s,color_0.15s] disabled:opacity-40"
                disabled={
                  deleteMutation.isPending &&
                  deleteMutation.variables === doc.id
                }
                onClick={() => deleteMutation.mutate(doc.id)}
                title="Delete document"
              >
                <WorkspaceIcon name="close" size={12} />
              </button>
            </div>
          ))}
        </section>
      )}
    </div>
  );
}

// ─── Permissions tab ──────────────────────────────────────────────────────────

function PermissionsTab({ conns }: { conns: IntegrationConnection[] }) {
  if (conns.length === 0) {
    return (
      <div className="py-12 text-center text-[14px] text-muted">
        Connect integrations to see their permission configuration here.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-[13.5px] text-muted leading-[1.55]">
        Permission filtering is enforced at retrieval time — employees only see
        content they already have access to in the source system. These tiers
        control how strongly source authority is weighted in ranking.
      </p>
      <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden">
        <div
          className="grid items-center gap-4 px-5 py-2.5 border-b border-line bg-bg-2 font-mono text-[10.5px] text-dim tracking-[0.06em] uppercase"
          style={{ gridTemplateColumns: "auto 1fr auto auto" }}
        >
          <span className="w-5" />
          <span>Integration</span>
          <span className="text-right">Authority tier</span>
          <span className="text-right">Status</span>
        </div>
        {conns.map((c) => {
          const src = integrationTypeToSrcKey(c.integration_type);
          const meta = INTEGRATION_META[c.integration_type as IntegrationType];
          const tier = meta?.authorityTier ?? 3;
          const ds = apiStatusToDisplay(c.status);
          return (
            <div
              key={c.id}
              className="grid items-center gap-4 px-5 py-3.5 border-b border-line last:border-b-0"
              style={{ gridTemplateColumns: "auto 1fr auto auto" }}
            >
              <SrcIcon src={src} size={16} />
              <div>
                <div className="text-[14px] font-medium text-ink">
                  {SOURCES[src]?.label ?? c.integration_type}
                </div>
                <div className="font-mono text-[11.5px] text-muted mt-0.5">
                  {AUTHORITY_TIER_LABELS[tier] ?? `Tier ${tier}`}
                </div>
              </div>
              <div className="font-mono text-[12px] text-ink text-right">
                Tier {tier}
              </div>
              <div
                className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full ${STATUS_STYLES[ds]}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[ds]}`}
                />
                {STATUS_LABEL[ds]}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-col gap-2 p-4 bg-bg-2 border border-line rounded-[10px] text-[13px] text-muted">
        <div className="flex items-center gap-2 font-semibold text-ink">
          <WorkspaceIcon name="shield" size={13} />
          How permission filtering works
        </div>
        <p className="m-0 leading-[1.55]">
          When a user asks a question, the retrieval pipeline attaches their
          workspace ID and user ID as permission groups. Only chunks whose{" "}
          <code className="font-mono bg-surface px-1 py-0.5 rounded-[4px] text-ink">
            permission_groups
          </code>{" "}
          field overlaps with the user's groups are returned — enforced in
          Pinecone before any reranking.
        </p>
      </div>
    </div>
  );
}

// ─── Sync log tab ─────────────────────────────────────────────────────────────

function SyncLogTab() {
  const { getToken } = useAuth();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["sync-log"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return [];
      return apiJson<SyncJob[]>("/integrations/sync-log", token);
    },
    refetchInterval: 10_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 animate-pulse pt-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-surface-2 rounded-[8px]" />
        ))}
      </div>
    );
  }

  if (jobs.length === 0) {
    return (
      <div className="py-12 text-center text-[14px] text-muted">
        No sync jobs yet. Connect an integration or trigger a manual sync to see
        activity here.
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden">
      {jobs.map((job) => {
        const src = job.integration_type
          ? integrationTypeToSrcKey(job.integration_type)
          : null;
        const statusStyle =
          JOB_STATUS_STYLES[job.status] ?? "text-muted bg-surface-2";
        const duration =
          job.started_at && job.completed_at
            ? `${((new Date(job.completed_at).getTime() - new Date(job.started_at).getTime()) / 1000).toFixed(1)}s`
            : null;

        return (
          <div
            key={job.id}
            className="flex items-center gap-3.5 px-5 py-3.5 border-b border-line last:border-b-0"
          >
            {src ? (
              <SrcIcon src={src} size={14} />
            ) : (
              <span className="w-4 h-4 grid place-items-center text-muted">
                <WorkspaceIcon name="att" size={12} />
              </span>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-[14px] text-ink font-medium">
                {src
                  ? (SOURCES[src]?.label ?? job.integration_type)
                  : job.job_type === "ingest_document"
                    ? "File upload"
                    : "Sync job"}
              </div>
              {job.error_message && (
                <div className="font-mono text-[11.5px] text-danger mt-0.5 truncate">
                  {job.error_message}
                </div>
              )}
            </div>
            {duration && (
              <span className="font-mono text-[11.5px] text-muted">
                {duration}
              </span>
            )}
            <span className="font-mono text-[11.5px] text-muted">
              {formatRelativeTime(job.created_at)}
            </span>
            <div
              className={`inline-flex items-center gap-1.5 font-mono text-[11px] px-2.5 py-1 rounded-full ${statusStyle}`}
            >
              {job.status === "running" && (
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              )}
              {job.status}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

function getNango() {
  return new Nango({
    publicKey: process.env.NEXT_PUBLIC_NANGO_PUBLIC_KEY ?? "",
  });
}

export default function ConnectionsScreen() {
  const { getToken } = useAuth();
  const qc = useQueryClient();
  const [activeTab, setActiveTab] = useState<ConnTab>("connected");
  const [connectingType, setConnectingType] = useState<string | null>(null);
  const [connectError, setConnectError] = useState<string | null>(null);

  const { data: conns = [] } = useQuery({
    queryKey: ["integrations"],
    queryFn: async () => {
      const token = await getToken();
      if (!token) return [];
      return apiJson<IntegrationConnection[]>("/integrations", token);
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: async (integrationType: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch("/integrations/disconnect", token, {
        method: "POST",
        body: JSON.stringify({ integrationType }),
      });
      if (!res.ok) throw new Error("Disconnect failed");
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["integrations"] }),
  });

  const syncMutation = useMutation({
    mutationFn: async (integrationType: string) => {
      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch("/integrations/sync", token, {
        method: "POST",
        body: JSON.stringify({ integrationType }),
      });
      if (!res.ok) throw new Error("Sync failed");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["integrations"] });
      qc.invalidateQueries({ queryKey: ["sync-log"] });
    },
  });

  async function connectIntegration(integrationType: string) {
    const meta = INTEGRATION_META[integrationType as IntegrationType];
    if (!meta) return;

    setConnectingType(integrationType);
    setConnectError(null);

    try {
      const nangoConnectionId = crypto.randomUUID();
      const nango = getNango();
      await nango.auth(meta.nangoProvider, nangoConnectionId);

      const token = await getToken();
      if (!token) throw new Error("Not authenticated");
      const res = await apiFetch("/integrations/connect", token, {
        method: "POST",
        body: JSON.stringify({ integrationType, nangoConnectionId }),
      });
      if (!res.ok) throw new Error("Failed to register connection");

      qc.invalidateQueries({ queryKey: ["integrations"] });
      setActiveTab("connected");
    } catch (err) {
      const msg = (err as Error).message;
      if (
        !msg.toLowerCase().includes("cancelled") &&
        !msg.toLowerCase().includes("window")
      ) {
        setConnectError(`Could not connect ${meta.label}: ${msg}`);
      }
    } finally {
      setConnectingType(null);
    }
  }

  const displayConns = conns.map((c) => ({
    ...c,
    src: integrationTypeToSrcKey(c.integration_type),
    displayStatus: apiStatusToDisplay(c.status),
    docs: c.docs_indexed ?? 0,
    lastSync: formatRelativeTime(c.last_synced_at),
  }));

  const totalDocs = displayConns.reduce((a, c) => a + c.docs, 0);
  const warns = displayConns.filter((c) => c.displayStatus === "err").length;
  const ok = displayConns.filter(
    (c) => c.displayStatus === "ok" || c.displayStatus === "syncing",
  ).length;

  const connectedTypes = new Set(conns.map((c) => c.integration_type));
  const phaseOneTypes = new Set<string>(PHASE_ONE_INTEGRATIONS);
  const discoverList = Object.keys(DISCOVER_CONNECTORS)
    .filter((k) => !connectedTypes.has(k))
    .filter((k) => phaseOneTypes.has(k));

  const tabs: { id: ConnTab; label: string; count: number | null }[] = [
    { id: "connected", label: "Connected", count: conns.length },
    { id: "discover", label: "Discover", count: discoverList.length },
    { id: "permissions", label: "Permissions", count: null },
    { id: "sync-log", label: "Sync log", count: null },
  ];

  return (
    <div className="max-w-295 mx-auto px-10 max-[600px]:px-4 pt-9 max-[600px]:pt-6 pb-20">
      <div className="mb-7">
        <h1 className="text-[26px] tracking-[-0.02em] font-semibold m-0 mb-1 text-ink">
          Sources
        </h1>
        <p className="text-[14px] text-muted m-0">
          Connect the systems your team works in. Every answer is grounded in
          what's indexed here.
        </p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-4 max-[900px]:grid-cols-2 gap-3 mb-6">
        {[
          { label: "Connected", value: conns.length, badge: "active" },
          {
            label: "Documents indexed",
            value: totalDocs.toLocaleString(),
            badge: null,
          },
          { label: "Healthy", value: ok, badge: `of ${conns.length}` },
          {
            label: "Needs attention",
            value: warns,
            badge: warns > 0 ? "investigate" : "all good",
            warn: warns > 0,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="px-4 py-3.5 bg-surface border border-line rounded-[10px]"
          >
            <div className="font-mono text-[10.5px] text-dim tracking-[0.08em] uppercase mb-1.5">
              {stat.label}
            </div>
            <div className="text-[26px] font-semibold tracking-[-0.02em] text-ink leading-none">
              {stat.value}
              {stat.badge && (
                <em
                  className={`not-italic text-[18px] ml-1.5 px-[0.18em] rounded-[4px] align-[4px] ${stat.warn ? "bg-(--warning-soft) text-warning" : "bg-accent text-accent-ink"}`}
                >
                  {stat.badge}
                </em>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-line overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`px-3.5 py-2 text-[13px] border-b-2 -mb-px [transition:color_0.12s] cursor-pointer ${
              activeTab === tab.id
                ? "text-ink font-medium border-ink"
                : "text-muted border-transparent hover:text-ink-2"
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {tab.count !== null && (
              <span
                className={`ml-1.5 font-mono text-[11px] ${activeTab === tab.id ? "text-accent-ink" : "text-dim"}`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Connect error */}
      {connectError && (
        <div className="flex items-center justify-between gap-3 px-4 py-3 mb-3 bg-danger/5 border border-danger/20 rounded-[10px] text-[13px] text-danger">
          <div className="flex items-center gap-2">
            <WorkspaceIcon name="warn" size={14} />
            {connectError}
          </div>
          <button
            type="button"
            onClick={() => setConnectError(null)}
            className="text-danger/60 hover:text-danger"
          >
            <WorkspaceIcon name="close" size={12} />
          </button>
        </div>
      )}

      {/* Connected tab */}
      {activeTab === "connected" && (
        <>
          {displayConns.length === 0 ? (
            <div className="py-10 px-8 bg-surface border border-dashed border-line-2 rounded-[10px] text-center text-muted text-[14px]">
              No integrations connected yet. Pick one below or upload files
              directly.
            </div>
          ) : (
            <div className="flex flex-col bg-surface border border-line rounded-[10px] overflow-hidden mb-2">
              {displayConns.map((c) => (
                <div
                  key={c.id}
                  className="grid items-center gap-4.5 max-[600px]:gap-3 px-5 max-[600px]:px-4 py-4 border-b border-line last:border-b-0 grid-cols-[auto_1fr_auto_auto_auto] max-[600px]:grid-cols-[auto_1fr_auto]"
                >
                  <SrcIcon src={c.src} size={18} />
                  <div>
                    <div className="text-[15px] font-medium text-ink tracking-[-0.005em]">
                      {SOURCES[c.src]?.label ?? c.integration_type}
                    </div>
                    <div className="flex items-center gap-2 font-mono text-[11.5px] text-muted mt-0.5 flex-wrap">
                      <span>last sync {c.lastSync}</span>
                    </div>
                  </div>
                  <div className="text-right max-[600px]:hidden">
                    <div className="font-mono text-[13px] text-ink font-medium">
                      {c.docs.toLocaleString()}
                    </div>
                    <div className="font-mono text-[11px] text-muted">
                      indexed
                    </div>
                  </div>
                  <div
                    className={`inline-flex items-center gap-1.5 font-mono text-[11.5px] px-2.5 py-1 rounded-full max-[600px]:hidden ${STATUS_STYLES[c.displayStatus]}`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[c.displayStatus]}`}
                    />
                    {STATUS_LABEL[c.displayStatus]}
                  </div>
                  <div className="flex gap-2">
                    {c.displayStatus === "err" && (
                      <button
                        type="button"
                        className="px-3 py-1.5 border border-warning/40 rounded-full text-[12px] text-warning bg-bg hover:bg-warning/5 [transition:background_0.15s] disabled:opacity-50"
                        disabled={connectingType === c.integration_type}
                        onClick={() => connectIntegration(c.integration_type)}
                      >
                        {connectingType === c.integration_type
                          ? "Reconnecting…"
                          : "Reconnect"}
                      </button>
                    )}
                    <button
                      type="button"
                      className="px-3 py-1.5 border border-line rounded-full text-[12px] text-ink-2 bg-bg hover:border-line-2 hover:text-ink [transition:border-color_0.15s,color_0.15s] disabled:opacity-50"
                      disabled={
                        syncMutation.isPending &&
                        syncMutation.variables === c.integration_type
                      }
                      onClick={() => syncMutation.mutate(c.integration_type)}
                    >
                      Sync
                    </button>
                    <button
                      type="button"
                      className="px-3 py-1.5 border border-line rounded-full text-[12px] text-ink-2 bg-bg hover:border-danger/40 hover:text-danger [transition:border-color_0.15s,color_0.15s] disabled:opacity-50"
                      disabled={
                        disconnectMutation.isPending &&
                        disconnectMutation.variables === c.integration_type
                      }
                      onClick={() =>
                        disconnectMutation.mutate(c.integration_type)
                      }
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <UploadSection />
        </>
      )}

      {/* Discover tab */}
      {activeTab === "discover" && discoverList.length > 0 && (
        <div className="grid grid-cols-4 max-[900px]:grid-cols-2 max-[600px]:grid-cols-1 gap-3">
          {discoverList.map((s) => (
            <div
              key={s}
              className="flex flex-col gap-2 p-4.5 bg-surface border border-line rounded-[10px] [transition:border-color_0.15s,transform_0.15s] hover:border-line-2 hover:-translate-y-px"
            >
              <SrcIcon src={integrationTypeToSrcKey(s)} size={16} />
              <div className="text-[14px] font-medium text-ink">
                {SOURCES[integrationTypeToSrcKey(s)]?.label ??
                  INTEGRATION_META[s as IntegrationType]?.label ??
                  s}
              </div>
              <div className="text-[12.5px] text-muted leading-[1.4]">
                {DISCOVER_CONNECTORS[s]}
              </div>
              <button
                type="button"
                disabled={connectingType === s}
                onClick={() => connectIntegration(s)}
                className="mt-auto self-start px-3 py-1.5 bg-ink text-accent border-0 rounded-full text-[12px] font-medium disabled:opacity-60 cursor-pointer hover:bg-ink-2 transition-colors"
              >
                {connectingType === s ? "Connecting…" : "Connect"}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Permissions tab */}
      {activeTab === "permissions" && <PermissionsTab conns={conns} />}

      {/* Sync log tab */}
      {activeTab === "sync-log" && <SyncLogTab />}
    </div>
  );
}
