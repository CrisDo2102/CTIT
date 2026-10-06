// Icon SVG dùng chung (nét viền, kế thừa màu từ `currentColor`).

/** Mũi tên chéo ↗ dùng ở các thẻ liên kết. */
export function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7" /><path d="M9 7h8v8" />
    </svg>
  );
}

export function InventoryIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 7.5 12 4l8 3.5v9L12 20l-8-3.5Z" />
      <path d="M4 7.5 12 11l8-3.5M12 11v9" />
    </svg>
  );
}
