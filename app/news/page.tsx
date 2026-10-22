import { navMetadata } from "@/lib/page-meta";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getNews } from "@/lib/sheet-data";
import { NewsView } from "./NewsView";

export const metadata = navMetadata("/news");

export default async function NewsPage() {
  const items = await getNews();

  return (
    <>
      <Header />
      <main id="main">
        <NewsView items={items} />
      </main>
      <Footer />
    </>
  );
}
