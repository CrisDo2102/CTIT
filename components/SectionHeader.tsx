import Link from "next/link";

export type SectionHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  href?: string;
  linkLabel?: string;
  id?: string;
  className?: string;
};

/** Compact editorial section heading: mono label + readable title + optional link. */
export function SectionHeader({
  eyebrow,
  title,
  description,
  href,
  linkLabel = "Xem tất cả",
  id,
  className = ""
}: SectionHeaderProps) {
  return (
    <div className={`ctit-section-header ${className}`.trim()}>
      <div className="ctit-section-header-copy">
        {eyebrow ? <p className="ctit-section-eyebrow">{eyebrow}</p> : null}
        <h2 id={id}>{title}</h2>
        {description ? <p className="ctit-section-description">{description}</p> : null}
      </div>
      {href ? <Link href={href} className="ctit-section-more">{linkLabel}<span aria-hidden="true"> →</span></Link> : null}
    </div>
  );
}
