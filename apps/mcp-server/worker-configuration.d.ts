interface Env {
  KV: KVNamespace;

  PAYLOAD_CMS_URL: string;
  INTERNAL_MCP_SECRET: string;
  GODLY_CHECKOUT_URL: string;
  MCP_ALLOWED_ORIGINS?: string;
  GODLY_DEV_API_KEY?: string;
}
