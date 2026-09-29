import type { OverviewStat } from "@/lib/dashboard-types";

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
            {stats.map((stat) => (
              <div className="overview-stat" key={stat.label}>
                <strong>{stat.value}</strong>
                <span>{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
