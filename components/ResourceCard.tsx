import { SafeImage } from "@/components/SafeImage";
import type { Resource, ResourceType } from "@/data/resources";
import { toneOf } from "@/lib/format";

type Props = {
  resource: Resource;
  spotlight?: boolean;
};

// Mau nen fallback cover: on dinh theo title (cung 1 tai lieu luon ra 1 mau),
// dung chung ky thuat hash voi StudentsShowcase de dong bo brand.
export function TypeIcon({ type }: { type: ResourceType | string }) {
  switch (type) {
    case "Code":
      return (
        <svg className="type-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="m9 8-4 4 4 4" />
          <path d="m15 8 4 4-4 4" />
        </svg>
      );
    case "Video":
      return (
        <svg className="type-icon" viewBox="0 0 24 24" aria-hidden="true">
          <rect x="3" y="6" width="13" height="12" />
          <path d="M16 10l5-3v10l-5-3Z" />
        </svg>
      );
    case "Tool":
      return (
        <svg className="type-icon" viewBox="0 0 24 24" aria-hidden="true">
          <line x1="4" y1="6" x2="20" y2="6" />
          <circle cx="9" cy="6" r="2" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <circle cx="15" cy="12" r="2" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="9" cy="18" r="2" />
        </svg>
      );
    case "Website":
      return (
        <svg className="type-icon" viewBox="0 0 24 24" aria-hidden="true">
          <circle cx="12" cy="12" r="9" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <path d="M12 3c2.5 2.7 4 6.1 4 9s-1.5 6.3-4 9c-2.5-2.7-4-6.1-4-9s1.5-6.3 4-9Z" />
        </svg>
      );
    case "Datasheet":
    case "PDF":
    default:
      return (
        <svg className="type-icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M7 3h7l4 4v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M14 3v4h4" />
          <path d="M9 13h6M9 17h6" />
        </svg>
      );
  }
}

export function ResourceCard({ resource, spotlight }: Props) {
  const metaItems = [resource.category, resource.topic, resource.level, resource.source].filter(Boolean);

  return (
    <article className={`card resource-card${spotlight ? " is-spotlight" : ""}`}>
      <div className="resource-cover">
        <SafeImage
          src={resource.cover ?? ""}
          alt={resource.title}
          loading="lazy"
          fallback={
            <div
              className="resource-cover-fallback"
              style={{ ["--tone" as string]: `${toneOf(resource.title)}` }}
              aria-hidden="true"
            >
              <TypeIcon type={resource.type} />
            </div>
          }
        />
      </div>

      <div className="card-topline">
        <span className="type">
          <TypeIcon type={resource.type} />
          {resource.type}
        </span>
        {resource.featured ? <span className="featured">Featured</span> : null}
      </div>

      <h3>{resource.title}</h3>
      {resource.description ? <p>{resource.description}</p> : null}

      {metaItems.length > 0 ? (
        <div className="meta">
          {metaItems.map((item, index) => (
            <span key={`${item}-${index}`}>{item}</span>
          ))}
        </div>
      ) : null}

      <div className="card-action">
        <a className="btn secondary" href={resource.url} target="_blank" rel="noreferrer">
          Mở tài liệu
        </a>
      </div>
    </article>
  );
}
