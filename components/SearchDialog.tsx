"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { SEARCH_EVENT } from "@/components/SearchTrigger";
import { useSaved } from "@/lib/saved";
import { addHistory, clearHistory, readHistory, removeHistory } from "@/lib/search-history";
import { kindOrder, searchEntries, type SearchEntry, type SearchKind } from "@/lib/search";

type Scope = "all" | SearchKind;

// Gợi ý nhanh khi chưa gõ gì (giống "Quick start" của st.com).
const SUGGESTIONS = ["STM32", "ESP32", "CAN", "Tuyển sinh", "Khóa học"];

// Ô tìm kiếm toàn trang: bấm nút kính lúp ở header, hoặc Ctrl/⌘+K, hoặc phím "/".
// - Chỉ mục tải 1 lần khi mở lần đầu; ↑↓ chọn, Enter mở, Esc đóng.
// - Chip lọc theo loại (có số kết quả), lịch sử tìm kiếm và mục đã lưu (★) khi chưa gõ.
export function SearchDialog() {
  const router = useRouter();
  const { items: saved } = useSaved();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scope, setScope] = useState<Scope>("all");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const [history, setHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setScope("all");
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(target?.tagName || "") || target?.isContentEditable;
      if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    const onOpen = () => setOpen(true);
    addEventListener("keydown", onKey);
    addEventListener(SEARCH_EVENT, onOpen);
    return () => {
      removeEventListener("keydown", onKey);
      removeEventListener(SEARCH_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    setHistory(readHistory());
    inputRef.current?.focus();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open || index || failed) return;
    let cancelled = false;
    fetch("/api/search")
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: SearchEntry[]) => !cancelled && setIndex(data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [open, index, failed]);

  const typed = query.trim().length > 0;
  const results = useMemo(() => (index && typed ? searchEntries(index, query, 60) : []), [index, query, typed]);

  // Số kết quả theo từng loại, để hiện trên chip lọc.
  const counts = useMemo(() => {
    const map = new Map<SearchKind, number>();
    for (const entry of results) map.set(entry.kind, (map.get(entry.kind) ?? 0) + 1);
    return map;
  }, [results]);

  // Khi chưa gõ: gợi ý các trang chính.
  const shown = typed ? results.filter((entry) => scope === "all" || entry.kind === scope) : (index || []).filter((entry) => entry.kind === "Trang");

  // Nhóm theo loại nhưng đánh số liên tục để điều hướng bằng phím.
  const groups = kindOrder
    .map((kind) => ({ kind, items: shown.filter((entry) => entry.kind === kind) }))
    .filter((group) => group.items.length > 0);
  const ordered = groups.flatMap((group) => group.items);
  const position = new Map(ordered.map((entry, i) => [entry, i]));

  useEffect(() => setActive(0), [query, scope]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (entry: SearchEntry) => {
    if (typed) addHistory(query);
    close();
    if (entry.external) window.open(entry.href, "_blank", "noopener,noreferrer");
    else router.push(entry.href);
  };

  const pick = (value: string) => {
    setQuery(value);
    setScope("all");
    inputRef.current?.focus();
  };

  const onInputKey = (event: React.KeyboardEvent) => {
    if (event.key === "Escape") close();
    else if (event.key === "ArrowDown") {
      event.preventDefault();
      setActive((i) => Math.min(i + 1, ordered.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActive((i) => Math.max(i - 1, 0));
    } else if (event.key === "Enter" && ordered[active]) {
      event.preventDefault();
      go(ordered[active]);
    }
  };

  if (!open) return null;

  const scopes: { key: Scope; label: string; count: number }[] = [
    { key: "all", label: "Tất cả", count: results.length },
    ...kindOrder.filter((kind) => counts.has(kind)).map((kind) => ({ key: kind as Scope, label: kind, count: counts.get(kind) ?? 0 }))
  ];

  return (
    <div className="search-overlay" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && close()}>
      <div className="search-dialog" role="dialog" aria-modal="true" aria-label="Tìm kiếm trên CTIT">
        <div className="search-field">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Tìm trang, tài liệu, khóa học, vật tư, tin tức…"
            aria-label="Từ khóa tìm kiếm"
            autoComplete="off"
            spellCheck={false}
            maxLength={120}
          />
          {query ? <button type="button" className="search-clear" onClick={() => pick("")} aria-label="Xóa từ khóa">✕</button> : null}
          <button type="button" className="search-esc" onClick={close}>Esc</button>
        </div>

        {typed && scopes.length > 2 ? (
          <div className="search-scopes" role="tablist" aria-label="Lọc theo loại">
            {scopes.map((s) => (
              <button key={s.key} type="button" role="tab" aria-selected={scope === s.key} className={scope === s.key ? "is-active" : undefined} onClick={() => setScope(s.key)}>
                {s.label}<em>{s.count}</em>
              </button>
            ))}
          </div>
        ) : null}

        {!typed ? (
          <div className="search-start">
            {history.length > 0 ? (
              <section aria-label="Tìm gần đây">
                <header>
                  <h3>Tìm gần đây</h3>
                  <button type="button" className="link-reset" onClick={() => setHistory(clearHistory())}>Xóa tất cả</button>
                </header>
                <ul className="search-recent">
                  {history.map((item) => (
                    <li key={item}>
                      <button type="button" onClick={() => pick(item)}>{item}</button>
                      <button type="button" className="search-recent-x" aria-label={`Xóa “${item}” khỏi lịch sử`} onClick={() => setHistory(removeHistory(item))}>✕</button>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
            <section aria-label="Gợi ý">
              <header><h3>Gợi ý</h3></header>
              <ul className="search-recent is-suggest">
                {SUGGESTIONS.map((item) => <li key={item}><button type="button" onClick={() => pick(item)}>{item}</button></li>)}
              </ul>
            </section>
            {saved.length > 0 ? (
              <section aria-label="Đã lưu">
                <header>
                  <h3>★ Đã lưu</h3>
                  <Link href="/saved" className="link-reset" onClick={close}>Xem tất cả ({saved.length})</Link>
                </header>
                <ul className="search-saved">
                  {saved.slice(0, 4).map((item) => (
                    <li key={item.id}>
                      <Link href={item.href} onClick={close}><strong>{item.title}</strong>{item.sub ? <span>{item.sub}</span> : null}</Link>
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>
        ) : null}

        <ul className="search-results" ref={listRef} role="listbox">
          {failed ? <li className="search-note">Không tải được dữ liệu tìm kiếm. Thử lại sau ít phút.</li> : null}
          {!failed && !index ? <li className="search-note">Đang tải…</li> : null}
          {index && typed && ordered.length === 0 ? <li className="search-note">Không có kết quả cho “{query.trim()}”. Thử từ khóa ngắn hơn, ví dụ mã linh kiện.</li> : null}
          {groups.map((group) => (
            <li key={group.kind} role="presentation" className="search-group">
              <p>{group.kind}</p>
              <ul>
                {group.items.map((entry) => {
                  const i = position.get(entry)!;
                  return (
                    <li key={`${entry.kind}-${i}`} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={i === active}
                        data-i={i}
                        className={`search-item${i === active ? " is-active" : ""}`}
                        onMouseMove={() => setActive(i)}
                        onClick={() => go(entry)}
                      >
                        <span className="search-item-title">{entry.title}</span>
                        {entry.sub ? <span className="search-item-sub">{entry.sub}</span> : null}
                        <b aria-hidden="true">{entry.external ? "↗" : "→"}</b>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>

        <div className="search-foot" aria-hidden="true">
          <span><kbd>↑</kbd><kbd>↓</kbd> chọn</span>
          <span><kbd>Enter</kbd> mở</span>
          <span><kbd>Esc</kbd> đóng</span>
        </div>
      </div>
    </div>
  );
}
