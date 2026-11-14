import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero, type HeroAccent, type HeroVariant } from "@/components/PageHero";
import { nav } from "@/lib/site-config";

type Props = {
  slug: string;
  bare?: boolean;
  title?: string;
  intro?: string;
  heroClass?: string;
  heroVariant?: HeroVariant;
  heroAccent?: HeroAccent;
  children: React.ReactNode;
};

const ACCENTS: Partial<Record<string, HeroAccent>> = {
  events: "events",
  schools: "schools",
  campus: "neutral",
  resources: "resources"
};

/** Shared app shell; each page decides its density, not its brand identity. */
export function PageShell({
  slug,
  bare,
  title,
  intro,
  heroClass = "",
  heroVariant,
  heroAccent,
  children
}: Props) {
  const page = nav.find((item) => item.href === `/${slug}`);
  if (!page) throw new Error(`PageShell: unknown page slug "${slug}"`);

  const variant = heroVariant ?? (slug === "about" ? "standard" : "compact");
  const accent = heroAccent ?? ACCENTS[slug] ?? "neutral";

  return (
    <>
      <Header />
      <main id="main" className="ctit-page-shell" data-ctit-page={variant}>
        <PageHero
          variant={variant}
          accent={accent}
          className={heroClass}
          eyebrow={page.en}
          title={title || page.label}
          intro={intro || page.intro}
        />
        {bare ? (
          children
        ) : (
          <section className="section no-top">
            <div className="container">{children}</div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
