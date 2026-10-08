import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { InventoryIcon } from "@/components/icons";
import { PageHero } from "@/components/PageHero";
import { SafeImage } from "@/components/SafeImage";
import { SaveButton } from "@/components/SaveButton";
import { toneOf } from "@/lib/format";
import { matchesKeys, relatedKeys, statusClass, statusLabel, withSlugs } from "@/lib/inventory";
import { getCourses, getInventory, getResources } from "@/lib/sheet-data";

type Props = { params: Promise<{ slug: string }> };

const loadItems = cache(async () => withSlugs(await getInventory()));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const item = (await loadItems()).find((entry) => entry.slug === slug);
  if (!item) return { title: "Inventory" };
  return { title: `${item.title} | Inventory`, description: item.description || undefined };
}

export default async function InventoryItemPage({ params }: Props) {
  const { slug } = await params;
  const items = await loadItems();
  const item = items.find((entry) => entry.slug === slug);
  if (!item) notFound();

  // Tài liệu / khóa học liên quan: nối theo mã linh kiện (xem relatedKeys trong lib/inventory.ts).
  const keys = relatedKeys(item);
  const [resources, courses] = keys.length ? await Promise.all([getResources().catch(() => []), getCourses().catch(() => [])]) : [[], []];
  const relatedDocs = resources
    .filter((doc) => matchesKeys(`${doc.title} ${doc.description} ${doc.topic} ${doc.category ?? ""}`, keys))
    .slice(0, 6);
  const relatedCourses = courses
    .filter((course) =>
      matchesKeys(
        `${course.title} ${course.description} ${course.tracks.flatMap((track) => track.lessons.map((lesson) => `${lesson.title} ${lesson.description}`)).join(" ")}`,
        keys
      )
    )
    .slice(0, 4);
  const sameCategory = item.category ? items.filter((entry) => entry.category === item.category && entry.slug !== item.slug).slice(0, 4) : [];

  const specs: [string, string][] = [
    ["Danh mục", item.category],
    ["Hãng", item.manufacturer],
    ["Model", item.model],
    ["Số lượng", `${item.quantity} ${item.unit || "đơn vị"}`],
    ["Vị trí", item.location]
  ];

  return (
    <>
      <Header />
      <main id="main">
        <PageHero
          eyebrow="Resources / Inventory"
          title={item.title}
          intro={item.description || undefined}
          parent={{ label: "Inventory", href: "/resources/inventory" }}
          aside={
            <div className="ph-cover">
              <SafeImage
                src={item.image}
                alt=""
                loading="eager"
                fallback={<div className="inventory-image-fallback" style={{ ["--tone" as string]: `${toneOf(item.title)}`, height: "100%" }}><InventoryIcon /></div>}
              />
            </div>
          }
        />

        <section className="section no-top">
          <div className="container item-layout">
            <div className="item-main">
              <div className="item-status-row">
                <span className={statusClass(item.status)}>{statusLabel(item.status)}</span>
                {item.currentUser ? <span className="item-user">Đang sử dụng: <strong>{item.currentUser}</strong></span> : null}
              </div>

              <dl className="item-specs">
                {specs.filter(([, value]) => value).map(([label, value]) => (
                  <div key={label}>
                    <dt>{label}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>

              <div className="item-actions">
                {item.datasheet ? <a className="btn" href={item.datasheet} target="_blank" rel="noopener noreferrer">Datasheet<span className="sr-only"> (mở tab mới)</span></a> : null}
                {item.purchaseUrl ? <a className="btn secondary" href={item.purchaseUrl} target="_blank" rel="noopener noreferrer">Nơi mua<span className="sr-only"> (mở tab mới)</span></a> : null}
                <SaveButton
                  variant="pill"
                  item={{ id: `vat-tu:${item.slug}`, kind: "Vật tư", title: item.title, sub: [item.category, item.model].filter(Boolean).join(" · "), href: `/resources/inventory/${item.slug}` }}
                />
              </div>
            </div>

            <aside className="item-side">
              <h2>Tài liệu và khóa học liên quan</h2>
              {relatedDocs.length === 0 && relatedCourses.length === 0 ? (
                <p className="item-empty">Chưa có tài liệu nào nhắc tới {item.model || item.title}. Ghi mã linh kiện vào tiêu đề, topic hoặc mô tả của tài liệu trong Sheet thì sẽ tự hiện ở đây.</p>
              ) : (
                <ul className="item-related">
                  {relatedCourses.map((course) => (
                    <li key={`course-${course.slug}`}>
                      <Link href={`/resources/courses/${course.slug}`}><span>Khóa học</span>{course.title}</Link>
                    </li>
                  ))}
                  {relatedDocs.map((doc) => (
                    <li key={`doc-${doc.id}-${doc.url}`}>
                      <a href={doc.url} target="_blank" rel="noopener noreferrer"><span>{doc.type || "Tài liệu"}</span>{doc.title}</a>
                    </li>
                  ))}
                </ul>
              )}
            </aside>
          </div>

          {sameCategory.length > 0 ? (
            <div className="container item-more">
              <h2>Cùng danh mục “{item.category}”</h2>
              <ul>
                {sameCategory.map((entry) => (
                  <li key={entry.slug}>
                    <Link href={`/resources/inventory/${entry.slug}`}>
                      <strong>{entry.title}</strong>
                      <span>{[entry.model, `${entry.quantity} ${entry.unit || "đơn vị"}`].filter(Boolean).join(" · ")}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </section>
      </main>
      <Footer />
    </>
  );
}
