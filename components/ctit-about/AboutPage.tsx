"use client";
import { useEffect, useRef, type ReactNode } from "react";
import "./ctit-about.css";

/** Editable vector artwork is inline: search for board, traces, pins, chip-body or chip-labels. */
type Props = { title?: string; intro?: string; profile?: ReactNode; overview?: ReactNode };

export default function AboutPage({ title, intro, profile, overview }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = rootRef.current;
    if (!element) return;
    const root: HTMLDivElement = element;
const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-topic]'));
const panels = Array.from(root.querySelectorAll<HTMLElement>('[data-story]'));
const cleanups: Array<() => void> = [];
function select(key: string | null) {
  root.dataset.active = key ?? 'mission';
  buttons.forEach(button => button.setAttribute('aria-pressed', String(button.getAttribute('data-topic') === key)));
  panels.forEach(panel => { panel.hidden = panel.getAttribute('data-story') !== key; });
}
buttons.forEach(button => {
  const choose = () => select(button.getAttribute('data-topic'));
  button.addEventListener('click', choose);
  button.addEventListener('focus', choose);
  button.addEventListener('mouseenter', choose);
  cleanups.push(() => { button.removeEventListener('click', choose); button.removeEventListener('focus', choose); button.removeEventListener('mouseenter', choose); });
});
const motion = root.querySelector<HTMLButtonElement>('.ca-motion')!;
const pause = () => {
  const paused = root.dataset.paused !== 'true';
  root.dataset.paused = String(paused);
  motion.setAttribute('aria-pressed', String(paused));
  motion.textContent = paused ? 'Tiếp tục chuyển động' : 'Tạm dừng chuyển động';
};
motion.addEventListener('click', pause);
cleanups.push(() => motion.removeEventListener('click', pause));
return () => cleanups.forEach(cleanup => cleanup());
  }, []);
  return (<div ref={rootRef} className="ctit-about" data-active="mission" data-paused="false">
<a className="ca-skip" href="#ca-main">Đến nội dung</a>
<div className="ca-inner" id="ca-main">
<div className="ca-breadcrumb">
<a href="/">CTIT</a>
<span>/</span>
<span>Giới thiệu</span>
</div>
<section className="ca-hero" aria-labelledby="ca-title">
<div className="ca-hero-copy">
<p className="ca-eyebrow">
<span className="ca-dot">
</span> CLOSED THINKING INSTITUTE OF TECHNOLOGY</p>
<h1 id="ca-title">{title || <>Kết nối tri thức.<br/><em>Kiến tạo</em><br/>giá trị.</>}</h1>
<p className="ca-lead">Từ một câu hỏi đến một ý tưởng.<br/>Từ một ý tưởng đến điều có thể làm được.</p>
<p className="ca-intro">{intro || "CTIT hướng đến một không gian học hỏi công nghệ, nơi tư duy kỹ thuật được nuôi dưỡng bằng thực hành, thử nghiệm và chia sẻ."}</p>
<a className="ca-primary" href="#ca-story">Khám phá CTIT <span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 19 19 5M5 5h14v14"/>
</svg>
</span>
</a>
<div className="ca-hero-note">
<span>01 — GIỚI THIỆU</span>
<span>TƯ DUY · THỰC HÀNH · CHIA SẺ</span>
</div>
</div>
<div className="ca-art">
<div className="ca-art-top">
<span>CTIT / POWER OF CONNECTION</span>
<button type="button" className="ca-motion" aria-pressed="false">Tạm dừng chuyển động</button>
</div>
<div className="ca-chip">
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 760" role="img" aria-labelledby="ctit-chip-title ctit-chip-desc">
<title id="ctit-chip-title">CTIT — mạch kết nối tri thức</title>
<desc id="ctit-chip-desc">Minh họa IC công suất chữ nhật, 24 chân hai cạnh, kết nối bốn nhóm sứ mệnh, cách làm, con người và giá trị tạo ra. Không phải sơ đồ chân linh kiện thực.</desc>
<defs>
<linearGradient id="ctit-body" x2="0.25" y2="1">
<stop stopColor="#383746"/>
<stop offset=".5" stopColor="#22212e"/>
<stop offset="1" stopColor="#11121e"/>
</linearGradient>
<linearGradient id="ctit-metal" x2="0" y2="1">
<stop stopColor="#f5f2ff"/>
<stop offset=".24" stopColor="#a8a7bd"/>
<stop offset=".5" stopColor="#e7e4f5"/>
<stop offset=".75" stopColor="#77758f"/>
<stop offset="1" stopColor="#c4c1d8"/>
</linearGradient>
<linearGradient id="ctit-board" x2="1" y2="1">
<stop stopColor="#191335"/>
<stop offset="1" stopColor="#0c0b19"/>
</linearGradient>
<pattern id="ctit-grid" width="30" height="30" patternUnits="userSpaceOnUse">
<circle cx="1" cy="1" r=".8" fill="#c1b5e9" opacity=".15"/>
</pattern>
</defs>
<style>{".ctit-trace{fill:none;stroke:#645582;stroke-width:2;stroke-linejoin:round}.ctit-pulse{fill:none;stroke:#c6afff;stroke-width:3;stroke-dasharray:6 94;animation:ctit-signal 6s linear infinite}.ctit-group:nth-child(2n) .ctit-pulse{animation-delay:-3s}@keyframes ctit-signal{to{stroke-dashoffset:-100}}@media(prefers-reduced-motion:reduce){.ctit-pulse{animation:none;stroke-dasharray:none;opacity:.3}}"}</style>
<g id="board">
<rect x="20" y="20" width="960" height="720" rx="8" fill="url(#ctit-board)" stroke="#52436c"/>
<rect x="20" y="20" width="960" height="720" rx="8" fill="url(#ctit-grid)"/>
<circle cx="49" cy="49" r="8" fill="#080813" stroke="#756a8d" strokeWidth="3"/>
<circle cx="49" cy="711" r="8" fill="#080813" stroke="#756a8d" strokeWidth="3"/>
<circle cx="951" cy="49" r="8" fill="#080813" stroke="#756a8d" strokeWidth="3"/>
<circle cx="951" cy="711" r="8" fill="#080813" stroke="#756a8d" strokeWidth="3"/>
</g>
<g id="traces">
<g id="traces-mission" className="ctit-group ctit-group-mission">
<path className="ctit-trace" d="M 332 251 H 290 L 178 139 H 105"/>
<circle cx="105" cy="139" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="139" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 273 H 290 L 178 161 H 105"/>
<path className="ctit-pulse" pathLength="100" d="M 332 273 H 290 L 178 161 H 105"/>
<circle cx="105" cy="161" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="161" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 295 H 290 L 178 183 H 105"/>
<circle cx="105" cy="183" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="183" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 317 H 290 L 178 205 H 105"/>
<circle cx="105" cy="205" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="205" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 339 H 290 L 178 227 H 105"/>
<path className="ctit-pulse" pathLength="100" d="M 332 339 H 290 L 178 227 H 105"/>
<circle cx="105" cy="227" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="227" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 361 H 290 L 178 249 H 105"/>
<circle cx="105" cy="249" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="249" r="2" fill="#080813"/>
</g>
<g id="traces-method" className="ctit-group ctit-group-method">
<path className="ctit-trace" d="M 332 383 H 290 L 178 495 H 105"/>
<circle cx="105" cy="495" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="495" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 405 H 290 L 178 517 H 105"/>
<path className="ctit-pulse" pathLength="100" d="M 332 405 H 290 L 178 517 H 105"/>
<circle cx="105" cy="517" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="517" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 427 H 290 L 178 539 H 105"/>
<circle cx="105" cy="539" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="539" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 449 H 290 L 178 561 H 105"/>
<circle cx="105" cy="561" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="561" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 471 H 290 L 178 583 H 105"/>
<path className="ctit-pulse" pathLength="100" d="M 332 471 H 290 L 178 583 H 105"/>
<circle cx="105" cy="583" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="583" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 332 493 H 290 L 178 605 H 105"/>
<circle cx="105" cy="605" r="5" fill="#201734" stroke="#a48acb"/><circle cx="105" cy="605" r="2" fill="#080813"/>
</g>
<g id="traces-people" className="ctit-group ctit-group-people">
<path className="ctit-trace" d="M 674 251 H 710 L 822 139 H 895"/>
<circle cx="895" cy="139" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="139" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 273 H 710 L 822 161 H 895"/>
<path className="ctit-pulse" pathLength="100" d="M 674 273 H 710 L 822 161 H 895"/>
<circle cx="895" cy="161" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="161" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 295 H 710 L 822 183 H 895"/>
<circle cx="895" cy="183" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="183" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 317 H 710 L 822 205 H 895"/>
<circle cx="895" cy="205" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="205" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 339 H 710 L 822 227 H 895"/>
<path className="ctit-pulse" pathLength="100" d="M 674 339 H 710 L 822 227 H 895"/>
<circle cx="895" cy="227" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="227" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 361 H 710 L 822 249 H 895"/>
<circle cx="895" cy="249" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="249" r="2" fill="#080813"/>
</g>
<g id="traces-output" className="ctit-group ctit-group-output">
<path className="ctit-trace" d="M 674 383 H 710 L 822 495 H 895"/>
<circle cx="895" cy="495" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="495" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 405 H 710 L 822 517 H 895"/>
<path className="ctit-pulse" pathLength="100" d="M 674 405 H 710 L 822 517 H 895"/>
<circle cx="895" cy="517" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="517" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 427 H 710 L 822 539 H 895"/>
<circle cx="895" cy="539" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="539" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 449 H 710 L 822 561 H 895"/>
<circle cx="895" cy="561" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="561" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 471 H 710 L 822 583 H 895"/>
<path className="ctit-pulse" pathLength="100" d="M 674 471 H 710 L 822 583 H 895"/>
<circle cx="895" cy="583" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="583" r="2" fill="#080813"/>
<path className="ctit-trace" d="M 674 493 H 710 L 822 605 H 895"/>
<circle cx="895" cy="605" r="5" fill="#201734" stroke="#a48acb"/><circle cx="895" cy="605" r="2" fill="#080813"/>
</g>
</g>
<g id="chip-shadow">
<rect x="371" y="211" width="300" height="350" rx="5" fill="#03030a" opacity=".8"/>
</g>
<g id="pins" fill="url(#ctit-metal)" stroke="#7f7b93" strokeWidth="1">
<path id="pin-1" d="M332 244h21l6 3v10l-6 3h-21z"/>
<path id="pin-24" d="M647 244h21l6 3v10l-6 3h-21z"/>
<path id="pin-2" d="M332 266h21l6 3v10l-6 3h-21z"/>
<path id="pin-23" d="M647 266h21l6 3v10l-6 3h-21z"/>
<path id="pin-3" d="M332 288h21l6 3v10l-6 3h-21z"/>
<path id="pin-22" d="M647 288h21l6 3v10l-6 3h-21z"/>
<path id="pin-4" d="M332 310h21l6 3v10l-6 3h-21z"/>
<path id="pin-21" d="M647 310h21l6 3v10l-6 3h-21z"/>
<path id="pin-5" d="M332 332h21l6 3v10l-6 3h-21z"/>
<path id="pin-20" d="M647 332h21l6 3v10l-6 3h-21z"/>
<path id="pin-6" d="M332 354h21l6 3v10l-6 3h-21z"/>
<path id="pin-19" d="M647 354h21l6 3v10l-6 3h-21z"/>
<path id="pin-7" d="M332 376h21l6 3v10l-6 3h-21z"/>
<path id="pin-18" d="M647 376h21l6 3v10l-6 3h-21z"/>
<path id="pin-8" d="M332 398h21l6 3v10l-6 3h-21z"/>
<path id="pin-17" d="M647 398h21l6 3v10l-6 3h-21z"/>
<path id="pin-9" d="M332 420h21l6 3v10l-6 3h-21z"/>
<path id="pin-16" d="M647 420h21l6 3v10l-6 3h-21z"/>
<path id="pin-10" d="M332 442h21l6 3v10l-6 3h-21z"/>
<path id="pin-15" d="M647 442h21l6 3v10l-6 3h-21z"/>
<path id="pin-11" d="M332 464h21l6 3v10l-6 3h-21z"/>
<path id="pin-14" d="M647 464h21l6 3v10l-6 3h-21z"/>
<path id="pin-12" d="M332 486h21l6 3v10l-6 3h-21z"/>
<path id="pin-13" d="M647 486h21l6 3v10l-6 3h-21z"/>
</g>
<g id="chip-body">
<rect x="355" y="200" width="292" height="350" rx="6" fill="url(#ctit-body)" stroke="#82778f" strokeWidth="2"/>
<path d="M362 208H640V542H362Z" fill="none" stroke="#4f495b"/>
<path d="M355 200H647L632 216H371V535L355 550Z" fill="#fff" opacity=".035"/>
<circle cx="377" cy="225" r="6" fill="#151420" stroke="#71647f"/>
</g>
<g id="chip-labels" fill="#e8e3f2" fontFamily="monospace">
<text x="389" y="308" fontSize="47" fontWeight="700" letterSpacing="5">CTIT</text>
<path d="M389 324H438" stroke="#b897fa" strokeWidth="4"/>
<text x="389" y="365" fontSize="17" letterSpacing="2">THINK. BUILD.</text>
<text x="389" y="392" fontSize="17" letterSpacing="2">SHARE.</text>
<text x="389" y="493" fontSize="12" fill="#b2a8c0">CT-PWR / ABOUT</text>
<text x="389" y="514" fontSize="11" fill="#91869f">CONCEPT SERIES · 01</text>
</g>
<g id="components">
<g id="resistor-1" transform="translate(300 273)"><rect x="-12" y="-5" width="24" height="10" rx="1" fill="#b9b4c7"/><rect x="-7" y="-5" width="14" height="10" fill="#706077"/><text x="-9" y="-10" fontFamily="monospace" fontSize="8" fill="#bfb0d2">R1</text></g>
<g id="resistor-2" transform="translate(300 449)"><rect x="-12" y="-5" width="24" height="10" rx="1" fill="#b9b4c7"/><rect x="-7" y="-5" width="14" height="10" fill="#706077"/><text x="-9" y="-10" fontFamily="monospace" fontSize="8" fill="#bfb0d2">R2</text></g>
<g id="resistor-3" transform="translate(692 273)"><rect x="-12" y="-5" width="24" height="10" rx="1" fill="#b9b4c7"/><rect x="-7" y="-5" width="14" height="10" fill="#706077"/><text x="-9" y="-10" fontFamily="monospace" fontSize="8" fill="#bfb0d2">R3</text></g>
<g id="resistor-4" transform="translate(692 449)"><rect x="-12" y="-5" width="24" height="10" rx="1" fill="#b9b4c7"/><rect x="-7" y="-5" width="14" height="10" fill="#706077"/><text x="-9" y="-10" fontFamily="monospace" fontSize="8" fill="#bfb0d2">R4</text></g>
</g>
<g id="board-labels" fill="#bfb0d2" fontFamily="monospace" fontSize="12" letterSpacing="1.5">
<text x="86" y="91">01 / PURPOSE</text>
<text x="86" y="682">02 / PROCESS</text>
<text x="736" y="91">03 / PEOPLE</text>
<text x="736" y="682">04 / IMPACT</text>
<text x="376" y="655" fill="#91829f" fontSize="10">CTIT · CONNECTIONS MATTER</text>
</g>
</svg>
</div>
<div className="ca-art-bottom">
<span>
<i>
</i> MỖI KẾT NỐI, MỘT KHẢ NĂNG</span>
<span>CT-PWR / 01</span>
</div>
</div>
</section>
<section className="ca-explore" id="ca-story" aria-labelledby="ca-explore-title">
<div className="ca-section-heading">
<p className="ca-eyebrow">BÊN TRONG CTIT</p>
<h2 id="ca-explore-title">Một mạch chung.<br/>Nhiều cách đóng góp.</h2>
<p>Chọn một kết nối để khám phá điều chúng tôi hướng đến.</p>
</div>
<div className="ca-explorer">
<div className="ca-topics" role="group" aria-label="Khám phá CTIT">
<button type="button" className="ca-topic" data-topic="mission" aria-pressed="true" aria-controls="ca-topic-panel">
<span>01</span>Sứ mệnh<span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 19 19 5M5 5h14v14"/>
</svg>
</span>
</button>
<button type="button" className="ca-topic" data-topic="method" aria-pressed="false" aria-controls="ca-topic-panel">
<span>02</span>Cách làm<span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 19 19 5M5 5h14v14"/>
</svg>
</span>
</button>
<button type="button" className="ca-topic" data-topic="people" aria-pressed="false" aria-controls="ca-topic-panel">
<span>03</span>Con người<span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 19 19 5M5 5h14v14"/>
</svg>
</span>
</button>
<button type="button" className="ca-topic" data-topic="output" aria-pressed="false" aria-controls="ca-topic-panel">
<span>04</span>Giá trị tạo ra<span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 19 19 5M5 5h14v14"/>
</svg>
</span>
</button>
</div>
<div className="ca-topic-panel" id="ca-topic-panel" aria-live="polite" aria-atomic="true">
<div className="ca-story" data-story="mission">
<p className="ca-eyebrow">Sứ mệnh</p>
<h3>Khơi mở cách nghĩ.</h3>
<p>Bắt đầu từ một câu hỏi tốt. Kiến thức trở nên có ý nghĩa khi được dùng để giải thích, thiết kế và giải quyết một vấn đề cụ thể.</p>
<span className="ca-mono">Câu hỏi → Hiểu biết</span>
</div>
<div className="ca-story" data-story="method" hidden={true}>
<p className="ca-eyebrow">Cách làm</p>
<h3>Hiểu nguyên lý. Làm đến nơi.</h3>
<p>Đi từ nền tảng đến mô hình, từ mô hình đến thử nghiệm. Mỗi lần đo, mỗi lần sửa là một bước làm rõ điều mình đang học.</p>
<span className="ca-mono">Nguyên lý → Thử nghiệm</span>
</div>
<div className="ca-story" data-story="people" hidden={true}>
<p className="ca-eyebrow">Con người</p>
<h3>Cùng học. Cùng tiến bộ.</h3>
<p>Một góc nhìn khác có thể mở ra một lời giải mới. Chia sẻ cách làm, trao đổi thẳng thắn và để kết quả thực nghiệm dẫn dắt cuộc thảo luận.</p>
<span className="ca-mono">Trao đổi → Kết nối</span>
</div>
<div className="ca-story" data-story="output" hidden={true}>
<p className="ca-eyebrow">Giá trị tạo ra</p>
<h3>Để ý tưởng thành hình.</h3>
<p>Hướng đến những mô hình có thể vận hành, tài liệu có thể học lại và kinh nghiệm có thể chia sẻ cho người đi sau.</p>
<span className="ca-mono">Ý tưởng → Giá trị</span>
</div>
</div>
</div>
</section>
{profile ? <div className="ca-live-profile">{profile}</div> : null}
<section className="ca-principle" aria-labelledby="ca-principle-title">
<p className="ca-eyebrow">TINH THẦN KỸ THUẬT</p>
<h2 id="ca-principle-title">Hiểu sâu hơn.<br/>Làm tốt hơn.<br/>
<span>Chia sẻ xa hơn.</span>
</h2>
<div>
<p>Một kết quả tốt bắt đầu từ việc hiểu rõ vấn đề. Một hành trình học tốt tiếp tục bằng việc kiểm chứng điều mình tin là đúng.</p>
<p>Đó là cách CTIT muốn kết nối việc học với những bài toán thực tế: rõ nguyên lý, có thử nghiệm và luôn sẵn sàng cải tiến.</p>
</div>
</section>
<section className="ca-process" id="ca-process" aria-labelledby="ca-process-title">
<div className="ca-section-heading">
<p className="ca-eyebrow">TỪ ĐẦU VÀO ĐẾN GIÁ TRỊ</p>
<h2 id="ca-process-title">Ý tưởng đi qua<br/>một quá trình.</h2>
</div>
<ol className="ca-steps">
<li>
<span className="ca-step-number">01 / INPUT</span>
<h3>Đặt câu hỏi</h3>
<p>Xác định điều cần hiểu, bài toán cần giải và những giới hạn của nó.</p>
<span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 5 19 19M5 19h14V5"/>
</svg>
</span>
</li>
<li>
<span className="ca-step-number">02 / CORE</span>
<h3>Thử &amp; kiểm chứng</h3>
<p>Kết nối kiến thức, xây dựng mô hình, đo đạc và điều chỉnh theo kết quả.</p>
<span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 5 19 19M5 19h14V5"/>
</svg>
</span>
</li>
<li>
<span className="ca-step-number">03 / OUTPUT</span>
<h3>Làm &amp; chia sẻ</h3>
<p>Hoàn thiện điều đã học thành sản phẩm, tài liệu và kinh nghiệm có thể tiếp nối.</p>
<span aria-hidden="true">
<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
<path d="M5 19 19 5M5 5h14v14"/>
</svg>
</span>
</li>
</ol>
</section>
{overview ? <div className="ca-live-overview">{overview}</div> : null}
<section className="ca-faq" aria-labelledby="ca-faq-title">
<div>
<p className="ca-eyebrow">HIỂU THÊM VỀ CTIT</p>
<h2 id="ca-faq-title">Bắt đầu từ<br/>sự tò mò.</h2>
</div>
<div className="ca-questions">
<details open>
<summary>CTIT là viết tắt của điều gì?</summary>
<p>CTIT là viết tắt của CLOSED THINKING INSTITUTE OF TECHNOLOGY.</p>
</details>
<details>
<summary>Vì sao chọn hình ảnh một con chip?</summary>
<p>Mỗi kết nối trên mạch tượng trưng cho một phần của quá trình học hỏi: câu hỏi, kiến thức, con người và kết quả. Con chip là hình ảnh kết nối những phần đó thành một hệ thống.</p>
</details>
<details>
<summary>Điều gì định hướng cách học tại đây?</summary>
<p>Hiểu nguyên lý trước khi áp dụng, kiểm chứng bằng thực hành và chia sẻ rõ ràng để người khác có thể học tiếp.</p>
</details>
</div>
</section>
<div className="ca-end">
<span>CTIT</span>
<p>Công nghệ bắt đầu bằng một câu hỏi.</p>
<a href="#ca-main">Về đầu trang ↑</a>
</div>
</div>
</div>);
}
