import type { OverviewStat } from "@/lib/dashboard-types";
import { CountUp, Reveal } from "@/components/motion";

type Props = {
  stats: OverviewStat[];
};

export function CtitOverview({ stats }: Props) {
  return (
    <section className="section no-top">
      <div className="container">
        <div className="section-title">
          <h2>Tổng quan CTIT</h2>
          <p>Những con số nổi bật về hoạt động và cộng đồng CTIT, được cập nhật thường xuyên.</p>
        </div>

        {stats.length === 0 ? (
          <div className="empty-state">
            Chưa có dữ liệu tổng quan. Kiểm tra biến môi trường{" "}
            <code>OVERVIEW_SHEET_CSV_URL</code> trong <code>.env.local</code>.
          </div>
        ) : (
          <div className="overview-grid">
            {stats.map((stat, index) => (
              <Reveal i={index % 4} key={stat.label}>
                <div className="overview-stat">
                  <em>{String(index + 1).padStart(2, "0")}</em>
                  <strong><CountUp value={stat.value} /></strong>
                  <span>{stat.label}</span>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
