import Link from "next/link";
import { contact, nav, socials } from "@/lib/site-config";

const icons: Record<string, React.ReactNode> = {
  TikTok: <path d="M14 4v10.5a3 3 0 1 1-3-3M14 4c.3 2.3 1.9 3.8 4.5 4" />,
  Instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="5" />
      <circle cx="12" cy="12" r="3.6" />
      <circle cx="17" cy="7" r=".6" />
    </>
  ),
  Facebook: <path d="M14 20v-7h2.5l.5-3h-3V8.5c0-.8.4-1.5 1.5-1.5H17V4.2C16.600 4.100 15.700 4 14.800 4 12.500 4 11 5.400 11 8v2H8.500v3H11v7z" />,
  YouTube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.500" />
      <path d="m10.500 9.500 4 2.500-4 2.500z" />
    </>
  )
};

const resourceLinks = [
  { href: "/resources/documents", label: "Tài liệu" },
  { href: "/resources/inventory", label: "Inventory" },
  { href: "/resources/courses", label: "Khóa học" }
];

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="foot-grid">
          <div className="foot-about">
            <Link href="/" className="brand footer-brand" aria-label="CTIT - Trang chủ">
              <span className="footer-logo-wrap">
                <img src="/images/About/logo.png" alt="" className="footer-logo" />
              </span>
              <span className="footer-brand-copy">
                <strong>CTIT</strong>
                <small>Closed Thinking Institute of Technology</small>
              </span>
            </Link>
            <div className="socials">
              {socials.map((s) => (
                <a key={s.name} className="social" href={s.href} aria-label={s.name} target="_blank" rel="noreferrer">
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    {icons[s.name]}
                  </svg>
                </a>
              ))}
            </div>
          </div>

          <div className="foot-col is-wide">
            <h4>Khám phá</h4>
            <ul>
              {nav.filter((n) => n.href !== "/resources").map((n) => (
                <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="foot-col">
            <h4>Tài nguyên</h4>
            <ul>
              {resourceLinks.map((n) => (
                <li key={n.href}><Link href={n.href}>{n.label}</Link></li>
              ))}
            </ul>
          </div>

          <div className="foot-col">
            <h4>Liên hệ</h4>
            <ul>
              <li><a href={`tel:${contact.phone.replace(/\s/g, "")}`}>{contact.phone}</a></li>
              <li><a href={`mailto:${contact.email}`}>{contact.email}</a></li>
            </ul>
          </div>
        </div>

        <div className="foot-bottom">
          <span>©{new Date().getFullYear()} CTIT. All Rights Reserved</span>
        </div>
      </div>
    </footer>
  );
}
