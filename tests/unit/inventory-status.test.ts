import { describe, expect, it } from "vitest";
import { statusClass, statusKind, statusLabel, withSlugs } from "@/lib/inventory";

describe("statusKind / statusLabel / statusClass", () => {
  // [giá trị trong Sheet, nhóm, nhãn hiển thị, class]
  it.each([
    ["Sắp hết", "low", "Sắp hết", "inventory-status is-low"], // lỗi từng có: bị coi là "Hết hàng" vì chứa chữ "hết"
    ["sắp hết hàng", "low", "Sắp hết", "inventory-status is-low"],
    ["  SẮP HẾT  ", "low", "Sắp hết", "inventory-status is-low"],
    ["Low stock", "low", "Sắp hết", "inventory-status is-low"],
    ["limited", "low", "Sắp hết", "inventory-status is-low"],
    ["Hết hàng", "out", "Hết hàng", "inventory-status is-out"],
    ["Out of stock", "out", "Hết hàng", "inventory-status is-out"],
    ["unavailable", "out", "Hết hàng", "inventory-status is-out"],
    ["Còn hàng", "ok", "Còn hàng", "inventory-status is-ok"], // lỗi từng có: không được tính vào "Đang có sẵn"
    ["Available", "ok", "Available", "inventory-status is-ok"],
    ["Sẵn sàng", "ok", "Sẵn sàng", "inventory-status is-ok"],
    ["Đang mượn", "warn", "Đang mượn", "inventory-status is-warn"],
    ["Đang sửa", "warn", "Đang sửa", "inventory-status is-warn"],
    ["Under maintenance", "warn", "Under maintenance", "inventory-status is-warn"],
    ["Có người sử dụng", "inuse", "Có người sử dụng", "inventory-status is-warn"],
    ["In use", "inuse", "In use", "inventory-status is-warn"],
    ["", "unknown", "Chưa cập nhật", "inventory-status is-ok"],
    ["   ", "unknown", "Chưa cập nhật", "inventory-status is-ok"]
  ])("%j -> %s", (status, kind, label, cls) => {
    expect(statusKind(status)).toBe(kind);
    expect(statusLabel(status)).toBe(label);
    expect(statusClass(status)).toBe(cls);
  });

  it('"Sắp hết" và "Hết hàng" luôn có nhãn khác nhau (bộ lọc không được hiện hai mục trùng tên)', () => {
    expect(statusLabel("Sắp hết")).not.toBe(statusLabel("Hết hàng"));
  });
});

describe("withSlugs", () => {
  const item = (title: string) => ({ title, model: "", id: "x" }) as Parameters<typeof withSlugs>[0][number];
  it("tên trùng thì thêm -2, -3 và giữ thứ tự", () => {
    expect(withSlugs([item("Kìm"), item("Kìm"), item("Kìm"), item("Khác")]).map((i) => i.slug)).toEqual(["kim", "kim-2", "kim-3", "khac"]);
  });
});
