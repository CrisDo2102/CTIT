"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animation chỉ chạy khi đang nhìn thấy vùng minh họa và tab còn hoạt động.
 * Không có requestAnimationFrame, WebGL hoặc dữ liệu giả từ server.
 */
function useVisibleMotion() {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const coarsePointer = window.matchMedia("(pointer: coarse)");
    let inViewport = !("IntersectionObserver" in window);
    const sync = () => {
      setActive(inViewport && document.visibilityState === "visible" && !preference.matches && !coarsePointer.matches);
    };

    const observer = "IntersectionObserver" in window
      ? new IntersectionObserver(([entry]) => {
          inViewport = entry.isIntersecting;
          sync();
        }, { threshold: 0.05 })
      : null;

    observer?.observe(element);
    preference.addEventListener("change", sync);
    coarsePointer.addEventListener("change", sync);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      observer?.disconnect();
      preference.removeEventListener("change", sync);
      coarsePointer.removeEventListener("change", sync);
      document.removeEventListener("visibilitychange", sync);
    };
  }, []);

  return { ref, active };
}

const PCB_TRACES = [
  "M8 30H84L104 50H186L210 26H292",
  "M4 72H50L80 102H170L194 78H294",
  "M28 122H102L128 96H216L240 120H302",
  "M52 10V28H116L136 48",
  "M272 146V122H244L222 100"
];

/** Minh họa đường mạch, không phải số liệu phần cứng thật. */
export function PCBSignal() {
  const { ref, active } = useVisibleMotion();

  return (
    <div ref={ref} className="ctit-pcb-signal" data-motion-active={active ? "true" : "false"} aria-hidden="true">
      <svg viewBox="0 0 310 158" preserveAspectRatio="xMidYMid meet" focusable="false">
        {PCB_TRACES.map((path, index) => (
          <g key={path}>
            <path className="ctit-pcb-trace" d={path} />
            {index < 3 ? <path className="ctit-pcb-pulse" d={path} style={{ animationDelay: `${index * -1.6}s` }} /> : null}
          </g>
        ))}
        <rect x="117" y="49" width="73" height="55" rx="9" className="ctit-pcb-chip-outline" />
        <rect x="129" y="61" width="49" height="31" rx="5" className="ctit-pcb-chip-center" />
        {[30, 72, 122].map((y) => <circle key={y} cx="8" cy={y} r="3" className="ctit-pcb-via" />)}
      </svg>
    </div>
  );
}

/**
 * Dạng sóng được vẽ sẵn bằng SVG, mang tính minh họa.
 * Không gắn nhãn LIVE, không tự tạo bất kỳ số đo thực tế nào.
 */
export function CanWaveform() {
  const { ref, active } = useVisibleMotion();

  const high = "M4 55H22V23H46V55H70V23H94V55H118V23H142V55H166V23H190V55H214V23H238V55H262";
  const low = "M4 61H22V82H46V61H70V82H94V61H118V82H142V61H166V82H190V61H214V82H238V61H262";

  return (
    <div className="ctit-can-visual" ref={ref} data-motion-active={active ? "true" : "false"}>
      <span className="ctit-can-label">CAN / BMS · Mô phỏng tín hiệu</span>
      <svg viewBox="0 0 266 106" role="img" aria-label="Hai dạng sóng CAN_H và CAN_L được minh họa, không phải dữ liệu đo trực tiếp.">
        <title>Dạng sóng CAN_H và CAN_L minh họa, không phải dữ liệu thực</title>
        {[22, 55, 82].map((y) => <line key={y} x1="4" x2="262" y1={y} y2={y} className="ctit-can-grid" />)}
        <path d={high} className="ctit-can-base" />
        <path d={low} className="ctit-can-base ctit-can-low" />
        <path d={high} className="ctit-can-highlight" />
        <path d={low} className="ctit-can-highlight ctit-can-low" style={{ animationDelay: "-1.5s" }} />
      </svg>
    </div>
  );
}
