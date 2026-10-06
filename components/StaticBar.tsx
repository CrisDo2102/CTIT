import Link from "next/link";

// Thanh đầu trang đơn giản, không gọi dữ liệu. Dùng cho trang loading / lỗi,
// nơi không thể chờ Google Sheet mới có được header đầy đủ.
export function StaticBar() {
  return (
    <header className="header">
      <div className="container header-inner">
        <Link href="/" className="brand" aria-label="CTIT - Trang chủ">
          <img src="/images/About/logo.png" alt="" className="brand-logo" />
          <span>Closed Thinking Institute of Technology</span>
        </Link>
      </div>
    </header>
  );
}
