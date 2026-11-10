import type { ComponentLibraryDoc } from "../types/cms";

export function buildAttributionFooter(
  library: ComponentLibraryDoc | null | undefined,
): string {
  if (!library?.name) {
    return "";
  }

  const license = library.license ?? "MIT";
  const github = library.githubUrl
    ? `• Give them a star on GitHub: ${library.githubUrl}`
    : "";
  const affiliate = library.affiliateUrl
    ? `• Need their complete 500+ component design system & Figma UI Kit?\n  👉 Check out ${library.name} Pro: ${library.affiliateUrl}`
    : "";

  return [
    "---",
    "⭐ **Attribution & Pro Upsell:**",
    `Component crafted by **${library.name}** (${license} License).`,
    github,
    affiliate,
  ]
    .filter(Boolean)
    .join("\n");
}
