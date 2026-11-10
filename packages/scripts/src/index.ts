import { mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import "./config/env.js";
import { processComponentVideo } from "./ffmpeg.js";
import { generateCustomId } from "./lib/ids.js";
import { recordComponentPreview } from "./record.js";
import {
  analyzeComponentWithGemini,
  generateComponentEmbedding,
} from "./tagger.js";
import {
  createComponentDraft,
  createRunOutputDir,
  uploadComponentAssets,
} from "./upload.js";
import type { IngestionInput } from "./types/ingest.js";

function printUsage(): void {
  console.log(`Usage:
  pnpm --filter @godly/scripts ingest -- \\
    --url <componentRegistryUrl> \\
    --library <componentLibrarySlug> \\
    --code <path/to/Component.tsx> \\
    [--registry-json <registryJsonUrl>] \\
    [--cli <shadcnCliCommand>] \\
    [--custom-id <cmp_id>] \\
    [--duration-ms <3000-6000>]
`);
}

function parseArgs(argv: string[]): IngestionInput | null {
  if (argv.length === 0 || argv.includes("--help")) {
    printUsage();
    return null;
  }

  const flags = new Map<string, string>();

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token?.startsWith("--")) continue;
    const key = token.slice(2);
    const value = argv[i + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }
    flags.set(key, value);
    i += 1;
  }

  const registryUrl = flags.get("url");
  const librarySlug = flags.get("library");
  const codePath = flags.get("code");

  if (!registryUrl || !librarySlug || !codePath) {
    printUsage();
    throw new Error("--url, --library, and --code are required.");
  }

  const duration = flags.get("duration-ms");
  const recordDurationMs = duration ? Number.parseInt(duration, 10) : 4500;

  return {
    registryUrl,
    librarySlug,
    codeFilePath: path.resolve(codePath),
    registryJsonUrl: flags.get("registry-json"),
    cliCommand: flags.get("cli"),
    customId: flags.get("custom-id"),
    recordDurationMs,
  };
}

/** Component ingestion CLI entry (Phase 2). */
export async function main(argv = process.argv.slice(2)): Promise<void> {
  const parsed = parseArgs(argv);
  if (!parsed) return;

  const customId = parsed.customId ?? generateCustomId(parsed.librarySlug);
  const outputDir = createRunOutputDir(customId);
  await mkdir(outputDir, { recursive: true });

  const rawCode = await readFile(parsed.codeFilePath, "utf8");

  console.log(`[1/4] Recording ${parsed.registryUrl}`);
  const { rawVideoPath } = await recordComponentPreview({
    registryUrl: parsed.registryUrl,
    outputDir,
    durationMs: parsed.recordDurationMs,
  });

  console.log("[2/4] Compressing with FFmpeg");
  const media = await processComponentVideo(rawVideoPath, outputDir);

  console.log("[3/4] Tagging with Gemini");
  const gemini = await analyzeComponentWithGemini({
    registryUrl: parsed.registryUrl,
    rawCode,
    posterWebpPath: media.posterWebpPath,
  });
  const embedding = await generateComponentEmbedding(gemini);

  console.log("[4/4] Uploading to R2 + Payload draft");
  const urls = await uploadComponentAssets({
    customId,
    previewWebmPath: media.previewWebmPath,
    posterWebpPath: media.posterWebpPath,
  });

  const payload = await createComponentDraft({
    customId,
    gemini,
    embedding,
    videoUrl: urls.videoUrl,
    posterUrl: urls.posterUrl,
    ingest: { ...parsed, rawCode },
  });

  console.log(
    JSON.stringify(
      {
        status: "draft_created",
        customId,
        payloadId: payload.id,
        title: gemini.title,
        videoUrl: urls.videoUrl,
        posterUrl: urls.posterUrl,
        outputDir,
      },
      null,
      2,
    ),
  );
}

const isCliEntry =
  Boolean(process.argv[1]) &&
  import.meta.url === pathToFileURL(process.argv[1]!).href;

if (isCliEntry) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
