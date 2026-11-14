import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PageHero } from "@/components/PageHero";
import { SectionHeader } from "@/components/SectionHeader";

describe("CTIT 2.3 unified design system", () => {
  it("renders compact listing banner with scoped accent and authentic zero stats", () => {
    const html = renderToStaticMarkup(
      <PageHero variant="compact" accent="resources" eyebrow="Resources" title="Tài liệu" stats={[{ value: 0, label: "tài liệu" }]} />
    );
    expect(html).toContain('data-ctit-hero="compact"');
    expect(html).toContain('data-ctit-accent="resources"');
    expect(html).toContain("Tài liệu");
    expect(html).toContain("tài liệu</span>");
    expect(html).toContain(">0</b>");
  });

  it("keeps backward-compatible standard variant", () => {
    const html = renderToStaticMarkup(<PageHero eyebrow="CTIT" title="Giới thiệu" />);
    expect(html).toContain('data-ctit-hero="standard"');
    expect(html).toContain("Giới thiệu");
  });

  it("uses a quiet reading banner", () => {
    const html = renderToStaticMarkup(<PageHero variant="reading" eyebrow="Courses" title="Lập trình nhúng" />);
    expect(html).toContain('data-ctit-hero="reading"');
  });

  it("renders a semantic section heading without an empty link", () => {
    const html = renderToStaticMarkup(<SectionHeader eyebrow="LAB / 01" title="Khám phá tài nguyên" />);
    expect(html).toContain("<h2>");
    expect(html).toContain("LAB / 01");
    expect(html).not.toContain("<a ");
  });
});
