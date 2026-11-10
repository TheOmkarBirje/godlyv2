import { config as loadDotenv } from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const packageDir = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(packageDir, "../../../.env") });
loadDotenv();

export function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getR2PublicBaseUrl(): string {
  return (process.env.R2_PUBLIC_DOMAIN ?? "https://teststorage.godly.design").replace(
    /\/$/,
    "",
  );
}

export function getGeminiVisionModel(): string {
  return process.env.GEMINI_VISION_MODEL ?? "gemini-2.5-flash";
}

export function getGeminiEmbeddingModel(): string {
  return process.env.GEMINI_EMBEDDING_MODEL ?? "gemini-embedding-001";
}
