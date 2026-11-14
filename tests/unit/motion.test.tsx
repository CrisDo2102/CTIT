import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { CanWaveform, PCBSignal } from "@/components/motion/SignalVisuals";

describe("CTIT 2.1 Subtle Motion", () => {
  it("PCB chỉ là hình minh họa và không cản chuột", () => {
    const html = renderToStaticMarkup(<PCBSignal />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('ctit-pcb-signal');
    expect(html).toContain('data-motion-active="false"');
  });

  it("waveform có nhãn mô phỏng và mô tả trợ năng, không giả dữ liệu live", () => {
    const html = renderToStaticMarkup(<CanWaveform />);
    expect(html).toContain("Mô phỏng tín hiệu");
    expect(html).toContain("không phải dữ liệu đo trực tiếp");
    expect(html).toContain('data-motion-active="false"');
    expect(html).not.toContain("LIVE");
  });
});
