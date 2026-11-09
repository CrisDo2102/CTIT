"use client";

import Link from "next/link";
import { useSaved } from "@/lib/saved";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { MOBILE_NAV_CLOSE_EVENT, MOBILE_NAV_STATE_EVENT, MOBILE_NAV_TOGGLE_EVENT } from "@/lib/mobile-nav-events";

type Item = { href: string; label: string };

type Props = {
  items: Item[];
  resourceLinks: Item[];
};

// Menu điện thoại: nút 3 gạch mở một ngăn kéo dưới thanh header.
// Đóng khi bấm link, bấm ra ngoài, nhấn Esc hoặc khi đổi trang.
export function MobileNav({ items, resourceLinks }: Props) {
  const [open, setOpen] = useState(false);
  const lastFocused = useRef<HTMLElement | null>(null);
  const { items: savedItems } = useSaved(); // hiện số mục đã lưu ở menu điện thoại (dải liên kết trên cùng bị ẩn ở màn hình nhỏ)
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const toggle = () => setOpen((current) => !current);
    const close = () => setOpen(false);
    window.addEventListener(MOBILE_NAV_TOGGLE_EVENT, toggle);
    window.addEventListener(MOBILE_NAV_CLOSE_EVENT, close);
    return () => {
      window.removeEventListener(MOBILE_NAV_TOGGLE_EVENT, toggle);
      window.removeEventListener(MOBILE_NAV_CLOSE_EVENT, close);
    };
  }, []);

  useEffect(() => {
    window.dispatchEvent(new CustomEvent(MOBILE_NAV_STATE_EVENT, { detail: open }));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const panel = document.getElementById("mobile-nav-panel");
    lastFocused.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = requestAnimationFrame(() => panel?.querySelector<HTMLElement>("a[href]")?.focus());
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); setOpen(false); return; }
      if (event.key !== "Tab" || !panel) return;
      const links = [...panel.querySelectorAll<HTMLElement>("a[href]")];
      const first = links[0], last = links[links.length - 1];
      if (!first || !last) return;
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      cancelAnimationFrame(focusFrame);
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
      lastFocused.current?.focus();
    };
  }, [open]);

  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="mobile-nav">
      <button
        type="button"
        className={`mobile-nav-toggle${open ? " is-open" : ""}`}
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        onClick={() => setOpen((value) => !value)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>

      {open ? <button type="button" className="mobile-nav-backdrop" aria-label="Đóng menu" tabIndex={-1} onClick={() => setOpen(false)} /> : null}

      <nav id="mobile-nav-panel" className={`mobile-nav-panel${open ? " is-open" : ""}`} aria-label="Menu chính" hidden={!open}>
        <ul>
          {items.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className={isActive(item.href) ? "is-current" : undefined} aria-current={pathname === item.href ? "page" : undefined}>
                {item.href === "/saved" && savedItems.length > 0 ? `${item.label} (${savedItems.length})` : item.label}
              </Link>
              {item.href === "/resources" ? (
                <ul className="mobile-nav-sub">
                  {resourceLinks.map((sub) => (
                    <li key={sub.href}>
                      <Link href={sub.href} className={isActive(sub.href) ? "is-current" : undefined}>
                        {sub.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
