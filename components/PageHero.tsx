import type { ReactNode } from "react";
import { BackLink } from "@/components/BackLink";

export type ParentLink = { label: string; href: string };
export type HeroStat = { value: string | number; label: string };
export type HeroVariant = "standard" | "compact" | "reading";
export type HeroAccent = "resources" | "research" | "events" | "schools" | "news" | "neutral";

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  parent?: ParentLink;
  stats?: HeroStat[];
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  /** Compact for list/discovery pages; reading for distraction-free details. */
  variant?: HeroVariant;
  accent?: HeroAccent;
};

/**
 * A single page hero API across CTIT, without forcing the homepage layout
 * onto listings and reading pages. The legacy standard variant is unchanged.
 */
export function PageHero({
  eyebrow,
  title,
  intro,
  parent,
  stats = [],
  aside,
  children,
  className = "",
  variant = "standard",
  accent = "neutral"
}: Props) {
  // Zero is a real value (empty inventory, no courses, etc.) and must be visible.
  const visibleStats = stats.filter((item) => String(item.value).trim() !== "");
  return (
    <section
      className={`page-hero ph ${className}`.trim()}
      data-ctit-hero={variant}
      data-ctit-accent={accent}
      aria-label={`${title} — giới thiệu trang`}
    >
      <div className={`ph-inner${aside ? " has-aside" : ""}`}>
        <div className="ph-copy">
          {parent ? <BackLink href={parent.href} label={parent.label} /> : null}
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {intro ? <p className="lead">{intro}</p> : null}
          {visibleStats.length > 0 ? (
            <ul className="ph-stats" aria-label="Số liệu của trang">
              {visibleStats.map((item) => (
                <li key={item.label}>
                  <b>{item.value}</b>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
          {children ? <div className="ph-actions">{children}</div> : null}
        </div>
        {aside ? <div className="ph-aside">{aside}</div> : null}
      </div>
    </section>
  );
}
