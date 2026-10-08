// Hàm thuần cho Inventory, dùng được ở cả server (trang chi tiết) lẫn client (danh sách).
import { fold, slugify } from "@/lib/format";
import type { InventoryItem } from "@/lib/sheet-data";

export type InventoryEntry = InventoryItem & { slug: string };

/** Gắn đường dẫn riêng cho từng vật tư (từ tên; trùng tên thì thêm -2, -3...). Thứ tự giữ nguyên như trong Sheet. */
export function withSlugs(items: InventoryItem[]): InventoryEntry[] {
  const used = new Set<string>();
  return items.map((item) => {
    const base = slugify(item.title || item.model || item.id) || "vat-tu";
    let slug = base;
    for (let n = 2; used.has(slug); n += 1) slug = `${base}-${n}`;
    used.add(slug);
    return { ...item, slug };
  });
}

export function statusLabel(status: string): string {
  const value = status.trim().toLowerCase();
  if (!value) return "Chưa cập nhật";
  if (/(out|hết|empty|unavailable)/.test(value)) return "Hết hàng";
  if (/(low|thấp|sắp|limited)/.test(value)) return "Sắp hết";
  return status;
}

export function statusClass(status: string): string {
  const value = status.trim().toLowerCase();
  if (/(out|hết|empty|unavailable)/.test(value)) return "inventory-status is-out";
  if (/(low|thấp|sắp|limited)/.test(value)) return "inventory-status is-low";
  if (/(borrow|mượn|repair|sửa|maintenance)/.test(value)) return "inventory-status is-warn";
  return "inventory-status is-ok";
}

/**
 * Từ khóa để nối vật tư với tài liệu / khóa học liên quan: các "mã linh kiện" trong model và tên
 * (từ có chữ số, từ 4 ký tự), thêm dạng rút gọn 8 ký tự đầu (STM32F103C8T6 -> stm32f10).
 * Chỉ cần ghi mã linh kiện trong tiêu đề / topic / mô tả của tài liệu là tự nối được.
 */
export function relatedKeys(item: InventoryItem): string[] {
  const keys = new Set<string>();
  for (const token of `${item.model} ${item.title}`.split(/[\s,/()]+/)) {
    const key = fold(token).replace(/[^a-z0-9]/g, "");
    if (key.length < 4 || !/\d/.test(key)) continue;
    keys.add(key);
    if (key.length >= 9) keys.add(key.slice(0, 8));
  }
  return [...keys].slice(0, 6);
}

export function matchesKeys(haystack: string, keys: string[]): boolean {
  const text = fold(haystack).replace(/[^a-z0-9]/g, "");
  return keys.some((key) => text.includes(key));
}
