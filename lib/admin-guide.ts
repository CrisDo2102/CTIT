// Du lieu cho trang /admin: cach dien tung tab Google Sheet. Ham thuan, dung duoc o client.
export type GuideColumn = { name: string; desc: string; required?: boolean };
export type Guide = {
  key: string;
  label: string; // ten chip (khop ten menu)
  tab: string; // ten tab trong Google Sheet
  path: string; // trang web dung du lieu tab nay
  env: string; // bien trong .env.local
  imageFolder?: string;
  note?: string; // ghi chu trang thai (vd tab chua dev)
  columnsHeading?: string;
  columns: GuideColumn[];
  rules: string[];
  sample: string[][]; // dong dau = header
};

const FEED_COLUMNS: GuideColumn[] = [
  { name: "title", desc: "Tiêu đề.", required: true },
  { name: "date", desc: "Ngày, ghi 2026-09-20 (năm-tháng-ngày)." },
  { name: "summary", desc: "Mô tả 1–2 câu." },
  { name: "url", desc: "Link xem thêm." },
  { name: "image", desc: "Tên file ảnh CÓ ĐUÔI, khớp chính xác hoa/thường; hoặc link Drive / URL ảnh." },
  { name: "tag", desc: "Nhãn phân loại." }
];

export const guides: Guide[] = [
  {
    key: "overview",
    label: "Overview",
    tab: "Overview",
    path: "/",
    env: "OVERVIEW_SHEET_CSV_URL",
    imageFolder: "public/images/Overview/",
    note: "Số liệu hiện ở trang Giới thiệu (và trang đầu). Cột id/ảnh trong tab hiện chưa được dùng.",
    columns: [
      { name: "label", desc: "Tên số liệu, vd Năm thành lập.", required: true },
      { name: "value", desc: "Giá trị hiển thị, vd 2023 hoặc 200+.", required: true }
    ],
    rules: ["Mỗi dòng là 1 ô số liệu, hiện theo thứ tự trong sheet."],
    sample: [["label", "value"], ["Năm thành lập", "2023"], ["Số lượng thành viên", "200+"]]
  },
  {
    key: "admissions",
    label: "Tuyển sinh",
    tab: "Admissions",
    path: "/admissions",
    env: "ADMISSIONS_SHEET_CSV_URL",
    imageFolder: "public/images/Admissions/",
    note: "Chưa dev. Trang Tuyển sinh hiện là 4 bước viết cứng trong code; tab Admissions chưa có cấu trúc cột.",
    columns: [],
    rules: [],
    sample: []
  },
  {
    key: "students",
    label: "Trường & Khoa",
    tab: "Students",
    path: "/schools",
    env: "STUDENTS_SHEET_CSV_URL",
    imageFolder: "public/images/Students/",
    columns: [
      { name: "Tên viết tắt", desc: "Tên trường viết tắt, vd HCMUT. Dùng để gom nhóm và làm chip lọc.", required: true },
      { name: "Tên đầy đủ", desc: "Chỉ cần điền 1 lần cho mỗi trường, các dòng trống tự lấy theo." },
      { name: "name", desc: "Họ tên học viên.", required: true },
      { name: "major", desc: "Ngành." },
      { name: "faculty", desc: "Khoa." },
      { name: "id", desc: "Tên file ảnh có đuôi, vd huynhhuunhat.png (hoặc đặt cột tên photo)." }
    ],
    rules: ["Dòng trống giữa các dòng dữ liệu được bỏ qua."],
    sample: [
      ["Tên viết tắt", "Tên đầy đủ", "name", "major", "faculty", "id"],
      ["HCMUT", "Trường Đại học Bách khoa - ĐHQG-HCM", "Huỳnh Hữu Nhật", "Khoa học Máy tính", "Khoa Khoa học và Kỹ thuật Máy tính", "huynhhuunhat.png"]
    ]
  },
  {
    key: "research",
    label: "Nghiên cứu",
    tab: "Research",
    path: "/research",
    env: "RESEARCH_SHEET_CSV_URL",
    imageFolder: "public/images/Research/",
    note: "Chưa dev. Link CSV đã được nhận nhưng trang chưa hiển thị dữ liệu, cột sẽ định nghĩa sau.",
    columns: [],
    rules: [],
    sample: []
  },
  {
    key: "news",
    label: "Tin tức",
    tab: "News",
    path: "/news",
    env: "NEWS_SHEET_CSV_URL",
    imageFolder: "public/images/News/",
    columns: FEED_COLUMNS,
    rules: ["Dòng mới nhất để trên cùng, thứ tự dòng = thứ tự hiển thị."],
    sample: [["title", "date", "summary", "url", "image", "tag"], ["Tuyển thành viên khóa mới", "2026-09-20", "CTIT mở đơn đăng ký.", "https://...", "tuyen-thanh-vien.jpg", "Thông báo"]]
  },
  {
    key: "events",
    label: "Sự kiện",
    tab: "Events",
    path: "/events",
    env: "EVENTS_SHEET_CSV_URL",
    imageFolder: "public/images/Events/",
    note: "Trang tự chia Sắp diễn ra / Đã diễn ra dựa vào cột date so với ngày hôm nay (không cần cột trạng thái riêng). Sắp diễn ra hiện dạng danh sách lịch; Đã diễn ra hiện dạng ảnh có thể bấm xem lớn.",
    columnsHeading: "9 cột",
    columns: [
      { name: "title", desc: "Tên sự kiện.", required: true },
      { name: "date", desc: "Ghi 2026-10-05 (năm-tháng-ngày). Đặt cột ở dạng Plain text để Sheets không tự đổi định dạng. Để trống = chưa chốt lịch, vẫn hiện ở mục Sắp diễn ra." },
      { name: "time", desc: "Giờ diễn ra, vd 18:00 - 20:00. Tuỳ chọn." },
      { name: "place", desc: "Địa điểm, vd Lab A1 / Online qua Google Meet." },
      { name: "summary", desc: "Mô tả ngắn 1–2 câu, tối đa khoảng 120 ký tự." },
      { name: "url", desc: "Link đăng ký / xem thêm (form, Facebook post...). Trống thì thẻ sự kiện không hiện nút." },
      { name: "image", desc: "Tên file ảnh có đuôi trong public/images/Events/, hoặc link ảnh. Khớp chính xác hoa/thường." },
      { name: "tag", desc: "Nhãn để lọc: Workshop / Seminar / Thông báo... Thanh chip tự tạo từ cột này." },
      { name: "featured", desc: "Điền x để ưu tiên làm ảnh hero đầu trang (trong nhóm sự kiện sắp diễn ra). Không có dòng nào thì tự lấy sự kiện gần nhất." }
    ],
    rules: [
      "Thứ tự dòng trong sheet không quan trọng — trang tự sắp xếp: sắp diễn ra theo ngày gần nhất trước, đã diễn ra theo ngày gần nhất trước.",
      "Ảnh nên rộng khoảng 1600px, dưới 500KB (ảnh điện thoại 5–8MB sẽ làm trang chậm)."
    ],
    sample: [
      ["title", "date", "time", "place", "summary", "url", "image", "tag", "featured"],
      ["Workshop CAN bus", "2026-10-05", "18:00 - 20:00", "Lab A1", "Buổi học thực hành bus CAN trên ATmega.", "https://...", "can-workshop.jpg", "Workshop", "x"]
    ]
  },
  {
    key: "resources",
    label: "Tài liệu",
    tab: "Resources",
    path: "/resources",
    env: "RESOURCES_SHEET_CSV_URL",
    imageFolder: "public/images/Resources/",
    columns: [
      { name: "id", desc: "Tên file ảnh bìa CÓ ĐUÔI, vd Chuyen-nganh-co-dien-tu.jpg. Trống thì card hiện icon." },
      { name: "title", desc: "Tên tài liệu, hiện làm tiêu đề card.", required: true },
      { name: "url", desc: "Link mở tài liệu: Drive, GitHub, YouTube, PDF...", required: true },
      { name: "description", desc: "Mô tả ngắn hiện dưới tiêu đề." },
      { name: "type", desc: "youtube, pdf, datasheet, code, tool, website... Bỏ trống thì tự đoán từ link." },
      { name: "topic", desc: "Chủ đề, ví dụ AVR, STM32, CAN, BMS." },
      { name: "level", desc: "Mức độ, ví dụ Core, Practice, Reference." },
      { name: "source", desc: "Nguồn tài liệu, ví dụ GitHub, Microchip, Drive." },
      { name: "featured", desc: "Điền x hoặc yes để hiện ở mục Featured trên trang chủ." },
      { name: "Mục lớn", desc: "Nhóm lớn của tài liệu, hiện ở dòng thông tin dưới tiêu đề." }
    ],
    rules: ["Ghi chú trong ngoặc ở tên cột được bỏ qua: “url (link sách, link youtube)” vẫn là cột url."],
    sample: [
      ["Mục lớn", "id", "title", "url", "description", "type", "topic"],
      ["", "Chuyen-nganh-co-dien-tu.jpg", "Nhất nghệ tinh chuyên ngành Cơ điện tử", "https://...", "", "pdf", ""]
    ]
  },
  {
    key: "campus",
    label: "Khuôn viên",
    tab: "Campus",
    path: "/campus",
    env: "CAMPUS_SHEET_CSV_URL",
    imageFolder: "public/images/Campus/",
    columns: [
      { name: "title", desc: "Tên ảnh / hoạt động, hiện khi hover và trong ảnh lớn.", required: true },
      { name: "date", desc: "Ghi 2026-09-20. Đặt cột ở dạng Plain text để Sheets không tự đổi định dạng." },
      { name: "summary", desc: "Note hiện trong ảnh lớn, 1–2 câu, tối đa khoảng 120 ký tự." },
      { name: "url", desc: "Link xem thêm (bài Facebook, album...). Trống thì không hiện nút." },
      { name: "image", desc: "Tên file có đuôi trong public/images/Campus/, vd can-workshop-01.jpg. Khớp chính xác hoa/thường." },
      { name: "tag", desc: "Nhãn để lọc: Lab / Workshop / Đời sống... Chỉ dùng 3–5 từ cố định. Thanh chip tự tạo từ cột này." },
      { name: "place", desc: "Địa điểm, hiện cạnh ngày. Vd Lab A1." },
      { name: "featured", desc: "Điền x để làm ảnh hero to đầu trang. Không có dòng nào thì lấy dòng đầu." }
    ],
    rules: [
      "1 dòng = 1 ảnh. Dòng mới nhất để trên cùng, thứ tự dòng = thứ tự hiển thị.",
      "Tên ảnh nên chữ thường, không dấu, không cách: lab-01.jpg.",
      "Ảnh ngang 3:2 hoặc 4:3, rộng khoảng 1600px, dưới 500KB (ảnh điện thoại 5–8MB sẽ làm trang chậm).",
      "Chip lọc chỉ hiện khi có từ 2 tag khác nhau; lưới hiện khi có từ 2 ảnh."
    ],
    sample: [
      ["title", "date", "summary", "url", "image", "tag", "place", "featured"],
      ["Workshop CAN bus", "2026-09-20", "15 bạn cùng debug bus CAN trên ATmega.", "https://facebook.com/...", "can-workshop-01.jpg", "Workshop", "Lab A1", "x"],
      ["Góc học của CTIT", "2026-09-12", "Bàn hàn mạch sau buổi thực hành.", "", "lab-corner.jpg", "Lab", "Lab A1", ""]
    ]
  },
  {
    key: "about",
    label: "Giới thiệu",
    tab: "About",
    path: "/about",
    env: "ABOUT_SHEET_CSV_URL",
    imageFolder: "public/images/About/",
    note: "Người phụ trách, hiện ở đầu trang Giới thiệu. Tab có 2 cột label | value, mỗi dòng là 1 thông tin.",
    columnsHeading: "9 dòng label",
    columns: [
      { name: "Tên (name)", desc: "Họ tên người phụ trách.", required: true },
      { name: "Trường (school)", desc: "Vd HCM-UTE." },
      { name: "Ngành (major)", desc: "Ngành học." },
      { name: "Khoa (faculty)", desc: "Khoa." },
      { name: "Giới thiệu (bio)", desc: "Đoạn giới thiệu ngắn." },
      { name: "Ảnh admin (photo)", desc: "Tên file ảnh có đuôi trong public/images/About/, hoặc link ảnh." },
      { name: "Logo web (logo)", desc: "Tuỳ chọn. Tên file logo (đuôi ảnh) trong public/images/About/, hoặc link ảnh. Để trống thì Header hiện chữ \"CT\" mặc định." },
      { name: "Tiêu đề trang (page_title)", desc: "Tuỳ chọn. Chữ H1 to ở đầu trang Giới thiệu, để trống thì tự lấy chữ \"Giới thiệu\" mặc định." },
      { name: "Mô tả trang (page_intro)", desc: "Tuỳ chọn. Dòng mô tả nhỏ dưới H1 (vd \"Người phụ trách và các số liệu tổng quan về CTIT.\"), để trống thì tự lấy câu mặc định." }
    ],
    rules: [
      "Ghi nhãn ở cột label bằng tiếng Việt hoặc tiếng Anh đều được (Tên hoặc name...).",
      "KHÔNG cần thêm cột \"id\" riêng: mỗi dòng đã là 1 thông tin (label | value), tên file ảnh ghi thẳng vào cột value của đúng dòng đó (Ảnh admin, Logo web)."
    ],
    sample: [["label", "value"], ["Tên", "Đỗ Thành Đạt"], ["Trường", "HCM-UTE"], ["Ngành", "Công nghệ Kỹ thuật Ô tô"], ["Khoa", "Đào tạo Tiên tiến"], ["Ảnh admin", "about-photo.jpg"], ["Logo web", "logo.png"], ["Tiêu đề trang", "Giới thiệu"], ["Mô tả trang", "Người phụ trách và các số liệu tổng quan về CTIT."]]
  }
];
