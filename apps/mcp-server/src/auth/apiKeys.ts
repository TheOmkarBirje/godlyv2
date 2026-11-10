import { hashApiKey } from "./quota";

export type ApiKeyRecord = {
  tier: "free" | "pro";
  active: boolean;
  label?: string;
};

export class InvalidApiKeyError extends Error {
  constructor() {
    super("Invalid or inactive API key");
    this.name = "InvalidApiKeyError";
  }
}

function parseRecord(raw: string): ApiKeyRecord | null {
  try {
    const record = JSON.parse(raw) as ApiKeyRecord;
    if (!record?.active) return null;
    if (record.tier !== "pro" && record.tier !== "free") {
      return { ...record, tier: "free" };
    }
    return record;
  } catch {
    return null;
  }
}

/** Validates Bearer token against KV `apikey:{sha256}` records. */
export async function assertValidApiKey(
  env: Env,
  token: string,
): Promise<ApiKeyRecord> {
  const hash = await hashApiKey(token);
  const raw = await env.KV.get(`apikey:${hash}`);

  if (raw) {
    const record = parseRecord(raw);
    if (record) return record;
  }

  if (env.GODLY_DEV_API_KEY && token === env.GODLY_DEV_API_KEY) {
    return { tier: "pro", active: true, label: "dev-bypass" };
  }

  throw new InvalidApiKeyError();
}

export async function syncTierFromApiKey(
  env: Env,
  token: string,
  record: ApiKeyRecord,
): Promise<void> {
  const hash = await hashApiKey(token);
  const existing = await env.KV.get(`tier:${hash}`);
  if (existing === record.tier) return;
  await env.KV.put(`tier:${hash}`, record.tier, {
    expirationTtl: 60 * 60 * 24 * 400,
  });
}
