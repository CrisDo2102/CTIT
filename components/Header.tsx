import Link from "next/link";
import { nav } from "@/lib/site-config";
import { getAboutInfo } from "@/lib/sheet-data";
import { resolvePhotoUrl } from "@/lib/photo-url";

export async function Header() {
  const about = await getAboutInfo();
  const logoSrc = about?.logo ? resolvePhotoUrl(about.logo, "about") : "";

  return (
    <>
      <div className="top-strip">
        <div className="container top-strip-inner">
          <span>Automotive Engineering Technology</span>
        </div>
      </div>
      <header className="header">
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="Closed Thinking Institute of Technology - Trang chủ">
            {logoSrc ? (
              <img src={logoSrc} alt="Logo CTIT" className="brand-logo" />
            ) : (
              <span className="brand-mark">CT</span>
            )}
            <span>Closed Thinking Institute of Technology</span>
          </Link>
          <nav className="mainnav" aria-label="Menu chính">
            {nav.map((item) =>
              item.href === "/resources" ? (
                <div key={item.href} className="nav-dropdown">
                  <Link href={item.href} className="nav-dropdown-trigger" aria-haspopup="true">
                    <span>{item.label}</span>
                  </Link>
                  <div className="nav-dropdown-menu" role="menu" aria-label="Các tài nguyên của CTIT">
                    <div className="nav-mega-intro">
                      <span className="nav-mega-kicker">CTIT RESOURCES</span>
                      <strong>Tài nguyên kỹ thuật</strong>
                      <p>Tài liệu để học và kho vật tư để làm — tập trung trong một nơi.</p>
                      <Link href="/resources" className="nav-mega-all">Xem tổng quan <span>→</span></Link>
                    </div>
                    <div className="nav-mega-links">
                      <Link href="/resources/documents" role="menuitem" className="nav-dropdown-item">
                        <span className="nav-dropdown-icon nav-doc-icon" aria-hidden="true">▤</span>
                        <span>
                          <small>01 / DOCUMENTS</small>
                          <strong>Tài liệu</strong>
                          <em>Sách, PDF, YouTube, GitHub và nguồn học tập.</em>
                        </span>
                        <b aria-hidden="true">→</b>
                      </Link>
                      <Link href="/resources/inventory" role="menuitem" className="nav-dropdown-item">
                        <span className="nav-dropdown-icon nav-inventory-icon" aria-hidden="true">▦</span>
                        <span>
                          <small>02 / INVENTORY</small>
                          <strong>Inventory</strong>
                          <em>Linh kiện, vi điều khiển, module, công cụ và vật tư.</em>
                        </span>
                        <b aria-hidden="true">→</b>
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <Link key={item.href} href={item.href}>
                  {item.label}
                </Link>
              )
            )}
          </nav>
        </div>
      </header>
    </>
  );
}
