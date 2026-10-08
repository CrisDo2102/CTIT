// Dùng chung cho API /api/search và ô tìm kiếm (components/SearchDialog.tsx).
export type SearchKind = "Trang" | "Tài liệu" | "Inventory" | "Khóa học" | "Tin tức" | "Sự kiện" | "Học viên";

export type SearchEntry = {
  kind: SearchKind;
  title: string;
  sub: string;
  href: string;
  external?: boolean;
};

export const kindOrder: SearchKind[] = ["Trang", "Khóa học", "Tài liệu", "Inventory", "Tin tức", "Sự kiện", "Học viên"];

// Bỏ dấu tiếng Việt + chữ thường, để gõ "tai lieu" vẫn ra "Tài liệu".
export function fold(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase();
}

export function searchEntries(entries: SearchEntry[], query: string, limit = 24): SearchEntry[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const title = fold(entry.title);
    const hay = `${title} ${fold(entry.sub)} ${fold(entry.kind)}`;
    if (!words.every((w) => hay.includes(w))) continue;
    let score = 0;
    for (const w of words) {
      if (title.startsWith(w)) score += 4;
      else if (title.includes(` ${w}`)) score += 3;
      else if (title.includes(w)) score += 2;
      else score += 1;
    }
    if (entry.kind === "Trang") score += 1;
    scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score || kindOrder.indexOf(a.entry.kind) - kindOrder.indexOf(b.entry.kind));
  return scored.slice(0, limit).map((s) => s.entry);
}
