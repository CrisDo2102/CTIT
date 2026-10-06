"use client";

import { useMemo, useState } from "react";
import { ResourceCard } from "@/components/ResourceCard";
import type { Resource, ResourceType } from "@/data/resources";
import { resourceTypes } from "@/data/resources";

type Props = {
  initialResources: Resource[];
};

export function ResourceExplorer({ initialResources }: Props) {
  const [query, setQuery] = useState("");
  const [type, setType] = useState<ResourceType | "All">("All");
  const [category, setCategory] = useState<string | "All">("All");

  const countByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const resource of initialResources) {
      map.set(resource.type, (map.get(resource.type) ?? 0) + 1);
    }
    return map;
  }, [initialResources]);

  // Danh sach loai hien lam chip: uu tien dung thu tu chuan trong
  // resourceTypes, loai nao sheet co nhung khong khop enum (go nham chinh
  // ta, vd "Paper") van duoc gom vao cuoi thay vi bi an mat khoi bo loc.
  const presentTypes = useMemo(() => {
    const known = resourceTypes.filter((item) => countByType.has(item));
    const extra = Array.from(countByType.keys())
      .filter((item) => !resourceTypes.includes(item as ResourceType))
      .sort((a, b) => a.localeCompare(b));
    return [...known, ...extra];
  }, [countByType]);

  const countByCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const resource of initialResources) {
      if (!resource.category) continue;
      map.set(resource.category, (map.get(resource.category) ?? 0) + 1);
    }
    return map;
  }, [initialResources]);

  // Muc lon hien lam chip theo dung thu tu no xuat hien trong sheet (khong
  // sap A-Z, khong co danh sach cung). Dong nao de trong Muc lon thi khong
  // sinh chip rieng, van nam trong "Tat ca" cho toi khi sheet dien vao.
  const presentCategories = useMemo(() => {
    const seen: string[] = [];
    for (const resource of initialResources) {
      if (resource.category && !seen.includes(resource.category)) {
        seen.push(resource.category);
      }
    }
    return seen;
  }, [initialResources]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return initialResources.filter((resource) => {
      const matchesType = type === "All" || resource.type === type;
      const matchesCategory = category === "All" || resource.category === category;
      const haystack = [
        resource.title,
        resource.description,
        resource.category,
        resource.topic,
        resource.level,
        resource.source,
        resource.type
      ]
        .join(" ")
        .toLowerCase();

      return matchesType && matchesCategory && (!keyword || haystack.includes(keyword));
    });
  }, [initialResources, query, type, category]);

  const hasFilter = query.trim() !== "" || type !== "All" || category !== "All";

  // Khu "Noi bat" chi hien o man mac dinh (chua go tim/loc gi) - luc dang loc
  // thi nguoi dùng dang tim thu cu the, khong can spotlight lam roi mat.
  const spotlight = hasFilter ? [] : initialResources.filter((resource) => resource.featured);

  function resetFilters() {
    setQuery("");
    setType("All");
    setCategory("All");
  }

  return (
    <>
      {spotlight.length > 0 ? (
        <div className="resource-spotlight">
          <div className="chip-group-label">Nổi bật</div>
          <div className="grid three">
            {spotlight.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} spotlight />
            ))}
          </div>
        </div>
      ) : null}

      <div className="resource-toolbar">
        <div className="resource-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <line x1="16.5" y1="16.5" x2="21" y2="21" />
          </svg>
          <input
            className="input"
            type="search"
            placeholder="Tìm datasheet, GitHub, I2C, CAN, BMS..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>

        {presentCategories.length > 1 ? (
          <div className="chip-group">
            <span className="chip-group-label">Lĩnh vực</span>
            <div className="type-chips" role="tablist" aria-label="Lọc theo lĩnh vực">
              <button
                type="button"
                role="tab"
                aria-selected={category === "All"}
                className={`chip ${category === "All" ? "is-active" : ""}`}
                onClick={() => setCategory("All")}
              >
                Tất cả
                <em>{initialResources.length}</em>
              </button>
              {presentCategories.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={category === item}
                  className={`chip ${category === item ? "is-active" : ""}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                  <em>{countByCategory.get(item) ?? 0}</em>
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {presentTypes.length > 1 ? (
          <div className="chip-group">
            {presentCategories.length > 1 ? <span className="chip-group-label">Loại</span> : null}
            <div className="type-chips" role="tablist" aria-label="Lọc theo loại tài liệu">
              <button
                type="button"
                role="tab"
                aria-selected={type === "All"}
                className={`chip ${type === "All" ? "is-active" : ""}`}
                onClick={() => setType("All")}
              >
                Tất cả
                <em>{initialResources.length}</em>
              </button>
              {presentTypes.map((item) => (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={type === item}
                  className={`chip ${type === item ? "is-active" : ""}`}
                  onClick={() => setType(item as ResourceType)}
                >
                  {item}
                  <em>{countByType.get(item) ?? 0}</em>
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {initialResources.length === 0 ? (
        <div className="empty-state">
          Chưa có dữ liệu tài liệu. Kiểm tra biến môi trường{" "}
          <code>RESOURCES_SHEET_CSV_URL</code> trong <code>.env.local</code>.
        </div>
      ) : (
        <>
          <p className="result-line">
            <span>
              <strong>{filtered.length}</strong> / {initialResources.length} tài liệu
            </span>
            {hasFilter ? (
              <button type="button" className="link-reset" onClick={resetFilters}>
                Xoá bộ lọc
              </button>
            ) : null}
          </p>

          <div className="grid three">
            {filtered.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state">
              Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại.
              <button type="button" className="btn ghost empty-reset" onClick={resetFilters}>
                Xoá bộ lọc
              </button>
            </div>
          ) : null}
        </>
      )}
    </>
  );
}
