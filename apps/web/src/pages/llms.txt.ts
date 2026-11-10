import type { APIRoute } from "astro";
import { SITE_URL } from "astro:env/server";
import {
  getCompanies,
  getMarketingAssets,
  getPages,
  getPublishedComponents,
  getSections,
} from "../lib/cms";

export const GET: APIRoute = async () => {
  const [companies, pages, sections, marketing, components] = await Promise.all([
    getCompanies(),
    getPages(),
    getSections(),
    getMarketingAssets(),
    getPublishedComponents(),
  ]);

  const lines: string[] = [
    "# Godly.Design",
    "",
    `> ${SITE_URL} — Visual inspiration platform and MCP component registry.`,
    "",
    "## Public routes",
    `- Home: ${SITE_URL}/`,
    `- Marketing feed: ${SITE_URL}/marketing`,
    `- Component registry: ${SITE_URL}/components`,
    "",
    "## Brands",
    ...companies.map(
      (company) =>
        `- [${company.name}](${SITE_URL}/brands/${company.slug}) (${company.domain ?? "brand"})`,
    ),
    "",
    "## Full pages",
    ...pages.map((page) => {
      const company =
        typeof page.company === "object" ? page.company?.name : "Brand";
      return `- ${page.title} (${company}) — ${page.pageType ?? "Page"}`;
    }),
    "",
    "## Sections (prompt IDs)",
    ...sections.map(
      (section) =>
        `- ${section.title} — \`Use @godly to build #${section.customId}\``,
    ),
    "",
    "## Components (prompt IDs)",
    ...components.map(
      (component) =>
        `- ${component.title} — \`Use @godly to build component #${component.customId}\``,
    ),
    "",
    "## Marketing assets",
    ...marketing.map(
      (asset) => `- ${asset.title} (${asset.assetType ?? "Asset"})`,
    ),
    "",
    "## MCP Server",
    "- Endpoint: https://api.godly.design/mcp",
    "- Auth: Authorization: Bearer <api_key>",
    "- Tools: get_component, get_section_inspiration, get_brand_design_system",
    "",
    "No paywalled code, registry URLs, or MCP secrets are exposed on this site.",
  ];

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=300",
    },
  });
};
