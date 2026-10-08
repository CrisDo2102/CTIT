"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { InventoryIcon } from "@/components/icons";
import { SafeImage } from "@/components/SafeImage";
import { SaveButton } from "@/components/SaveButton";
import { toneOf } from "@/lib/format";
import { statusClass, statusLabel, type InventoryEntry } from "@/lib/inventory";

type SortKey = "title" | "category" | "manufacturer" | "model" | "quantity" | "location" | "status";
type Sort = { key: SortKey; dir: "asc" | "desc" } | null;
type View = "grid" | "table";

const MAX_COMPARE = 3;

// Cột của dạng bảng; cũng là danh sách để sắp xếp.
const columns: { key: SortKey; label: string; numeric?: boolean }[] = [
  { key: "title", label: "Tên" },
  { key: "category", label: "Danh mục" },
  { key: "manufacturer", label: "Hãng" },
  { key: "model", label: "Model" },
  { key: "quantity", label: "SL", numeric: true },
  { key: "location", label: "Vị trí" },
  { key: "status", label: "Trạng thái" }
];

const sortPresets: { value: string; label: string }[] = [
  { value: "", label: "Thứ tự trong Sheet" },
  { value: "title:asc", label: "Tên A → Z" },
  { value: "quantity:desc", label: "Số lượng nhiều → ít" },
  { value: "quantity:asc", label: "Số lượng ít → nhiều" },
  { value: "category:asc", label: "Danh mục A → Z" }
];

const sortValue = (sort: Sort) => (sort ? `${sort.key}:${sort.dir}` : "");
const parseSort = (raw: string | null): Sort => {
  const [key, dir] = (raw ?? "").split(":");
  return columns.some((col) => col.key === key) && (dir === "asc" || dir === "desc") ? { key: key as SortKey, dir } : null;
};

function sortItems(items: InventoryEntry[], sort: Sort): InventoryEntry[] {
  if (!sort) return items;
  const numeric = columns.find((col) => col.key === sort.key)?.numeric;
  const factor = sort.dir === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    if (numeric) return ((Number(a[sort.key]) || 0) - (Number(b[sort.key]) || 0)) * factor;
    return String(a[sort.key] ?? "").localeCompare(String(b[sort.key] ?? ""), "vi", { numeric: true, sensitivity: "base" }) * factor;
  });
}

export function InventoryExplorer({ initialItems }: { initialItems: InventoryEntry[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");
  const [view, setView] = useState<View>("grid");
  const [sort, setSort] = useState<Sort>(null);
  const [compare, setCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [ready, setReady] = useState(false);

  const categories = useMemo(() => [...new Set(initialItems.map((item) => item.category).filter(Boolean))], [initialItems]);
  const statuses = useMemo(() => [...new Set(initialItems.map((item) => item.status).filter(Boolean))], [initialItems]);

  // Đọc bộ lọc từ link (?q=&cat=&st=&view=&sort=) khi mở trang, để link gửi cho người khác ra đúng kết quả.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cat = params.get("cat");
    const st = params.get("st");
    setQuery(params.get("q") ?? "");
    setCategory(cat && categories.includes(cat) ? cat : "All");
    setStatus(st && statuses.includes(st) ? st : "All");
    setView(params.get("view") === "table" ? "table" : "grid");
    setSort(parseSort(params.get("sort")));
    setReady(true);
  }, [categories, statuses]);

  // Ghi bộ lọc ngược lại vào link (không thêm lịch sử trình duyệt).
  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "All") params.set("cat", category);
    if (status !== "All") params.set("st", status);
    if (view === "table") params.set("view", "table");
    if (sort) params.set("sort", sortValue(sort));
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [ready, query, category, status, view, sort]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    const list = initialItems.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesStatus = status === "All" || item.status === status;
      const haystack = [item.category, item.title, item.manufacturer, item.model, item.description, item.location, item.id].join(" ").toLowerCase();
      return matchesCategory && matchesStatus && (!keyword || haystack.includes(keyword));
    });
    return sortItems(list, sort);
  }, [initialItems, query, category, status, sort]);

  const totalQuantity = initialItems.reduce((sum, item) => sum + (Number.isFinite(item.quantity) ? item.quantity : 0), 0);
  const availableCount = initialItems.filter((item) => /available|có sẵn|sẵn sàng|in stock/i.test(item.status)).length;
  const lowCount = initialItems.filter((item) => /low|thấp|sắp|limited/i.test(item.status)).length;
  const filtering = Boolean(query) || category !== "All" || status !== "All";

  const compared = compare.map((slug) => initialItems.find((item) => item.slug === slug)).filter((item): item is InventoryEntry => Boolean(item));
  const toggleCompare = (slug: string) =>
    setCompare((current) => (current.includes(slug) ? current.filter((entry) => entry !== slug) : current.length >= MAX_COMPARE ? current : [...current, slug]));
  const compareFull = compare.length >= MAX_COMPARE;

  function reset() {
    setQuery("");
    setCategory("All");
    setStatus("All");
  }

  // Bấm tiêu đề cột: lần 1 tăng dần, lần 2 giảm dần, lần 3 về thứ tự trong Sheet.
  function sortBy(key: SortKey) {
    setSort((current) => {
      if (!current || current.key !== key) return { key, dir: "asc" };
      return current.dir === "asc" ? { key, dir: "desc" } : null;
    });
  }

  const saveItem = (item: InventoryEntry) => ({
    id: `vat-tu:${item.slug}`,
    kind: "Vật tư",
    title: item.title,
    sub: [item.category, item.model].filter(Boolean).join(" · "),
    href: `/resources/inventory/${item.slug}`
  });

  const compareBox = (item: InventoryEntry) => {
    const checked = compare.includes(item.slug);
    return (
      <label className={`compare-check${checked ? " is-checked" : ""}`} title={checked ? "Bỏ khỏi so sánh" : compareFull ? `Tối đa ${MAX_COMPARE} món` : "Thêm vào so sánh"}>
        <input type="checkbox" checked={checked} disabled={!checked && compareFull} onChange={() => toggleCompare(item.slug)} aria-label={`So sánh: ${item.title}`} />
        <span>So sánh</span>
      </label>
    );
  };

  return (
    <>
      <div className="inventory-overview">
        <div className="inventory-kpi"><span>Danh mục</span><strong>{initialItems.length}</strong><small>mặt hàng</small></div>
        <div className="inventory-kpi"><span>Tổng số lượng</span><strong>{totalQuantity}</strong><small>đơn vị</small></div>
        <div className="inventory-kpi"><span>Đang có sẵn</span><strong>{availableCount}</strong><small>mặt hàng</small></div>
        <div className="inventory-kpi inventory-kpi-alert"><span>Sắp hết</span><strong>{lowCount}</strong><small>cần kiểm tra</small></div>
      </div>

      <div className="inventory-toolbar">
        <div className="resource-search inventory-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><line x1="16.5" y1="16.5" x2="21" y2="21" /></svg>
          <input className="input" type="search" placeholder="Tìm STM32, ESP32, CAN, Hakko..." value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        {categories.length > 0 ? (
          <div className="inventory-filter-row">
            <span className="chip-group-label">Danh mục</span>
            <div className="type-chips compact-chips">
              <button type="button" className={`chip ${category === "All" ? "is-active" : ""}`} onClick={() => setCategory("All")}>Tất cả <em>{initialItems.length}</em></button>
              {categories.map((item) => <button type="button" className={`chip ${category === item ? "is-active" : ""}`} key={item} onClick={() => setCategory(item)}>{item}</button>)}
            </div>
          </div>
        ) : null}
        {statuses.length > 1 ? (
          <div className="inventory-filter-row">
            <span className="chip-group-label">Trạng thái</span>
            <div className="type-chips compact-chips">
              <button type="button" className={`chip ${status === "All" ? "is-active" : ""}`} onClick={() => setStatus("All")}>Tất cả</button>
              {statuses.map((item) => <button type="button" className={`chip ${status === item ? "is-active" : ""}`} key={item} onClick={() => setStatus(item)}>{statusLabel(item)}</button>)}
            </div>
          </div>
        ) : null}
      </div>

      <div className="inventory-result-line">
        <span><strong>{filtered.length}</strong> / {initialItems.length} mặt hàng</span>
        <div className="inventory-view-tools">
          {filtering ? <button type="button" className="link-reset" onClick={reset}>Xoá bộ lọc</button> : null}
          <label className="inventory-sort">
            <span>Sắp xếp</span>
            <select value={sortValue(sort)} onChange={(e) => setSort(parseSort(e.target.value))}>
              {sortPresets.map((preset) => <option key={preset.value} value={preset.value}>{preset.label}</option>)}
              {sort && !sortPresets.some((preset) => preset.value === sortValue(sort)) ? (
                <option value={sortValue(sort)}>Theo cột: {columns.find((col) => col.key === sort.key)?.label} {sort.dir === "asc" ? "↑" : "↓"}</option>
              ) : null}
            </select>
          </label>
          <div className="view-toggle" role="group" aria-label="Kiểu hiển thị">
            <button type="button" className={view === "grid" ? "is-active" : undefined} aria-pressed={view === "grid"} onClick={() => setView("grid")}>Thẻ</button>
            <button type="button" className={view === "table" ? "is-active" : undefined} aria-pressed={view === "table"} onClick={() => setView("table")}>Bảng</button>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><InventoryIcon /> Chưa có mặt hàng phù hợp. Thử xoá bộ lọc hoặc đổi từ khóa tìm kiếm.</div>
      ) : view === "table" ? (
        <div className="inventory-table-wrap">
          <table className="inventory-table">
            <thead>
              <tr>
                <th scope="col" className="col-tools"><span className="sr-only">So sánh và lưu</span></th>
                {columns.map((col) => {
                  const active = sort?.key === col.key;
                  return (
                    <th key={col.key} scope="col" className={col.numeric ? "is-num" : undefined} aria-sort={active ? (sort.dir === "asc" ? "ascending" : "descending") : "none"}>
                      <button type="button" onClick={() => sortBy(col.key)}>
                        {col.label}<i aria-hidden="true">{active ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</i>
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.slug}>
                  <td className="col-tools">
                    <div className="row-tools">
                      {compareBox(item)}
                      <SaveButton item={saveItem(item)} />
                    </div>
                  </td>
                  <td><Link href={`/resources/inventory/${item.slug}`} className="row-title">{item.title}</Link></td>
                  <td>{item.category || "—"}</td>
                  <td>{item.manufacturer || "—"}</td>
                  <td>{item.model || "—"}</td>
                  <td className="is-num">{item.quantity}</td>
                  <td>{item.location || "—"}</td>
                  <td><span className={statusClass(item.status)}>{statusLabel(item.status)}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid three inventory-grid">
          {filtered.map((item) => (
            <article className="card inventory-card" key={item.slug}>
              <div className="inventory-image">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  fallback={<div className="inventory-image-fallback" style={{ ["--tone" as string]: `${toneOf(item.title)}` }}><InventoryIcon /></div>}
                />
                <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
                <SaveButton item={saveItem(item)} className="on-image" />
              </div>
              <div className="inventory-card-body">
                <div className="inventory-card-meta"><span>{item.category || "Chưa phân loại"}</span>{item.model ? <span>{item.model}</span> : null}</div>
                <h3><Link href={`/resources/inventory/${item.slug}`}>{item.title}</Link></h3>
                {item.manufacturer ? <p className="inventory-maker">{item.manufacturer}</p> : null}
                {item.description ? <p>{item.description}</p> : null}
                <div className="inventory-facts">
                  <span><b>{item.quantity}</b> {item.unit || "đơn vị"}</span>
                  {item.location ? <span>{item.location}</span> : null}
                </div>
                {item.currentUser ? <div className="inventory-user"><span>Đang sử dụng</span><strong>{item.currentUser}</strong></div> : null}
                <div className="inventory-actions">
                  <div className="inventory-link-group">
                    {item.datasheet ? <a className="btn secondary" href={item.datasheet} target="_blank" rel="noreferrer">Datasheet</a> : null}
                    {item.purchaseUrl ? <a className="btn ghost" href={item.purchaseUrl} target="_blank" rel="noreferrer">Nơi mua</a> : null}
                  </div>
                  {compareBox(item)}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {compared.length > 0 ? (
        <div className="compare-bar" role="region" aria-label="So sánh vật tư">
          <span><strong>{compared.length}</strong>/{MAX_COMPARE} món để so sánh</span>
          <div>
            <button type="button" className="btn" disabled={compared.length < 2} onClick={() => setComparing(true)}>{compared.length < 2 ? "Chọn thêm 1 món" : "So sánh"}</button>
            <button type="button" className="btn ghost" onClick={() => setCompare([])}>Bỏ chọn</button>
          </div>
        </div>
      ) : null}

      {comparing && compared.length >= 2 ? <CompareDialog items={compared} onClose={() => setComparing(false)} onRemove={toggleCompare} /> : null}
    </>
  );
}

function CompareDialog({ items, onClose, onRemove }: { items: InventoryEntry[]; onClose: () => void; onRemove: (slug: string) => void }) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose]);

  const rows: { label: string; render: (item: InventoryEntry) => React.ReactNode }[] = [
    { label: "Danh mục", render: (item) => item.category || "—" },
    { label: "Hãng", render: (item) => item.manufacturer || "—" },
    { label: "Model", render: (item) => item.model || "—" },
    { label: "Mô tả", render: (item) => item.description || "—" },
    { label: "Số lượng", render: (item) => `${item.quantity} ${item.unit || ""}`.trim() },
    { label: "Vị trí", render: (item) => item.location || "—" },
    { label: "Trạng thái", render: (item) => <span className={statusClass(item.status)}>{statusLabel(item.status)}</span> },
    { label: "Đang sử dụng", render: (item) => item.currentUser || "—" },
    { label: "Datasheet", render: (item) => (item.datasheet ? <a href={item.datasheet} target="_blank" rel="noreferrer">Mở datasheet ↗</a> : "—") },
    { label: "Nơi mua", render: (item) => (item.purchaseUrl ? <a href={item.purchaseUrl} target="_blank" rel="noreferrer">Mở link ↗</a> : "—") }
  ];

  return (
    <div className="compare-overlay" role="dialog" aria-modal="true" aria-label="So sánh vật tư" onClick={onClose}>
      <div className="compare-panel" onClick={(event) => event.stopPropagation()}>
        <div className="compare-head">
          <h2>So sánh {items.length} vật tư</h2>
          <button type="button" className="compare-close" onClick={onClose} aria-label="Đóng so sánh">✕</button>
        </div>
        <div className="compare-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th scope="col"><span className="sr-only">Thông số</span></th>
                {items.map((item) => (
                  <th key={item.slug} scope="col">
                    <Link href={`/resources/inventory/${item.slug}`}>{item.title}</Link>
                    <button type="button" onClick={() => onRemove(item.slug)} aria-label={`Bỏ ${item.title} khỏi so sánh`}>Bỏ</button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.label}>
                  <th scope="row">{row.label}</th>
                  {items.map((item) => <td key={item.slug}>{row.render(item)}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
