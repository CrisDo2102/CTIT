import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const css = (file: string) => readFileSync(file, "utf8");

describe("CTIT sticky offsets regression", () => {
  it("pills below header with lower z-index", () => {
    for (const file of ["app/admissions/admissions.css", "app/news/news.css", "app/research/research.css"]) {
      const source = css(file);
      expect(source).toContain("var(--sticky-stack-before, 0px)");
      expect(source).toContain("z-index:var(--z-sticky, 15)");
      expect(source).not.toMatch(/(?:adm-nav-wrap|nw-nav-wrap|rx-tabs-wrap)\{position:sticky;top:12px/);
    }
  });

  it("scroll padding and desktop inventory panel adapt to measured header", () => {
    const extras = css("app/extras.css");
    expect(extras).toContain("scroll-padding-top: calc(var(--sticky-top) + 16px)");
    expect(extras).toContain("max-height: calc(100dvh - var(--sticky-top) - 38px)");
    expect(extras).toContain("top: var(--sticky-top)");
  });

  it("does not override internal table stickiness", () => {
    const globals = css("app/globals.css");
    expect(globals).toMatch(/\.inventory-table thead th\s*\{\s*position: sticky; top: 0;/);
    expect(globals).toMatch(/\.compare-table thead th\s*\{\s*position: sticky; top: 0;/);
  });
});
