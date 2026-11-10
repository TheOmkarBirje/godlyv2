import { assertValidApiKey, syncTierFromApiKey } from "./auth/apiKeys";
import { parseBearerToken } from "./auth/bearer";
import { unauthorizedResponse } from "./auth/quota";
import { handleMcpOptions, handleMcpRequest } from "./mcp/handler";

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS" && url.pathname.startsWith("/mcp")) {
      return handleMcpOptions(request, env);
    }

    if (url.pathname === "/health") {
      return Response.json({ status: "ok", service: "godly-mcp", env: "test" });
    }

    if (url.pathname === "/mcp" || url.pathname === "/mcp/") {
      const apiKey = parseBearerToken(request);
      if (!apiKey) return unauthorizedResponse();

      try {
        const keyRecord = await assertValidApiKey(env, apiKey);
        await syncTierFromApiKey(env, apiKey, keyRecord);
      } catch {
        return unauthorizedResponse();
      }

      return handleMcpRequest(request, env, apiKey);
    }

    return Response.json(
      {
        error: "not_found",
        message: "Godly.Design MCP is available at /mcp (Streamable HTTP + SSE).",
      },
      { status: 404 },
    );
  },
};
