import type { OverviewStat } from "@/lib/dashboard-types";
import { CountUp, Reveal } from "@/components/motion";

// Dải số liệu ngay dưới hero. Dữ liệu lấy từ tab Overview của Google Sheet (cùng nguồn với trang Giới thiệu).
export function HomeStats({ stats }: { stats: OverviewStat[] }) {
  const shown = stats.slice(0, 4);
  if (shown.length === 0) return null;
  return (
    <section className="home-stats-wrap">
      <div className="container">
        <Reveal>
          <div className="home-stats" style={{ "--cols": shown.length } as React.CSSProperties}>
            {shown.map((stat) => (
              <div className="home-stat" key={stat.label}>
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
