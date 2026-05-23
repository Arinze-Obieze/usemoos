const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export function buildApiUrl(path: string): string {
  return `${API_BASE}/api${path}`;
}

export async function apiFetch(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<Response> {
  return fetch(buildApiUrl(path), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers as Record<string, string> | undefined),
    },
  });
}

export async function apiJson<T>(
  path: string,
  token: string,
  options?: RequestInit,
): Promise<T> {
  const res = await apiFetch(path, token, options);
  if (!res.ok) {
    const text = await res.text().catch(() => "Unknown error");
    throw new Error(`API ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

// Maps IntegrationType values to SrcIcon keys used in workspaceData
export function integrationTypeToSrcKey(type: string): string {
  const overrides: Record<string, string> = {
    google_drive: "drive",
    microsoft_teams: "teams",
  };
  return overrides[type] ?? type;
}

export function formatRelativeTime(iso: string | null): string {
  if (!iso) return "never";
  const diffMs = Date.now() - new Date(iso).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hr ago`;
  return `${Math.floor(diffHr / 24)} days ago`;
}
