import { defineConfig, envField } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";

// https://astro.build/config
export default defineConfig({
  output: "server",
  adapter: cloudflare({
    imageService: "cloudflare",
  }),
  integrations: [react(), tailwind({ applyBaseStyles: false })],
  env: {
    schema: {
      PAYLOAD_CMS_URL: envField.string({
        context: "server",
        access: "public",
        default: "https://testcms.godly.design",
      }),
      SITE_URL: envField.string({
        context: "server",
        access: "public",
        default: "https://test.godly.design",
      }),
    },
  },
});
