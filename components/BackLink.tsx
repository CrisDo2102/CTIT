"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { recallList } from "@/lib/list-memory";
import { markRestore } from "@/lib/scroll-memory";

// Nút "← Danh sách" ở đầu trang con. Nếu bạn vừa lọc ở danh sách thì quay về đúng bộ lọc đó.
export function BackLink({ href, label }: { href: string; label: string }) {
  const [search, setSearch] = useState("");
  useEffect(() => setSearch(recallList(href)), [href]);

  return (
    <Link href={`${href}${search}`} className="ph-back" onClick={() => markRestore(href)}>
      <span aria-hidden="true">←</span> {label}
      {search ? <small className="ph-back-note"> · giữ bộ lọc</small> : null}
    </Link>
  );
}
