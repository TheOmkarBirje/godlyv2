export type ComponentCategory =
  | "Navigation"
  | "Pricing"
  | "Cards"
  | "Modals"
  | "Drawers"
  | "Inputs"
  | "Buttons";

export type GeminiIngestionResult = {
  title: string;
  description: string;
  category: ComponentCategory;
  tags: string[];
  aiDesignTokens: Record<string, unknown>;
  dependencies: string[];
};

export type IngestionInput = {
  registryUrl: string;
  librarySlug: string;
  codeFilePath: string;
  rawCode?: string;
  registryJsonUrl?: string;
  cliCommand?: string;
  customId?: string;
  recordDurationMs?: number;
};

export type IngestionArtifacts = {
  customId: string;
  rawVideoPath: string;
  previewWebmPath: string;
  posterWebpPath: string;
  gemini: GeminiIngestionResult;
  embedding: number[];
  videoUrl: string;
  posterUrl: string;
};
