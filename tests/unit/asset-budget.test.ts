import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// "Ngân sách dung lượng ảnh": chặn việc vô tình đưa ảnh nặng vào public/images (từng có logo 2000x2000 nặng 1,4 MB
// chỉ để hiện ở cỡ 40px, tải trên mọi trang). Ảnh trong thư mục này được người dùng thay bằng tay nên cần một chốt chặn tự động.
const ROOT = "public/images";
const KB = 1024;

function images(dir = ROOT): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return images(path);
    return /\.(png|jpe?g|webp|avif|gif)$/i.test(name) ? [path] : [];
  });
}

/** Chiều rộng và cao của PNG / JPEG / WebP (đủ cho kiểm tra ngân sách, không cần thư viện ảnh). */
function size(path: string): { w: number; h: number } | null {
  const b = readFileSync(path);
  if (b.subarray(1, 4).toString() === "PNG") return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
  if (b[0] === 0xff && b[1] === 0xd8) {
    for (let i = 2; i < b.length - 9; ) {
      if (b[i] !== 0xff) { i++; continue; }
      const marker = b[i + 1];
      if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
      i += 2 + b.readUInt16BE(i + 2);
    }
  }
  return null;
}

describe("ngân sách ảnh", () => {
  const files = images();

  it("có ảnh để kiểm tra", () => expect(files.length).toBeGreaterThan(20));

  it("không ảnh nào nặng quá 700 KB", () => {
    const heavy = files.filter((f) => statSync(f).size > 700 * KB).map((f) => `${f}: ${Math.round(statSync(f).size / KB)} KB`);
    expect(heavy).toEqual([]);
  });

  it("không ảnh nào rộng hoặc cao quá 2600px (không có chỗ nào hiển thị lớn như vậy)", () => {
    const huge = files.flatMap((f) => { const s = size(f); return s && Math.max(s.w, s.h) > 2600 ? [`${f}: ${s.w}x${s.h}`] : []; });
    expect(huge).toEqual([]);
  });

  it("logo (hiện ở cỡ 30-150px ở mọi trang) nhỏ hơn 150 KB và không quá 512px", () => {
    const path = join(ROOT, "About/logo.png");
    expect(statSync(path).size).toBeLessThan(150 * KB);
    const s = size(path)!;
    expect(Math.max(s.w, s.h)).toBeLessThanOrEqual(512);
  });

  it("tổng dung lượng thư mục ảnh dưới 12 MB", () => {
    const total = files.reduce((sum, f) => sum + statSync(f).size, 0);
    expect(total).toBeLessThan(12 * 1024 * KB);
  });
});
