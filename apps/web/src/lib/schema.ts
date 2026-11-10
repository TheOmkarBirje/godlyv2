export function videoObjectJsonLd(input: {
  name: string;
  description?: string;
  contentUrl: string;
  thumbnailUrl: string;
  uploadDate?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: input.name,
    description: input.description,
    contentUrl: input.contentUrl,
    thumbnailUrl: input.thumbnailUrl,
    uploadDate: input.uploadDate ?? new Date().toISOString(),
  };
}

export function imageGalleryJsonLd(input: {
  name: string;
  images: { url: string; name?: string }[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: input.name,
    associatedMedia: input.images.map((image) => ({
      "@type": "ImageObject",
      contentUrl: image.url,
      name: image.name,
    })),
  };
}
