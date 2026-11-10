import { PAYLOAD_CMS_URL } from "astro:env/server";
import type {
  Company,
  ComponentDoc,
  MarketingAsset,
  PageDoc,
  PayloadList,
  SectionDoc,
} from "../types/content";

function cmsUrl(): string {
  return PAYLOAD_CMS_URL.replace(/\/$/, "");
}

async function fetchList<T>(
  collection: string,
  params: Record<string, string>,
): Promise<T[]> {
  const search = new URLSearchParams({
    depth: "1",
    limit: "100",
    ...params,
  });

  try {
    const response = await fetch(
      `${cmsUrl()}/api/${collection}?${search.toString()}`,
      { headers: { Accept: "application/json" } },
    );

    if (!response.ok) {
      console.error(
        `[godly/web] CMS ${collection} failed: ${response.status} ${response.statusText}`,
      );
      return [];
    }

    const data = (await response.json()) as PayloadList<T>;
    return data.docs ?? [];
  } catch (error) {
    console.error(`[godly/web] CMS ${collection} unreachable:`, error);
    return [];
  }
}

export async function getCompanies(): Promise<Company[]> {
  return fetchList<Company>("companies", { sort: "name" });
}

export async function getCompanyBySlug(slug: string): Promise<Company | null> {
  const docs = await fetchList<Company>("companies", {
    "where[slug][equals]": slug,
    limit: "1",
  });
  return docs[0] ?? null;
}

export async function getPages(companyId?: string): Promise<PageDoc[]> {
  const params: Record<string, string> = { sort: "-capturedDate" };
  if (companyId) params["where[company][equals]"] = companyId;
  return fetchList<PageDoc>("pages", params);
}

export async function getSections(companyId?: string): Promise<SectionDoc[]> {
  const params: Record<string, string> = { sort: "-createdAt" };
  if (companyId) params["where[company][equals]"] = companyId;
  return fetchList<SectionDoc>("sections", params);
}

export async function getMarketingAssets(
  companyId?: string,
): Promise<MarketingAsset[]> {
  const params: Record<string, string> = { sort: "-publishedDate" };
  if (companyId) params["where[company][equals]"] = companyId;
  return fetchList<MarketingAsset>("marketing-assets", params);
}

export async function getPublishedComponents(): Promise<ComponentDoc[]> {
  return fetchList<ComponentDoc>("components", {
    sort: "-createdAt",
    "where[_status][equals]": "published",
  });
}
