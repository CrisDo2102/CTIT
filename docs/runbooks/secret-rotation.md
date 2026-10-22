# Khóa bí mật: danh sách, cách đổi, và việc cần làm khi lộ

## Danh sách khóa của dự án

| Khóa | Nằm ở đâu | Dùng để | Lộ thì ảnh hưởng |
|---|---|---|---|
| `ADMIN_PASSWORD` | Vercel (Environment Variables), `.env.local` | Mật khẩu vào `/admin` | Người lạ vào được trang admin (chỉ là trang hướng dẫn và link CSV của các tab) |
| `ALERT_WEBHOOK_URL` | Vercel, `.env.local` | Gửi cảnh báo vào Discord/Slack | Người lạ gửi tin giả vào kênh cảnh báo của bạn |
| `*_SHEET_CSV_URL` (10 biến) | Vercel, `.env.local` | Đọc nội dung từ Google Sheet đã "publish to web" | Người có link đọc được toàn bộ tab đó (không sửa được) |
| `SUPABASE_*`, `ADMIN_SECRET` (cũ) | Có trong `.env.local` cũ | **Không còn dùng trong code** | Nếu là khóa thật: khóa `service_role` có toàn quyền với cơ sở dữ liệu |

> **Việc cần kiểm tra:** trong `.env.local` của bản zip ban đầu, các biến Supabase chỉ là **chuỗi mẫu** (`YOUR_...`), không phải khóa thật,
> nên không có khóa nào bị lộ qua file đó. Nhưng `ADMIN_PASSWORD` trong file là **chuỗi mẫu kiểu `change-this-...`**: nếu giá trị này (hoặc
> bất kỳ mật khẩu đoán được) đang được đặt trên Vercel thì phải đổi ngay sang chuỗi ngẫu nhiên. Từ bản này, `/admin` tự tắt trên bản chạy thật nếu mật khẩu là chuỗi mẫu.

## Nguyên tắc khi nghi ngờ lộ khóa

1. **Đổi khóa trước**, dọn dẹp sau. Xóa khóa khỏi file hay khỏi git không làm khóa hết hiệu lực, vì bản cũ vẫn còn trong lịch sử, bản sao và bản tải về.
2. Đổi xong, cập nhật giá trị mới ở **Vercel** (Settings → Environment Variables, cả Production và Preview) và `.env.local`, rồi **Redeploy**.
3. Kiểm tra lại: `/api/health` trả `ok`, vào được `/admin` bằng mật khẩu mới.
4. Ghi lại ngày đổi và lý do (một dòng trong changelog nội bộ là đủ).

## Từng khóa

**`ADMIN_PASSWORD`**: đặt chuỗi dài từ 16 ký tự, ngẫu nhiên (trình quản lý mật khẩu tạo giúp). Dưới 12 ký tự thì `/admin` tự tắt trên bản chạy thật.

**`ALERT_WEBHOOK_URL`**: Discord: Cài đặt kênh → Tích hợp → Webhook → xóa webhook cũ, tạo cái mới, sao chép URL. Slack: Incoming Webhooks → thu hồi URL cũ, tạo URL mới. Sau đó bấm "Gửi cảnh báo thử" ở `/admin` để kiểm tra.

**Link Google Sheet**: Google Sheet → Tệp → Chia sẻ → **Xuất bản lên web** → dừng xuất bản tab đó, rồi xuất bản lại để có link mới (link cũ ngừng hoạt động). Cập nhật biến `*_SHEET_CSV_URL` tương ứng. Nếu Sheet chứa dữ liệu nhạy cảm, đừng xuất bản cả tab đó.

**Khóa Supabase cũ** (chỉ cần làm nếu bạn từng dán khóa thật vào đó): vào Supabase → Project Settings → API (tên mục có thể khác theo phiên bản giao diện). Tạo lại khóa bí mật / JWT secret để khóa cũ mất hiệu lực, hoặc xóa cả project nếu không còn dùng. Sau đó xóa `SUPABASE_*` và `ADMIN_SECRET` khỏi `.env.local` và Vercel.

## Phòng ngừa

- `.env.local` đã nằm trong `.gitignore`. **Không gửi zip có chứa `.env.local`** cho người khác.
- CI chạy `npm run check:secrets` mỗi lần đẩy code và báo lỗi nếu thấy dạng khóa quen thuộc hoặc file `.env` thật bị theo dõi. Chạy tay: `npm run check:secrets`.
- Bật **GitHub Secret Scanning và Push Protection** (repo → Settings → Code security): GitHub chặn ngay lúc đẩy code nếu thấy khóa của các nhà cung cấp phổ biến.
- Chỉ đặt vào biến `NEXT_PUBLIC_*` những thứ **công khai**; mọi biến đó bị nhúng vào mã gửi cho trình duyệt.
