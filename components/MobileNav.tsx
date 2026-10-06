"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string };

type Props = {
  items: Item[];
  resourceLinks: Item[];
};

// Menu điện thoại: nút 3 gạch mở một ngăn kéo dưới thanh header.
// Đóng khi bấm link, bấm ra ngoài, nhấn Esc hoặc khi đổi trang.
export function MobileNav({ items, resourceLinks }: Props) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
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
                {item.label}
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
