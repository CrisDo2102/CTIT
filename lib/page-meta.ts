import type { Metadata } from "next";
import { nav } from "@/lib/site-config";

// Tiêu đề và mô tả của các trang trong thanh điều hướng lấy luôn từ site-config (một nơi duy nhất để sửa).
// Layout gắn thêm hậu tố " · CTIT" nên tab trình duyệt, lịch sử và dấu trang đều phân biệt được từng trang.
export function navMetadata(href: string): Metadata {
  const item = nav.find((entry) => entry.href === href);
  return item ? { title: item.label, description: item.intro } : {};
}
