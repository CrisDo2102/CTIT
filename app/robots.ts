import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: ["/", "/resources"], disallow: ["/admin"] }
    ],
    sitemap: "https://ctit-embedded.vercel.app/sitemap.xml"
  };
}
