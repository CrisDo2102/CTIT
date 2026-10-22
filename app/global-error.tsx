"use client";

import { useEffect } from "react";
import { reportClientError } from "@/lib/report-client";

// Lỗi xảy ra ngay ở khung ngoài cùng (layout) mà app/error.tsx không bắt được. Phải tự có <html> và <body>.
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    reportClientError("boundary", error, { digest: error.digest });
  }, [error]);

  return (
    <html lang="vi">
      <body style={{ fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100vh", margin: 0, textAlign: "center", padding: 24 }}>
        <div>
          <h1>Trang đang gặp sự cố</h1>
          <p>Thử lại sau vài giây. Nếu vẫn lỗi, vui lòng quay lại sau.</p>
          <button type="button" onClick={() => reset()} style={{ padding: "10px 20px", fontSize: 16, cursor: "pointer" }}>Thử lại</button>
          {error.digest ? <p style={{ color: "#666", fontSize: 13 }}>Mã lỗi: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}
