import type { CollectionConfig } from "payload";

/**
 * Optional admin uploads to R2 (`admin/` prefix via s3Storage).
 * Production gallery assets use deterministic `cdn.godly.design` URLs on text fields (PRD §4).
 */
export const Media: CollectionConfig = {
  slug: "media",
  access: {
    read: () => true,
  },
  upload: {
    mimeTypes: ["image/*", "video/webm", "video/mp4"],
  },
  fields: [
    {
      name: "alt",
      type: "text",
    },
  ],
};
