import { NextResponse } from "next/server";
import { getCourses, getEvents, getInventory, getNews, getResources, getStudents } from "@/lib/sheet-data";
import { nav } from "@/lib/site-config";
import type { SearchEntry } from "@/lib/search";

// Chỉ mục tìm kiếm toàn trang: gom từ các tab Google Sheet đã có sẵn (cùng bộ đệm 60 giây
// với các trang), nên sửa Sheet xong thì tìm kiếm cũng cập nhật theo.
export const revalidate = 60;

const clip = (text: string | undefined, max = 90) => {
  const t = (text || "").replace(/\s+/g, " ").trim();
  return t.length > max ? `${t.slice(0, max - 1)}…` : t;
};

export async function GET() {
  const [resources, inventory, courses, news, events, students] = await Promise.allSettled([
    getResources(),
    getInventory(),
    getCourses(),
    getNews(),
    getEvents(),
    getStudents()
  ]);
  const ok = <T,>(r: PromiseSettledResult<T[]>): T[] => (r.status === "fulfilled" ? r.value : []);

  const entries: SearchEntry[] = [];

  for (const n of nav) entries.push({ kind: "Trang", title: n.label, sub: clip(n.intro), href: n.href });

  for (const r of ok(resources)) {
    entries.push({ kind: "Tài liệu", title: r.title, sub: clip([r.type, r.category || r.topic].filter(Boolean).join(" · ") || r.description), href: r.url || `/resources/documents?q=${encodeURIComponent(r.title)}`, external: Boolean(r.url) });
  }
  for (const i of ok(inventory)) {
    entries.push({ kind: "Inventory", title: i.title, sub: clip([i.category, i.manufacturer, i.model].filter(Boolean).join(" · ")), href: `/resources/inventory?q=${encodeURIComponent(i.title)}` });
  }
  for (const c of ok(courses)) {
    entries.push({ kind: "Khóa học", title: c.title, sub: clip(c.description), href: `/resources/courses/${c.slug}` });
  }
  for (const n of ok(news)) {
    entries.push({ kind: "Tin tức", title: n.title, sub: clip(n.summary || n.date), href: n.url || "/news", external: /^https?:/.test(n.url || "") });
  }
  for (const e of ok(events)) {
    entries.push({ kind: "Sự kiện", title: e.title, sub: clip([e.date, e.place].filter(Boolean).join(" · ") || e.summary), href: e.url || "/events", external: /^https?:/.test(e.url || "") });
  }
  for (const s of ok(students)) {
    entries.push({ kind: "Học viên", title: s.name, sub: clip([s.school, s.major || s.faculty].filter(Boolean).join(" · ")), href: "/schools" });
  }

  return NextResponse.json(entries.filter((e) => e.title));
}
