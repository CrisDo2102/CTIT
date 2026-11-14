"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import type { ImageryCategory } from "@/lib/imagery";

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();

export function ImageryDirectory({ categories }: { categories: ImageryCategory[] }) {
  const [query, setQuery] = useState("");
  const visible = useMemo(() => {
    const keyword = normalize(query.trim());
    return categories.filter((category) => normalize(category.name).includes(keyword));
  }, [categories, query]);

  return (
    <div className="imagery-directory">
      <div className="imagery-toolbar">
        <div>
          <p className="imagery-kicker">IMAGE ARCHIVE / CTIT</p>
          <h2>Thư mục hình ảnh</h2>
          <p className="imagery-lead">Tên danh mục trùng với tên thư mục, được sắp xếp tự động theo bảng chữ cái.</p>
        </div>
        {categories.length > 0 && (
          <label className="imagery-search">
            <span className="sr-only">Tìm danh mục ảnh</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>
            <input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm danh mục, ví dụ Physics..." />
          </label>
        )}
      </div>
      {categories.length === 0 ? (
        <div className="imagery-empty" role="status">
          <span className="imagery-empty-icon" aria-hidden="true">▧</span>
          <h3>Chưa có thư mục hình ảnh</h3>
          <p>Tạo thư mục con trong <code>public/images/Imagery</code> rồi thêm ảnh JPG, PNG, WEBP, AVIF hoặc GIF. Trang sẽ tự tạo danh mục khi chạy/build lại.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="imagery-empty" role="status">Không tìm thấy danh mục phù hợp với “{query.trim()}”.</div>
      ) : (
        <div className="imagery-category-grid">
          {visible.map((category, index) => (
            <Link href={category.href} key={category.name} className="imagery-category-card">
              <div className="imagery-category-media">
                {category.cover ? (
                  <Image src={category.cover} alt="" fill sizes="(max-width: 680px) 100vw, (max-width: 1100px) 50vw, 33vw" className="imagery-category-image" />
                ) : <span className="imagery-category-placeholder" aria-hidden="true">▧</span>}
                <span className="imagery-category-index">DIR / {String(index + 1).padStart(2, "0")}</span>
              </div>
              <div className="imagery-category-info">
                <div><h3>{category.name}</h3><span>{category.photos.length} ảnh</span></div>
                <span className="imagery-category-arrow" aria-hidden="true">↗</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
