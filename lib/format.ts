// Hàm định dạng dùng chung cho nhiều trang.

/** Số thứ tự hiển thị 2 chữ số, tính từ index 0: 0 -> "01", 9 -> "10". */
export const padIndex = (index: number) => String(index + 1).padStart(2, "0");

/** 2026-10-05 -> 05/10/2026. Định dạng khác (sheet tự đổi ngày) thì giữ nguyên. */
export function formatDate(value: string): string {
  const m = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  return m ? `${m[3].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[1]}` : value;
}

/** Màu nền (hue 0-359) ổn định theo chuỗi: cùng một tên luôn ra cùng một màu. */
export function toneOf(text: string): number {
  let hash = 0;
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) % 360;
  }
  return hash;
}

/** Ngày hôm nay dạng YYYY-MM-DD theo giờ Việt Nam (máy chủ chạy UTC vẫn ra đúng ngày của người dùng ở VN). */
export function todayInVietnam(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}
