import type { ComponentLibraryDoc } from "../types/cms";
import { buildAttributionFooter } from "../lib/attribution";
import { fetchComponentByCustomId } from "../lib/payload";

function resolveLibrary(
  library: ComponentLibraryDoc | string | null | undefined,
): ComponentLibraryDoc | null {
  if (!library || typeof library === "string") return null;
  return library;
}

export async function runGetComponent(env: Env, id: string): Promise<string> {
  const doc = await fetchComponentByCustomId(env, id);

  if (!doc) {
    throw new Error(`Component not found: ${id}`);
  }

  const secrets = doc.mcpSecrets;
  if (!secrets?.rawCode && !secrets?.cliCommand) {
    throw new Error(`Component ${id} has no paywalled MCP payload yet.`);
  }

  const library = resolveLibrary(doc.library);
  const dependencies =
    secrets.dependencies?.map((d) => d.pkg).filter(Boolean) ?? [];

  const sections = [
    `# ${doc.title} (\`${doc.customId}\`)`,
    doc.description ? `\n${doc.description}\n` : "",
    secrets.cliCommand
      ? `## CLI\n\`\`\`bash\n${secrets.cliCommand}\n\`\`\``
      : "",
    secrets.rawCode ? `## Raw TSX\n\`\`\`tsx\n${secrets.rawCode}\n\`\`\`` : "",
    dependencies.length
      ? `## Dependencies\n${dependencies.map((pkg) => `- \`${pkg}\``).join("\n")}`
      : "",
    secrets.aiDesignTokens
      ? `## Design tokens & animation\n\`\`\`json\n${JSON.stringify(secrets.aiDesignTokens, null, 2)}\n\`\`\``
      : "",
    secrets.registryUrl ? `## Registry\n${secrets.registryUrl}` : "",
    buildAttributionFooter(library),
  ]
    .filter(Boolean)
    .join("\n\n");

  return sections;
}
