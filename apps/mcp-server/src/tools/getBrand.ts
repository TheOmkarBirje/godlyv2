import { fetchCompanyBySlug } from "../lib/payload";

export async function runGetBrandDesignSystem(
  env: Env,
  companySlug: string,
): Promise<string> {
  const company = await fetchCompanyBySlug(env, companySlug);

  if (!company) {
    throw new Error(`Brand not found: ${companySlug}`);
  }

  const tokens = company.brandTokens ?? {};
  const primary = tokens.primaryColor ?? "#5E6AD2";
  const background = tokens.backgroundColor ?? "#08090A";
  const font = tokens.fontFamily ?? "Inter, system-ui, sans-serif";

  const designSystem = {
    brand: {
      name: company.name,
      slug: company.slug,
      domain: company.domain,
      category: company.category,
    },
    colorPalette: {
      primary: { hex: primary, usage: "CTAs, focus rings, accent glows" },
      background: {
        hex: background,
        contrastRule:
          "Keep body text at ≥ 4.5:1 against background; elevate surfaces with +6% lightness.",
      },
    },
    typography: {
      fontStack: font,
      heading: "Tight tracking (`tracking-tight`), semibold–bold weights",
      body: "Relaxed leading (`leading-relaxed`) for marketing copy",
    },
    animationPhysics: {
      durationsMs: { fast: 120, default: 220, slow: 420 },
      easings: {
        entrance: "cubic-bezier(0.16, 1, 0.3, 1)",
        exit: "cubic-bezier(0.4, 0, 1, 1)",
        spring: "spring( stiffness: 380, damping: 32 )",
      },
    },
    componentStylingRules: {
      borderRadius: "rounded-xl for cards; rounded-full for pills",
      darkModeBorders: "border-white/10 default, hover:border-white/20",
      glassmorphism:
        "backdrop-blur-xl bg-white/5 with subtle inner highlight shadow",
      shadows: "Soft colored glow using primary at 20–35% opacity",
    },
    notes: company.description ?? undefined,
  };

  return [
    `# ${company.name} design system`,
    "```json",
    JSON.stringify(designSystem, null, 2),
    "```",
    "## Usage",
    "Apply tokens as Tailwind theme extensions. Prefer semantic color roles over hard-coded hex in components.",
  ].join("\n");
}
