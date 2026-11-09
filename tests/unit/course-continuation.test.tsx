import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { CourseHardware } from "@/components/CourseHardware";
import { LearningSummary } from "@/components/CourseProgressUI";

vi.mock("@/lib/saved", () => ({
  useDone: () => ({ done: new Set(["mcu:avr:0", "mcu:arm:0"]) })
}));

describe("course continuation", () => {
  it("opens the first unfinished lesson even in a later branch", () => {
    const html = renderToStaticMarkup(<LearningSummary courses={[
      { slug:"mcu", title:"Vi điều khiển", ids:["mcu:avr:0", "mcu:arm:0", "mcu:arm:1"] }
    ]}/>);
    expect(html).toContain("/resources/courses/mcu?track=arm&amp;lesson=1");
  });

  it("keeps the inventory detail link when borrowing is unavailable", () => {
    const html = renderToStaticMarkup(<CourseHardware course="MCU" track="ARM" parts={[
      { slug:"blue-pill", title:"Blue Pill", quantity:0, unit:"cái", status:"Hết hàng", canInquire:false }
    ]}/>);
    expect(html).toContain("/resources/inventory/blue-pill");
    expect(html).toContain("Hết hàng");
    expect(html).not.toContain("mailto:");
  });

  it("opens an inquiry draft for available stock", () => {
    const html = renderToStaticMarkup(<CourseHardware course="MCU" track="ARM" parts={[
      { slug:"blue-pill", title:"Blue Pill", quantity:2, unit:"cái", status:"Còn hàng", canInquire:true }
    ]}/>);
    expect(html).toContain("mailto:");
    expect(html).toContain(encodeURIComponent("Hỏi mượn Blue Pill cho môn MCU"));
  });
});
