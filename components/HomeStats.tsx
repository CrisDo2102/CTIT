import Link from "next/link";
import type { OverviewStat } from "@/lib/dashboard-types";
import { CountUp, Reveal } from "@/components/motion";

// Dải số liệu nền tối ở cuối trang chủ (bố cục "Where innovation meets impact" của ti.com).
// Dữ liệu lấy từ tab Overview của Google Sheet (cùng nguồn với trang Giới thiệu).
export function HomeStats({ stats }: { stats: OverviewStat[] }) {
  const shown = stats.slice(0, 4);
  if (shown.length === 0) return null;
  return (
    <section className="ti-band">
      <div className="container">
        <Reveal>
          <div className="ti-band-head">
            <h2>CTIT qua những con số</h2>
            <Link className="ti-link on-dark" href="/about">Tìm hiểu thêm <span aria-hidden="true">→</span></Link>
          </div>
          <div className="ti-band-stats" style={{ "--cols": shown.length } as React.CSSProperties}>
            {shown.map((stat) => (
              <div className="ti-band-stat" key={stat.label}>
                <CountUp value={stat.value} />
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
