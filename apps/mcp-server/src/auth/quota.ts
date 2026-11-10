export const FREE_DAILY_LIMIT = 5;
export const PRO_DAILY_LIMIT = 500;

export type QuotaTier = "free" | "pro";

export type QuotaSnapshot = {
  tier: QuotaTier;
  limit: number;
  used: number;
  remaining: number;
  resetDate: string;
};

const MAX_QUOTA_RETRIES = 6;

function utcDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export async function hashApiKey(token: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(token),
  );
  return [...new Uint8Array(digest)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getTier(env: Env, keyHash: string): Promise<QuotaTier> {
  const tier = await env.KV.get(`tier:${keyHash}`);
  return tier === "pro" ? "pro" : "free";
}

function limitForTier(tier: QuotaTier): number {
  return tier === "pro" ? PRO_DAILY_LIMIT : FREE_DAILY_LIMIT;
}

async function getUsageCount(
  env: Env,
  keyHash: string,
  dateKey: string,
): Promise<number> {
  const raw = await env.KV.get(`usage:${keyHash}:${dateKey}`);
  if (!raw) return 0;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : 0;
}

export async function getQuotaSnapshot(
  env: Env,
  apiKey: string,
): Promise<QuotaSnapshot> {
  const keyHash = await hashApiKey(apiKey);
  const resetDate = utcDateKey();
  const tier = await getTier(env, keyHash);
  const limit = limitForTier(tier);
  const used = await getUsageCount(env, keyHash, resetDate);

  return {
    tier,
    limit,
    used,
    remaining: Math.max(0, limit - used),
    resetDate,
  };
}

/** Returns false when the daily quota is exhausted (optimistic retry loop). */
export async function consumeQuota(env: Env, apiKey: string): Promise<boolean> {
  const keyHash = await hashApiKey(apiKey);
  const dateKey = utcDateKey();
  const tier = await getTier(env, keyHash);
  const limit = limitForTier(tier);
  const usageKey = `usage:${keyHash}:${dateKey}`;

  for (let attempt = 0; attempt < MAX_QUOTA_RETRIES; attempt += 1) {
    const used = await getUsageCount(env, keyHash, dateKey);
    if (used >= limit) return false;

    const next = used + 1;
    await env.KV.put(usageKey, String(next), {
      expirationTtl: 60 * 60 * 48,
    });

    const verify = await getUsageCount(env, keyHash, dateKey);
    if (verify === next) return true;
  }

  return false;
}

export function paymentRequiredResponse(
  env: Env,
  snapshot: QuotaSnapshot,
): Response {
  const checkout = env.GODLY_CHECKOUT_URL ?? "https://test.godly.design/pricing";

  return new Response(
    JSON.stringify({
      error: "quota_exceeded",
      message:
        "You've used today's Godly.Design MCP quota. Upgrade to Pro for 500 requests/day.",
      tier: snapshot.tier,
      limit: snapshot.limit,
      used: snapshot.used,
      resetDate: snapshot.resetDate,
      checkoutUrl: checkout,
    }),
    {
      status: 402,
      headers: {
        "Content-Type": "application/json",
        "X-Godly-Quota-Limit": String(snapshot.limit),
        "X-Godly-Quota-Used": String(snapshot.used),
        "X-Godly-Checkout-Url": checkout,
      },
    },
  );
}

export function unauthorizedResponse(message?: string): Response {
  return new Response(
    JSON.stringify({
      error: "unauthorized",
      message:
        message ??
        "Missing, invalid, or inactive API key. Use: Authorization: Bearer <your_api_key>",
    }),
    { status: 401, headers: { "Content-Type": "application/json" } },
  );
}

export async function extractToolsCallFromRequest(
  request: Request,
): Promise<boolean> {
  if (request.method !== "POST") return false;

  const contentType = request.headers.get("content-type") ?? "";
  let body: unknown = null;

  if (contentType.includes("application/json")) {
    body = await request.clone().json().catch(() => null);
  } else {
    const text = await request.clone().text().catch(() => "");
    if (text.trim().startsWith("{") || text.trim().startsWith("[")) {
      try {
        body = JSON.parse(text) as unknown;
      } catch {
        body = null;
      }
    }
  }

  return isToolsCallPayload(body);
}

export function isToolsCallPayload(body: unknown): boolean {
  if (!body || typeof body !== "object") return false;

  if (Array.isArray(body)) {
    return body.some((item) => isToolsCallPayload(item));
  }

  const record = body as Record<string, unknown>;
  return record.method === "tools/call";
}
