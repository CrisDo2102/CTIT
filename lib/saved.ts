"use client";

import { useCallback, useSyncExternalStore } from "react";
import { safeHref } from "@/lib/safe-url";

// Mục đã lưu (★) và bài đã học, lưu trong trình duyệt của từng người (localStorage), không cần đăng nhập.

export type SavedItem = {
  id: string; // duy nhất, vd "vat-tu:stm32f103c8t6-type-c"
  kind: string; // nhóm hiển thị: Vật tư, Tài liệu, Khóa học
  title: string;
  sub: string;
  href: string; // link nội bộ hoặc link ngoài
  at: number;
};

const SAVED_KEY = "ctit-saved";
const DONE_KEY = "ctit-done";
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
  listeners.add(callback);
  window.addEventListener("storage", callback);
  return () => {
    listeners.delete(callback);
    window.removeEventListener("storage", callback);
  };
}

function read(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? "";
  } catch {
    return "";
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Trình duyệt chặn lưu trữ (chế độ riêng tư...): bỏ qua, nút vẫn không gây lỗi.
  }
  listeners.forEach((callback) => callback());
}

function parseJson(raw: string): unknown[] {
  try {
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

const MAX_SAVED = 200;
const text = (value: unknown, max: number) => (typeof value === "string" ? value.slice(0, max) : "");

// localStorage là dữ liệu không tin được (extension, sửa tay, bản cũ): kiểm tra từng mục,
// bỏ mục hỏng, bỏ mục trùng id, và chỉ nhận link nội bộ hoặc http(s).
function parseSaved(raw: string): SavedItem[] {
  const seen = new Set<string>();
  const out: SavedItem[] = [];
  for (const entry of parseJson(raw)) {
    if (!entry || typeof entry !== "object") continue;
    const r = entry as Record<string, unknown>;
    const id = text(r.id, 200);
    const title = text(r.title, 200);
    const href = safeHref(text(r.href, 2048));
    if (!id || !title || !href || seen.has(id)) continue;
    seen.add(id);
    out.push({ id, kind: text(r.kind, 40) || "Khác", title, sub: text(r.sub, 200), href, at: typeof r.at === "number" ? r.at : 0 });
    if (out.length >= MAX_SAVED) break;
  }
  return out;
}

function parseStrings(raw: string): string[] {
  return parseJson(raw).filter((v): v is string => typeof v === "string" && v.length <= 200);
}

// Trang có hàng chục nút ★ / ô "đã học", mỗi nút gọi useSaved()/useDone(). Nhớ kết quả phân tích của
// chuỗi localStorage gần nhất để cả trang chỉ phân tích MỘT lần mỗi khi dữ liệu đổi (trước đây mỗi nút tự
// phân tích lại: n nút × m mục). Kết quả không bao giờ bị sửa tại chỗ nên dùng chung an toàn.
function memoByRaw<T>(parse: (raw: string) => T): (raw: string) => T {
  let last: { raw: string; value: T } | undefined;
  return (raw) => (last && last.raw === raw ? last.value : (last = { raw, value: parse(raw) }).value);
}

const savedSnapshot = memoByRaw((raw) => {
  const items = parseSaved(raw);
  return { items, ids: new Set(items.map((item) => item.id)) };
});
const doneSnapshot = memoByRaw((raw) => new Set(parseStrings(raw)));
const currentSaved = () => savedSnapshot(read(SAVED_KEY)).items;

export function useSaved() {
  const raw = useSyncExternalStore(subscribe, () => read(SAVED_KEY), () => "");
  const { items, ids } = savedSnapshot(raw);
  // Hàm ổn định giữa các lần render để useMemo ở nơi dùng không bị tính lại vô ích.
  const has = useCallback((id: string) => ids.has(id), [ids]);

  const toggle = useCallback((item: Omit<SavedItem, "at">) => {
    const current = currentSaved();
    const next = current.some((entry) => entry.id === item.id) ? current.filter((entry) => entry.id !== item.id) : [{ ...item, at: Date.now() }, ...current];
    write(SAVED_KEY, JSON.stringify(next));
  }, []);
  const removeMany = useCallback((targets: string[]) => {
    const drop = new Set(targets);
    write(SAVED_KEY, JSON.stringify(currentSaved().filter((entry) => !drop.has(entry.id))));
  }, []);
  const remove = useCallback((id: string) => removeMany([id]), [removeMany]);
  // Khôi phục (Hoàn tác): trả mục về đúng thời điểm lưu cũ, không tạo trùng.
  const restore = useCallback((back: SavedItem[]) => {
    const current = currentSaved();
    const have = new Set(current.map((entry) => entry.id));
    const merged = [...current, ...back.filter((entry) => !have.has(entry.id))].sort((a, b) => b.at - a.at).slice(0, MAX_SAVED);
    write(SAVED_KEY, JSON.stringify(merged));
  }, []);
  const clear = useCallback(() => write(SAVED_KEY, "[]"), []);

  return { items, has, toggle, remove, removeMany, restore, clear };
}

export function useDone() {
  const raw = useSyncExternalStore(subscribe, () => read(DONE_KEY), () => "");
  const done = doneSnapshot(raw);

  // Đánh dấu / bỏ đánh dấu một hoặc nhiều bài (vd "đã học cả nhánh", "học lại từ đầu").
  const setMany = useCallback((targets: string[], value: boolean) => {
    const next = new Set(doneSnapshot(read(DONE_KEY)));
    for (const id of targets) {
      if (value) next.add(id);
      else next.delete(id);
    }
    write(DONE_KEY, JSON.stringify([...next]));
  }, []);
  const toggle = useCallback((id: string) => setMany([id], !doneSnapshot(read(DONE_KEY)).has(id)), [setMany]);

  return { done, toggle, setMany };
}
