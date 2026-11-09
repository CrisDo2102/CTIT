/**
 * Microinteraction khi thực sự lưu một mục. Không phụ thuộc thư viện animation.
 * Không chạy trên thiết bị cảm ứng hay khi người dùng bật Reduce Motion.
 */
export function emitSaveBurst(button: HTMLButtonElement) {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
  if (typeof button.animate !== "function") return;

  for (let i = 0; i < 6; i++) {
    const dot = document.createElement("span");
    dot.className = "ctit-save-particle";
    dot.setAttribute("aria-hidden", "true");
    const angle = (Math.PI * 2 * i) / 6;
    const dx = Math.cos(angle) * 20;
    const dy = Math.sin(angle) * 20;
    button.appendChild(dot);

    const animation = dot.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 0.75 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0)`, opacity: 0 }
      ],
      { duration: 330, easing: "ease-out" }
    );
    animation.onfinish = () => dot.remove();
    animation.oncancel = () => dot.remove();
  }
}
