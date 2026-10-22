// Thông báo nhỏ ở đáy màn hình ("Đã lưu...", kèm Hoàn tác). Phát sự kiện, ToastHost (gắn ở layout) hiển thị.
export const TOAST_EVENT = "ctit:toast";

export type ToastDetail = {
  message: string;
  /** Link phụ, vd "Xem Đã lưu". */
  link?: { label: string; href: string };
  /** Nút hành động, vd "Hoàn tác". */
  action?: { label: string; run: () => void };
};

export const showToast = (detail: ToastDetail): void => {
  window.dispatchEvent(new CustomEvent<ToastDetail>(TOAST_EVENT, { detail }));
};
