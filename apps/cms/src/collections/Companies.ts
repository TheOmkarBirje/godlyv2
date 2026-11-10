import type { CollectionConfig } from "payload";

const companyCategories = [
  "Developer Tools",
  "Fintech",
  "AI / ML",
  "Design",
  "Productivity",
] as const;

export const Companies: CollectionConfig = {
  slug: "companies",
  admin: { useAsTitle: "name" },
  access: {
    read: () => true,
  },
  fields: [
    { name: "name", type: "text", required: true },
    { name: "slug", type: "text", required: true, unique: true, index: true },
    { name: "domain", type: "text", required: true },
    { name: "description", type: "textarea" },
    { name: "logoUrl", type: "text", required: true },
    {
      name: "category",
      type: "select",
      options: [...companyCategories],
    },
    {
      name: "brandTokens",
      type: "group",
      fields: [
        { name: "primaryColor", type: "text" },
        { name: "backgroundColor", type: "text" },
        { name: "fontFamily", type: "text" },
      ],
    },
    {
      name: "socialLinks",
      type: "group",
      fields: [
        { name: "twitter", type: "text" },
        { name: "github", type: "text" },
      ],
    },
  ],
};
