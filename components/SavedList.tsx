"use client";

import Link from "next/link";
import { useSaved } from "@/lib/saved";

const isExternal = (href: string) => /^https?:\/\//i.test(href);

// Trang "Đã lưu": danh sách các mục người xem đã bấm ★, gom theo nhóm. Chỉ nằm trong trình duyệt của họ.
export function SavedList() {
  const { items, remove, clear } = useSaved();

  if (items.length === 0) {
    return (
      <div className="empty-state">
        Chưa lưu mục nào. Bấm ★ ở vật tư, tài liệu hoặc khóa học để lưu lại, danh sách chỉ nằm trong trình duyệt này.
        <div className="saved-empty-links">
          <Link className="btn secondary" href="/resources/inventory">Xem Inventory</Link>
          <Link className="btn secondary" href="/resources/documents">Xem Tài liệu</Link>
          <Link className="btn secondary" href="/resources/courses">Xem Khóa học</Link>
        </div>
      </div>
    );
  }

  const kinds = [...new Set(items.map((item) => item.kind))];

  return (
    <>
      <div className="saved-head">
        <span><strong>{items.length}</strong> mục đã lưu</span>
        <button type="button" className="link-reset" onClick={() => window.confirm("Xóa toàn bộ mục đã lưu?") && clear()}>Xóa tất cả</button>
      </div>
      {kinds.map((kind) => (
        <section key={kind} className="saved-group">
          <h2>{kind}</h2>
          <ul>
            {items.filter((item) => item.kind === kind).map((item) => (
              <li key={item.id}>
                {isExternal(item.href) ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer"><strong>{item.title}</strong>{item.sub ? <span>{item.sub}</span> : null}</a>
                ) : (
                  <Link href={item.href}><strong>{item.title}</strong>{item.sub ? <span>{item.sub}</span> : null}</Link>
                )}
                <button type="button" onClick={() => remove(item.id)} aria-label={`Bỏ lưu: ${item.title}`}>Bỏ lưu</button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
