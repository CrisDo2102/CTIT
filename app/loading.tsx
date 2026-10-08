import { StaticBar } from "@/components/StaticBar";

// Hiện ngay khi chuyển trang, trong lúc chờ dữ liệu từ Google Sheet.
export default function Loading() {
  return (
    <>
      <StaticBar />
      <main id="main" aria-busy="true" aria-live="polite">
        <span className="sr-only">Đang tải…</span>
        <section className="state-page is-loading">
          <div className="container">
            <div className="skeleton skeleton-eyebrow" />
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-line" />
            <div className="skeleton skeleton-line short" />
            <div className="skeleton-grid">
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
              <div className="skeleton skeleton-card" />
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
