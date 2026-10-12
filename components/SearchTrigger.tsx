"use client";

// Nút mở ô tìm kiếm. Chỉ phát sự kiện; hộp thoại (SearchDialog) gắn một lần ở Header và lắng nghe.
export const SEARCH_EVENT = "ctit:search";

export function SearchTrigger({ variant = "pill", className = "" }: { variant?: "pill" | "icon"; className?: string }) {
  return (
    <button
      type="button"
      className={`search-trigger${variant === "icon" ? " is-icon" : ""} ${className}`.trim()}
      aria-label="Tìm kiếm (Ctrl+K)"
      aria-haspopup="dialog"
      onClick={() => window.dispatchEvent(new Event(SEARCH_EVENT))}
    >
      <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m20 20-4.2-4.2" /></svg>
      {variant === "pill" ? (
        <>
          <span className="search-trigger-text">Tìm kiếm</span>
          <kbd>Ctrl K</kbd>
        </>
      ) : null}
    </button>
  );
}
