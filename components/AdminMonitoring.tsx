"use client";

import { useState } from "react";

// Khối "Giám sát" ở trang admin: xem tình trạng hệ thống và gửi cảnh báo thử để biết kênh cảnh báo có hoạt động.
export function AdminMonitoring() {
  const [state, setState] = useState<"idle" | "busy" | "sent" | "not-configured" | "failed">("idle");

  const test = async () => {
    setState("busy");
    try {
      const response = await fetch("/admin/test-alert", { method: "POST" });
      const data = (await response.json()) as { configured?: boolean; sent?: boolean };
      setState(!data.configured ? "not-configured" : data.sent ? "sent" : "failed");
    } catch {
      setState("failed");
    }
  };

  return (
    <div className="container admin-monitoring">
      <h2>Giám sát</h2>
      <p>
        Xem <a href="/admin/health" target="_blank" rel="noopener noreferrer">tình trạng hệ thống <span aria-hidden="true">↗</span></a> (tab Google Sheet nào đang tải được, chỉ admin xem được). Dùng <code>/api/health</code> cho công cụ
        giám sát công khai (UptimeRobot, Better Stack...) để được báo khi trang hỏng. Cách cài đặt nằm trong <code>docs/runbooks/monitoring.md</code>.
      </p>
      <button type="button" className="btn secondary" onClick={test} disabled={state === "busy"}>
        {state === "busy" ? "Đang gửi..." : "Gửi cảnh báo thử"}
      </button>
      <p className="admin-monitoring-result" role="status">
        {state === "sent" ? "Đã gửi. Kiểm tra kênh Discord/Slack của bạn." : null}
        {state === "not-configured" ? "Chưa đặt ALERT_WEBHOOK_URL trên máy chủ nên chưa có kênh nhận cảnh báo." : null}
        {state === "failed" ? "Không gửi được. Xem nhật ký của máy chủ (tìm \"alert_send_failed\")." : null}
      </p>
    </div>
  );
}
