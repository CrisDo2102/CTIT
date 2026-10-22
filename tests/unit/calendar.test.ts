import { describe, expect, it } from "vitest";
import { googleCalendarUrl, icsContent, isIsoDate, monthCells, parseTimes } from "@/lib/calendar";

describe("parseTimes", () => {
  it.each([
    ["18:00 - 20:00", { start: [18, 0], end: [20, 0] }],
    ["18h30–20h", { start: [18, 30], end: [20, 0] }],
    ["9 giờ 30", { start: [9, 30], end: null }]
  ])("đọc %s", (text, expected) => expect(parseTimes(text)).toEqual(expected));

  it.each(["Cả ngày", "13/10", "25h", "", undefined])("không có giờ hợp lệ: %s", (text) => expect(parseTimes(text)).toBeNull());
});

const event = { title: 'Workshop CAN, bus; "xe"', date: "2026-10-13", time: "18:00 - 20:00", place: "Phòng B1, ĐH Cần Thơ", summary: "Dòng 1\nDòng 2", url: "https://example.com/dk" };

describe("googleCalendarUrl", () => {
  it("đổi giờ Việt Nam (UTC+7) sang UTC", () => {
    expect(googleCalendarUrl(event)).toContain("dates=20261013T110000Z/20261013T130000Z");
  });
  it("giờ sớm: 05:00 VN là 22:00Z ngày hôm trước", () => {
    expect(googleCalendarUrl({ title: "Sớm", date: "2026-10-13", time: "05:00" })).toContain("dates=20261012T220000Z/20261013T000000Z");
  });
  it("mã hóa tiêu đề", () => expect(googleCalendarUrl(event)).toContain("text=Workshop%20CAN%2C%20bus%3B"));
  it("ngày không hợp lệ thì không có link", () => expect(googleCalendarUrl({ title: "x", date: "13/10" })).toBeNull());
});

describe("icsContent", () => {
  const ics = icsContent(event)!;
  it("dùng CRLF và có giờ UTC", () => {
    expect(ics).toContain("\r\n");
    expect(ics).not.toMatch(/[^\r]\n/);
    expect(ics).toContain("DTSTART:20261013T110000Z");
    expect(ics).toContain("DTEND:20261013T130000Z");
  });
  it("escape dấu phẩy, chấm phẩy và xuống dòng", () => {
    expect(ics).toContain('SUMMARY:Workshop CAN\\, bus\\; "xe"');
    expect(ics).toContain("\\n");
  });
  it("mỗi dòng không quá 75 byte và gấp dòng không làm mất chữ có dấu", () => {
    const long = icsContent({ ...event, summary: "Rất dài ".repeat(60) })!;
    expect(long.split("\r\n").every((line) => new TextEncoder().encode(line).length <= 75)).toBe(true);
    expect(long.replace(/\r\n /g, "")).toContain("Rất dài ".repeat(60).trim());
  });
  it("sự kiện cả ngày: kết thúc là ngày hôm sau", () => {
    const allDay = icsContent({ title: "Cả ngày", date: "2026-12-31" })!;
    expect(allDay).toContain("DTSTART;VALUE=DATE:20261231");
    expect(allDay).toContain("DTEND;VALUE=DATE:20270101");
  });
  it("qua nửa đêm: 22:00 - 01:00 kết thúc sang hôm sau", () => {
    const night = icsContent({ title: "Đêm", date: "2026-10-13", time: "22:00 - 01:00" })!;
    expect(night).toContain("DTSTART:20261013T150000Z");
    expect(night).toContain("DTEND:20261013T180000Z");
  });
});

describe("monthCells", () => {
  it("tháng 10/2026: 1/10 là thứ Năm nên có 3 ô trống đầu, đủ 31 ngày, chia hết cho 7", () => {
    const cells = monthCells(2026, 10);
    expect(cells.slice(0, 3)).toEqual([null, null, null]);
    expect(cells[3]).toBe("2026-10-01");
    expect(cells.filter(Boolean)).toHaveLength(31);
    expect(cells.length % 7).toBe(0);
  });
  it("năm nhuận: tháng 2/2028 có 29 ngày", () => expect(monthCells(2028, 2).filter(Boolean)).toHaveLength(29));
  it("tháng bắt đầu từ thứ Hai không có ô trống đầu", () => expect(monthCells(2026, 6)[0]).toBe("2026-06-01"));
  it("isIsoDate", () => {
    expect(isIsoDate("2026-10-13")).toBe(true);
    expect(isIsoDate("13/10/2026")).toBe(false);
  });
});
