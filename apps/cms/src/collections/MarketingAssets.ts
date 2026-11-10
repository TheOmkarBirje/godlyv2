import type { CollectionConfig } from "payload";

const assetTypes = [
  "OG Image",
  "Social Media Graphic",
  "Product Launch Video",
  "Header Banner",
  "Email Newsletter",
] as const;

export const MarketingAssets: CollectionConfig = {
  slug: "marketing-assets",
  admin: { useAsTitle: "title" },
  access: {
    read: () => true,
  },
  fields: [
    { name: "title", type: "text", required: true },
    {
      name: "company",
      type: "relationship",
      relationTo: "companies",
      required: true,
      index: true,
    },
    {
      name: "assetType",
      type: "select",
      required: true,
      options: [...assetTypes],
    },
    { name: "mediaUrl", type: "text", required: true },
    { name: "thumbnailUrl", type: "text", required: true },
    { name: "captionOrCopy", type: "textarea" },
    { name: "sourceUrl", type: "text" },
    { name: "publishedDate", type: "date" },
    {
      name: "tags",
      type: "array",
      fields: [{ name: "tag", type: "text" }],
    },
  ],
};
