// Bộ lọc nhiều lựa chọn (facet) dùng chung cho Inventory và Tài liệu.
// Tick nhiều ô trong một nhóm = HOẶC, giữa các nhóm = VÀ; số cạnh mỗi ô là số kết quả nếu tick thêm ô đó.

export type Selected<K extends string> = Record<K, string[]>;
export type Getters<T, K extends string> = Record<K, (item: T) => string>;

export const emptySelected = <K extends string>(keys: readonly K[]): Selected<K> =>
  Object.fromEntries(keys.map((key) => [key, [] as string[]])) as Selected<K>;

export const toggleValue = (list: string[], value: string): string[] =>
  list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

export const countSelected = <K extends string>(selected: Selected<K>): number =>
  Object.values<string[]>(selected).reduce((sum, list) => sum + list.length, 0);

/**
 * Một lượt duyệt O(N·F) cho cả danh sách kết quả lẫn số đếm của mọi ô
 * (cách cũ: tính lại cả bộ lọc cho từng nhóm, O(N·F²)).
 *
 * Mỗi món được đếm xem nó "trượt" bao nhiêu nhóm đang tick:
 *  - trượt 0 nhóm: nằm trong kết quả và được tính vào số đếm của mọi nhóm;
 *  - trượt đúng 1 nhóm k: chỉ được tính vào số đếm của nhóm k (đúng nghĩa "nếu tick thêm ô ở nhóm k");
 *  - trượt từ 2 nhóm: bỏ qua.
 * `accept` là điều kiện chung áp cho tất cả (từ khóa, còn hàng, đã lưu...).
 */
export function runFacets<T, K extends string>(
  items: T[],
  keys: readonly K[],
  get: Getters<T, K>,
  selected: Selected<K>,
  accept: (item: T) => boolean
) {
  const results: T[] = [];
  const counts = Object.fromEntries(keys.map((key) => [key, new Map<string, number>()])) as Record<K, Map<string, number>>;

  for (const item of items) {
    if (!accept(item)) continue;
    let failed: K | undefined;
    let failures = 0;
    for (const key of keys) {
      const picked = selected[key];
      if (picked.length > 0 && !picked.includes(get[key](item))) {
        failed = key;
        if (++failures > 1) break;
      }
    }
    if (failures > 1) continue;
    if (failures === 0) results.push(item);
    for (const key of keys) {
      if (failures === 1 && key !== failed) continue;
      const value = get[key](item);
      if (value) counts[key].set(value, (counts[key].get(value) ?? 0) + 1);
    }
  }
  return { results, counts };
}

/** Đọc các nhóm đã tick từ link (?cat=A&cat=B...); bỏ giá trị không còn tồn tại trong dữ liệu. */
export function readSelected<K extends string>(params: URLSearchParams, keys: readonly K[], param: Record<K, string>, options: Record<K, string[]>): Selected<K> {
  return Object.fromEntries(keys.map((key) => [key, params.getAll(param[key]).filter((value) => options[key].includes(value))])) as Selected<K>;
}

/** Ghi các nhóm đã tick vào link. */
export function writeSelected<K extends string>(params: URLSearchParams, keys: readonly K[], param: Record<K, string>, selected: Selected<K>): void {
  for (const key of keys) for (const value of selected[key]) params.append(param[key], value);
}

/** Giá trị khác rỗng, không trùng, giữ thứ tự xuất hiện. */
export const uniqueValues = <T>(items: T[], pick: (item: T) => string): string[] => [...new Set(items.map(pick).filter(Boolean))];
