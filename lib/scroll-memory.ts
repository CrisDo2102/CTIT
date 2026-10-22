// Nhớ vị trí cuộn của trang danh sách khi người dùng bấm sang trang chi tiết, và trả lại khi quay về.
// Trình duyệt tự khôi phục vị trí cuộn rất hay sai ở trang dựng bằng JavaScript (nó cuộn trước khi trang kịp cao đủ),
// nên ở đây tự làm: đợi danh sách vẽ xong rồi mới cuộn.
//
// Chỉ khôi phục khi thật sự là "quay lại": bấm Back của trình duyệt, hoặc bấm nút "← Danh sách" (BackLink).
// Vào danh sách từ menu như bình thường thì vẫn ở đầu trang.
import { useEffect } from "react";

const KEY = "ctit-scroll:";
const FLAG = "ctit-restore";
const MAX_AGE_MS = 30 * 60 * 1000;
const POP_WINDOW_MS = 3000;

let lastPop = 0;
if (typeof window !== "undefined") window.addEventListener("popstate", () => (lastPop = Date.now()));

const store = () => {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
};

export function saveScroll(base: string, search: string, y: number): void {
  store()?.setItem(KEY + base, JSON.stringify({ search, y: Math.round(y), at: Date.now() }));
}

/** BackLink gọi hàm này khi bấm, để danh sách biết cần trả lại vị trí cuộn. */
export function markRestore(base: string): void {
  store()?.setItem(FLAG, base);
}

/** Lấy (và xóa) vị trí cuộn đã nhớ nếu hợp lệ: cùng bộ lọc, còn mới, và đang quay lại chứ không phải vào mới. */
export function takeScroll(base: string, search: string): number | null {
  const s = store();
  if (!s) return null;
  const flagged = s.getItem(FLAG) === base;
  s.removeItem(FLAG);
  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  const returning = flagged || Date.now() - lastPop < POP_WINDOW_MS || nav?.type === "back_forward";
  const raw = s.getItem(KEY + base);
  s.removeItem(KEY + base);
  if (!returning || !raw) return null;
  try {
    const saved = JSON.parse(raw) as { search?: string; y?: number; at?: number };
    const fresh = typeof saved.at === "number" && Date.now() - saved.at < MAX_AGE_MS;
    return fresh && saved.search === search && Number.isFinite(saved.y) ? (saved.y as number) : null;
  } catch {
    return null;
  }
}

/**
 * Dùng trong trang danh sách. `ready` = đã đọc xong bộ lọc từ link và danh sách đã lọc xong.
 * Lưu vị trí cuộn lúc bấm sang trang khác; khi quay lại và `ready` thì cuộn về chỗ cũ.
 */
export function useScrollMemory(base: string, ready: boolean): void {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;
      const url = new URL(anchor.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname === window.location.pathname) return;
      saveScroll(base, window.location.search, window.scrollY);
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, [base]);

  useEffect(() => {
    if (!ready) return;
    const y = takeScroll(base, window.location.search);
    if (y === null) return;
    // Hai khung hình: đợi danh sách đã lọc vẽ xong rồi mới cuộn, nếu không sẽ bị kẹp ở đáy trang còn ngắn.
    let second = 0;
    const first = requestAnimationFrame(() => {
      second = requestAnimationFrame(() => window.scrollTo({ top: y, behavior: "auto" }));
    });
    return () => {
      cancelAnimationFrame(first);
      cancelAnimationFrame(second);
    };
  }, [ready, base]);
}
