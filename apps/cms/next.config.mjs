import path from "node:path";
import { fileURLToPath } from "node:url";
import { withPayload } from "@payloadcms/next/withPayload";
import { config as loadDotenv } from "dotenv";

const dirname = path.dirname(fileURLToPath(import.meta.url));
loadDotenv({ path: path.resolve(dirname, "../../.env") });

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default withPayload(nextConfig, {
  configPath: path.resolve(dirname, "./src/payload.config.ts"),
});
