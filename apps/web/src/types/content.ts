export type ComponentLibraryRef = {
  name: string;
  logoUrl?: string | null;
};

export type Company = {
  id: string;
  name: string;
  slug: string;
  domain?: string;
  description?: string | null;
  logoUrl?: string;
  category?: string | null;
};

export type PageDoc = {
  id: string;
  title: string;
  slug: string;
  pageType?: string | null;
  fullPageVideoUrl?: string;
  fullPagePosterUrl?: string;
  company?: Company | string;
};

export type SectionDoc = {
  id: string;
  customId: string;
  title: string;
  sectionType?: string | null;
  videoUrl?: string;
  posterUrl?: string;
  company?: Company | string;
};

export type MarketingAsset = {
  id: string;
  title: string;
  assetType?: string | null;
  mediaUrl?: string;
  thumbnailUrl?: string;
  company?: Company | string;
};

export type ComponentDoc = {
  id: string;
  customId: string;
  title: string;
  description?: string;
  category?: string | null;
  videoUrl?: string;
  posterUrl?: string;
  library?: ComponentLibraryRef | string | null;
};

export type FeedFilter = "all" | "sections" | "brands" | "marketing" | "components";

export type FeedItem = {
  key: string;
  filter: Exclude<FeedFilter, "all">;
  title: string;
  subtitle?: string;
  href: string;
  videoUrl?: string;
  posterUrl?: string;
  imageUrl?: string;
  promptText?: string;
  library?: ComponentLibraryRef | null;
};

export type PayloadList<T> = {
  docs: T[];
  totalDocs: number;
};
