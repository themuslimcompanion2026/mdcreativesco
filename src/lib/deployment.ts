export function getDeploymentVersion() {
  return (
    process.env.CF_PAGES_COMMIT_SHA ||
    process.env.CF_VERSION_METADATA ||
    process.env.CF_PAGES_URL ||
    "dev"
  );
}

export function getBuildTimestamp() {
  return process.env.BUILD_TIMESTAMP || new Date().toISOString();
}

export function getRuntimeEnvironment() {
  if (process.env.CF_PAGES === "1") return "cloudflare-pages";
  if (process.env.CF_WORKER === "1") return "cloudflare-worker";
  return "local";
}

export function getEnvironmentDiagnostics() {
  const required = [
    "VITE_SUPABASE_URL",
    "VITE_SUPABASE_PUBLISHABLE_KEY",
    "VITE_SUPABASE_PROJECT_ID",
    "SUPABASE_URL",
    "SUPABASE_PUBLISHABLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "WISE_WEBHOOK_PUBLIC_KEY",
  ] as const;

  return required.map((name) => ({ name, configured: Boolean(process.env[name]) }));
}

export function toErrorDetails(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };
  }

  return { message: String(error) };
}