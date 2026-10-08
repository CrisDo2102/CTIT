import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { PageHero } from "@/components/PageHero";
import { nav } from "@/lib/site-config";

type Props = {
  slug: string;
  bare?: boolean;
  // Tuy chon: ghi de tieu de (h1) / mo ta (lead) cua banner, dung khi trang
  // muon lay 2 dong nay tu Google Sheet thay vi lib/site-config.ts (vd trang
  // /about lay tu tab Admin: page_title, page_intro). Bo trong thi dung mac
  // dinh trong nav[] nhu cu.
  title?: string;
  intro?: string;
  heroClass?: string;
  children: React.ReactNode;
};

// Khung chung cho các trang con: banner (PageHero) + nội dung + footer.
export function PageShell({ slug, bare, title, intro, heroClass = "", children }: Props) {
  const page = nav.find((item) => item.href === `/${slug}`)!;
  return (
    <>
      <Header />
      <main id="main">
        <PageHero
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
