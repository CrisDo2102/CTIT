import Link from "next/link";
import type { ReactNode } from "react";

// Khi một tab Google Sheet trống hoặc chưa tải được:
// - lúc phát triển (npm run dev): nói rõ biến môi trường nào cần kiểm tra;
// - ngoài production: người xem chỉ cần thấy "đang cập nhật" và lối đi tiếp, không phải đọc tên biến và `.env.local`.
const isDev = process.env.NODE_ENV !== "production";

export function NoDataMessage({ what, env, note }: { what?: string; env: string; note?: ReactNode }) {
  if (isDev) {
    return (
      <>
        Chưa có dữ liệu{what ? ` ${what}` : ""}. Kiểm tra biến môi trường <code>{env}</code> trong <code>.env.local</code>
        {note ? <> {note}.</> : "."}
      </>
    );
  }
  return <>Nội dung{what ? ` ${what}` : ""} đang được cập nhật. Bạn quay lại sau nhé.</>;
}

export function NoData({ what, env, note }: { what?: string; env: string; note?: ReactNode }) {
  return (
    <div className="empty-state">
      <NoDataMessage what={what} env={env} note={note} />
      {isDev ? null : (
        <div className="state-actions no-data-links">
          <Link href="/" className="btn secondary">Về trang chủ</Link>
          <Link href="/resources" className="btn ghost">Xem tài nguyên</Link>
        </div>
      )}
    </div>
  );
}
