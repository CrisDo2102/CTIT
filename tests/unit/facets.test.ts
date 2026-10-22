import { describe, expect, it } from "vitest";
import { countSelected, emptySelected, readSelected, runFacets, toggleValue, uniqueValues, writeSelected } from "@/lib/facets";

type Item = { cat: string; maker: string; status: string };
const KEYS = ["cat", "maker", "status"] as const;
const get = { cat: (i: Item) => i.cat, maker: (i: Item) => i.maker, status: (i: Item) => i.status };

// Cách làm "ngây thơ" (lọc lại toàn bộ cho từng nhóm) để đối chiếu với thuật toán một lượt.
function naive(items: Item[], sel: Record<(typeof KEYS)[number], string[]>, accept: (i: Item) => boolean) {
  const passes = (it: Item, skip?: string) => KEYS.every((k) => k === skip || !sel[k].length || sel[k].includes(it[k])) && accept(it);
  const counts = Object.fromEntries(KEYS.map((k) => [k, new Map<string, number>()])) as Record<(typeof KEYS)[number], Map<string, number>>;
  for (const k of KEYS) for (const it of items) if (passes(it, k)) counts[k].set(it[k], (counts[k].get(it[k]) ?? 0) + 1);
  return { results: items.filter((it) => passes(it)), counts };
}

function lcg(seed: number) {
  let s = seed;
  return () => (s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296;
}

describe("runFacets", () => {
  it("cho cùng kết quả và số đếm như cách lọc lại từng nhóm (300 bộ dữ liệu ngẫu nhiên)", () => {
    const rnd = lcg(11);
    const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
    const vals = { cat: ["A", "B", "C", "D"], maker: ["ST", "TI", "NXP"], status: ["ok", "low"] };
    for (let t = 0; t < 300; t++) {
      const items: Item[] = Array.from({ length: 80 }, () => ({ cat: pick(vals.cat), maker: pick(vals.maker), status: pick(vals.status) }));
      const sel = Object.fromEntries(KEYS.map((k) => [k, vals[k].filter(() => rnd() < 0.4)])) as Record<(typeof KEYS)[number], string[]>;
      const accept = (i: Item) => i.cat !== "D" || sel.cat.length > 0;
      const a = naive(items, sel, accept);
      const b = runFacets(items, KEYS, get, sel, accept);
      expect(b.results).toEqual(a.results);
      for (const k of KEYS) expect([...b.counts[k]].sort()).toEqual([...a.counts[k]].sort());
    }
  });

  it("không chọn gì: mọi món đều là kết quả và đếm đủ", () => {
    const items: Item[] = [
      { cat: "A", maker: "ST", status: "ok" },
      { cat: "A", maker: "TI", status: "ok" }
    ];
    const { results, counts } = runFacets(items, KEYS, get, emptySelected(KEYS), () => true);
    expect(results).toHaveLength(2);
    expect(counts.cat.get("A")).toBe(2);
    expect(counts.maker.get("ST")).toBe(1);
  });

  it("điều kiện chung (accept) loại món khỏi cả kết quả lẫn số đếm", () => {
    const items: Item[] = [
      { cat: "A", maker: "ST", status: "ok" },
      { cat: "B", maker: "ST", status: "ok" }
    ];
    const { results, counts } = runFacets(items, KEYS, get, emptySelected(KEYS), (i) => i.cat === "A");
    expect(results).toHaveLength(1);
    expect(counts.cat.has("B")).toBe(false);
  });
});

describe("tiện ích facet", () => {
  it("toggleValue thêm rồi bớt, không sửa mảng gốc", () => {
    const base = ["a"];
    expect(toggleValue(base, "b")).toEqual(["a", "b"]);
    expect(toggleValue(["a", "b"], "a")).toEqual(["b"]);
    expect(base).toEqual(["a"]);
  });

  it("countSelected và uniqueValues", () => {
    expect(countSelected({ cat: ["a", "b"], maker: [], status: ["x"] })).toBe(3);
    expect(uniqueValues([{ v: "a" }, { v: "" }, { v: "b" }, { v: "a" }], (i) => i.v)).toEqual(["a", "b"]);
  });

  it("ghi rồi đọc lại từ link, và bỏ giá trị không còn trong dữ liệu", () => {
    const param = { cat: "cat", maker: "mk", status: "st" };
    const params = new URLSearchParams();
    writeSelected(params, KEYS, param, { cat: ["A", "B"], maker: ["Hãng X"], status: [] });
    expect(params.toString()).toBe("cat=A&cat=B&mk=H%C3%A3ng+X");
    const back = readSelected(new URLSearchParams(params.toString()), KEYS, param, { cat: ["A"], maker: ["Hãng X"], status: [] });
    expect(back).toEqual({ cat: ["A"], maker: ["Hãng X"], status: [] });
  });
});
