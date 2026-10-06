import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedList } from "@/components/FeedList";
import { ResourceCard } from "@/components/ResourceCard";
import { HomeBento } from "@/components/HomeBento";
import { HomeStats } from "@/components/HomeStats";
import { Reveal } from "@/components/motion";
import { getEvents, getNews, getOverviewStats, getResources } from "@/lib/sheet-data";
import "./home.css";

// Ảnh hero & các chip nổi. Đổi tại đây nếu muốn ảnh/nhãn khác (ảnh nằm trong /public/images).
const HERO_IMAGE = "/images/Campus/mot_vai_thanh_vien_cua_ctit.jpg";
const HERO_CHIPS = ["Embedded Systems", "Automotive Electronics", "BMS"];

export default async function HomePage() {
  const [news, events, resources, stats] = await Promise.all([
    getNews(),
    getEvents(),
    getResources(),
    getOverviewStats()
  ]);
  const featured = resources.filter((resource) => resource.featured).slice(0, 3);

  return (
    <>
      <Header />
      <main>
        <section className="hero home-hero">
          <div className="container hero-grid">
            <div className="hero-copy">
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
            <div className="hero-visual">
              <img src={HERO_IMAGE} alt="Thành viên CTIT" />
              {HERO_CHIPS.map((chip, index) => (
                <span key={chip} className={`hero-chip c${index + 1}`}>
                  {chip}
                </span>
              ))}
              <div className="hero-visual-card">
                <small>Closed Thinking Institute of Technology</small>
                <strong>Học, làm và chia sẻ cùng nhau</strong>
              </div>
            </div>
          </div>
        </section>

        <HomeStats stats={stats} />

        <section className="section no-top">
          <div className="container">
            <Reveal>
              <div className="section-title">
                <h2>Khám phá CTIT</h2>
                <p>Tám khu vực chính của cổng thông tin, chọn một ô để bắt đầu.</p>
              </div>
            </Reveal>
            <HomeBento />
          </div>
        </section>

        <section className="section no-top">
          <div className="container">
            <Reveal>
              <div className="section-title">
                <h2>Tin tức mới</h2>
                <Link href="/news">Xem tất cả</Link>
              </div>
              <FeedList items={news.slice(0, 3)} env="NEWS_SHEET_CSV_URL" />
            </Reveal>
          </div>
        </section>

        <section className="section no-top">
          <div className="container">
            <Reveal>
              <div className="section-title">
                <h2>Sự kiện sắp tới</h2>
                <Link href="/events">Xem tất cả</Link>
              </div>
              <FeedList items={events.slice(0, 3)} env="EVENTS_SHEET_CSV_URL" />
            </Reveal>
          </div>
        </section>

        {featured.length > 0 ? (
          <section className="section no-top">
            <div className="container">
              <Reveal>
                <div className="section-title">
                  <h2>Tài liệu nổi bật</h2>
                  <Link href="/resources/documents">Xem tất cả</Link>
                </div>
                <div className="grid three">
                  {featured.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              </Reveal>
            </div>
          </section>
        ) : null}
      </main>
      <Footer />
    </>
  );
}
