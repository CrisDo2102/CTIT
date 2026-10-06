import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getResearchInfo } from "@/lib/sheet-data";
import { ResearchExplorer, ResearchHero } from "./ResearchExplorer";

export default async function ResearchPage() {
  const data = await getResearchInfo();

  return (
    <>
      <Header />
      <main>
        <ResearchHero />
        <ResearchExplorer data={data} />
      </main>
      <Footer />
    </>
  );
}
