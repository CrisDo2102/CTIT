import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedList } from "@/components/FeedList";
import { ResourceCard } from "@/components/ResourceCard";
import { getEvents, getNews, getResources } from "@/lib/sheet-data";
import { nav } from "@/lib/site-config";

export default async function HomePage() {
  const [news, events, resources] = await Promise.all([getNews(), getEvents(), getResources()]);
  const featured = resources.filter((resource) => resource.featured).slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <section className="hero">
          <div className="container">
            <p className="eyebrow">CTIT</p>
            <h1>Cổng thông tin CTIT</h1>
            <p className="lead">
              Giới thiệu, học viên, tài liệu, tin tức và sự kiện của CTIT, gom về một nơi.
            </p>
            <div className="actions">
              <Link className="btn" href="/about">
                Tìm hiểu CTIT
              </Link>
              <Link className="btn secondary" href="/admissions">
                Cách tham gia
              </Link>
            </div>
          </div>
        </section>

        <section className="section no-top">
          <div className="container grid three">
            {nav.map((item) => (
              <Link key={item.href} href={item.href} className="card quick">
                <span className="type">{item.en}</span>
                <h3>{item.label}</h3>
                <p>{item.intro}</p>
              </Link>
            ))}
          </div>
        </section>

        <section className="section no-top">
          <div className="container">
            <div className="section-title">
              <h2>Tin tức mới</h2>
              <Link href="/news">Xem tất cả</Link>
            </div>
            <FeedList items={news.slice(0, 3)} env="NEWS_SHEET_CSV_URL" />
          </div>
        </section>

        <section className="section no-top">
          <div className="container">
            <div className="section-title">
              <h2>Sự kiện sắp tới</h2>
              <Link href="/events">Xem tất cả</Link>
            </div>
            <FeedList items={events.slice(0, 3)} env="EVENTS_SHEET_CSV_URL" />
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="section no-top">
            <div className="container">
              <div className="section-title">
                <h2>Tài liệu nổi bật</h2>
                <Link href="/resources/documents">Xem tất cả</Link>
              </div>
              <div className="grid three">
                {featured.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
