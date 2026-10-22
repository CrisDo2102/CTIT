import { NoData } from "@/components/NoData";
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
          <NoData what="tổng quan" env="OVERVIEW_SHEET_CSV_URL" />
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
