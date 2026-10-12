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

// Bỏ dấu (NFD + regex) là phần tốn nhất của mỗi lần gõ. Mỗi mục chỉ cần tính một lần: lần gõ sau dùng lại.
const prepared = new WeakMap<SearchEntry, { title: string; hay: string }>();
function prepare(entry: SearchEntry) {
  let cached = prepared.get(entry);
  if (!cached) {
    const title = fold(entry.title);
    cached = { title, hay: `${title} ${fold(entry.sub)} ${fold(entry.kind)}` };
    prepared.set(entry, cached);
  }
  return cached;
}

const kindRank = new Map(kindOrder.map((kind, i) => [kind, i]));

export function searchEntries(entries: SearchEntry[], query: string, limit = 24): SearchEntry[] {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  const scored: { entry: SearchEntry; score: number }[] = [];
  for (const entry of entries) {
    const { title, hay } = prepare(entry);
    if (!words.every((w) => hay.includes(w))) continue;
    let score = entry.kind === "Trang" ? 1 : 0;
    for (const w of words) {
      score += title.startsWith(w) ? 4 : title.includes(` ${w}`) ? 3 : title.includes(w) ? 2 : 1;
    }
    scored.push({ entry, score });
  }
  scored.sort((a, b) => b.score - a.score || kindRank.get(a.entry.kind)! - kindRank.get(b.entry.kind)!);
  return scored.slice(0, limit).map((s) => s.entry);
}
