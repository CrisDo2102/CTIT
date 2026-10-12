"use client";

import { googleCalendarUrl, icsContent, type CalendarEvent } from "@/lib/calendar";

// "Thêm vào lịch": Google Calendar (mở tab mới) hoặc tải file .ics cho Apple / Outlook.
// Sự kiện chưa có ngày hợp lệ (YYYY-MM-DD) thì không hiện.
export function AddToCalendar({ event, className = "" }: { event: CalendarEvent; className?: string }) {
  const google = googleCalendarUrl(event);
  if (!google) return null;

  const download = () => {
    const content = icsContent(event);
    if (!content) return;
    const url = URL.createObjectURL(new Blob([content], { type: "text/calendar;charset=utf-8" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `ctit-${event.date}.ics`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <span className={`ev-cal ${className}`.trim()}>
      <span className="ev-cal-label">Thêm vào lịch</span>
      <a href={google} target="_blank" rel="noopener noreferrer">Google<span className="sr-only"> (mở tab mới)</span></a>
      <button type="button" onClick={download}>Apple / Outlook (.ics)</button>
    </span>
  );
}
