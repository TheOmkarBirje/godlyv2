export function getR2PublicBaseUrl(): string {
  const domain = process.env.R2_PUBLIC_DOMAIN ?? "https://teststorage.godly.design";
  return domain.replace(/\/$/, "");
}

export function getR2S3ClientConfig() {
  const accountId = process.env.CLOUDFLARE_R2_ACCOUNT_ID;

  return {
    credentials: {
      accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID ?? "",
      secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY ?? "",
    },
    region: "auto",
    ...(accountId
      ? {
          endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
          forcePathStyle: true,
        }
      : {}),
  };
}
