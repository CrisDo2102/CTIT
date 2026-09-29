import type { FeedItem } from "@/lib/dashboard-types";

type Props = { items: FeedItem[]; env: string; gallery?: boolean };

export function FeedList({ items, env, gallery }: Props) {
  if (items.length === 0) {
    return (
      <div className="empty-state">
        Chưa có dữ liệu. Kiểm tra biến môi trường <code>{env}</code> trong <code>.env.local</code>.
      </div>
    );
  }
  return (
    <div className={`grid three ${gallery ? "gallery" : ""}`}>
      {items.map((item, index) => {
        const body = (
          <>
            {item.image ? <img className="feed-img" src={item.image} alt={item.title} loading="lazy" /> : null}
            <div className="feed-body">
              <div className="card-topline">
                {item.tag ? <span className="type">{item.tag}</span> : null}
                {item.date ? <span className="feed-date">{item.date}</span> : null}
              </div>
              <h3>{item.title}</h3>
              {item.summary ? <p>{item.summary}</p> : null}
            </div>
          </>
        );
        return item.url ? (
          <a key={index} className="card feed-card" href={item.url} target="_blank" rel="noreferrer">
            {body}
          </a>
        ) : (
          <article key={index} className="card feed-card">
            {body}
          </article>
        );
      })}
    </div>
  );
}
