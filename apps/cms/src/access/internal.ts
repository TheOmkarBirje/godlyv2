import type { PayloadRequest } from "payload";

function getRequestHeader(req: PayloadRequest, name: string): string | null {
  const headers = req.headers;
  if (!headers) return null;

  if (typeof headers.get === "function") {
    return headers.get(name);
  }

  const record = headers as unknown as Record<string, string | undefined>;
  return record[name] ?? record[name.toLowerCase()] ?? null;
}

export function hasMcpInternalAccess(req: PayloadRequest): boolean {
  const secret = process.env.INTERNAL_MCP_SECRET;
  if (!secret) return false;
  return getRequestHeader(req, "x-mcp-internal-key") === secret;
}

export function hasAdminInternalAccess(req: PayloadRequest): boolean {
  const secret = process.env.INTERNAL_ADMIN_SECRET;
  if (!secret) return false;
  return getRequestHeader(req, "x-admin-internal-key") === secret;
}

function isPayloadAdminUser(req: PayloadRequest): boolean {
  const user = req.user as { roles?: string[] } | null | undefined;
  if (!user) return false;
  return Array.isArray(user.roles) && user.roles.includes("admin");
}

/**
 * Paywalled MCP payloads: internal headers or Payload users with explicit `admin` role.
 */
export function canReadPaywalledFields(req: PayloadRequest): boolean {
  return (
    hasMcpInternalAccess(req) ||
    hasAdminInternalAccess(req) ||
    isPayloadAdminUser(req)
  );
}

/** Admin-only metadata (e.g. internalNotes). */
export function canReadInternalAdminFields(req: PayloadRequest): boolean {
  return isPayloadAdminUser(req) || hasAdminInternalAccess(req);
}

export const paywalledGroupAccess = {
  read: ({ req }: { req: PayloadRequest }) => canReadPaywalledFields(req),
  update: ({ req }: { req: PayloadRequest }) =>
    isPayloadAdminUser(req) || hasAdminInternalAccess(req),
  create: ({ req }: { req: PayloadRequest }) =>
    isPayloadAdminUser(req) || hasAdminInternalAccess(req),
} as const;

export const internalAdminFieldAccess = {
  read: ({ req }: { req: PayloadRequest }) => canReadInternalAdminFields(req),
  update: ({ req }: { req: PayloadRequest }) => canReadInternalAdminFields(req),
  create: ({ req }: { req: PayloadRequest }) => canReadInternalAdminFields(req),
} as const;

export function publicPublishedOnlyAccess(req: PayloadRequest) {
  if (
    req.user ||
    hasMcpInternalAccess(req) ||
    hasAdminInternalAccess(req)
  ) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
  };
}
