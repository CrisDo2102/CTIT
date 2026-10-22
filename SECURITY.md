# Chính sách bảo mật

## Báo lỗ hổng

Nếu bạn phát hiện lỗ hổng bảo mật trên website CTIT, vui lòng **không đăng công khai**. Gửi email tới địa chỉ trong
[`public/.well-known/security.txt`](public/.well-known/security.txt) (hoặc trang Liên hệ) với:

- mô tả lỗi và địa chỉ trang bị ảnh hưởng,
- các bước để tái hiện,
- ảnh hưởng bạn nghĩ có thể xảy ra.

Chúng tôi sẽ phản hồi trong vòng 7 ngày. Vui lòng không truy cập dữ liệu của người khác và không làm gián đoạn dịch vụ khi kiểm tra.

## Với người vận hành

- Khóa và mật khẩu: xem [`docs/runbooks/secret-rotation.md`](docs/runbooks/secret-rotation.md) (danh sách khóa, cách đổi, việc cần làm khi lộ khóa).
- Theo dõi và cảnh báo: xem [`docs/runbooks/monitoring.md`](docs/runbooks/monitoring.md).
- CI chạy quét khóa bí mật (`npm run check:secrets`) và kiểm tra lỗ hổng của thư viện (`npm audit`) mỗi lần đẩy code; Dependabot mở PR cập nhật thư viện hằng tuần.
