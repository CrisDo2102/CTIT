import { navMetadata } from "@/lib/page-meta";
import { AboutIntro } from "@/components/AboutIntro";
import { CtitOverview } from "@/components/CtitOverview";
import AboutExperience from "@/components/ctit-about/AboutPage";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getAboutInfo, getOverviewStats } from "@/lib/sheet-data";

export const metadata = navMetadata("/about");

export default async function AboutPage() {
  const [about, stats] = await Promise.all([getAboutInfo(), getOverviewStats()]);
  return (
    <>
      <Header />
      <main id="main" className="ctit-page-shell">
        <AboutExperience
          title={about?.pageTitle}
          intro={about?.pageIntro}
          profile={about ? <AboutIntro about={about} /> : undefined}
          overview={stats.length > 0 ? <CtitOverview stats={stats} /> : undefined}
        />
      </main>
      <Footer />
    </>
  );
}
