"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { href: string; label: string };

// Menu ngang trên máy tính. Mục của trang đang mở luôn sáng (cùng kiểu với khi rê chuột).
export function MainNav({ items }: { items: Item[] }) {
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const cls = (base: string, href: string) => (isActive(href) ? `${base} is-active`.trim() : base);
  const current = (href: string) => (pathname === href ? "page" : undefined);

  return (
    <nav className="mainnav" aria-label="Menu chính">
      {items.map((item) =>
        item.href === "/resources" ? (
          <div key={item.href} className="nav-dropdown">
            <Link href={item.href} className={cls("nav-dropdown-trigger", item.href)} aria-haspopup="true" aria-current={current(item.href)}>
              <span>{item.label}</span>
            </Link>
            <div className="nav-dropdown-menu" role="menu" aria-label="Các tài nguyên của CTIT">
              <div className="nav-mega-intro">
                <span className="nav-mega-kicker">CTIT RESOURCES</span>
                <strong>Tài nguyên kỹ thuật</strong>
                <p>Tài liệu, lộ trình học và kho vật tư — tập trung trong một nơi.</p>
                <Link href="/resources" className="nav-mega-all">Xem tổng quan <span>→</span></Link>
              </div>
              <div className="nav-mega-links">
                <Link href="/resources/documents" role="menuitem" className={cls("nav-dropdown-item", "/resources/documents")} aria-current={current("/resources/documents")}>
                  <span className="nav-dropdown-icon nav-doc-icon" aria-hidden="true">▤</span>
                  <span>
                    <small>01 / DOCUMENTS</small>
                    <strong>Tài liệu</strong>
                    <em>Sách, PDF, YouTube, GitHub và nguồn học tập.</em>
                  </span>
                  <b aria-hidden="true">→</b>
                </Link>
                <Link href="/resources/inventory" role="menuitem" className={cls("nav-dropdown-item", "/resources/inventory")} aria-current={current("/resources/inventory")}>
                  <span className="nav-dropdown-icon nav-inventory-icon" aria-hidden="true">▦</span>
                  <span>
                    <small>02 / INVENTORY</small>
                    <strong>Inventory</strong>
                    <em>Linh kiện, vi điều khiển, module, công cụ và vật tư.</em>
                  </span>
                  <b aria-hidden="true">→</b>
                </Link>
                <Link href="/resources/courses" role="menuitem" className={cls("nav-dropdown-item", "/resources/courses")} aria-current={current("/resources/courses")}>
                  <span className="nav-dropdown-icon nav-course-icon" aria-hidden="true">▥</span>
                  <span>
                    <small>03 / COURSES</small>
                    <strong>Khóa học</strong>
                    <em>Lộ trình học theo môn: vi điều khiển, AVR, ARM.</em>
                  </span>
                  <b aria-hidden="true">→</b>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          <Link key={item.href} href={item.href} className={isActive(item.href) ? "is-active" : undefined} aria-current={current(item.href)}>
            {item.label}
          </Link>
        )
      )}
    </nav>
  );
}
