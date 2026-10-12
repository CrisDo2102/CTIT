// Lịch sử tìm kiếm lưu trong trình duyệt (localStorage), giống mục "Search history" của st.com.
// Chỉ lưu chuỗi ngắn, tối đa 8 mục, mới nhất ở đầu, không trùng (không phân biệt hoa thường).
const KEY = "ctit-search-history";
const MAX = 8;

export function readHistory(): string[] {
  try {
    const data: unknown = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    if (!Array.isArray(data)) return [];
    return data.filter((v): v is string => typeof v === "string" && v.length > 0 && v.length <= 80).slice(0, MAX);
  } catch {
    return [];
  }
}

function write(list: string[]): string[] {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    // Trình duyệt chặn lưu trữ: bỏ qua, ô tìm kiếm vẫn chạy bình thường.
  }
  return list;
}

export function addHistory(query: string): string[] {
  const value = query.trim().replace(/\s+/g, " ").slice(0, 80);
  if (value.length < 2) return readHistory();
  const rest = readHistory().filter((item) => item.toLowerCase() !== value.toLowerCase());
  return write([value, ...rest].slice(0, MAX));
}

export function removeHistory(query: string): string[] {
  return write(readHistory().filter((item) => item !== query));
}

export function clearHistory(): string[] {
  return write([]);
}
