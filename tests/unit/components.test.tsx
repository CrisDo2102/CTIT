import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AddToCalendar } from "@/components/AddToCalendar";
import { EmptyResults } from "@/components/EmptyResults";
import { EventsJournal } from "@/components/EventsJournal";
import { EventsMonth } from "@/components/EventsMonth";
import { Footer } from "@/components/Footer";
import { ToastHost } from "@/components/ToastHost";
import { appVersion } from "@/data/changelog";
import type { EventItem } from "@/lib/dashboard-types";

const html = (node: React.ReactElement) => renderToStaticMarkup(node).replace(/<!-- -->/g, "");
const ev = (title: string, date: string, extra: Partial<EventItem> = {}): EventItem => ({ title, date, summary: "", url: "", image: "", tag: "Workshop", place: "Phòng B1", time: "", featured: false, ...extra }) as EventItem;

const items = [
  ev("Workshop CAN bus", "2026-10-13", { time: "18:00 - 20:00", url: "https://example.com/dk", summary: "Thực hành CAN" }),
  ev("Họp CLB", "2026-10-13"),
  ev("Hackathon", "2026-10-20", { time: "8h", tag: "Cuộc thi" }),
  ev("Demo day", "2026-11-05"),
  ev("Chưa chốt lịch", ""),
  ev("Đã diễn ra", "2026-09-01")
];

describe("EmptyResults", () => {
  const out = html(<EmptyResults message="Không có." onReset={() => {}} suggestions={[{ label: "Hãng: ST", count: 5, run: () => {} }, { label: "Danh mục: A", count: 0, run: () => {} }, { label: "Từ khóa “x”", run: () => {} }]} />);
  it("gợi ý bộ lọc có kết quả kèm số, và gợi ý không đếm được", () => {
    expect(out).toContain("Hãng: ST");
    expect(out).toContain("5 kết quả");
    expect(out).toContain("Từ khóa");
  });
  it("ẩn gợi ý sẽ vẫn ra 0 kết quả", () => expect(out).not.toContain("Danh mục: A"));
  it("luôn có nút xóa tất cả", () => expect(out).toContain("Xóa tất cả bộ lọc"));
});

describe("NoData", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });
  const render = async () => {
    vi.resetModules();
    const { NoData } = await import("@/components/NoData");
    return html(<NoData what="sự kiện" env="EVENTS_SHEET_CSV_URL" />);
  };
  it("lúc phát triển nói rõ biến môi trường cần kiểm tra", async () => {
    vi.stubEnv("NODE_ENV", "development");
    const out = await render();
    expect(out).toContain("EVENTS_SHEET_CSV_URL");
    expect(out).not.toContain("đang được cập nhật");
  });
  it("ở production người xem không thấy tên biến hay .env.local, chỉ thấy lời nhắn và lối đi tiếp", async () => {
    vi.stubEnv("NODE_ENV", "production");
    const out = await render();
    expect(out).toContain("đang được cập nhật");
    expect(out).toContain("Về trang chủ");
    expect(out).not.toContain("EVENTS_SHEET_CSV_URL");
    expect(out).not.toContain(".env.local");
  });
});

describe("AddToCalendar", () => {
  it("có link Google Calendar và nút .ics cho sự kiện có ngày", () => {
    const out = html(<AddToCalendar event={items[0]} />);
    expect(out).toContain("calendar.google.com/calendar/render");
    expect(out).toContain(".ics");
  });
  it("không hiện gì khi chưa có ngày hợp lệ", () => expect(html(<AddToCalendar event={items[4]} />)).toBe(""));
});

describe("EventsMonth", () => {
  const out = html(<EventsMonth items={items} today="2026-10-12" />);
  it("mở ở tháng hôm nay và đếm đúng sự kiện có ngày trong tháng", () => {
    expect(out).toContain("Tháng 10/2026");
    expect(out).toContain("3 sự kiện");
  });
  it("ngày 13 có 2 sự kiện, hôm nay được đánh dấu", () => {
    expect(out).toContain("13 tháng 10, 2 sự kiện");
    expect(out).toContain("12 tháng 10 (hôm nay)");
  });
  it("sự kiện chưa có ngày không lên lịch; sự kiện đã qua không có nút thêm vào lịch", () => {
    expect(out).not.toContain("Chưa chốt lịch");
    expect(out.match(/Thêm vào lịch/g)).toHaveLength(3);
  });
  it("tháng hôm nay trống thì nhảy tới sự kiện sắp tới gần nhất", () => {
    expect(html(<EventsMonth items={[ev("Xa", "2027-02-10")]} today="2026-10-12" />)).toContain("Tháng 2/2027");
  });
  it("không có sự kiện nào: vẫn hiện tháng hôm nay và báo trống", () => {
    const empty = html(<EventsMonth items={[]} today="2026-10-12" />);
    expect(empty).toContain("Tháng 10/2026");
    expect(empty).toContain("chưa có sự kiện");
  });
  it("lưới dùng nút bấm thật, không dùng role grid sai chuẩn (aria-pressed trên gridcell)", () => {
    expect(out).not.toContain('role="gridcell"');
    expect(out).toContain("aria-pressed");
  });
});

describe("EventsJournal", () => {
  it("có nút chuyển Danh sách / Lịch tháng khi có sự kiện có ngày", () => {
    const out = html(<EventsJournal items={items} today="2026-10-12" />);
    expect(out).toContain("Lịch tháng");
    expect(out).toContain("Danh sách");
  });
  it("ẩn nút chuyển khi không sự kiện nào có ngày hợp lệ", () => {
    expect(html(<EventsJournal items={[ev("A", ""), ev("B", "")]} today="2026-10-12" />)).not.toContain("Lịch tháng");
  });
});

describe("Footer và ToastHost", () => {
  it("chân trang hiện số phiên bản và link tới trang Có gì mới", () => {
    const out = html(<Footer />);
    expect(out).toContain(`v${appVersion}`);
    expect(out).toContain('href="/changelog"');
  });
  it("vùng thông báo có role status để trình đọc màn hình nghe được", () => {
    expect(html(<ToastHost />)).toContain('role="status"');
  });
});
