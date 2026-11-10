const ADJECTIVES = [
  "minimalist",
  "glowing",
  "polished",
  "soft",
  "bold",
  "compact",
] as const;

export function slugifyToken(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 32);
}

export function generateCustomId(seed: string): string {
  const base = slugifyToken(seed) || "component";
  const suffix = Math.random().toString(36).slice(2, 6);
  return `cmp_${base}_${suffix}`;
}

export function pickAdjective(): string {
  const index = Math.floor(Math.random() * ADJECTIVES.length);
  return ADJECTIVES[index] ?? "minimalist";
}
