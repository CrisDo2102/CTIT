import type { Instrumentation } from "next";

// Next.js gọi hàm này mỗi khi một yêu cầu phía server gặp lỗi chưa được xử lý (trang, route API, proxy).
// Ghi nhật ký có cấu trúc và báo cho người vận hành. Không đưa tiêu đề, cookie hay tham số trên link vào báo cáo.
export const onRequestError: Instrumentation.onRequestError = async (error, request, context) => {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { logEvent } = await import("@/lib/log");
  const { notify } = await import("@/lib/alert");

  const err = error as Error & { digest?: string };
  const message = err?.message || "Lỗi không rõ";
  const path = request.path.split("?")[0];

  logEvent("error", "server_error", { message, digest: err?.digest, path, method: request.method, routePath: context.routePath, routeType: context.routeType, renderSource: context.renderSource });
  await notify({
    title: `Lỗi máy chủ: ${message.slice(0, 120)}`,
    detail: `${request.method} ${path} (${context.routeType})${err?.digest ? `\nMã lỗi: ${err.digest}` : ""}`,
    fingerprint: `server:${context.routePath}:${message.slice(0, 80)}`
  });
};
