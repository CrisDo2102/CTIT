import type { MetadataRoute } from "next";
import { getCourses } from "@/lib/sheet-data";
import { nav, siteUrl } from "@/lib/site-config";
import { getImageryCategories } from "@/lib/imagery";

// Chỉ liệt kê trang công khai. /admin cố ý không có ở đây (và bị khoá bằng mật khẩu).
const extraPages = ["/roadmap", "/resources/documents", "/resources/inventory", "/resources/courses", "/imagery", "/changelog"];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const [courses, imagery] = await Promise.all([getCourses(), getImageryCategories()]);
  const pages = [...new Set([
    ...nav.map((item) => item.href), ...extraPages,
    ...courses.map((course) => `/resources/courses/${course.slug}`),
    ...imagery.map((category) => category.href)
  ])];
  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...pages.map((href) => ({
      url: `${siteUrl}${href}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: 0.7
    }))
  ];
}
