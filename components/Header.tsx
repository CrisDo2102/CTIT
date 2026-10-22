import Link from "next/link";
import { MainNav } from "@/components/MainNav";
import { MobileNav } from "@/components/MobileNav";
import { HeaderScroll } from "@/components/HeaderScroll";
import { SearchDialog } from "@/components/SearchDialog";
import { SearchTrigger } from "@/components/SearchTrigger";
import { SavedLink } from "@/components/SaveButton";
import { contact, nav } from "@/lib/site-config";
import { getAboutInfo } from "@/lib/sheet-data";
import { resolvePhotoUrl } from "@/lib/photo-url";

const navItems = nav.map(({ href, label }) => ({ href, label }));

const resourceLinks = [
  { href: "/resources/documents", label: "Tài liệu" },
  { href: "/resources/inventory", label: "Inventory" },
  { href: "/resources/courses", label: "Khóa học" }
];

// overlay: header "nổi" trong suốt trên ảnh hero (chỉ trang chủ dùng), cuộn xuống thì thành nền kính mờ. Mặc định: header trắng dính như các trang khác.
export async function Header({ overlay = false }: { overlay?: boolean } = {}) {
  const about = await getAboutInfo();
  const logoSrc = about?.logo ? resolvePhotoUrl(about.logo, "about") : "";

  return (
    <>
      <div className={`top-strip${overlay ? " is-overlay" : ""}`}>
        <div className="container top-strip-inner">
          <span>Automotive Engineering Technology</span>
          <nav className="top-links" aria-label="Liên kết tiện ích">
            <Link href="/admissions">Tuyển sinh</Link>
            <Link href="/resources/documents">Tài liệu</Link>
            <Link href="/resources/courses">Khóa học</Link>
            <SearchTrigger />
            <SavedLink />
            <a href={`mailto:${contact.email}`}>Liên hệ</a>
          </nav>
        </div>
      </div>
      <header className={`header${overlay ? " is-overlay" : ""}`}>
        <div className="container header-inner">
          <Link href="/" className="brand" aria-label="Closed Thinking Institute of Technology - Trang chủ">
            {logoSrc ? (
              <img src={logoSrc} alt="Logo CTIT" className="brand-logo" width={42} height={42} decoding="async" />
            ) : (
              <span className="brand-mark">CT</span>
            )}
            <span>Closed Thinking Institute of Technology</span>
          </Link>
          <MainNav items={navItems} />
          <SearchTrigger variant="icon" className="search-trigger-mobile" />
          <MobileNav items={[...navItems, { href: "/saved", label: "★ Đã lưu" }]} resourceLinks={resourceLinks} />
        </div>
      </header>
      {overlay ? <HeaderScroll /> : null}
      <SearchDialog />
    </>
  );
}
