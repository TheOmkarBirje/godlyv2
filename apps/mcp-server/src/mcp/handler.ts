import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";

import {
  extractToolsCallFromRequest,
  getQuotaSnapshot,
  paymentRequiredResponse,
} from "../auth/quota";
import { createGodlyMcpServer } from "./createServer";

function parseAllowedOrigins(env: Env): string[] {
  const raw = env.MCP_ALLOWED_ORIGINS ?? "";
  return raw
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function corsHeadersForRequest(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get("Origin");
  const allowed = parseAllowedOrigins(env);

  const base: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, MCP-Protocol-Version, Mcp-Session-Id, Last-Event-ID",
    "Access-Control-Expose-Headers": "Mcp-Session-Id",
  };

  if (!origin) {
    return base;
  }

  if (allowed.length === 0 || allowed.includes(origin) || allowed.includes("*")) {
    return { ...base, "Access-Control-Allow-Origin": origin, Vary: "Origin" };
  }

  return base;
}

function withCors(request: Request, env: Env, response: Response): Response {
  const headers = new Headers(response.headers);
  for (const [key, value] of Object.entries(corsHeadersForRequest(request, env))) {
    headers.set(key, value);
  }
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

async function maybeBlockQuota(
  request: Request,
  env: Env,
  apiKey: string,
): Promise<Response | null> {
  const isToolsCall = await extractToolsCallFromRequest(request);
  if (!isToolsCall) return null;

  const snapshot = await getQuotaSnapshot(env, apiKey);
  if (snapshot.remaining > 0) return null;

  return paymentRequiredResponse(env, snapshot);
}

/**
 * Stateless Streamable HTTP (Workers-safe). GET opens SSE; POST carries JSON-RPC.
 */
export async function handleMcpRequest(
  request: Request,
  env: Env,
  apiKey: string,
): Promise<Response> {
  const blocked = await maybeBlockQuota(request, env, apiKey);
  if (blocked) return withCors(request, env, blocked);

  const server = await createGodlyMcpServer(env, apiKey);
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });

  await server.connect(transport);
  const response = await transport.handleRequest(request);
  return withCors(request, env, response);
}

export function handleMcpOptions(request: Request, env: Env): Response {
  return new Response(null, {
    status: 204,
    headers: corsHeadersForRequest(request, env),
  });
}
