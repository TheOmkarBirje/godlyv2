import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";

import { consumeQuota } from "../auth/quota";
import { runGetBrandDesignSystem } from "../tools/getBrand";
import { runGetComponent } from "../tools/getComponent";
import { runGetSectionInspiration } from "../tools/getSection";

export async function createGodlyMcpServer(
  env: Env,
  apiKey: string,
): Promise<McpServer> {
  const server = new McpServer({
    name: "godly-design",
    version: "1.0.0",
  });

  const runTool = async <T>(work: () => Promise<T>): Promise<T> => {
    const allowed = await consumeQuota(env, apiKey);
    if (!allowed) {
      const checkout = env.GODLY_CHECKOUT_URL ?? "https://godly.design/pricing";
      throw new Error(
        `Daily MCP quota exceeded. Upgrade to Pro (500 req/day): ${checkout}`,
      );
    }
    return work();
  };

  server.registerTool(
    "get_component",
    {
      description:
        "Fetch standalone component TSX, CLI command, dependencies, and design tokens with attribution footer.",
      inputSchema: {
        id: z
          .string()
          .min(1)
          .describe("Component custom ID, e.g. cmp_btn_48"),
      },
    },
    async ({ id }) => {
      const text = await runTool(() => runGetComponent(env, id));
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "get_section_inspiration",
    {
      description:
        "Fetch section keyframe URLs plus Tailwind/spring design tokens for visual replication.",
      inputSchema: {
        id: z
          .string()
          .min(1)
          .describe("Section custom ID, e.g. sec_lin_hero_01"),
      },
    },
    async ({ id }) => {
      const text = await runTool(() => runGetSectionInspiration(env, id));
      return { content: [{ type: "text", text }] };
    },
  );

  server.registerTool(
    "get_brand_design_system",
    {
      description:
        "Return brand palette, typography, animation physics, and component styling rules.",
      inputSchema: {
        companySlug: z
          .string()
          .min(1)
          .describe("Company slug, e.g. linear"),
      },
    },
    async ({ companySlug }) => {
      const text = await runTool(() =>
        runGetBrandDesignSystem(env, companySlug),
      );
      return { content: [{ type: "text", text }] };
    },
  );

  return server;
}
