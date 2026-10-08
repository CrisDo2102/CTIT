"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

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

function parseList<T>(raw: string): T[] {
  try {
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? (data as T[]) : [];
  } catch {
    return [];
  }
}

export function useSaved() {
  const raw = useSyncExternalStore(subscribe, () => read(SAVED_KEY), () => "");
  const items = useMemo(() => parseList<SavedItem>(raw), [raw]);
  const ids = useMemo(() => new Set(items.map((item) => item.id)), [items]);

  const toggle = useCallback((item: Omit<SavedItem, "at">) => {
    const current = parseList<SavedItem>(read(SAVED_KEY));
    const next = current.some((entry) => entry.id === item.id) ? current.filter((entry) => entry.id !== item.id) : [{ ...item, at: Date.now() }, ...current];
    write(SAVED_KEY, JSON.stringify(next));
  }, []);
  const remove = useCallback((id: string) => {
    write(SAVED_KEY, JSON.stringify(parseList<SavedItem>(read(SAVED_KEY)).filter((entry) => entry.id !== id)));
  }, []);
  const clear = useCallback(() => write(SAVED_KEY, "[]"), []);

  return { items, has: (id: string) => ids.has(id), toggle, remove, clear };
}

export function useDone() {
  const raw = useSyncExternalStore(subscribe, () => read(DONE_KEY), () => "");
  const done = useMemo(() => new Set(parseList<string>(raw)), [raw]);

  const toggle = useCallback((id: string) => {
    const current = new Set(parseList<string>(read(DONE_KEY)));
    if (current.has(id)) current.delete(id);
    else current.add(id);
    write(DONE_KEY, JSON.stringify([...current]));
  }, []);

  return { done, toggle };
}
