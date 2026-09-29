import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { getNews } from "@/lib/sheet-data";
import { NewsView } from "./NewsView";

export default async function NewsPage() {
  const items = await getNews();

  return (
    <>
      <Header />
      <main>
        <NewsView items={items} />
      </main>
      <Footer />
    </>
  );
}
