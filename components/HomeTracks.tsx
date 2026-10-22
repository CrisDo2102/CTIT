import Link from "next/link";
import { Reveal } from "@/components/motion";
import type { AdmissionsTrack } from "@/lib/dashboard-types";

// Mỗi hướng hoạt động là MỘT màn hình riêng (một ý, một tiêu đề, hai nút), theo cách trình bày từng dòng sản phẩm của Tesla:
// nền tối, chữ lớn, ít thứ khác trên màn hình. Dữ liệu lấy từ tab Admissions (mục track). Ảnh sơ đồ nhỏ nên đặt trong khung, không phóng tràn nền.
// Không có hướng nào thì không hiện gì.
const MAX_PANELS = 4;
const isExternal = (href: string) => /^https?:\/\//i.test(href);

export function HomeTracks({ tracks }: { tracks: AdmissionsTrack[] }) {
  const panels = tracks.filter((track) => track.title).slice(0, MAX_PANELS);
  if (panels.length === 0) return null;

  return (
    <section id="huong" className="ct-tracks" aria-label="Các hướng hoạt động">
      {panels.map((track, index) => {
        const number = String(index + 1).padStart(2, "0");
        const learn = track.url || "/admissions";
        return (
          <article key={`${track.title}-${index}`} className={`ct-panel${index % 2 === 1 ? " is-flip" : ""}`} style={{ "--h": 232 + index * 38 } as React.CSSProperties}>
            <div className="container ct-panel-grid">
              <Reveal className="ct-panel-copy">
                <p className="ct-kicker">{number} / Hướng hoạt động</p>
                <h2>{track.title}</h2>
                {track.content ? <p className="ct-lead">{track.content}</p> : null}
                <div className="ct-actions">
                  {isExternal(learn) ? (
                    <a className="ct-btn" href={learn} target="_blank" rel="noopener noreferrer">
                      Tìm hiểu hướng này<span className="sr-only"> (mở tab mới)</span>
                    </a>
                  ) : (
                    <Link className="ct-btn" href={learn}>Tìm hiểu hướng này</Link>
                  )}
                  <Link className="ct-btn is-ghost" href="/resources/documents">Xem tài liệu</Link>
                </div>
              </Reveal>
              <Reveal i={1} className="ct-panel-media">
                {track.image ? <img src={track.image} alt={track.title} loading="lazy" decoding="async" /> : <span className="ct-number" aria-hidden="true">{number}</span>}
              </Reveal>
            </div>
          </article>
        );
      })}
    </section>
  );
}
