import path from "node:path";
import { fileURLToPath } from "node:url";
import { buildConfig } from "payload";
import { mongooseAdapter } from "@payloadcms/db-mongodb";
import { s3Storage } from "@payloadcms/storage-s3";

import { Companies } from "./collections/Companies";
import { Pages } from "./collections/Pages";
import { Sections } from "./collections/Sections";
import { MarketingAssets } from "./collections/MarketingAssets";
import { ComponentLibraries } from "./collections/ComponentLibraries";
import { Components } from "./collections/Components";
import { Users } from "./collections/Users";
import { Media } from "./collections/Media";
import { getR2S3ClientConfig } from "./lib/r2";

const filename = fileURLToPath(import.meta.url);
const dirname = path.dirname(filename);

const r2Bucket = process.env.R2_BUCKET_NAME ?? "godly-design";

const payloadSecret = process.env.PAYLOAD_SECRET;
if (!payloadSecret) {
  console.warn(
    "[@godly/cms] PAYLOAD_SECRET missing — using dev fallback. Set it in root .env before deploy.",
  );
}

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [
    Companies,
    Pages,
    Sections,
    MarketingAssets,
    ComponentLibraries,
    Components,
    Users,
    Media,
  ],
  db: mongooseAdapter({
    url: process.env.MONGODB_URI ?? "",
  }),
  secret: payloadSecret ?? "dev-only-secret-change-before-deploy",
  typescript: {
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  plugins: [
    s3Storage({
      enabled: Boolean(
        process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
          process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
          process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
      ),
      bucket: r2Bucket,
      acl: "public-read",
      collections: {
        media: {
          prefix: "admin",
        },
      },
      config: getR2S3ClientConfig(),
    }),
  ],
});
