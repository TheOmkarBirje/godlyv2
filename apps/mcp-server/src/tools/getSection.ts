import { fetchSectionByCustomId } from "../lib/payload";

function buildImplementationGuide(
  sectionType: string | null | undefined,
  title: string,
): string {
  const type = sectionType ?? "Section";

  return [
    "## Implementation guide",
    `Replicate **${title}** as a **${type}** section:`,
    "1. Mirror the vertical rhythm and max-width container from the keyframes (typically `max-w-6xl mx-auto px-6`).",
    "2. Map `aiDesignTokens` Tailwind classes literally before introducing custom CSS.",
    "3. Honor spring / easing curves from tokens for hover and entrance motion.",
    "4. Preserve dark-mode border opacity and glass/blur cues visible in frames 2–4.",
    "5. Ship a muted, loop-ready preview clip on the marketing site only — never expose raw source publicly.",
  ].join("\n");
}

export async function runGetSectionInspiration(
  env: Env,
  id: string,
): Promise<string> {
  const doc = await fetchSectionByCustomId(env, id);

  if (!doc) {
    throw new Error(`Section not found: ${id}`);
  }

  const secrets = doc.mcpSecrets;
  const keyframes =
    secrets?.keyframeUrls?.map((k) => k.url).filter(Boolean) ?? [];

  if (keyframes.length === 0 && !secrets?.aiDesignTokens) {
    throw new Error(`Section ${id} has no MCP inspiration payload yet.`);
  }

  const sections = [
    `# ${doc.title} (\`${doc.customId}\`)`,
    doc.sectionType ? `**Section type:** ${doc.sectionType}` : "",
    doc.videoUrl ? `**Public preview loop:** ${doc.videoUrl}` : "",
    keyframes.length
      ? `## Keyframes (4–6 WebP)\n${keyframes.map((url, i) => `${i + 1}. ${url}`).join("\n")}`
      : "",
    secrets?.aiDesignTokens
      ? `## Design tokens (Tailwind, springs, typography)\n\`\`\`json\n${JSON.stringify(secrets.aiDesignTokens, null, 2)}\n\`\`\``
      : "",
    buildImplementationGuide(doc.sectionType, doc.title),
    secrets?.rawCode
      ? `## Reference snippet (optional)\n\`\`\`tsx\n${secrets.rawCode}\n\`\`\``
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  return sections;
}
