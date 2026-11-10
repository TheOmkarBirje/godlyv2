export type PayloadList<T> = {
  docs: T[];
  totalDocs: number;
};

export type BrandTokens = {
  primaryColor?: string | null;
  backgroundColor?: string | null;
  fontFamily?: string | null;
};

export type ComponentLibraryDoc = {
  name: string;
  slug?: string;
  githubUrl?: string | null;
  affiliateUrl?: string | null;
  license?: string | null;
};

export type ComponentMcpSecrets = {
  registryUrl?: string | null;
  cliCommand?: string | null;
  rawCode?: string | null;
  dependencies?: { pkg: string; id?: string }[] | null;
  aiDesignTokens?: Record<string, unknown> | null;
};

export type ComponentDoc = {
  id: string;
  customId: string;
  title: string;
  description?: string;
  library?: ComponentLibraryDoc | string | null;
  mcpSecrets?: ComponentMcpSecrets | null;
};

export type SectionMcpSecrets = {
  keyframeUrls?: { url: string; id?: string }[] | null;
  aiDesignTokens?: Record<string, unknown> | null;
  rawCode?: string | null;
};

export type SectionDoc = {
  id: string;
  customId: string;
  title: string;
  sectionType?: string | null;
  videoUrl?: string | null;
  mcpSecrets?: SectionMcpSecrets | null;
};

export type CompanyDoc = {
  id: string;
  name: string;
  slug: string;
  domain?: string | null;
  description?: string | null;
  brandTokens?: BrandTokens | null;
  category?: string | null;
};
