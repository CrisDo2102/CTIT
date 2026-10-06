import Link from "next/link";
import { MainNav } from "@/components/MainNav";
import { MobileNav } from "@/components/MobileNav";
import { nav } from "@/lib/site-config";
import { getAboutInfo } from "@/lib/sheet-data";
import { resolvePhotoUrl } from "@/lib/photo-url";

const navItems = nav.map(({ href, label }) => ({ href, label }));

const resourceLinks = [
  { href: "/resources/documents", label: "Tài liệu" },
  { href: "/resources/inventory", label: "Inventory" },
  { href: "/resources/courses", label: "Khóa học" }
];

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
          <MainNav items={navItems} />
          <MobileNav items={navItems} resourceLinks={resourceLinks} />
        </div>
      </header>
    </>
  );
}
