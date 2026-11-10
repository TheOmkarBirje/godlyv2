import type {
  CompanyDoc,
  ComponentDoc,
  PayloadList,
  SectionDoc,
} from "../types/cms";

function cmsBaseUrl(env: Env): string {
  return (env.PAYLOAD_CMS_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

function internalHeaders(env: Env): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-mcp-internal-key": env.INTERNAL_MCP_SECRET ?? "",
  };
}

async function fetchPayloadList<T>(
  env: Env,
  path: string,
): Promise<T | null> {
  const url = `${cmsBaseUrl(env)}${path}`;
  const response = await fetch(url, { headers: internalHeaders(env) });

  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Payload CMS error ${response.status} for ${path}`);
  }

  return (await response.json()) as T;
}

export async function fetchComponentByCustomId(
  env: Env,
  id: string,
): Promise<ComponentDoc | null> {
  const params = new URLSearchParams({
    "where[customId][equals]": id,
    depth: "2",
    limit: "1",
  });

  const result = await fetchPayloadList<PayloadList<ComponentDoc>>(
    env,
    `/api/components?${params.toString()}`,
  );

  return result?.docs[0] ?? null;
}

export async function fetchSectionByCustomId(
  env: Env,
  id: string,
): Promise<SectionDoc | null> {
  const params = new URLSearchParams({
    "where[customId][equals]": id,
    depth: "1",
    limit: "1",
  });

  const result = await fetchPayloadList<PayloadList<SectionDoc>>(
    env,
    `/api/sections?${params.toString()}`,
  );

  return result?.docs[0] ?? null;
}

export async function fetchCompanyBySlug(
  env: Env,
  companySlug: string,
): Promise<CompanyDoc | null> {
  const params = new URLSearchParams({
    "where[slug][equals]": companySlug,
    depth: "0",
    limit: "1",
  });

  const result = await fetchPayloadList<PayloadList<CompanyDoc>>(
    env,
    `/api/companies?${params.toString()}`,
  );

  return result?.docs[0] ?? null;
}
