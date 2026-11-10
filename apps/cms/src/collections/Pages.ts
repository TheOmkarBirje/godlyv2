import type { CollectionConfig } from "payload";

const pageTypes = [
  "Landing",
  "Pricing",
  "Changelog",
  "About",
  "Careers",
  "Docs",
] as const;

export const Pages: CollectionConfig = {
  slug: "pages",
  admin: { useAsTitle: "title" },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: "company",
      type: "relationship",
      relationTo: "companies",
      required: true,
      index: true,
    },
    { name: "title", type: "text", required: true },
    { name: "slug", type: "text", required: true, index: true },
    {
      name: "pageType",
      type: "select",
      options: [...pageTypes],
    },
    { name: "url", type: "text", required: true },
    { name: "fullPageVideoUrl", type: "text", required: true },
    { name: "fullPagePosterUrl", type: "text", required: true },
    { name: "capturedDate", type: "date", required: true },
  ],
};
