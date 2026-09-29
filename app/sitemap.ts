import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://ctit-embedded.vercel.app";
  return [
    { url: base, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${base}/resources`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/admin`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 }
  ];
}
