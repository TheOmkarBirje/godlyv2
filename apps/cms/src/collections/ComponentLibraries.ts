import type { CollectionConfig } from "payload";

import { internalAdminFieldAccess } from "../access/internal";

const licenses = ["MIT", "Apache-2.0", "CC-BY-4.0"] as const;

export const ComponentLibraries: CollectionConfig = {
  slug: "component-libraries",
  admin: {
    useAsTitle: "name",
    description:
      "Component creators & registries for attribution and affiliate upsells",
  },
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "logoUrl", type: "text", required: true },
    { name: "githubUrl", type: "text" },
    { name: "affiliateUrl", type: "text" },
    {
      name: "license",
      type: "select",
      options: [...licenses],
      defaultValue: "MIT",
    },
    {
      name: "internalNotes",
      type: "textarea",
      access: internalAdminFieldAccess,
    },
  ],
};
