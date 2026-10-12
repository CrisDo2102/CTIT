"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSaved, type SavedItem } from "@/lib/saved";

const isExternal = (href: string) => /^https?:\/\//i.test(href);

type Sort = "recent" | "oldest" | "az";

// "hôm nay", "3 ngày trước", "2 tháng trước"...
function ago(at: number): string {
  if (!at) return "";
  const days = Math.floor((Date.now() - at) / 86_400_000);
  if (days <= 0) return "Lưu hôm nay";
  if (days === 1) return "Lưu hôm qua";
  if (days < 30) return `Lưu ${days} ngày trước`;
  if (days < 365) return `Lưu ${Math.floor(days / 30)} tháng trước`;
  return `Lưu ${Math.floor(days / 365)} năm trước`;
}

// Trang "Đã lưu": tìm trong danh sách, lọc theo nhóm, sắp xếp, chọn nhiều để bỏ lưu, sao chép / tải danh sách,
// và "Hoàn tác" ngay sau khi bỏ lưu (không còn hộp xác nhận). Dữ liệu chỉ nằm trong trình duyệt này.
export function SavedList() {
  const { items, removeMany, restore, clear } = useSaved();
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [sort, setSort] = useState<Sort>("recent");
  const [selecting, setSelecting] = useState(false);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [undo, setUndo] = useState<{ items: SavedItem[] } | null>(null);
  const [copied, setCopied] = useState(false);
  const undoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (copyTimer.current) clearTimeout(copyTimer.current);
  }, []);

  const kinds = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of items) map.set(item.kind, (map.get(item.kind) ?? 0) + 1);
    return [...map.entries()];
  }, [items]);

  // Nhóm đang chọn không còn mục nào (vừa bỏ lưu hết) thì quay về "Tất cả".
  useEffect(() => {
    if (kind !== "all" && !kinds.some(([name]) => name === kind)) setKind("all");
  }, [kinds, kind]);

  const visible = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const list = items.filter((item) => (kind === "all" || item.kind === kind) && (!keyword || `${item.title} ${item.sub}`.toLowerCase().includes(keyword)));
    if (sort === "az") return [...list].sort((a, b) => a.title.localeCompare(b.title, "vi"));
    if (sort === "oldest") return [...list].sort((a, b) => a.at - b.at);
    return [...list].sort((a, b) => b.at - a.at);
  }, [items, query, kind, sort]);

  const groups = useMemo(() => {
    const byKind = new Map<string, SavedItem[]>();
    for (const item of visible) {
      const list = byKind.get(item.kind);
      if (list) list.push(item);
      else byKind.set(item.kind, [item]);
    }
    return [...byKind].map(([name, items]) => ({ name, items }));
  }, [visible]);

  const offerUndo = (removed: SavedItem[]) => {
    if (removed.length === 0) return;
    setUndo({ items: removed });
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndo(null), 8000);
  };

  const removeItems = (targets: SavedItem[]) => {
    removeMany(targets.map((item) => item.id));
    setPicked(new Set());
    offerUndo(targets);
  };

  const togglePick = (id: string) =>
    setPicked((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const absolute = (href: string) => (isExternal(href) ? href : `${window.location.origin}${href}`);
  const asText = () => visible.map((item) => `- ${item.title}${item.sub ? ` (${item.sub})` : ""}: ${absolute(item.href)}`).join("\n");

  const copyList = async () => {
    try {
      await navigator.clipboard.writeText(asText());
      setCopied(true);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      window.alert("Không sao chép được. Hãy dùng nút Tải về.");
    }
  };

  const download = () => {
    const blob = new Blob([`# CTIT: danh sách đã lưu\n\n${asText()}\n`], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "ctit-da-luu.md";
    link.click();
    URL.revokeObjectURL(url);
  };

    const undoBar = undo ? (
        <div className="saved-undo" role="status" aria-live="polite">
          <span>Đã bỏ lưu {undo.items.length} mục</span>
          <button type="button" onClick={() => { restore(undo.items); setUndo(null); }}>Hoàn tác</button>
        </div>
  ) : null;

  if (items.length === 0) {
    return (
      <>
      <div className="empty-state">
        Chưa lưu mục nào. Bấm ★ ở vật tư, tài liệu hoặc khóa học để lưu lại, danh sách chỉ nằm trong trình duyệt này.
        <div className="saved-empty-links">
          <Link className="btn secondary" href="/resources/inventory">Xem Inventory</Link>
          <Link className="btn secondary" href="/resources/documents">Xem Tài liệu</Link>
          <Link className="btn secondary" href="/resources/courses">Xem Khóa học</Link>
        </div>
      </div>
      {undoBar}
      </>
    );
  }

  const pickedItems = visible.filter((item) => picked.has(item.id));

  return (
    <>
      <div className="saved-bar">
        <div className="resource-search saved-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
          <input className="input" type="search" placeholder="Tìm trong danh sách đã lưu..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Tìm trong mục đã lưu" />
        </div>
        <label className="doc-sort">
          <span className="sr-only">Sắp xếp</span>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Sắp xếp mục đã lưu">
            <option value="recent">Mới lưu trước</option>
            <option value="oldest">Cũ nhất trước</option>
            <option value="az">Tên A → Z</option>
          </select>
        </label>
      </div>

      {kinds.length > 1 ? (
        <div className="type-chips saved-kinds" role="tablist" aria-label="Lọc theo nhóm">
          <button type="button" role="tab" aria-selected={kind === "all"} className={`chip${kind === "all" ? " is-active" : ""}`} onClick={() => setKind("all")}>Tất cả <em>{items.length}</em></button>
          {kinds.map(([name, count]) => (
            <button key={name} type="button" role="tab" aria-selected={kind === name} className={`chip${kind === name ? " is-active" : ""}`} onClick={() => setKind(name)}>{name} <em>{count}</em></button>
          ))}
        </div>
      ) : null}

      <div className="saved-head">
        <span><strong>{visible.length}</strong>{visible.length !== items.length ? ` / ${items.length}` : ""} mục đã lưu</span>
        <span className="saved-actions">
          {selecting ? (
            <>
              <button type="button" className="link-reset" onClick={() => setPicked(picked.size === visible.length ? new Set() : new Set(visible.map((item) => item.id)))}>
                {picked.size === visible.length && visible.length > 0 ? "Bỏ chọn hết" : "Chọn tất cả"}
              </button>
              <button type="button" className="saved-danger" disabled={pickedItems.length === 0} onClick={() => removeItems(pickedItems)}>Bỏ lưu ({pickedItems.length})</button>
              <button type="button" className="link-reset" onClick={() => { setSelecting(false); setPicked(new Set()); }}>Xong</button>
            </>
          ) : (
            <>
              <button type="button" className="link-reset" onClick={copyList} disabled={visible.length === 0}>{copied ? "Đã sao chép ✓" : "Sao chép danh sách"}</button>
              <button type="button" className="link-reset" onClick={download} disabled={visible.length === 0}>Tải về (.md)</button>
              <button type="button" className="link-reset" onClick={() => setSelecting(true)}>Chọn nhiều</button>
              <button type="button" className="link-reset" onClick={() => { const all = items; clear(); offerUndo(all); }}>Xóa tất cả</button>
            </>
          )}
        </span>
      </div>

      {visible.length === 0 ? <div className="empty-state">Không có mục nào khớp “{query.trim()}”.</div> : null}

      {groups.map((group) => (
        <section key={group.name} className="saved-group">
          <h2>{group.name} <em>{group.items.length}</em></h2>
          <ul>
            {group.items.map((item) => {
              const body = (
                <>
                  <strong>{item.title}</strong>
                  {item.sub ? <span>{item.sub}</span> : null}
                  {item.at ? <small className="saved-when">{ago(item.at)}</small> : null}
                </>
              );
              return (
                <li key={item.id} className={picked.has(item.id) ? "is-picked" : undefined}>
                  {selecting ? (
                    <label className="saved-pick">
                      <input type="checkbox" checked={picked.has(item.id)} onChange={() => togglePick(item.id)} aria-label={`Chọn: ${item.title}`} />
                      <span className="saved-pick-body">{body}</span>
                    </label>
                  ) : isExternal(item.href) ? (
                    <a href={item.href} target="_blank" rel="noopener noreferrer">{body}</a>
                  ) : (
                    <Link href={item.href}>{body}</Link>
                  )}
                  {!selecting ? <button type="button" onClick={() => removeItems([item])} aria-label={`Bỏ lưu: ${item.title}`}>Bỏ lưu</button> : null}
                </li>
              );
            })}
          </ul>
        </section>
      ))}

      {undoBar}
    </>
  );
}
