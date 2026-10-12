"use client";

import { useEffect, useMemo, useState } from "react";
import { FacetGroup } from "@/components/FacetGroup";
import { countSelected, emptySelected, readSelected, runFacets, toggleValue, uniqueValues, writeSelected, type Getters, type Selected } from "@/lib/facets";
import { ResourceCard } from "@/components/ResourceCard";
import type { Resource } from "@/data/resources";
import { resourceTypes } from "@/data/resources";
import { useSaved } from "@/lib/saved";

type Props = {
  initialResources: Resource[];
};

// Bộ lọc nhiều lựa chọn kiểu product selector của st.com (cùng logic với Inventory: lib/facets.ts).
const FACET_KEYS = ["cat", "type", "level", "source"] as const;
type FacetKey = (typeof FACET_KEYS)[number];
type Sort = "sheet" | "az" | "za";
const GET: Getters<Resource, FacetKey> = { cat: (r) => r.category ?? "", type: (r) => r.type, level: (r) => r.level, source: (r) => r.source };
const TITLE: Record<FacetKey, string> = { cat: "Lĩnh vực", type: "Loại", level: "Cấp độ", source: "Nguồn" };
const PARAM: Record<FacetKey, string> = { cat: "cat", type: "type", level: "lv", source: "src" };
const NONE = emptySelected(FACET_KEYS);
const savedId = (resource: Resource) => `tai-lieu:${resource.url || resource.title}`;

export function ResourceExplorer({ initialResources }: Props) {
  const { has } = useSaved();
  const [query, setQuery] = useState("");
  const [facets, setFacets] = useState<Selected<FacetKey>>(NONE);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sort, setSort] = useState<Sort>("sheet");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [ready, setReady] = useState(false);

  // Giá trị của từng nhóm. Lĩnh vực giữ đúng thứ tự trong Sheet; Loại theo thứ tự chuẩn rồi tới loại lạ
  // (gõ nhầm chính tả vẫn có ô lọc, không bị ẩn); Cấp độ và Nguồn theo thứ tự xuất hiện.
  const options = useMemo(() => {
    const types = uniqueValues(initialResources, GET.type);
    const extraTypes = types.filter((item) => !resourceTypes.includes(item)).sort((a, b) => a.localeCompare(b));
    return {
      cat: uniqueValues(initialResources, GET.cat),
      type: [...resourceTypes.filter((item) => types.includes(item)), ...extraTypes],
      level: uniqueValues(initialResources, GET.level),
      source: uniqueValues(initialResources, GET.source)
    };
  }, [initialResources]);

  const haystacks = useMemo(
    () => new Map(initialResources.map((resource) => [resource.id, [resource.title, resource.description, resource.category, resource.topic, resource.level, resource.source, resource.type].join(" ").toLowerCase()])),
    [initialResources]
  );

  // Đọc bộ lọc từ link (?q=&cat=&type=&lv=&src=&saved=1&sort=) để gửi link ra đúng kết quả.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setQuery(params.get("q") ?? "");
    setFacets(readSelected(params, FACET_KEYS, PARAM, options));
    setSavedOnly(params.get("saved") === "1");
    const wanted = params.get("sort");
    setSort(wanted === "az" || wanted === "za" ? wanted : "sheet");
    setReady(true);
  }, [options]);

  useEffect(() => {
    if (!ready) return;
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    writeSelected(params, FACET_KEYS, PARAM, facets);
    if (savedOnly) params.set("saved", "1");
    if (sort !== "sheet") params.set("sort", sort);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [ready, query, facets, savedOnly, sort]);

  const keyword = query.trim().toLowerCase();
  const { results, counts } = useMemo(
    () => runFacets(initialResources, FACET_KEYS, GET, facets, (resource) => (!savedOnly || has(savedId(resource))) && (!keyword || (haystacks.get(resource.id) ?? "").includes(keyword))),
    [initialResources, haystacks, facets, savedOnly, has, keyword]
  );
  const filtered = useMemo(() => (sort === "sheet" ? results : [...results].sort((a, b) => (sort === "az" ? 1 : -1) * a.title.localeCompare(b.title, "vi"))), [results, sort]);

  const activeCount = countSelected(facets) + (savedOnly ? 1 : 0);
  const hasFilter = keyword !== "" || activeCount > 0;

  // Khu "Nổi bật" chỉ hiện ở màn mặc định: lúc đang lọc là đang tìm thứ cụ thể, không cần spotlight làm rối mắt.
  const spotlight = hasFilter ? [] : initialResources.filter((resource) => resource.featured);

  const toggleFacet = (key: FacetKey, value: string) => setFacets((current) => ({ ...current, [key]: toggleValue(current[key], value) }));

  function resetFilters() {
    setQuery("");
    setFacets(NONE);
    setSavedOnly(false);
  }

  const visibleKeys = FACET_KEYS.filter((key) => options[key].length > 1);

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
            aria-label="Tìm tài liệu"
          />
        </div>
      </div>

      {initialResources.length === 0 ? (
        <div className="empty-state">
          Chưa có dữ liệu tài liệu. Kiểm tra biến môi trường <code>RESOURCES_SHEET_CSV_URL</code> trong <code>.env.local</code>.
        </div>
      ) : (
        <div className={`inv-layout${visibleKeys.length === 0 ? " no-facets" : ""}`}>
          <aside id="doc-facets" className={`inv-facets${filtersOpen ? " is-open" : ""}`} aria-label="Bộ lọc tài liệu">
            <div className="inv-facets-head">
              <strong>Bộ lọc{activeCount > 0 ? <em>{activeCount}</em> : null}</strong>
              <button type="button" className="link-reset" onClick={() => setFiltersOpen(false)}>Xong</button>
            </div>
            {visibleKeys.map((key) => (
              <FacetGroup
                key={key}
                title={TITLE[key]}
                values={options[key]}
                counts={counts[key]}
                selected={facets[key]}
                keepOrder={key !== "source"}
                onToggle={(value) => toggleFacet(key, value)}
              />
            ))}
            <label className="inv-switch">
              <input type="checkbox" checked={savedOnly} onChange={(event) => setSavedOnly(event.target.checked)} />
              <span>Chỉ hiện mục đã lưu ★</span>
            </label>
          </aside>

          <div className="inv-results">
            <p className="result-line">
              <span>
                <strong>{filtered.length}</strong> / {initialResources.length} tài liệu
              </span>
              <span className="doc-tools">
                <button type="button" className="inv-filter-btn" aria-expanded={filtersOpen} aria-controls="doc-facets" onClick={() => setFiltersOpen((open) => !open)}>
                  Bộ lọc{activeCount > 0 ? ` (${activeCount})` : ""}
                </button>
                <label className="doc-sort">
                  <span className="sr-only">Sắp xếp</span>
                  <select value={sort} onChange={(event) => setSort(event.target.value as Sort)} aria-label="Sắp xếp tài liệu">
                    <option value="sheet">Thứ tự mặc định</option>
                    <option value="az">Tên A → Z</option>
                    <option value="za">Tên Z → A</option>
                  </select>
                </label>
                {hasFilter ? (
                  <button type="button" className="link-reset" onClick={resetFilters}>Xoá bộ lọc</button>
                ) : null}
              </span>
            </p>

            {activeCount > 0 ? (
              <ul className="inv-active" aria-label="Bộ lọc đang áp dụng">
                {FACET_KEYS.flatMap((key) =>
                  facets[key].map((value) => (
                    <li key={`${key}:${value}`}>
                      <button type="button" onClick={() => toggleFacet(key, value)} aria-label={`Bỏ lọc ${TITLE[key]}: ${value}`}>
                        <small>{TITLE[key]}</small>{value}<i aria-hidden="true">✕</i>
                      </button>
                    </li>
                  ))
                )}
                {savedOnly ? <li><button type="button" onClick={() => setSavedOnly(false)} aria-label="Bỏ lọc đã lưu"><small>★</small>Đã lưu<i aria-hidden="true">✕</i></button></li> : null}
                <li><button type="button" className="is-clear" onClick={resetFilters}>Xóa tất cả</button></li>
              </ul>
            ) : null}

            <div className="grid three">
              {filtered.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>

            {filtered.length === 0 ? (
              <div className="empty-state">
                {savedOnly && !keyword && activeCount === 1 ? "Bạn chưa lưu tài liệu nào. Bấm ★ trên thẻ tài liệu để lưu." : "Không tìm thấy tài liệu phù hợp với bộ lọc hiện tại."}
                <button type="button" className="btn ghost empty-reset" onClick={resetFilters}>
                  Xoá bộ lọc
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
