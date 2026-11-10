import type { CollectionConfig } from "payload";

import { paywalledGroupAccess } from "../access/internal";

const sectionTypes = [
  "Hero",
  "Bento Grid",
  "Feature Showcase",
  "Pricing Table",
  "Testimonials",
  "Interactive Demo",
  "Footer",
  "Navigation",
] as const;

export const Sections: CollectionConfig = {
  slug: "sections",
  admin: { useAsTitle: "title" },
  access: {
    read: () => true,
  },
  fields: [
    { name: "customId", type: "text", required: true, unique: true, index: true },
    { name: "title", type: "text", required: true },
    {
      name: "company",
      type: "relationship",
      relationTo: "companies",
      required: true,
      index: true,
    },
    {
      name: "page",
      type: "relationship",
      relationTo: "pages",
      required: true,
      index: true,
    },
    {
      name: "sectionType",
      type: "select",
      required: true,
      options: [...sectionTypes],
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
        {
          name: "keyframeUrls",
          type: "array",
          fields: [{ name: "url", type: "text", required: true }],
        },
        { name: "aiDesignTokens", type: "json" },
        {
          name: "rawCode",
          type: "code",
          admin: { language: "typescript" },
        },
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
