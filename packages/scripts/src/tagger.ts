import { readFile } from "node:fs/promises";
import { GoogleGenAI, Type } from "@google/genai";

import {
  getGeminiEmbeddingModel,
  getGeminiVisionModel,
  requireEnv,
} from "./config/env";
import type { ComponentCategory, GeminiIngestionResult } from "./types/ingest";

const CATEGORY_OPTIONS: ComponentCategory[] = [
  "Navigation",
  "Pricing",
  "Cards",
  "Modals",
  "Drawers",
  "Inputs",
  "Buttons",
];

function buildPrompt(registryUrl: string, rawCode: string): string {
  return [
    "You are ingesting a standalone UI component for Godly.Design.",
    "Analyze the poster image and the component source code.",
    "Return white-labeled metadata that NEVER mentions upstream brand names.",
    "Extract layout tokens, Tailwind classes, spacing grid, and spring animation physics.",
    "",
    `Registry URL (context only): ${registryUrl}`,
    "",
    "Component source:",
    rawCode,
  ].join("\n");
}

export async function analyzeComponentWithGemini(input: {
  registryUrl: string;
  rawCode: string;
  posterWebpPath: string;
}): Promise<GeminiIngestionResult> {
  const apiKey = requireEnv("GEMINI_API_KEY");
  const ai = new GoogleGenAI({ apiKey });

  const posterBytes = await readFile(input.posterWebpPath);
  const posterBase64 = posterBytes.toString("base64");

  const response = await ai.models.generateContent({
    model: getGeminiVisionModel(),
    contents: [
      {
        role: "user",
        parts: [
          {
            inlineData: {
              mimeType: "image/webp",
              data: posterBase64,
            },
          },
          { text: buildPrompt(input.registryUrl, input.rawCode) },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING },
          category: { type: Type.STRING },
          tags: { type: Type.ARRAY, items: { type: Type.STRING } },
          aiDesignTokens: { type: Type.OBJECT },
          dependencies: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: [
          "title",
          "description",
          "category",
          "tags",
          "aiDesignTokens",
          "dependencies",
        ],
      },
    },
  });

  const text = response.text;
  if (!text) {
    throw new Error("Gemini returned an empty ingestion response.");
  }

  const parsed = JSON.parse(text) as GeminiIngestionResult;

  if (!CATEGORY_OPTIONS.includes(parsed.category)) {
    parsed.category = "Buttons";
  }

  parsed.title = parsed.title.trim();
  parsed.description = parsed.description.trim();
  parsed.tags = parsed.tags.map((tag) => tag.trim()).filter(Boolean);

  return parsed;
}

export async function generateComponentEmbedding(
  input: GeminiIngestionResult,
): Promise<number[]> {
  const apiKey = requireEnv("GEMINI_API_KEY");
  const ai = new GoogleGenAI({ apiKey });

  const embedText = [
    input.title,
    input.description,
    input.category,
    input.tags.join(", "),
    JSON.stringify(input.aiDesignTokens),
  ].join("\n");

  const response = await ai.models.embedContent({
    model: getGeminiEmbeddingModel(),
    contents: embedText,
    config: {
      outputDimensionality: 1536,
    },
  });

  const values = response.embeddings?.[0]?.values;
  if (!values || values.length === 0) {
    throw new Error("Gemini embedding response was empty.");
  }

  return values;
}
