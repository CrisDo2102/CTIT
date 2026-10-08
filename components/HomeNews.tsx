import type { FeedItem } from "@/lib/dashboard-types";
import { FeedList } from "@/components/FeedList";

const open = (url: string) => (url ? { href: url, target: "_blank", rel: "noreferrer" } : null);

// "Latest articles" kiểu ti.com: 1 bài nổi bật lớn bên trái + danh sách bài bên phải, mỗi dòng "ngày | chuyên mục".
export function HomeNews({ items }: { items: FeedItem[] }) {
  if (items.length === 0) return <FeedList items={[]} env="NEWS_SHEET_CSV_URL" />;
  const [lead, ...rest] = items;
  const leadLink = open(lead.url);

  const Meta = ({ item }: { item: FeedItem }) => (
    <p className="ti-meta">{[item.date, item.tag].filter(Boolean).join(" | ") || "Tin tức"}</p>
  );

  return (
    <div className="ti-news">
      <article className="ti-news-lead">
        {lead.image ? (
          <a className="ti-news-img" {...(leadLink ?? { href: "/news" })} aria-hidden="true" tabIndex={-1}>
            <img src={lead.image} alt="" loading="lazy" />
          </a>
        ) : null}
        <Meta item={lead} />
        <h3><a {...(leadLink ?? { href: "/news" })}>{lead.title}</a></h3>
        {lead.summary ? <p>{lead.summary}</p> : null}
        <a className="ti-link" {...(leadLink ?? { href: "/news" })}>Đọc bài <span aria-hidden="true">→</span></a>
      </article>
      {rest.length > 0 ? (
        <ul className="ti-news-list">
          {rest.map((item, i) => {
            const link = open(item.url);
            return (
              <li key={`${item.title}-${i}`}>
                <Meta item={item} />
                <h3><a {...(link ?? { href: "/news" })}>{item.title}</a></h3>
                <a className="ti-link" {...(link ?? { href: "/news" })}>Đọc bài <span aria-hidden="true">→</span></a>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
