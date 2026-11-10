import type { CollectionConfig } from "payload";

import {
  paywalledGroupAccess,
  publicPublishedOnlyAccess,
} from "../access/internal";

const componentCategories = [
  "Navigation",
  "Pricing",
  "Cards",
  "Modals",
  "Drawers",
  "Inputs",
  "Buttons",
] as const;

export const Components: CollectionConfig = {
  slug: "components",
  admin: { useAsTitle: "title" },
  versions: {
    drafts: true,
  },
  access: {
    read: ({ req }) => publicPublishedOnlyAccess(req),
    create: ({ req }) => Boolean(req.user) || paywalledGroupAccess.create({ req }),
    update: ({ req }) => Boolean(req.user) || paywalledGroupAccess.update({ req }),
    delete: ({ req }) => Boolean(req.user),
  },
  fields: [
    { name: "customId", type: "text", required: true, unique: true, index: true },
    { name: "title", type: "text", required: true },
    { name: "description", type: "textarea", required: true },
    {
      name: "category",
      type: "select",
      options: [...componentCategories],
    },
    {
      name: "library",
      type: "relationship",
      relationTo: "component-libraries",
      admin: {
        description: "Shows creator logo and name badge on public site",
      },
    },
    { name: "videoUrl", type: "text", required: true },
    { name: "posterUrl", type: "text", required: true },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text" }],
    },
    {
      name: "mcpSecrets",
      type: "group",
      access: paywalledGroupAccess,
      fields: [
        { name: "registryUrl", type: "text" },
        { name: "cliCommand", type: "text" },
        {
          name: "rawCode",
          type: "code",
          admin: { language: "typescript" },
        },
        {
          name: "dependencies",
          type: "array",
          fields: [{ name: "pkg", type: "text", required: true }],
        },
        { name: "aiDesignTokens", type: "json" },
        {
          name: "embedding",
          type: "array",
          admin: { hidden: true },
          fields: [{ name: "val", type: "number", required: true }],
        },
      ],
    },
  ],
};
