"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useSaved } from "@/lib/saved";
import { SEARCH_EVENT } from "@/components/SearchTrigger";
import { MOBILE_NAV_CLOSE_EVENT, MOBILE_NAV_STATE_EVENT, MOBILE_NAV_TOGGLE_EVENT } from "@/lib/mobile-nav-events";

function TabIcon({ name }: { name: "home" | "search" | "resources" | "saved" | "menu" }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const shape = {
    home: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m16.5 16.5 4 4" /></>,
    resources: <><rect x="4" y="3" width="16" height="18" rx="1" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
    saved: <><path d="m12 3 2.8 5.6 6.2.9-4.5 4.4 1.1 6.1L12 17l-5.6 3 1.1-6.1L3 9.5l6.2-.9Z" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>
  }[name];
  return <svg aria-hidden="true" viewBox="0 0 24 24" {...common}>{shape}</svg>;
}

/** Chỉ hiện ở điện thoại. Menu và Search tái sử dụng dialog/drawer hiện hữu. */
export function MobileBottomNav() {
  const pathname = usePathname();
  const { items } = useSaved();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    const onState = (event: Event) => setMenuOpen((event as CustomEvent<boolean>).detail === true);
    window.addEventListener(MOBILE_NAV_STATE_EVENT, onState);
    return () => window.removeEventListener(MOBILE_NAV_STATE_EVENT, onState);
  }, []);

  if (pathname.startsWith("/admin")) return null;
  const current = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  const openSearch = () => {
    window.dispatchEvent(new Event(MOBILE_NAV_CLOSE_EVENT));
    // Mở một SearchDialog có sẵn, không tạo dialog thứ hai.
    window.dispatchEvent(new Event(SEARCH_EVENT));
  };

  return (
    <nav className="ctit-bottom-nav" aria-label="Điều hướng nhanh trên điện thoại">
      <Link href="/" className={current("/") ? "is-active" : ""} aria-current={pathname === "/" ? "page" : undefined}>
        <TabIcon name="home" /><span>Trang chủ</span>
      </Link>
      <button type="button" onClick={openSearch} aria-haspopup="dialog" aria-label="Mở tìm kiếm CTIT">
        <TabIcon name="search" /><span>Tìm</span>
      </button>
      <Link href="/resources" className={current("/resources") ? "is-active" : ""} aria-current={pathname === "/resources" ? "page" : undefined}>
        <TabIcon name="resources" /><span>Tài nguyên</span>
      </Link>
      <Link href="/saved" className={current("/saved") ? "is-active" : ""} aria-current={pathname === "/saved" ? "page" : undefined}>
        <TabIcon name="saved" /><span>Đã lưu</span>
        {items.length > 0 ? <b className="ctit-bottom-count" aria-label={`${items.length} mục đã lưu`}>{items.length > 99 ? "99+" : items.length}</b> : null}
      </Link>
      <button type="button" onClick={() => window.dispatchEvent(new Event(MOBILE_NAV_TOGGLE_EVENT))} aria-expanded={menuOpen} aria-controls="mobile-nav-panel">
        <TabIcon name="menu" /><span>Menu</span>
      </button>
    </nav>
  );
}
