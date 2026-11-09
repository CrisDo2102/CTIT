import { navMetadata } from "@/lib/page-meta";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getResearchInfo } from "@/lib/sheet-data";
import { ResearchExplorer, ResearchHero } from "./ResearchExplorer";

export const metadata = navMetadata("/research");

export default async function ResearchPage() {
  const data = await getResearchInfo();

  return (
    <>
      <Header />
      <main id="main" data-ctit-accent="research">
        <ResearchHero />
        <ResearchExplorer data={data} />
      </main>
      <Footer />
    </>
  );
}
