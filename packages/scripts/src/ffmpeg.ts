import { spawn } from "node:child_process";
import path from "node:path";

function runProcess(cmd: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code ?? "unknown"}`));
    });
  });
}

export type FfmpegProcessResult = {
  previewWebmPath: string;
  posterWebpPath: string;
};

/**
 * Compresses the component capture to a muted 720p WebM loop (VP9, CRF 28)
 * and extracts a single poster.webp for the public gallery.
 */
export async function processComponentVideo(
  inputPath: string,
  outputDir: string,
): Promise<FfmpegProcessResult> {
  const previewWebmPath = path.join(outputDir, "preview.webm");
  const posterWebpPath = path.join(outputDir, "poster.webp");

  await runProcess("ffmpeg", [
    "-y",
    "-i",
    inputPath,
    "-an",
    "-vf",
    "scale=-2:720",
    "-c:v",
    "libvpx-vp9",
    "-crf",
    "28",
    "-b:v",
    "0",
    "-row-mt",
    "1",
    "-deadline",
    "good",
    previewWebmPath,
  ]);

  await runProcess("ffmpeg", [
    "-y",
    "-i",
    previewWebmPath,
    "-vframes",
    "1",
    "-c:v",
    "libwebp",
    "-quality",
    "85",
    posterWebpPath,
  ]);

  return { previewWebmPath, posterWebpPath };
}
