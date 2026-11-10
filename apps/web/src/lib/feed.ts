import type {
  Company,
  ComponentDoc,
  FeedFilter,
  FeedItem,
  MarketingAsset,
  PageDoc,
  SectionDoc,
} from "../types/content";

function resolveCompanyName(company: Company | string | undefined): string {
  if (!company) return "";
  return typeof company === "string" ? "" : company.name;
}

export function pageToFeedItem(page: PageDoc): FeedItem | null {
  const company =
    typeof page.company === "object" ? page.company : undefined;
  if (!company?.slug) return null;

  return {
    key: `page-${page.id}`,
    filter: "brands",
    title: page.title,
    subtitle: company.name,
    href: `/brands/${company.slug}`,
    videoUrl: page.fullPageVideoUrl,
    posterUrl: page.fullPagePosterUrl,
    promptText: `Use @godly to explore full page walkthrough for ${company.slug}`,
  };
}

export function sectionToFeedItem(section: SectionDoc): FeedItem {
  const companyName = resolveCompanyName(
    typeof section.company === "object" ? section.company : undefined,
  );

  return {
    key: `section-${section.id}`,
    filter: "sections",
    title: section.title,
    subtitle: companyName || section.sectionType || undefined,
    href: companyName
      ? `/brands/${typeof section.company === "object" ? section.company.slug : ""}`
      : "/",
    videoUrl: section.videoUrl,
    posterUrl: section.posterUrl,
    promptText: `Use @godly to build #${section.customId}`,
  };
}

export function marketingToFeedItem(asset: MarketingAsset): FeedItem {
  return {
    key: `marketing-${asset.id}`,
    filter: "marketing",
    title: asset.title,
    subtitle: asset.assetType ?? undefined,
    href: "/marketing",
    imageUrl: asset.mediaUrl,
    posterUrl: asset.thumbnailUrl ?? asset.mediaUrl,
  };
}

export function companyToFeedItem(company: Company): FeedItem {
  return {
    key: `brand-${company.id}`,
    filter: "brands",
    title: company.name,
    subtitle: company.domain,
    href: `/brands/${company.slug}`,
    imageUrl: company.logoUrl,
    posterUrl: company.logoUrl,
    promptText: `Use @godly to match design system #${company.slug}`,
  };
}

export function componentToFeedItem(component: ComponentDoc): FeedItem {
  const library =
    component.library && typeof component.library === "object"
      ? component.library
      : null;

  return {
    key: `component-${component.id}`,
    filter: "components",
    title: component.title,
    subtitle: component.category ?? undefined,
    href: "/components",
    videoUrl: component.videoUrl,
    posterUrl: component.posterUrl,
    promptText: `Use @godly to build component #${component.customId}`,
    library,
  };
}

export function buildUnifiedFeed(input: {
  companies: Company[];
  pages: PageDoc[];
  sections: SectionDoc[];
  marketing: MarketingAsset[];
  components: ComponentDoc[];
}): FeedItem[] {
  const fromPages = input.pages
    .map(pageToFeedItem)
    .filter((item): item is FeedItem => Boolean(item));
  const fromSections = input.sections.map(sectionToFeedItem);
  const fromMarketing = input.marketing.map(marketingToFeedItem);
  const fromCompanies = input.companies.map(companyToFeedItem);
  const fromComponents = input.components.map(componentToFeedItem);

  return [
    ...fromSections,
    ...fromPages,
    ...fromMarketing,
    ...fromCompanies,
    ...fromComponents,
  ];
}

export function filterFeed(items: FeedItem[], filter: FeedFilter): FeedItem[] {
  if (filter === "all") return items;
  return items.filter((item) => item.filter === filter);
}
