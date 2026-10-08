import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FeedList } from "@/components/FeedList";
import { HomeCarousel, type HeroSlide } from "@/components/HomeCarousel";
import { HomeNews } from "@/components/HomeNews";
import { ResourceCard } from "@/components/ResourceCard";
import { HomeBento } from "@/components/HomeBento";
import { HomeStats } from "@/components/HomeStats";
import { HomeQuickStart } from "@/components/HomeQuickStart";
import { HomeTopics, type Topic } from "@/components/HomeTopics";
import { HomeEventBanner } from "@/components/HomeEventBanner";
import { HomeStartHere } from "@/components/HomeStartHere";
import { Reveal } from "@/components/motion";
import { getCourses, getEvents, getInventory, getNews, getOverviewStats, getResources } from "@/lib/sheet-data";
import "./home.css";

// Ảnh slide đầu tiên. Đổi tại đây nếu muốn ảnh khác (ảnh nằm trong /public/images).
const HERO_IMAGE = "/images/Campus/mot_vai_thanh_vien_cua_ctit.jpg";

const clip = (text: string, max = 160) => (text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text);

export default async function HomePage() {
  const [news, events, resources, stats, courses, inventory] = await Promise.all([
    getNews(),
    getEvents(),
    getResources(),
    getOverviewStats(),
    getCourses(),
    getInventory()
  ]);
  const featured = resources.filter((resource) => resource.featured).slice(0, 3);
  const featuredEvent = events.find((event) => event.featured);

  // Khối có tab "Tài nguyên cho bạn": 3 mục đầu của mỗi nhóm (tab nào chưa có dữ liệu thì không hiện).
  const topicSources: Topic[] = [
    {
      id: "documents",
      label: "Tài liệu",
      blurb: "Sách, PDF, video, link học tập và tài liệu kỹ thuật.",
      href: "/resources/documents",
      cta: "Xem tất cả tài liệu",
      cards: (featured.length > 0 ? featured : resources.slice(0, 3)).map((r) => ({
        title: r.title,
        meta: [r.type, r.category || r.topic].filter(Boolean).join(" · "),
        text: r.description ? clip(r.description, 90) : undefined,
        href: r.url || "/resources/documents",
        external: /^https?:/.test(r.url || ""),
        image: r.cover
      }))
    },
    {
      id: "courses",
      label: "Khóa học",
      blurb: "Lộ trình học theo từng môn, mỗi bài là một link dẫn tới video, slide hoặc tài liệu.",
      href: "/resources/courses",
      cta: "Xem tất cả khóa học",
      cards: courses.slice(0, 3).map((c) => ({
        title: c.title,
        meta: c.lessonCount > 0 ? `${c.lessonCount} bài` : undefined,
        text: c.description ? clip(c.description, 90) : undefined,
        href: `/resources/courses/${c.slug}`,
        image: c.image
      }))
    },
    {
      id: "inventory",
      label: "Inventory",
      blurb: "Linh kiện, vi điều khiển, module và vật tư kỹ thuật của CTIT.",
      href: "/resources/inventory",
      cta: "Xem toàn bộ Inventory",
      cards: inventory.slice(0, 3).map((i) => ({
        title: i.title,
        meta: [i.category, i.status].filter(Boolean).join(" · ") || undefined,
        text: [i.manufacturer, i.model].filter(Boolean).join(" ") || (i.description ? clip(i.description, 90) : undefined),
        href: "/resources/inventory",
        image: i.image
      }))
    }
  ];
  const topics = topicSources.filter((t) => t.cards.length > 0);

  // Slide 1 là phần giới thiệu CTIT; slide 2-3 lấy tin mới nhất và sự kiện đầu tiên từ Google Sheet (không có thì bỏ).
  const slides: HeroSlide[] = [
    {
      eyebrow: "Closed Thinking Institute of Technology",
      title: "Cổng thông tin CTIT",
      text: "Học viên, tài liệu, tin tức và sự kiện của CTIT — mọi thứ để bạn tìm hiểu và bắt đầu.",
      cta: "Tìm hiểu CTIT",
      href: "/about",
      image: HERO_IMAGE
    }
  ];
  if (news[0]) {
    slides.push({
      eyebrow: "Tin mới",
      title: news[0].title,
      text: news[0].summary ? clip(news[0].summary) : undefined,
      cta: "Đọc bài",
      href: news[0].url || "/news",
      external: /^https?:/.test(news[0].url || ""),
      image: news[0].image || undefined
    });
  }
  if (events[0]) {
    slides.push({
      eyebrow: "Sự kiện",
      title: events[0].title,
      text: [events[0].date, events[0].place].filter(Boolean).join(" · ") || (events[0].summary ? clip(events[0].summary) : undefined),
      cta: "Xem chi tiết",
      href: events[0].url || "/events",
      external: /^https?:/.test(events[0].url || ""),
      image: events[0].image || undefined
    });
  }


  return (
    <>
      <Header />
      <main id="main">
        <HomeCarousel slides={slides} />
        <HomeQuickStart />

        <section className="section">
          <div className="container">
            <Reveal>
              <div className="section-title">
                <h2>Khám phá CTIT</h2>
                <p>Chọn một chủ đề để bắt đầu.</p>
              </div>
            </Reveal>
            <HomeBento />
          </div>
        </section>

        {topics.length > 0 ? (
          <section className="section ti-alt">
            <div className="container">
              <Reveal>
                <div className="section-title">
                  <h2>Tài nguyên cho bạn</h2>
                  <p>Chọn một nhóm để xem các mục mới.</p>
                </div>
                <HomeTopics topics={topics} />
              </Reveal>
            </div>
          </section>
        ) : null}

        <section className="section ti-alt">
          <div className="container">
            <Reveal>
              <div className="section-title">
                <h2>Tin tức mới</h2>
                <Link href="/news">Xem tất cả</Link>
              </div>
              <HomeNews items={news.slice(0, 4)} />
            </Reveal>
          </div>
        </section>

        <section className="section">
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

        {featuredEvent ? <HomeEventBanner event={featuredEvent} /> : null}

        {featured.length > 0 ? (
          <section className="section ti-alt">
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

        <HomeStartHere
          items={[
            { kicker: "Học", count: courses.length, unit: "khóa học", text: "Lộ trình học theo từng môn, xếp theo thứ tự nên học.", cta: "Bắt đầu học", href: "/resources/courses" },
            { kicker: "Tra cứu", count: resources.length, unit: "tài liệu", text: "Sách, PDF, video và tài liệu kỹ thuật.", cta: "Tìm tài liệu", href: "/resources/documents" },
            { kicker: "Làm", count: inventory.length, unit: "mặt hàng", text: "Linh kiện và vật tư có sẵn cho dự án của bạn.", cta: "Xem Inventory", href: "/resources/inventory" }
          ]}
        />

        <HomeStats stats={stats} />

        <section className="ti-cta-band">
          <div className="container ti-cta-inner">
            <div>
              <h2>Tham gia CTIT</h2>
              <p>Xem các bước và yêu cầu để trở thành một phần của CTIT.</p>
            </div>
            <Link className="btn" href="/admissions">Cách tham gia →</Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
