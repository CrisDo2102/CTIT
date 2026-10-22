import type { Metadata } from "next";
import Link from "next/link";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { PageHero } from "@/components/PageHero";
import { appVersion, changelog } from "@/data/changelog";

export const metadata: Metadata = {
  title: "Có gì mới",
  description: "Các cập nhật gần đây của cổng thông tin CTIT."
};

export default function ChangelogPage() {
  return (
    <>
      <Header />
      <main id="main">
        <PageHero eyebrow="What's new" title="Có gì mới" intro={`Phiên bản hiện tại: ${appVersion}. Các cập nhật gần đây của cổng thông tin CTIT, mới nhất ở trên.`} />
        <section className="section no-top">
          <div className="container">
            <ol className="cl-list">
              {changelog.map((entry, index) => (
                <li key={entry.version} className={`cl-entry${index === 0 ? " is-latest" : ""}`}>
                  <div className="cl-meta">
                    <span className="cl-version">v{entry.version}</span>
                    <time>{entry.date}</time>
                    {index === 0 ? <span className="cl-badge">Mới nhất</span> : null}
                  </div>
                  <div className="cl-body">
                    <h2>{entry.title}</h2>
                    <ul>
                      {entry.items.map((item) => (
                        <li key={item.text}>
                          {item.text}
                          {item.href ? <Link href={item.href} className="cl-try"> Xem thử →</Link> : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
