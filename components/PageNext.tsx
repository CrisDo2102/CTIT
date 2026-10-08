"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { nav } from "@/lib/site-config";

// Dải "Trang trước / Trang sau" theo thứ tự menu chính, hiện phía trên footer của 8 trang con
// (kể cả các trang con của /resources). Trang chủ, /admin, 404 không nằm trong menu nên tự ẩn.
export function PageNext() {
  const pathname = usePathname() || "/";
  const index = nav.findIndex((n) => pathname === n.href || pathname.startsWith(`${n.href}/`));
  if (index === -1) return null;

  const prev = nav[(index - 1 + nav.length) % nav.length];
  const next = nav[(index + 1) % nav.length];

  return (
    <nav className="page-next" aria-label="Chuyển trang">
      <div className="container page-next-grid">
        <Link href={prev.href} className="page-next-card is-prev">
          <small>← Trang trước · {prev.en}</small>
          <strong>{prev.label}</strong>
          <span>{prev.intro}</span>
        </Link>
        <Link href={next.href} className="page-next-card is-next">
          <small>Trang sau · {next.en} →</small>
          <strong>{next.label}</strong>
          <span>{next.intro}</span>
        </Link>
      </div>
    </nav>
  );
}
