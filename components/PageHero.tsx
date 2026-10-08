import Link from "next/link";
import type { ReactNode } from "react";

export type ParentLink = { label: string; href: string };
export type HeroStat = { value: string | number; label: string };

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  /** Mục cha của trang con (vd. "Tài nguyên" cho /resources/documents). Trang cấp 1 để trống. */
  parent?: ParentLink;
  stats?: HeroStat[];
  /** Cột bên phải (ảnh bìa, thẻ số liệu...). */
  aside?: ReactNode;
  /** Nút/hành động dưới phần mô tả. */
  children?: ReactNode;
  className?: string;
};

// Banner đầu trang dùng chung: nền tối + lưới (cùng ngôn ngữ với /about và /research),
// breadcrumb, eyebrow, tiêu đề, mô tả, dải số liệu và 1 cột phụ tuỳ chọn.
export function PageHero({ eyebrow, title, intro, parent, stats = [], aside, children, className = "" }: Props) {
  const visibleStats = stats.filter((s) => s.value !== 0 && s.value !== "");
  return (
    <section className={`page-hero ph ${className}`.trim()}>
      <div className={`ph-inner${aside ? " has-aside" : ""}`}>
        <div className="ph-copy">
          {parent ? (
            <Link href={parent.href} className="ph-back">
              <span aria-hidden="true">←</span> {parent.label}
            </Link>
          ) : null}
          <p className="eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          {intro ? <p className="lead">{intro}</p> : null}
          {visibleStats.length > 0 ? (
            <ul className="ph-stats">
              {visibleStats.map((s) => (
                <li key={s.label}>
                  <b>{s.value}</b>
                  <span>{s.label}</span>
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
