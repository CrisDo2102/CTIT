import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { nav } from "@/lib/site-config";

export const metadata: Metadata = {
  title: "Không tìm thấy trang",
  robots: { index: false }
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <section className="state-page">
          <div className="container">
            <p className="state-code" aria-hidden="true">404</p>
            <h1>Không tìm thấy trang này</h1>
            <p className="lead">Đường dẫn có thể đã gõ sai, hoặc trang đã được chuyển đi. Chọn một mục bên dưới để đi tiếp.</p>
            <div className="state-actions">
              <Link href="/" className="btn">Về trang chủ</Link>
            </div>
            <ul className="state-links">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href}>
                    <strong>{item.label}</strong>
                    <span>{item.intro}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
