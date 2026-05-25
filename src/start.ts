import { createStart, createMiddleware } from "@tanstack/react-start";
import { attachSupabaseAuth } from "@/integrations/supabase/auth-attacher";

import { renderErrorPage } from "./lib/error-page";
import { getDeploymentVersion, getRuntimeEnvironment, toErrorDetails } from "./lib/deployment";

const errorMiddleware = createMiddleware().server(async ({ next }) => {
  try {
    return await next();
  } catch (error) {
    if (error != null && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    console.error(error);
    return new Response(renderErrorPage(), {
      status: 500,
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }
});

const requestLoggingMiddleware = createMiddleware().server(async ({ next, request }) => {
  const startedAt = Date.now();
  const url = new URL(request.url);
  const requestId = request.headers.get("cf-ray") ?? crypto.randomUUID();
  const routeType = url.pathname.startsWith("/api/") ? "api" : "ssr";
  const baseLog = {
    event: "request",
    requestId,
    timestamp: new Date().toISOString(),
    method: request.method,
    path: url.pathname,
    routeType,
    workerAttached: true,
    deploymentVersion: getDeploymentVersion(),
    runtime: getRuntimeEnvironment(),
  };

  try {
    const response = await next();
    if (response instanceof Response) {
      response.headers.set("x-request-id", requestId);
      response.headers.set("x-deployment-version", getDeploymentVersion());
      console.info(
        JSON.stringify({
          ...baseLog,
          status: response.status,
          contentType: response.headers.get("content-type") ?? "unknown",
          durationMs: Date.now() - startedAt,
          middlewareExecutionResult: "ok",
        }),
      );
    }
    return response;
  } catch (error) {
    console.error(
      JSON.stringify({
        ...baseLog,
        status: 500,
        durationMs: Date.now() - startedAt,
        middlewareExecutionResult: "error",
        error: toErrorDetails(error),
      }),
    );
    throw error;
  }
});

export const startInstance = createStart(() => ({
  requestMiddleware: [requestLoggingMiddleware, errorMiddleware],
  functionMiddleware: [attachSupabaseAuth],
}));
