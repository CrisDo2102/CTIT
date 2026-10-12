"use client";

import { useState } from "react";

// Một nhóm bộ lọc kiểu product selector của st.com: tiêu đề thu gọn được, các ô tick kèm số kết quả,
// "Xem thêm" khi nhiều lựa chọn. Dùng chung cho Inventory và Tài liệu (CSS: .inv-facet* trong extras.css).
export function FacetGroup({
  title,
  values,
  counts,
  selected,
  label,
  keepOrder = false,
  onToggle
}: {
  title: string;
  values: string[];
  counts: Map<string, number>;
  selected: string[];
  label?: (value: string) => string;
  /** true: giữ đúng thứ tự `values` (vd thứ tự trong Sheet); false: nhiều kết quả nhất lên trước. */
  keepOrder?: boolean;
  onToggle: (value: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const LIMIT = 6;
  const sorted = keepOrder ? values : [...values].sort((a, b) => (counts.get(b) ?? 0) - (counts.get(a) ?? 0) || a.localeCompare(b, "vi"));
  const visible = expanded ? sorted : sorted.filter((value, i) => i < LIMIT || selected.includes(value));
  const hidden = sorted.length - visible.length;

  return (
    <details className="inv-facet" open>
      <summary>{title}{selected.length > 0 ? <em>{selected.length}</em> : null}</summary>
      <ul>
        {visible.map((value) => {
          const count = counts.get(value) ?? 0;
          const checked = selected.includes(value);
          const empty = count === 0 && !checked;
          return (
            <li key={value}>
              <label className={`inv-opt${empty ? " is-empty" : ""}`}>
                <input type="checkbox" checked={checked} disabled={empty} onChange={() => onToggle(value)} />
                <span>{label ? label(value) : value}</span>
                <b>{count}</b>
              </label>
            </li>
          );
        })}
      </ul>
      {hidden > 0 || (expanded && sorted.length > LIMIT) ? (
        <button type="button" className="link-reset inv-more" onClick={() => setExpanded((open) => !open)}>{expanded ? "Thu gọn" : `Xem thêm ${hidden}`}</button>
      ) : null}
    </details>
  );
}
