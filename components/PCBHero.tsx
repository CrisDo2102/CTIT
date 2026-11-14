"use client";

import { useEffect, useRef } from "react";

const pins = Array.from({ length: 16 }, (_, i) => i);
const sides = [0, 90, 180, 270];

/** Deterministic geometry keeps the server-rendered board visible before hydration. */
export function PCBHero({ active, paused, compact = false }: { active: boolean; paused: boolean; compact?: boolean }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || compact) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)");
    let visible = false;
    let frame = 0;
    let x = 0, y = 0;
    const draw = () => {
      frame = 0;
      const enabled = active && !paused && !reduce.matches && visible && !document.hidden;
      el.dataset.running = String(enabled);
      if (!enabled) return;
      const hero = el.closest("section")!;
      const progress = Math.min(1, Math.max(0, -hero.getBoundingClientRect().top / hero.offsetHeight));
      el.style.setProperty("--scroll", String(progress));
      el.style.setProperty("--mx", `${x}deg`);
      el.style.setProperty("--my", `${y}deg`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };
    const move = (e: PointerEvent) => {
      if (!fine.matches || reduce.matches || paused || !active || !visible) return;
      x = (e.clientX / window.innerWidth - .5) * 5;
      y = (e.clientY / window.innerHeight - .5) * -4;
      schedule();
    };
    const observer = new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; schedule(); });
    observer.observe(el);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("pointermove", move, { passive: true });
    document.addEventListener("visibilitychange", schedule);
    reduce.addEventListener("change", schedule);
    schedule();
    return () => {
      observer.disconnect(); cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("pointermove", move);
      document.removeEventListener("visibilitychange", schedule);
      reduce.removeEventListener("change", schedule);
    };
  }, [active, paused, compact]);

  return <div ref={root} className={`pcb-scene${compact ? " pcb-compact" : ""}`} data-running="false" role="img" aria-label="Vi điều khiển STM32 trên bo mạch CTIT, với chân kim loại và các đường mạch phát sáng">
    <div className="pcb-halo" />
    <div className="pcb-board">
      <svg className="pcb-copper" viewBox="0 0 800 800" aria-hidden="true">
        {sides.map(side => <g key={side} transform={`rotate(${side} 400 400)`}>
          {pins.map(i => {
            // Preserve pin order through the fan-out. Every diagonal is 45 degrees.
            // Four rotations occupy separate routing corridors around U1.
            const start = 290.5 + i * 15;
            const end = 225 + i * 23;
            const bend = 220 - Math.abs(end - start);
            const d = `M ${start} 260 V 220 L ${end} ${bend} V 112`;
            const populated = i === 3 || i === 12;
            return <g key={i}>
              <path d={d} className="pcb-trace" />
              {i % 5 === 0 && <path d={d} className="pcb-pulse" pathLength="100" style={{ animationDelay: `${i * -.37 - side / 90}s` }} />}
              <rect x={end - 5} y="105" width="10" height="14" rx="3" fill="#a09ab8" />
              <circle cx={end} cy="112" r="2.5" fill="#100d26" />
              {populated && <g>
                <rect x={end - 6} y="128" width="12" height="28" rx="2" fill="#c5c3d1" />
                <rect x={end - 6} y="134" width="12" height="16" fill="#817487" />
                <text x={end + 12} y="146" fill="#a09ab8" fontSize="9" fontFamily="monospace">R{side / 90 * 2 + (i === 3 ? 1 : 2)}</text>
              </g>}
            </g>;
          })}
        </g>)}
        {[60,740].flatMap(x => [60,740].map(y => <g key={`${x}-${y}`}><circle cx={x} cy={y} r="18" fill="#9793ac"/><circle cx={x} cy={y} r="11" fill="#09081b"/></g>))}
      </svg>
      <span className="pcb-silk pcb-silk-top">CTIT / EMBEDDED SYSTEMS</span>
      <span className="pcb-silk pcb-silk-bottom">STM32 · DEVELOPMENT BOARD / REV 01</span>
      {sides.map(side => <div className="pcb-pin-bank" key={side} style={{ transform: `rotate(${side}deg)` }}>
        {pins.map(i => <i key={i} style={{ left: `${286 + i * 15}px` }} />)}
      </div>)}
      <div className="pcb-package">
        <div className="pcb-chip-face">
          <span className="pcb-chip-brand">STM32</span>
          <span className="pcb-chip-line">ARM® Cortex®-M</span>
          <span className="pcb-chip-code">CTIT LAB<br/>EMBEDDED SYSTEMS</span>
          <span className="pcb-pin-one" />
          <span className="pcb-chip-glint" />
        </div>
      </div>




      <span className="pcb-u1">U1</span>
    </div>
    <div className="pcb-caption"><span/> CTIT LAB <b>/</b> FROM IDEAS TO HARDWARE</div>
  </div>;
}
