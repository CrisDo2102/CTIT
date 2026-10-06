import { AboutIntro } from "@/components/AboutIntro";
import { CtitOverview } from "@/components/CtitOverview";
import { PageShell } from "@/components/PageShell";
import { getAboutInfo, getOverviewStats } from "@/lib/sheet-data";

export default async function AboutPage() {
  const [about, stats] = await Promise.all([getAboutInfo(), getOverviewStats()]);
  return (
    <PageShell slug="about" heroClass="about-hero" bare title={about?.pageTitle} intro={about?.pageIntro}>
      <section className="section no-top">
        <div className="container"><AboutIntro about={about} /></div>
      </section>
      <CtitOverview stats={stats} />
    </PageShell>
  );
}
