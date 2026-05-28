import { createFileRoute } from "@tanstack/react-router";
import {
  getBuildTimestamp,
  getDeploymentVersion,
  getEnvironmentDiagnostics,
  getRuntimeEnvironment,
} from "@/lib/deployment";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        const env = getEnvironmentDiagnostics();
        const missing = env.filter((e) => !e.configured).map((e) => e.name);
        const body = {
          status: missing.length === 0 ? "ok" : "degraded",
          workerAttached: true,
          middlewareLoaded: true,
          runtime: getRuntimeEnvironment(),
          deploymentVersion: getDeploymentVersion(),
          buildTimestamp: getBuildTimestamp(),
          timestamp: new Date().toISOString(),
          env: env.map(({ name, configured }) => ({ name, configured })),
          missing,
        };
        return new Response(JSON.stringify(body, null, 2), {
          status: missing.length === 0 ? 200 : 503,
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "no-store",
          },
        });
      },
    },
  },
});
