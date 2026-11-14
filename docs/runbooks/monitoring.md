# Giám sát và cảnh báo

## Hệ thống đang làm gì

| Việc | Cách | Xem ở đâu |
|---|---|---|
| Biết Google Sheet nào đang hỏng | `GET /api/health` chỉ trả trạng thái tổng; `/admin/health` (có đăng nhập) hiển thị từng Sheet (đệm dữ liệu 60 giây). `ok`, `degraded` (đang dùng bản cũ), `down` (HTTP 503) | Mở `/admin/health` để xem chi tiết, hoặc trỏ công cụ giám sát vào `/api/health` |
| Biết lỗi phía máy chủ | `instrumentation.ts` ghi nhật ký `"event":"server_error"` mỗi khi một yêu cầu gặp lỗi | Vercel → Logs, lọc `server_error` |
| Biết lỗi phía trình duyệt người dùng | Lỗi JavaScript chưa xử lý và lỗi hiển thị trang gửi về `/api/report`, ghi `"event":"client_error"` | Vercel → Logs, lọc `client_error` |
| Được báo chủ động | Các lỗi trên và Sheet hỏng được gửi vào kênh Discord/Slack qua `ALERT_WEBHOOK_URL` | Kênh Discord/Slack của bạn |
| Biết trang chậm với người dùng thật | Vercel Speed Insights (Core Web Vitals), chỉ chạy trên Vercel | Vercel → Speed Insights |

Cảnh báo được **giới hạn tần suất**: cùng một lỗi chỉ báo một lần mỗi 15 phút, tối đa 20 tin mỗi giờ, nên một lỗi lặp lại hay người lạ cố tình gửi báo cáo giả cũng không làm ngập kênh. Báo lỗi từ trình duyệt còn bị giới hạn 20 báo cáo mỗi 10 phút cho mỗi địa chỉ IP, nhỏ tối đa 4 KB và phải cùng nguồn gốc. Bộ đếm nằm trong bộ nhớ từng instance nên trên Vercel là "hết sức có thể"; cần chặn tuyệt đối thì dùng Vercel Firewall.

## Cài đặt (làm một lần, khoảng 15 phút)

1. **Kênh nhận cảnh báo.** Discord: tạo kênh riêng (vd `#ctit-canh-bao`) → Cài đặt kênh → Tích hợp → Webhook → Webhook mới → sao chép URL. Slack: tạo Incoming Webhook.
2. **Đặt biến `ALERT_WEBHOOK_URL`** trên Vercel (Settings → Environment Variables, cho Production) = URL vừa sao chép. **Redeploy.** URL phải bắt đầu bằng `https://`; địa chỉ nội bộ bị từ chối.
3. **Thử:** vào `/admin`, mục **Giám sát**, bấm "Gửi cảnh báo thử". Thấy tin trong kênh là xong. Nếu báo "chưa đặt ALERT_WEBHOOK_URL" thì biến chưa có hiệu lực (chưa redeploy).
4. **Giám sát từ bên ngoài** (để biết cả khi cả trang chết, lúc code của mình không chạy được để tự báo): tạo tài khoản UptimeRobot hoặc Better Stack (có gói miễn phí), thêm monitor HTTP(s) tới `https://<tên miền>/api/health`, chu kỳ 5 phút, bật báo qua email/Telegram. Monitor kiểu "keyword" tìm chuỗi `"status":"ok"` sẽ bắt được cả trường hợp `degraded`.
5. **Tốc độ người dùng thật:** Vercel → project → tab **Speed Insights** → Enable, rồi redeploy.

## Khi nhận cảnh báo

| Cảnh báo | Thường là | Việc đầu tiên |
|---|---|---|
| "Google Sheet không tải được" | Link CSV sai hoặc đã dừng xuất bản; Google tạm lỗi | Mở `/admin/health` (cần tài khoản) xem tab nào; mở link CSV của tab đó trong trình duyệt ẩn danh |
| "Google Sheet đang dùng bản dữ liệu cũ" | Google tạm lỗi; trang vẫn hiển thị bình thường bằng bản cũ | Thường tự hết; nếu kéo dài hơn 1 giờ thì xử lý như trên |
| "Lỗi máy chủ: …" | Lỗi code hoặc dữ liệu lạ trong Sheet | Vercel → Logs, lọc `server_error`, xem `path` và `digest` |
| "Lỗi trên trình duyệt: …" | Lỗi JavaScript ở máy một số người dùng | Vercel → Logs, lọc `client_error`; xem `path`, nội dung và dấu vết |
| Không còn tin nào, trang chết | Monitor ngoài (bước 4) báo | Xem trạng thái deploy trên Vercel, quay lại bản deploy trước (Deployments → ⋯ → Promote to Production) |
