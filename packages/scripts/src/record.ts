import { mkdir } from "node:fs/promises";
import path from "node:path";
import { chromium, type Locator, type Page } from "playwright";

const PREVIEW_SELECTORS = [
  'iframe[src*="preview"]',
  'iframe[data-testid*="preview"]',
  "[data-preview]",
  "[data-component-preview]",
  ".component-preview",
  "#preview",
  "main article",
  "main",
] as const;

const INTERACTION_SELECTORS = [
  "button",
  "[role='button']",
  "a",
  "input",
  "[data-state]",
  "[aria-pressed]",
] as const;

export type RecordComponentOptions = {
  registryUrl: string;
  outputDir: string;
  /** Target 3–6s capture window (default 4500ms). */
  durationMs?: number;
  viewport?: { width: number; height: number };
};

export type RecordComponentResult = {
  rawVideoPath: string;
  usedSelector?: string;
};

async function findPreviewLocator(page: Page): Promise<{
  locator: Locator;
  usedSelector?: string;
  interactionRoot: Locator;
}> {
  for (const selector of PREVIEW_SELECTORS) {
    if (selector.startsWith("iframe")) {
      const iframe = page.locator(selector).first();
      if ((await iframe.count()) > 0) {
        const frameRoot = page.frameLocator(selector).locator("body");
        return {
          locator: iframe,
          usedSelector: selector,
          interactionRoot: frameRoot,
        };
      }
      continue;
    }

    const locator = page.locator(selector).first();
    if ((await locator.count()) > 0) {
      return { locator, usedSelector: selector, interactionRoot: locator };
    }
  }

  const fallback = page.locator("body");
  return { locator: fallback, interactionRoot: fallback };
}

async function runMicroInteractions(
  page: Page,
  root: Locator,
): Promise<void> {
  for (const selector of INTERACTION_SELECTORS) {
    const el = root.locator(selector).first();
    if ((await el.count()) === 0) continue;

    try {
      await el.scrollIntoViewIfNeeded({ timeout: 2000 });
      await el.hover({ timeout: 2000 });
      await page.waitForTimeout(400);

      const tag = await el.evaluate((node) => node.tagName.toLowerCase());
      if (tag === "button" || tag === "a") {
        await el.click({ timeout: 2000 }).catch(() => undefined);
        await page.waitForTimeout(500);
      }
    } catch {
      // Best-effort interactions for heterogeneous registries.
    }
  }
}

/**
 * Navigates an isolated component preview (iframe/container), triggers micro-interactions,
 * and records a short viewport capture clip for the automated registry pipeline.
 */
export async function recordComponentPreview(
  options: RecordComponentOptions,
): Promise<RecordComponentResult> {
  const {
    registryUrl,
    outputDir,
    durationMs = 4500,
    viewport = { width: 900, height: 600 },
  } = options;

  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport,
    recordVideo: {
      dir: outputDir,
      size: { width: viewport.width, height: viewport.height },
    },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();
  const video = page.video();
  let usedSelector: string | undefined;

  try {
    await page.goto(registryUrl, {
      waitUntil: "networkidle",
      timeout: 60_000,
    });

    const preview = await findPreviewLocator(page);
    usedSelector = preview.usedSelector;
    await preview.locator.scrollIntoViewIfNeeded().catch(() => undefined);
    await page.waitForTimeout(350);

    await runMicroInteractions(page, preview.interactionRoot);

    const remaining = Math.max(1200, durationMs - 1200);
    await page.waitForTimeout(remaining);
  } finally {
    await context.close();
    await browser.close();
  }

  if (!video) {
    throw new Error("Playwright did not produce a video artifact.");
  }

  const rawVideoPath = await video.path();
  const finalPath = path.join(outputDir, "raw-capture.webm");
  if (rawVideoPath !== finalPath) {
    const { rename } = await import("node:fs/promises");
    await rename(rawVideoPath, finalPath).catch(async () => {
      const { copyFile } = await import("node:fs/promises");
      await copyFile(rawVideoPath, finalPath);
    });
  }

  return { rawVideoPath: finalPath, usedSelector };
}
