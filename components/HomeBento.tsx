import Link from "next/link";
import { nav } from "@/lib/site-config";
import { Reveal } from "@/components/motion";

// Ảnh cho một số ô (ảnh nằm trong /public/images). Ô nào không có ảnh sẽ dùng nền gradient + số thứ tự.
const images: Record<string, string> = {
  "/research": "/images/Research/Embedded-system.png",
  "/campus": "/images/Campus/co_hoc_toan_quoc_2026.JPG"
};

// Lưới các khu vực chính theo kiểu ô "Applications" của ti.com: ảnh trên, tiêu đề + mô tả, dòng "Khám phá … →" dưới cùng.
export function HomeBento() {
  return (
    <div className="ti-tiles">
      {nav.map((item, index) => (
        <Reveal key={item.href} i={index} className="ti-tile-cell">
          <Link href={item.href} className="ti-tile" style={{ "--h": 235 + index * 14 } as React.CSSProperties}>
            <span className="ti-tile-media" aria-hidden="true">
              {images[item.href] ? <img src={images[item.href]} alt="" loading="lazy" /> : <b>{String(index + 1).padStart(2, "0")}</b>}
            </span>
            <span className="ti-tile-body">
              <small>{item.en}</small>
              <strong>{item.label}</strong>
              <span>{item.intro}</span>
            </span>
            <span className="ti-tile-cta">
              Khám phá {item.label.toLowerCase()} <i aria-hidden="true">→</i>
            </span>
          </Link>
        </Reveal>
      ))}
    </div>
  );
}
