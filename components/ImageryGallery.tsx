"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ImageryCategory } from "@/lib/imagery";

const normalize = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").toLowerCase();

export function ImageryGallery({ category }: { category: ImageryCategory }) {
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(-1);
  const [visibleCount, setVisibleCount] = useState(36);
  const closeButton = useRef<HTMLButtonElement>(null);
  const dialog = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLElement | null>(null);

  const photos = useMemo(() => {
    const keyword = normalize(query.trim());
    return category.photos.filter((photo) => normalize(`${photo.title} ${photo.filename}`).includes(keyword));
  }, [category.photos, query]);
  const photo = active >= 0 ? photos[active] : undefined;

  const close = () => {
    setActive(-1);
    opener.current?.focus();
  };
  const open = (index: number) => {
    opener.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setActive(index);
  };

  useEffect(() => {
    if (active < 0) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActive(-1);
        opener.current?.focus();
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        setActive((current) => (current + 1) % photos.length);
      } else if (event.key === "ArrowLeft") {
        event.preventDefault();
        setActive((current) => (current + photos.length - 1) % photos.length);
      } else if (event.key === "Tab") {
        const focusable = [...(dialog.current?.querySelectorAll<HTMLElement>("button:not([disabled]), a[href]") ?? [])];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [active, photos.length]);

  return (
    <div className="imagery-gallery">
      <div className="imagery-toolbar">
        <div>
          <p className="imagery-kicker">{category.name.toUpperCase()} / IMAGE SET</p>
          <h2>{category.name}</h2>
          <p className="imagery-lead">{category.photos.length} hình ảnh · sắp xếp theo tên file · nhấn ảnh để xem lớn</p>
        </div>
        {category.photos.length > 0 && (
          <label className="imagery-search">
            <span className="sr-only">Tìm hình ảnh trong {category.name}</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></svg>
            <input type="search" value={query} onChange={(event) => { setQuery(event.target.value); setActive(-1); setVisibleCount(36); }} placeholder="Tìm theo tên file..." />
          </label>
        )}
      </div>

      {category.photos.length === 0 ? (
        <div className="imagery-empty" role="status"><h3>Danh mục này chưa có ảnh</h3><p>Hãy thêm các file ảnh hợp lệ vào thư mục <strong>{category.name}</strong> rồi chạy/build lại CTIT.</p></div>
      ) : photos.length === 0 ? (
        <div className="imagery-empty" role="status">Không có hình ảnh nào khớp với “{query.trim()}”.</div>
      ) : (
        <>
        <div className="imagery-photo-grid">
          {photos.slice(0, visibleCount).map((item, index) => (
            <button key={item.filename} type="button" className="imagery-photo-card" onClick={() => open(index)} aria-label={`Xem ảnh ${item.title}`}>
              <span className="imagery-photo-media"><Image src={item.url} alt={item.title} fill sizes="(max-width: 650px) 50vw, (max-width: 1050px) 33vw, 25vw" /></span>
              <span className="imagery-photo-caption"><strong title={item.filename}>{item.title}</strong><span aria-hidden="true">↗</span></span>
            </button>
          ))}
        </div>
        {photos.length > visibleCount && (
          <div className="imagery-more">
            <p>Đang hiển thị {visibleCount} / {photos.length} ảnh</p>
            <button type="button" onClick={() => setVisibleCount((count) => count + 36)}>Xem thêm hình ảnh ↓</button>
          </div>
        )}
        </>
      )}

      {photo && (
        <div className="imagery-lightbox" ref={dialog} role="dialog" aria-modal="true" aria-label={`Đang xem ảnh: ${photo.title}`}>
          <button type="button" className="imagery-lightbox-backdrop" onClick={close} aria-label="Đóng trình xem ảnh" tabIndex={-1} />
          <div className="imagery-lightbox-panel">
            <div className="imagery-lightbox-top">
              <div><small>{category.name} · {active + 1}/{photos.length}</small><strong>{photo.title}</strong></div>
              <button type="button" className="imagery-lightbox-close" ref={closeButton} onClick={close} aria-label="Đóng xem ảnh">✕</button>
            </div>
            <div className="imagery-lightbox-stage">
              <Image key={photo.url} src={photo.url} alt={photo.title} fill sizes="100vw" className="imagery-lightbox-image" priority />
            </div>
            <div className="imagery-lightbox-bottom">
              <span className="imagery-lightbox-filename" title={photo.filename}>{photo.filename}</span>
              <div className="imagery-lightbox-actions">
                <a href={photo.url} download={photo.filename} className="imagery-download">Tải ảnh gốc ↓</a>
                <button type="button" onClick={() => setActive((value) => (value + photos.length - 1) % photos.length)} disabled={photos.length <= 1} aria-label="Ảnh trước">←</button>
                <button type="button" onClick={() => setActive((value) => (value + 1) % photos.length)} disabled={photos.length <= 1} aria-label="Ảnh tiếp">→</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
