import Link from "next/link";
import { nav } from "@/lib/site-config";
import { Reveal } from "@/components/motion";

// Ảnh nền cho các ô lớn. Đổi đường dẫn ở đây nếu muốn dùng ảnh khác (ảnh nằm trong /public/images).
// Ô nào không có ảnh sẽ hiển thị dạng thẻ chữ + số thứ tự.
const tiles: Record<string, { image?: string; size?: "big" | "wide" }> = {
  "/research": { image: "/images/Research/embedded.jpg", size: "big" },
  "/campus": { image: "/images/Campus/co_hoc_toan_quoc_2026.JPG", size: "wide" }
};

export function HomeBento() {
  return (
    <div className="bento">
      {nav.map((item, index) => {
        const tile = tiles[item.href] ?? {};
        const classes = ["bento-tile", tile.size ? `is-${tile.size}` : "", tile.image ? "has-image" : ""]
          .filter(Boolean)
          .join(" ");
        return (
          <Reveal key={item.href} i={index} className={`bento-cell ${tile.size ? `is-${tile.size}` : ""}`}>
            <Link href={item.href} className={classes}>
              {tile.image ? (
                <>
                  <img className="bento-bg" src={tile.image} alt="" loading="lazy" />
                  <span className="bento-shade" aria-hidden="true" />
                </>
              ) : null}
              <span className="bento-top">
                <span className="bento-num">{String(index + 1).padStart(2, "0")}</span>
                <span className="bento-en">{item.en}</span>
              </span>
              <span className="bento-body">
                <strong>{item.label}</strong>
                <span>{item.intro}</span>
              </span>
              <span className="bento-arrow" aria-hidden="true">↗</span>
            </Link>
          </Reveal>
        );
      })}
    </div>
  );
}
