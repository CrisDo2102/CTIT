import Link from "next/link";
import { contact } from "@/lib/site-config";

// Thanh "Truy cập nhanh" ngay dưới carousel (lấy ý tưởng từ "Quick start" của st.com).
const links = [
  { label: "Tuyển sinh", href: "/admissions" },
  { label: "Tài liệu", href: "/resources/documents" },
  { label: "Khóa học", href: "/resources/courses" },
  { label: "Inventory", href: "/resources/inventory" },
  { label: "Sự kiện", href: "/events" },
  { label: "Liên hệ", href: `mailto:${contact.email}` }
];

export function HomeQuickStart() {
  return (
    <nav className="qs" aria-label="Truy cập nhanh">
      <div className="container qs-inner">
        <span className="qs-label">Truy cập nhanh</span>
        <ul>
          {links.map((l) => (
            <li key={l.label}>
              {l.href.startsWith("mailto:") ? (
                <a href={l.href}>{l.label} <i aria-hidden="true">→</i></a>
              ) : (
                <Link href={l.href}>{l.label} <i aria-hidden="true">→</i></Link>
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
