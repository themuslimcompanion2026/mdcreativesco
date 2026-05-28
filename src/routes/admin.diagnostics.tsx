import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { GlassCard } from "@/components/ui-premium/GlassCard";

export const Route = createFileRoute("/admin/diagnostics")({
  head: () => ({
    meta: [
      { title: "Diagnostics — Admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: DiagnosticsPage,
});

type CheckResult = {
  label: string;
  path: string;
  status?: number;
  contentType?: string;
  durationMs?: number;
  ok?: boolean;
  error?: string;
};

const CHECKS: Array<{ label: string; path: string; method?: string }> = [
  { label: "Homepage (SSR)", path: "/" },
  { label: "About (SSR)", path: "/about" },
  { label: "Services (SSR)", path: "/services" },
  { label: "Portfolio (SSR)", path: "/portfolio" },
  { label: "Contact (SSR)", path: "/contact" },
  { label: "Health API", path: "/api/health" },
  { label: "Favicon (asset)", path: "/favicon.ico" },
];

function DiagnosticsPage() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState<CheckResult[]>([]);
  const [running, setRunning] = useState(false);
  const [health, setHealth] = useState<unknown>(null);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate({ to: "/" });
  }, [loading, user, isAdmin, navigate]);

  async function runChecks() {
    setRunning(true);
    const out: CheckResult[] = [];
    for (const c of CHECKS) {
      const startedAt = performance.now();
      try {
        const res = await fetch(c.path, { method: c.method ?? "GET", cache: "no-store" });
        out.push({
          label: c.label,
          path: c.path,
          status: res.status,
          contentType: res.headers.get("content-type") ?? "",
          durationMs: Math.round(performance.now() - startedAt),
          ok: res.status >= 200 && res.status < 400,
        });
      } catch (err) {
        out.push({
          label: c.label,
          path: c.path,
          ok: false,
          error: err instanceof Error ? err.message : String(err),
          durationMs: Math.round(performance.now() - startedAt),
        });
      }
      setResults([...out]);
    }
    try {
      const h = await fetch("/api/health", { cache: "no-store" });
      setHealth(await h.json());
    } catch (e) {
      setHealth({ error: e instanceof Error ? e.message : String(e) });
    }
    setRunning(false);
  }

  if (loading || !user || !isAdmin) return null;

  return (
    <div className="mx-auto max-w-4xl px-6 py-12">
      <h1 className="text-3xl font-bold">Deployment Diagnostics</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Verifies SSR routes, API endpoints, asset availability, and worker health.
      </p>
      <button
        onClick={runChecks}
        disabled={running}
        className="mt-6 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground disabled:opacity-50"
      >
        {running ? "Running…" : "Run checks"}
      </button>

      <GlassCard className="mt-6 p-6">
        <h2 className="text-lg font-semibold">Route checks</h2>
        <div className="mt-4 space-y-2 text-sm">
          {results.length === 0 && <p className="text-muted-foreground">No results yet.</p>}
          {results.map((r) => (
            <div key={r.path} className="flex items-center justify-between border-b border-white/5 py-2">
              <div>
                <span className={r.ok ? "text-emerald-400" : "text-red-400"}>●</span>{" "}
                <span className="font-medium">{r.label}</span>{" "}
                <span className="text-muted-foreground">{r.path}</span>
              </div>
              <div className="text-muted-foreground">
                {r.status ?? "—"} · {r.contentType?.split(";")[0] ?? "—"} · {r.durationMs ?? "—"}ms
                {r.error ? ` · ${r.error}` : ""}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="mt-6 p-6">
        <h2 className="text-lg font-semibold">Worker health</h2>
        <pre className="mt-4 overflow-x-auto rounded bg-black/40 p-4 text-xs">
          {health ? JSON.stringify(health, null, 2) : "Run checks to load /api/health."}
        </pre>
      </GlassCard>
    </div>
  );
}
