// Thêm sự kiện vào lịch cá nhân: link Google Calendar và file .ics (Apple, Outlook...).
// Giờ trong Sheet là giờ Việt Nam (UTC+7, không có giờ mùa hè) nên đổi sang UTC bằng cách trừ 7 tiếng.

export type CalendarEvent = { title: string; date: string; time?: string; place?: string; summary?: string; url?: string };

const VN_OFFSET_HOURS = 7;
const DEFAULT_DURATION_HOURS = 2;
const pad = (n: number) => String(n).padStart(2, "0");
const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

export const isIsoDate = (value: string) => ISO_DATE.test(value);

/** Lấy giờ bắt đầu và kết thúc từ chữ tự do: "18:00 - 20:00", "18h30–20h", "9 giờ". Không có giờ thì trả null (sự kiện cả ngày). */
export function parseTimes(text: string | undefined): { start: [number, number]; end: [number, number] | null } | null {
  const found = [...(text ?? "").matchAll(/(\d{1,2})\s*(?::|h|giờ)\s*(\d{2})?/gi)]
    .map((m) => [Number(m[1]), Number(m[2] ?? 0)] as [number, number])
    .filter(([h, min]) => h < 24 && min < 60);
  if (found.length === 0) return null;
  return { start: found[0], end: found[1] ?? null };
}

const icsUtc = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
const icsDate = (ms: number) => icsUtc(ms).slice(0, 8);

/** Khoảng thời gian của sự kiện: cả ngày (end là ngày hôm sau, không tính) hoặc theo giờ. */
function span(event: CalendarEvent): { allDay: boolean; start: number; end: number } | null {
  const m = event.date.match(ISO_DATE);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const times = parseTimes(event.time);
  if (!times) {
    const start = Date.UTC(y, mo, d);
    return { allDay: true, start, end: start + 86_400_000 };
  }
  const start = Date.UTC(y, mo, d, times.start[0] - VN_OFFSET_HOURS, times.start[1]);
  let end = times.end ? Date.UTC(y, mo, d, times.end[0] - VN_OFFSET_HOURS, times.end[1]) : start + DEFAULT_DURATION_HOURS * 3_600_000;
  if (end <= start) end += 86_400_000; // "22:00 - 01:00": kết thúc sang ngày hôm sau
  return { allDay: false, start, end };
}

const details = (event: CalendarEvent) => [event.summary, event.url].filter(Boolean).join("\n\n");

export function googleCalendarUrl(event: CalendarEvent): string | null {
  const range = span(event);
  if (!range) return null;
  const dates = range.allDay ? `${icsDate(range.start)}/${icsDate(range.end)}` : `${icsUtc(range.start)}/${icsUtc(range.end)}`;
  const query = [
    ["action", "TEMPLATE"],
    ["text", event.title],
    ["location", event.place ?? ""],
    ["details", details(event)]
  ]
    .filter(([, value]) => value)
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
    .join("&");
  return `https://calendar.google.com/calendar/render?${query}&dates=${dates}&ctz=Asia%2FHo_Chi_Minh`;
}

// ICS: ký tự đặc biệt phải escape, dòng không quá 75 byte (cắt theo byte để không chẻ đôi chữ có dấu).
const escapeText = (text: string) => text.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");

function fold(line: string): string {
  const encoder = new TextEncoder();
  const parts: string[] = [];
  let current = "";
  let bytes = 0;
  for (const char of line) {
    const size = encoder.encode(char).length;
    if (bytes + size > (parts.length === 0 ? 75 : 74)) {
      parts.push(current);
      current = "";
      bytes = 0;
    }
    current += char;
    bytes += size;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

function hash(text: string): string {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = ((h << 5) + h + text.charCodeAt(i)) | 0;
  return (h >>> 0).toString(16);
}

export function icsContent(event: CalendarEvent): string | null {
  const range = span(event);
  if (!range) return null;
  const when = range.allDay
    ? [`DTSTART;VALUE=DATE:${icsDate(range.start)}`, `DTEND;VALUE=DATE:${icsDate(range.end)}`]
    : [`DTSTART:${icsUtc(range.start)}`, `DTEND:${icsUtc(range.end)}`];
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//CTIT//Events//VI",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${event.date}-${hash(event.title)}@ctit`,
    `DTSTAMP:${icsUtc(Date.now())}`,
    ...when,
    `SUMMARY:${escapeText(event.title)}`,
    ...(event.place ? [`LOCATION:${escapeText(event.place)}`] : []),
    ...(details(event) ? [`DESCRIPTION:${escapeText(details(event))}`] : []),
    ...(event.url ? [`URL:${event.url}`] : []),
    "END:VEVENT",
    "END:VCALENDAR"
  ];
  return lines.map(fold).join("\r\n") + "\r\n";
}

/** Lưới tháng bắt đầu từ Thứ hai: mỗi ô là ngày (ISO) hoặc null (ô trống đầu/cuối tháng). month: 1–12. */
export function monthCells(year: number, month: number): (string | null)[] {
  const lead = (new Date(Date.UTC(year, month - 1, 1)).getUTCDay() + 6) % 7;
  const days = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: (string | null)[] = Array(lead).fill(null);
  for (let day = 1; day <= days; day++) cells.push(`${year}-${pad(month)}-${pad(day)}`);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}
