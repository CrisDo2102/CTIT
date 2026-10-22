// Nhật ký cập nhật hiển thị ở trang /changelog ("Có gì mới") và số phiên bản ở chân trang.
// Thêm đợt mới lên ĐẦU danh sách; phiên bản = ngày cập nhật (năm.tháng.ngày).
export type ChangeEntry = {
  version: string;
  date: string;
  title: string;
  items: { text: string; href?: string }[];
};

export const changelog: ChangeEntry[] = [
  {
    version: "2026.10.16",
    date: "16/10/2026",
    title: "Trang chủ điện ảnh, ảnh nhẹ hơn nhiều",
    items: [
      { text: "Trang chủ: ảnh hero chiếm trọn màn hình, menu nổi trên ảnh rồi chuyển sang nền kính mờ khi cuộn.", href: "/" },
      { text: "Mỗi hướng hoạt động là một màn hình riêng: tiêu đề lớn, một câu mô tả, hai nút (lấy từ tab Admissions)." },
      { text: "Logo từ 1,4 MB xuống 116 KB: mỗi khách mới tải trang nhanh hơn rõ rệt; ảnh trong thư mục images được trình duyệt giữ 1 ngày thay vì hỏi lại mỗi lần." }
    ]
  },
  {
    version: "2026.10.15",
    date: "15/10/2026",
    title: "Sửa lỗi phát hiện khi chạy thử với dữ liệu mẫu",
    items: [
      { text: "Inventory: trạng thái \"Sắp hết\" không còn bị hiện nhầm thành \"Hết hàng\"; ô \"Đang có sẵn\" tính đúng các món ghi \"Còn hàng\"; ô thống kê gọn 2×2 trên điện thoại.", href: "/resources/inventory" },
      { text: "Tìm kiếm: bấm kết quả vật tư mở đúng trang chi tiết của món đó." },
      { text: "Thông báo \"Đã lưu\" hiện 8 giây và dừng đếm giờ khi rê chuột hoặc focus vào; menu điện thoại hiện số mục đã lưu." },
      { text: "Hướng dẫn trong trang admin cho tab Tin tức đã sửa (cột section là bắt buộc)." }
    ]
  },
  {
    version: "2026.10.14",
    date: "14/10/2026",
    title: "Vá lỗ hổng bảo mật và hệ thống tự báo lỗi",
    items: [
      { text: "Nâng Next.js lên 16.4.0 để vá 17 lỗ hổng đã được công bố, trong đó có lỗi mức nghiêm trọng nhất (critical)." },
      { text: "Hệ thống tự ghi nhận lỗi trên máy chủ và trên trình duyệt người dùng, và có thể báo thẳng vào kênh Discord/Slack." },
      { text: "Trang admin tự tắt nếu mật khẩu còn là giá trị mẫu hoặc dễ đoán." },
      { text: "Quét khóa bí mật và kiểm tra lỗ hổng thư viện tự động mỗi lần đẩy code; thêm /.well-known/security.txt để người ngoài báo lỗ hổng đúng chỗ." }
    ]
  },
  {
    version: "2026.10.13.2",
    date: "13/10/2026",
    title: "Độ tin cậy: kiểm thử tự động, dữ liệu không mất khi Sheet lỗi",
    items: [
      { text: "Khi Google Sheet tạm lỗi, trang giữ lại dữ liệu tốt gần nhất thay vì hiện trống." },
      { text: "Thêm địa chỉ /api/health để theo dõi tình trạng từng Sheet (dùng với UptimeRobot hoặc tương tự).", href: "/api/health" },
      { text: "Ô tìm kiếm: bấm Esc đóng được từ bất kỳ nút nào bên trong, không chỉ khi đang ở ô nhập." },
      { text: "Lần đầu có kiểm thử tự động (hơn 100 bài đơn vị và 30 bài trên trình duyệt thật) chạy mỗi lần đẩy code." }
    ]
  },
  {
    version: "2026.10.13",
    date: "13/10/2026",
    title: "Sửa gạch chân menu bị dính nhau",
    items: [
      { text: "Menu chính: gạch chân của hai mục kề nhau (ví dụ Sự kiện và Tài nguyên) không còn nối liền thành một vệt; mỗi mục có gạch riêng dài bằng chữ, mục Tài nguyên dùng cùng kiểu gạch như các mục khác." }
    ]
  },
  {
    version: "2026.10.12.4",
    date: "12/10/2026",
    title: "Quay lại danh sách đúng chỗ, bộ lọc trên điện thoại tiện hơn",
    items: [
      { text: "Mở một món rồi quay lại Inventory hoặc Tài liệu: trang trở về đúng vị trí đang xem, không nhảy lên đầu.", href: "/resources/inventory" },
      { text: "Trên điện thoại: thanh \"N mặt hàng · Bộ lọc · Sắp xếp\" dính dưới header khi cuộn, và có nút \"Xem N kết quả\" ở cuối ngăn kéo bộ lọc." },
      { text: "Thanh dính không còn che ô đang chọn bằng phím Tab (theo WCAG 2.2)." }
    ]
  },
  {
    version: "2026.10.12.3",
    date: "12/10/2026",
    title: "Tiêu đề trang, thông báo thân thiện, dễ dùng hơn trên bàn phím và điện thoại",
    items: [
      { text: "Mỗi trang có tiêu đề riêng trên tab trình duyệt (vd \"Sự kiện · CTIT\") thay vì trang nào cũng là \"CTIT\"." },
      { text: "Khi một mục chưa có dữ liệu, người xem thấy \"Nội dung đang được cập nhật\" cùng lối đi tiếp, không còn thấy câu dành cho người làm web." },
      { text: "Trang 404 có nút Tìm kiếm." },
      { text: "Vòng viền rõ khi dùng phím Tab; nút và ô lọc đủ lớn (44px) trên màn hình cảm ứng; tắt cuộn mượt nếu máy bật giảm chuyển động." }
    ]
  },
  {
    version: "2026.10.12.2",
    date: "12/10/2026",
    title: "Dùng tiện hơn (UX)",
    items: [
      { text: "Bấm ★ có thông báo \"Đã lưu\" kèm Hoàn tác và đường tắt tới trang Đã lưu." },
      { text: "Từ trang chi tiết vật tư bấm \"← Inventory\" quay về đúng danh sách đang lọc.", href: "/resources/inventory" },
      { text: "Lọc ra rỗng thì có gợi ý \"Bỏ bộ lọc nào sẽ có bao nhiêu kết quả\" thay vì chỉ báo không có.", href: "/resources/documents" },
      { text: "Bộ lọc trên điện thoại: bấm nền mờ hoặc Esc để đóng, trang phía sau không cuộn theo." },
      { text: "Ô tìm kiếm: phím Tab không rơi ra ngoài, đóng xong trả con trỏ về nút cũ, có lối tắt tìm tiếp trong Tài liệu / Vật tư." }
    ]
  },
  {
    version: "2026.10.12",
    date: "12/10/2026",
    title: "Lịch sự kiện và cảm giác chuyển trang",
    items: [
      { text: "Sự kiện: nút \"Thêm vào lịch\" (Google Calendar hoặc file .ics cho Apple/Outlook).", href: "/events" },
      { text: "Sự kiện: chế độ xem Lịch tháng, bấm một ngày để xem chi tiết.", href: "/events" },
      { text: "Thanh tiến trình chạy ở mép trên khi chuyển trang." },
      { text: "Trang \"Có gì mới\" này và số phiên bản ở chân trang." }
    ]
  },
  {
    version: "2026.10.11",
    date: "11/10/2026",
    title: "Nhanh hơn, gọn hơn",
    items: [
      { text: "Bộ lọc Inventory và Tài liệu tính nhanh hơn, dùng chung một đoạn code.", href: "/resources/inventory" },
      { text: "Tìm kiếm phản hồi nhanh hơn khi gõ; các nút ★ không còn đọc lại cả danh sách đã lưu nhiều lần." }
    ]
  },
  {
    version: "2026.10.09",
    date: "09/10/2026",
    title: "Tìm kiếm, bộ lọc, trang Đã lưu và bảo mật",
    items: [
      { text: "Ô tìm kiếm toàn trang (Ctrl+K hoặc phím /), có chip lọc theo loại, lịch sử và mục đã lưu." },
      { text: "Inventory và Tài liệu: bộ lọc nhiều lựa chọn kèm số kết quả, link giữ nguyên bộ lọc.", href: "/resources/documents" },
      { text: "Trang Đã lưu: tìm, lọc nhóm, chọn nhiều, sao chép / tải danh sách, Hoàn tác.", href: "/saved" },
      { text: "Khóa học: tiến độ trên từng thẻ, nút \"Học tiếp\".", href: "/resources/courses" },
      { text: "Trang chủ: các ô \"Khám phá CTIT\" có ảnh tự đổi; Sự kiện sắp tới dạng thẻ ngày." },
      { text: "Tuyển sinh: bấm ảnh để phóng to. Inventory: nhãn trạng thái không còn đè nút ★.", href: "/admissions" },
      { text: "Bảo mật: chính sách CSP, chống dò mật khẩu /admin, lọc link từ Google Sheet, bỏ dòng trùng lặp." }
    ]
  }
];

export const appVersion = changelog[0].version;
