// Nhớ bộ lọc của trang danh sách trong tab hiện tại (sessionStorage), để từ trang chi tiết bấm "← Inventory"
// quay về đúng danh sách đang lọc thay vì danh sách trống. Hết khi đóng tab.
const PREFIX = "ctit-list:";
const SAFE = /^\?[\w%.~+\-=&:@/,]*$/; // chỉ nhận chuỗi truy vấn đã mã hóa, không nhận gì lạ

export function rememberList(base: string, search: string): void {
  try {
    window.sessionStorage.setItem(PREFIX + base, search.slice(0, 600));
  } catch {
    // Trình duyệt chặn lưu trữ: bỏ qua, nút quay lại vẫn về danh sách gốc.
  }
}

export function recallList(base: string): string {
  try {
    const value = window.sessionStorage.getItem(PREFIX + base) ?? "";
    return SAFE.test(value) ? value : "";
  } catch {
    return "";
  }
}
