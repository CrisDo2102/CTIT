"use client";

import Link from "next/link";
import { useEffect } from "react";
import { StaticBar } from "@/components/StaticBar";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <>
      <StaticBar />
      <main>
        <section className="state-page">
          <div className="container">
            <p className="state-code" aria-hidden="true">Lỗi</p>
            <h1>Trang này đang gặp sự cố</h1>
            <p className="lead">Có thể dữ liệu chưa tải được. Thử lại sau vài giây, nếu vẫn lỗi thì quay về trang chủ.</p>
            <div className="state-actions">
              <button type="button" className="btn" onClick={() => reset()}>Thử lại</button>
              <Link href="/" className="btn secondary">Về trang chủ</Link>
            </div>
            {error.digest ? <p className="state-digest">Mã lỗi: {error.digest}</p> : null}
          </div>
        </section>
      </main>
    </>
  );
}
