import { readLimitedText, BodyTooLargeError } from "@/lib/limited-body";
// Tầng đọc Google Sheet (publish-to-web CSV): tải, chuẩn hóa lỗi, giữ bản dữ liệu tốt gần nhất, báo tình trạng.
// Tách khỏi sheet-data.ts (phần "hiểu" từng tab) để kiểm thử riêng và để /api/health dùng chung.

const isDev = process.env.NODE_ENV !== "production";

// Chỉ tải CSV từ Google (link "Publish to web"). Chặn link lạ trong biến môi trường để
// server không bị dùng làm cầu gọi tới địa chỉ nội bộ/bên thứ ba (SSRF) nếu env bị sửa nhầm.
const SHEET_HOST = /(^|\.)(docs\.google\.com|google\.com|googleusercontent\.com)$/i;
export const SHEET_TIMEOUT_MS = 10_000;
export const SHEET_MAX_BYTES = 5 * 1024 * 1024;

export function isAllowedSheetUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && SHEET_HOST.test(url.hostname);
  } catch {
    return false;
  }
}

/**
 * Parse mot chuoi CSV don gian (co ho tro field co dau ngoac kep chua dau phay).
 * Du du cho nhu cau doc Google Sheet publish-to-web dang CSV.
 */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // bo qua, \n se ket thuc dong
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

/**
 * Kết quả một lần tải:
 *  - ok: tải được bản mới;
 *  - stale: lần này lỗi nhưng đang dùng bản tốt gần nhất đã tải trước đó (người xem không thấy trang trống);
 *  - failed: lỗi và chưa có bản nào để dùng tạm;
 *  - rejected: link không phải link Google hợp lệ;
 *  - missing: chưa cấu hình link.
 */
export type SheetState = "ok" | "stale" | "failed" | "rejected" | "missing";
export type SheetResult = { rows: string[][]; state: SheetState; ms: number; detail?: string };

// Bản tốt gần nhất theo link. Nằm trong bộ nhớ của tiến trình: trên serverless chỉ giữ được khi instance còn sống,
// nên đây là lớp đỡ thêm chứ không thay cho bộ đệm của Next.js.
const lastGood = new Map<string, string[][]>();

/** Chỉ dùng trong kiểm thử. */
export function resetSheetCache(): void {
  lastGood.clear();
}

function fail(url: string, label: string, started: number, detail: string): SheetResult {
  const ms = Date.now() - started;
  const kept = lastGood.get(url);
  // Ở production cũng ghi một dòng log: trước đây Sheet lỗi là im lặng và trang chỉ trống.
  console.warn(`[${label}] ${detail}${kept ? " Đang dùng bản dữ liệu tốt gần nhất." : ""}`);
  return kept ? { rows: kept, state: "stale", ms, detail } : { rows: [], state: "failed", ms, detail };
}

// ---- Chế độ dữ liệu mẫu (chỉ cho dev và kiểm thử) ----
// Đặt SHEET_FIXTURES_DIR=<thư mục chứa các file .csv> và đặt link Sheet dạng
//   https://docs.google.com/spreadsheets/d/e/FIXTURE-events/pub?output=csv
// thì tab đó đọc từ <thư mục>/events.csv thay vì gọi Google. Cả site chạy với dữ liệu giống thật mà không cần mạng hay quyền Sheet.
// Trong file mẫu, {{today+3}} / {{today-10}} được đổi thành ngày (giờ Việt Nam) tương ứng nên "sắp diễn ra / đã diễn ra" luôn đúng.
// TUYỆT ĐỐI không bật trên Vercel (tự tắt nếu thấy biến VERCEL) và /api/health báo `fixtures: true` khi đang bật.
const FIXTURE_URL = /^https:\/\/docs\.google\.com\/spreadsheets\/d\/e\/FIXTURE-([\w-]+)\//;

export const fixturesEnabled = (): boolean => Boolean(process.env.SHEET_FIXTURES_DIR) && !process.env.VERCEL;

function fixtureDates(text: string): string {
  const day = new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Ho_Chi_Minh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  return text.replace(/\{\{today([+-]\d+)?\}\}/g, (_match, offset: string | undefined) => {
    const base = new Date(`${day}T00:00:00Z`);
    base.setUTCDate(base.getUTCDate() + (offset ? Number(offset) : 0));
    return base.toISOString().slice(0, 10);
  });
}

let fixtureNoticeShown = false;

async function loadFixture(url: string, label: string, started: number): Promise<SheetResult | null> {
  const name = url.match(FIXTURE_URL)?.[1];
  if (!name || !fixturesEnabled()) return null;
  const { readFile } = await import("node:fs/promises");
  const { join } = await import("node:path");
  if (!fixtureNoticeShown) {
    fixtureNoticeShown = true;
    console.warn(`[fixtures] ĐANG DÙNG DỮ LIỆU MẪU từ ${process.env.SHEET_FIXTURES_DIR}. Không dùng cách này khi chạy thật.`);
  }
  try {
    const text = await readFile(join(process.env.SHEET_FIXTURES_DIR as string, `${name}.csv`), "utf8");
    return { rows: parseCsv(fixtureDates(text)), state: "ok", ms: Date.now() - started };
  } catch (error) {
    return fail(url, label, started, `Không đọc được file dữ liệu mẫu ${name}.csv: ${error instanceof Error ? error.message : String(error)}.`);
  }
}

export async function loadSheet(url: string, label = "Sheet"): Promise<SheetResult> {
  const started = Date.now();
  if (!url) {
    if (isDev) console.warn(`[${label}] Chưa có link CSV trong .env.local nên phần này sẽ trống.`);
    return { rows: [], state: "missing", ms: 0 };
  }
  if (!isAllowedSheetUrl(url)) {
    console.warn(`[${label}] Link CSV bị từ chối: phải là https://docs.google.com/... (Publish to web). Kiểm tra biến môi trường.`);
    return { rows: [], state: "rejected", ms: 0, detail: "Link không phải https://docs.google.com/..." };
  }

  const fixture = await loadFixture(url, label, started);
  if (fixture) return fixture;

  try {
    // npm run dev: luon lay du lieu moi nhat tu sheet (khong cache), sua sheet
    // xong F5 la thay. Chay that (build/start): cache 60 giay.
    let target = url;
    let res: Response | undefined;
    // Google may redirect exports, but an off-domain redirect must NEVER be followed (SSRF defense).
    // All hops share one request budget and only Google-owned HTTPS hosts are allowed.
    const signal = AbortSignal.timeout(SHEET_TIMEOUT_MS);
    for (let redirectCount = 0; redirectCount <= 4; redirectCount++) {
      res = await fetch(target, {
        ...(isDev ? { cache: "no-store" as const } : { next: { revalidate: 60 } }),
        redirect: "manual",
        signal
      });
      if (![301, 302, 303, 307, 308].includes(res.status)) break;
      const location = res.headers.get("location");
      if (!location || redirectCount === 4) return fail(url, label, started, "Sheet chuyển hướng quá nhiều hoặc không có địa chỉ.");
      const nextTarget = new URL(location, target).toString();
      if (!isAllowedSheetUrl(nextTarget)) return fail(url, label, started, "Sheet chuyển hướng đến địa chỉ không an toàn.");
      target = nextTarget;
    }
    if (!res?.ok) return fail(url, label, started, `Không tải được sheet (HTTP ${res?.status}). Kiểm tra link CSV.`);
    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > SHEET_MAX_BYTES) return fail(url, label, started, `Sheet quá lớn (${declared} byte), bỏ qua.`);
    let body: string;
    try { body = await readLimitedText(res, SHEET_MAX_BYTES); }
    catch (error) {
      if (error instanceof BodyTooLargeError) return fail(url, label, started, "Sheet quá lớn, bỏ qua.");
      throw error;
    }
    const rows = parseCsv(body);
    lastGood.set(url, rows);
    return { rows, state: "ok", ms: Date.now() - started };
  } catch (error) {
    return fail(url, label, started, `Lỗi khi tải sheet: ${error instanceof Error ? error.message : String(error)}.`);
  }
}

export async function fetchSheetRows(url: string, label = "Sheet"): Promise<string[][]> {
  return (await loadSheet(url, label)).rows;
}

// Các biến môi trường chứa link Sheet, theo tên hiển thị. /api/health kiểm tra từng cái.
export const SHEET_ENV: Record<string, string> = {
  overview: "OVERVIEW_SHEET_CSV_URL",
  about: "ABOUT_SHEET_CSV_URL",
  students: "STUDENTS_SHEET_CSV_URL",
  resources: "RESOURCES_SHEET_CSV_URL",
  news: "NEWS_SHEET_CSV_URL",
  campus: "CAMPUS_SHEET_CSV_URL",
  events: "EVENTS_SHEET_CSV_URL",
  research: "RESEARCH_SHEET_CSV_URL",
  admissions: "ADMISSIONS_SHEET_CSV_URL",
  courses: "COURSES_SHEET_CSV_URL"
};

export type SheetHealth = { configured: boolean; state: SheetState; rows: number; ms: number };

/** Tải thử từng Sheet đã cấu hình (song song) và báo tình trạng. Không trả về link hay nội dung. */
export async function checkSheets(env: Record<string, string | undefined> = process.env): Promise<Record<string, SheetHealth>> {
  const entries = await Promise.all(
    Object.entries(SHEET_ENV).map(async ([name, variable]): Promise<[string, SheetHealth]> => {
      const url = env[variable] ?? "";
      if (!url) return [name, { configured: false, state: "missing", rows: 0, ms: 0 }];
      const result = await loadSheet(url, name);
      return [name, { configured: true, state: result.state, rows: result.rows.length, ms: result.ms }];
    })
  );
  return Object.fromEntries(entries);
}
