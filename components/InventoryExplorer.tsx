"use client";

import { useMemo, useState } from "react";
import { SafeImage } from "@/components/SafeImage";
import type { InventoryItem } from "@/lib/sheet-data";
import { toneOf } from "@/lib/format";
import { InventoryIcon } from "@/components/icons";

function statusLabel(status: string) {
  const value = status.trim().toLowerCase();
  if (!value) return "Chưa cập nhật";
  if (/(out|hết|empty|unavailable|unavailable)/.test(value)) return "Hết hàng";
  if (/(low|thấp|sắp|limited)/.test(value)) return "Sắp hết";
  if (/(borrow|mượn|repair|sửa|maintenance)/.test(value)) return status;
  return status;
}

function statusClass(status: string) {
  const value = status.trim().toLowerCase();
  if (/(out|hết|empty|unavailable)/.test(value)) return "inventory-status is-out";
  if (/(low|thấp|sắp|limited)/.test(value)) return "inventory-status is-low";
  if (/(borrow|mượn|repair|sửa|maintenance)/.test(value)) return "inventory-status is-warn";
  return "inventory-status is-ok";
}

export function InventoryExplorer({ initialItems }: { initialItems: InventoryItem[] }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [status, setStatus] = useState("All");

  const categories = useMemo(() => {
    const seen: string[] = [];
    initialItems.forEach((item) => {
      if (item.category && !seen.includes(item.category)) seen.push(item.category);
    });
    return seen;
  }, [initialItems]);

  const statuses = useMemo(() => {
    const seen: string[] = [];
    initialItems.forEach((item) => {
      if (item.status && !seen.includes(item.status)) seen.push(item.status);
    });
    return seen;
  }, [initialItems]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return initialItems.filter((item) => {
      const matchesCategory = category === "All" || item.category === category;
      const matchesStatus = status === "All" || item.status === status;
      const haystack = [item.category, item.title, item.manufacturer, item.model, item.description, item.location, item.id]
        .join(" ")
        .toLowerCase();
      return matchesCategory && matchesStatus && (!keyword || haystack.includes(keyword));
    });
  }, [initialItems, query, category, status]);

  const totalQuantity = initialItems.reduce((sum, item) => sum + (Number.isFinite(item.quantity) ? item.quantity : 0), 0);
  const availableCount = initialItems.filter((item) => /available|có sẵn|sẵn sàng|in stock/i.test(item.status)).length;
  const lowCount = initialItems.filter((item) => /low|thấp|sắp|limited/i.test(item.status)).length;

  function reset() {
    setQuery("");
    setCategory("All");
    setStatus("All");
  }

  return (
    <>
      <div className="inventory-overview">
        <div className="inventory-kpi">
          <span>Danh mục</span><strong>{initialItems.length}</strong><small>mặt hàng</small>
        </div>
        <div className="inventory-kpi">
          <span>Tổng số lượng</span><strong>{totalQuantity}</strong><small>đơn vị</small>
        </div>
        <div className="inventory-kpi">
          <span>Đang có sẵn</span><strong>{availableCount}</strong><small>mặt hàng</small>
        </div>
        <div className="inventory-kpi inventory-kpi-alert">
          <span>Sắp hết</span><strong>{lowCount}</strong><small>cần kiểm tra</small>
        </div>
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
        {(query || category !== "All" || status !== "All") ? <button type="button" className="link-reset" onClick={reset}>Xoá bộ lọc</button> : null}
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state"><InventoryIcon /> Chưa có mặt hàng phù hợp. Kiểm tra dữ liệu I:S trong Sheet Inventory hoặc xoá bộ lọc.</div>
      ) : (
        <div className="grid three inventory-grid">
          {filtered.map((item) => (
            <article className="card inventory-card" key={item.id + item.title}>
              <div className="inventory-image">
                <SafeImage
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  fallback={<div className="inventory-image-fallback" style={{ ["--tone" as string]: `${toneOf(item.title)}` }}><InventoryIcon /></div>}
                />
                <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
              </div>
              <div className="inventory-card-body">
                <div className="inventory-card-meta"><span>{item.category || "Chưa phân loại"}</span>{item.model ? <span>{item.model}</span> : null}</div>
                <h3>{item.title}</h3>
                {item.manufacturer ? <p className="inventory-maker">{item.manufacturer}</p> : null}
                {item.description ? <p>{item.description}</p> : null}
                <div className="inventory-facts">
                  <span><b>{item.quantity}</b> {item.unit || "đơn vị"}</span>
                  {item.location ? <span>{item.location}</span> : null}
                </div>
                {item.currentUser ? (
                  <div className="inventory-user"><span>Đang sử dụng</span><strong>{item.currentUser}</strong></div>
                ) : null}
                <div className="inventory-actions">
                  <div className="inventory-link-group">
                    {item.datasheet ? <a className="btn secondary" href={item.datasheet} target="_blank" rel="noreferrer">Datasheet</a> : null}
                    {item.purchaseUrl ? <a className="btn ghost" href={item.purchaseUrl} target="_blank" rel="noreferrer">Nơi mua</a> : null}
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
