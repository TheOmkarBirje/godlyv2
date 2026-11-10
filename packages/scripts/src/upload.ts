import { readFile } from "node:fs/promises";
import path from "node:path";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { getR2PublicBaseUrl, requireEnv } from "./config/env";
import type { GeminiIngestionResult, IngestionInput } from "./types/ingest";

type PayloadList<T> = { docs: T[] };

function createR2Client(): S3Client {
  const accountId = requireEnv("CLOUDFLARE_R2_ACCOUNT_ID");

  return new S3Client({
    credentials: {
      accessKeyId: requireEnv("CLOUDFLARE_R2_ACCESS_KEY_ID"),
      secretAccessKey: requireEnv("CLOUDFLARE_R2_SECRET_ACCESS_KEY"),
    },
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    forcePathStyle: true,
  });
}

function cmsBaseUrl(): string {
  return (process.env.PAYLOAD_CMS_URL ?? "http://localhost:3000").replace(
    /\/$/,
    "",
  );
}

function internalHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    "x-mcp-internal-key": requireEnv("INTERNAL_MCP_SECRET"),
    "x-admin-internal-key": requireEnv("INTERNAL_ADMIN_SECRET"),
  };
}

export async function uploadComponentAssets(input: {
  customId: string;
  previewWebmPath: string;
  posterWebpPath: string;
}): Promise<{ videoUrl: string; posterUrl: string }> {
  const bucket = process.env.R2_BUCKET_NAME ?? "godly-design";
  const client = createR2Client();
  const baseKey = `components/${input.customId}`;

  const previewKey = `${baseKey}/preview.webm`;
  const posterKey = `${baseKey}/poster.webp`;

  const [previewBody, posterBody] = await Promise.all([
    readFile(input.previewWebmPath),
    readFile(input.posterWebpPath),
  ]);

  await Promise.all([
    client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: previewKey,
        Body: previewBody,
        ContentType: "video/webm",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    ),
    client.send(
      new PutObjectCommand({
        Bucket: bucket,
        Key: posterKey,
        Body: posterBody,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      }),
    ),
  ]);

  const cdn = getR2PublicBaseUrl();
  return {
    videoUrl: `${cdn}/${previewKey}`,
    posterUrl: `${cdn}/${posterKey}`,
  };
}

async function resolveLibraryId(librarySlug: string): Promise<string> {
  const params = new URLSearchParams({
    "where[slug][equals]": librarySlug,
    limit: "1",
  });

  const response = await fetch(
    `${cmsBaseUrl()}/api/component-libraries?${params.toString()}`,
    { headers: internalHeaders() },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to resolve ComponentLibrary "${librarySlug}" (${response.status})`,
    );
  }

  const data = (await response.json()) as PayloadList<{ id: string }>;
  const libraryId = data.docs[0]?.id;
  if (!libraryId) {
    throw new Error(`Component library not found for slug: ${librarySlug}`);
  }

  return libraryId;
}

export async function createComponentDraft(input: {
  customId: string;
  gemini: GeminiIngestionResult;
  embedding: number[];
  videoUrl: string;
  posterUrl: string;
  ingest: IngestionInput;
}): Promise<{ id: string }> {
  const libraryId = await resolveLibraryId(input.ingest.librarySlug);

  const registryUrl =
    input.ingest.registryJsonUrl ?? input.ingest.registryUrl ?? "";

  const cliCommand =
    input.ingest.cliCommand ??
    (registryUrl
      ? `npx shadcn@latest add ${registryUrl}`
      : `npx shadcn@latest add https://registry.godly.design/r/${input.customId}.json`);

  const body = {
    _status: "draft",
    customId: input.customId,
    title: input.gemini.title,
    description: input.gemini.description,
    category: input.gemini.category,
    library: libraryId,
    videoUrl: input.videoUrl,
    posterUrl: input.posterUrl,
    tags: input.gemini.tags.map((tag) => ({ tag })),
    mcpSecrets: {
      registryUrl,
      cliCommand,
      rawCode: input.ingest.rawCode,
      dependencies: input.gemini.dependencies.map((pkg) => ({ pkg })),
      aiDesignTokens: input.gemini.aiDesignTokens,
      embedding: input.embedding.map((val) => ({ val })),
    },
  };

  const response = await fetch(`${cmsBaseUrl()}/api/components?draft=true`, {
    method: "POST",
    headers: internalHeaders(),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Payload draft create failed (${response.status}): ${errorBody}`,
    );
  }

  const doc = (await response.json()) as { doc: { id: string } };
  return { id: doc.doc.id };
}

export function createRunOutputDir(customId: string): string {
  return path.resolve(process.cwd(), "tmp", "ingest", customId);
}
