"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { kindOrder, searchEntries, type SearchEntry } from "@/lib/search";

// Ô tìm kiếm toàn trang: bấm kính lúp hoặc Ctrl/⌘+K (hoặc "/") để mở.
// Chỉ mục tải 1 lần khi mở lần đầu; ↑↓ chọn, Enter mở, Esc đóng.
export function SearchDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState<SearchEntry[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const close = useCallback(() => {
    setOpen(false);
    setQuery("");
    setActive(0);
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test((event.target as HTMLElement)?.tagName || "") || (event.target as HTMLElement)?.isContentEditable;
      if ((event.key === "k" || event.key === "K") && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        setOpen((v) => !v);
      } else if (event.key === "/" && !typing && !event.ctrlKey && !event.metaKey) {
        event.preventDefault();
        setOpen(true);
      }
    };
    addEventListener("keydown", onKey);
    return () => removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) return;
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

  const results = useMemo(() => (index ? searchEntries(index, query) : []), [index, query]);
  // Khi chưa gõ: gợi ý các trang chính.
  const shown = query.trim() ? results : (index || []).filter((e) => e.kind === "Trang");

  // Nhóm theo loại nhưng đánh số liên tục để điều hướng bằng phím.
  const groups = kindOrder
    .map((kind) => ({ kind, items: shown.filter((entry) => entry.kind === kind) }))
    .filter((g) => g.items.length > 0);
  const ordered = groups.flatMap((g) => g.items);
  const position = new Map(ordered.map((entry, i) => [entry, i]));

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (entry: SearchEntry) => {
    close();
    if (entry.external) window.open(entry.href, "_blank", "noopener,noreferrer");
    else router.push(entry.href);
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

  return (
    <>
      <button type="button" className="search-trigger" onClick={() => setOpen(true)} aria-label="Tìm kiếm (Ctrl+K)">
        <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
        <span className="search-trigger-text">Tìm kiếm</span>
        <kbd>Ctrl K</kbd>
      </button>

      {open ? (
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
              />
              <button type="button" className="search-esc" onClick={close}>Esc</button>
            </div>

            <ul className="search-results" ref={listRef} role="listbox">
              {failed ? <li className="search-note">Không tải được dữ liệu tìm kiếm. Thử lại sau ít phút.</li> : null}
              {!failed && !index ? <li className="search-note">Đang tải…</li> : null}
              {index && query.trim() && ordered.length === 0 ? <li className="search-note">Không có kết quả cho “{query.trim()}”.</li> : null}
              {groups.map((g) => (
                <li key={g.kind} role="presentation" className="search-group">
                  <p>{g.kind}</p>
                  <ul>
                    {g.items.map((entry) => {
                      const i = position.get(entry)!;
                      return (
                        <li key={`${entry.kind}-${entry.href}-${entry.title}`} role="presentation">
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
      ) : null}
    </>
  );
}
