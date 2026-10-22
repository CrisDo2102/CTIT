// Tạo dữ liệu mẫu cho dev và kiểm thử: tests/fixtures/*.csv (chạy lại bằng `npm run fixtures`).
// Cấu trúc cột theo đúng cách các getter trong lib/sheet-data.ts đọc Sheet thật (xem lib/admin-guide.ts).
// Ảnh chỉ dùng file có sẵn trong public/images. Có chủ ý cài vài dòng "xấu" (trùng, link javascript:, thiếu link)
// để kiểm tra chúng bị loại đúng. {{today+N}} đổi thành ngày thật lúc đọc (lib/sheet-source.ts).
import { mkdirSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const out = fileURLToPath(new URL("../tests/fixtures/", import.meta.url));
mkdirSync(out, { recursive: true });

const cell = (value) => {
  const s = String(value ?? "");
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};
const csv = (rows) => rows.map((row) => row.map(cell).join(",")).join("\n") + "\n";
const save = (name, rows) => writeFileSync(join(out, `${name}.csv`), csv(rows), "utf8");
const T = (n) => (n === 0 ? "{{today}}" : `{{today${n > 0 ? "+" : ""}${n}}}`);
const yt = (id) => `https://www.youtube.com/watch?v=FIXTURE${id}`;

/* ---------- Resources: 3 khối cạnh nhau trong cùng một tab ---------- */
// Documents A:G | H trống | Inventory I:U | V trống | Courses W:AD | AE trống | level/source/featured AF:AH
const HEADER = [
  ...["Mục lớn", "id", "title", "url", "description", "type", "topic"], "",
  ...["Danh mục", "id", "title", "manufacturer", "model", "description", "unit", "quantity", "datasheet", "purchase_url", "location", "status", "current_user"], "",
  ...["Môn", "Title", "URL", "Type", "Description", "id", "Track", "Group"], "",
  ...["level", "source", "featured"]
];

const docs = [
  ["Vi điều khiển", "", "Hướng dẫn STM32 cho người mới bắt đầu", yt("D01"), "Chuỗi video từ cài đặt CubeIDE đến chớp tắt LED và ngắt.", "youtube", "STM32", "Core", "YouTube", "x"],
  ["Vi điều khiển", "", "Datasheet STM32F103C8T6", "https://example.com/stm32f103c8t6.pdf", "Thông số điện, sơ đồ chân và bộ nhớ của vi điều khiển Blue Pill.", "datasheet", "STM32", "Reference", "ST", ""],
  ["Vi điều khiển", "", "Reference Manual STM32F1 (RM0008)", "https://example.com/rm0008.pdf", "Tài liệu tham khảo đầy đủ các ngoại vi của dòng STM32F1.", "pdf", "STM32", "Reference", "ST", ""],
  ["Vi điều khiển", "", "Thư viện HAL mẫu cho STM32 (GitHub)", "https://github.com/example/stm32-hal-samples", "Các ví dụ GPIO, UART, SPI, I2C viết bằng HAL.", "code", "STM32", "Practice", "GitHub", ""],
  ["Vi điều khiển", "", "ESP32 Getting Started (Espressif)", "https://example.com/esp32-getting-started", "Cài ESP-IDF, chạy ví dụ đầu tiên và dùng Wi-Fi.", "website", "ESP32", "Core", "Espressif", "x"],
  ["Vi điều khiển", "", "Datasheet ESP32-WROOM-32", "https://example.com/esp32-wroom-32.pdf", "Thông số module ESP32-WROOM-32.", "datasheet", "ESP32", "Reference", "Espressif", ""],
  ["Vi điều khiển", "", "Lập trình AVR từ cơ bản", yt("D07"), "Học AVR bằng ATmega328P: thanh ghi, timer, ngắt.", "youtube", "AVR", "Core", "YouTube", ""],
  ["Vi điều khiển", "", "Datasheet ATmega328P", "https://example.com/atmega328p.pdf", "Tài liệu kỹ thuật của ATmega328P.", "datasheet", "AVR", "Reference", "Microchip", ""],
  ["Ô tô", "", "Giới thiệu mạng CAN trong ô tô", "https://example.com/can-intro.pdf", "Khung dữ liệu, định danh, phân xử bus và lỗi CAN.", "pdf", "CAN", "Core", "Drive", "x"],
  ["Ô tô", "", "CAN bus trên vi điều khiển: thực hành", yt("D10"), "Gửi nhận khung CAN với MCP2515 và analyzer.", "youtube", "CAN", "Practice", "YouTube", ""],
  ["Ô tô", "", "Thư viện CAN cho MCP2515", "https://github.com/example/mcp2515-can", "Driver MCP2515 dùng SPI cho Arduino và STM32.", "code", "CAN", "Practice", "GitHub", ""],
  ["Ô tô", "", "Hệ thống quản lý pin (BMS) cơ bản", "https://example.com/bms-basics.pdf", "Cân bằng cell, bảo vệ quá dòng, ước lượng SoC.", "pdf", "BMS", "Core", "Drive", ""],
  ["Ô tô", "", "Tài liệu OBD-II và chẩn đoán lỗi", "https://example.com/obd2.pdf", "Các chế độ OBD-II, PID thông dụng và mã lỗi DTC.", "pdf", "OBD", "Reference", "Drive", ""],
  ["Ô tô", "", "Kiến trúc phần mềm ô tô AUTOSAR", "https://example.com/autosar.pdf", "Tổng quan Classic và Adaptive Platform.", "pdf", "AUTOSAR", "Reference", "Drive", ""],
  ["Cơ điện tử", "Chuyen-nganh-co-dien-tu.jpg", "Nhất nghệ tinh chuyên ngành Cơ điện tử", "https://example.com/co-dien-tu.pdf", "Lộ trình học và sách tham khảo chuyên ngành Cơ điện tử.", "pdf", "Cơ điện tử", "Core", "Drive", ""],
  ["Ô tô", "nhat_nghe_tinh_oto.png", "Nhất nghệ tinh chuyên ngành Ô tô", "https://example.com/oto.pdf", "Lộ trình học và sách tham khảo chuyên ngành Ô tô.", "pdf", "Ô tô", "Core", "Drive", ""],
  ["Cơ khí", "tu-sach-nhat-nghe-tinh-chuyen-nganh-co-khi.jpg", "Tủ sách nhất nghệ tinh chuyên ngành Cơ khí", "https://example.com/co-khi.pdf", "Tuyển tập sách Cơ khí chọn lọc.", "pdf", "Cơ khí", "Core", "Drive", ""],
  ["Giao thông thông minh", "", "Tổng quan hệ thống giao thông thông minh (ITS)", "https://example.com/its-overview.pdf", "Các thành phần của ITS và bài toán thực tế.", "pdf", "ITS", "Core", "Drive", ""],
  ["Giao thông thông minh", "", "V2X: giao tiếp giữa xe và hạ tầng", "https://example.com/v2x", "Các chuẩn DSRC, C-V2X và ứng dụng cảnh báo.", "website", "V2X", "Reference", "IEEE", ""],
  ["Giao thông thông minh", "", "Mô phỏng giao lộ với SUMO", "https://github.com/example/sumo-intersection", "Dựng mô hình giao lộ và đo thời gian chờ bằng SUMO.", "tool", "SUMO", "Practice", "GitHub", ""],
  ["Công cụ", "", "Công cụ vẽ mạch KiCad", "https://example.com/kicad", "Vẽ sơ đồ nguyên lý và thiết kế PCB miễn phí.", "tool", "PCB", "Core", "KiCad", ""],
  ["Công cụ", "", "Wokwi: mô phỏng Arduino và ESP32 trên web", "https://example.com/wokwi", "Chạy thử code không cần phần cứng.", "tool", "Mô phỏng", "Practice", "Wokwi", ""],
  ["Công cụ", "", "Logic Analyzer Sigrok PulseView", "https://example.com/pulseview", "Phân tích tín hiệu UART, SPI, I2C, CAN.", "tool", "Debug", "Practice", "Sigrok", ""],
  ["Công cụ", "", "Tài liệu có tiêu đề rất dài để kiểm tra việc cắt chữ trong thẻ mà không làm vỡ bố cục của lưới hay đẩy các thẻ bên cạnh", "https://example.com/long-title", "Mô tả dài tương tự: " + "nội dung kiểm thử độ dài ".repeat(8), "pdf", "Kiểm thử", "Reference", "Drive", ""],
  // Các dòng "xấu": phải bị loại
  ["Vi điều khiển", "", "Hướng dẫn STM32 cho người mới bắt đầu", yt("D01"), "Dòng TRÙNG hoàn toàn (cùng tiêu đề và link): phải bị gộp", "youtube", "STM32", "Core", "YouTube", ""],
  ["Công cụ", "", "Link độc javascript (PHẢI BỊ LOẠI)", "javascript:alert(document.cookie)", "", "website", "", "", "", ""],
  ["Công cụ", "", "Link data (PHẢI BỊ LOẠI)", "data:text/html,<script>alert(1)</script>", "", "website", "", "", "", ""],
  ["Công cụ", "", "Dòng thiếu link (PHẢI BỊ LOẠI)", "", "", "pdf", "", "", "", ""]
];

const inv = [
  // category, id(ảnh), title, manufacturer, model, description, unit, quantity, datasheet, purchase_url, location, status, current_user
  ["Vi điều khiển", "STM32F103C8T6 Micro USB.jpg", "STM32F103C8T6 Blue Pill (Micro USB)", "ST", "STM32F103C8T6", "Board Blue Pill dùng cổng Micro USB, 64KB Flash.", "cái", 12, "https://example.com/stm32f103c8t6.pdf", "https://example.com/mua/bluepill", "Kệ A1", "Còn hàng", ""],
  ["Vi điều khiển", "STM32F103C8T6_Type-C_(China).jpg", "STM32F103C8T6 Blue Pill (Type-C)", "ST", "STM32F103C8T6", "Board Blue Pill cổng Type-C.", "cái", 8, "https://example.com/stm32f103c8t6.pdf", "https://example.com/mua/bluepill-c", "Kệ A1", "Còn hàng", ""],
  ["Vi điều khiển", "STM32F103CBT6 Bluepill.png", "STM32F103CBT6 Blue Pill", "ST", "STM32F103CBT6", "Bản 128KB Flash.", "cái", 2, "https://example.com/stm32f103cbt6.pdf", "", "Kệ A1", "Sắp hết", ""],
  ["Vi điều khiển", "ESP32_NodeMCU_LuaNode32_38Pin_Type-C.png", "ESP32 NodeMCU LuaNode32 (Type-C)", "Espressif", "ESP32-WROOM-32", "Board ESP32 38 chân, Wi-Fi và Bluetooth.", "cái", 15, "https://example.com/esp32-wroom-32.pdf", "https://example.com/mua/esp32", "Kệ A2", "Còn hàng", ""],
  ["Vi điều khiển", "esp32_cam_ai_thinker.jpg", "ESP32-CAM AI-Thinker", "AI-Thinker", "ESP32-CAM", "Module ESP32 kèm camera OV2640.", "cái", 6, "", "https://example.com/mua/esp32-cam", "Kệ A2", "Còn hàng", ""],
  ["Vi điều khiển", "esp32_cam_ai_thinker.jpg", "ESP32-S3 DevKitC-1", "Espressif", "ESP32-S3", "Board ESP32-S3 hỗ trợ USB native.", "cái", 0, "https://example.com/esp32-s3.pdf", "", "Kệ A2", "Hết hàng", ""],
  ["Vi điều khiển", "STM32F103CBT6 Bluepill.png", "ATmega328P Arduino Nano", "Microchip", "ATmega328P", "Board Arduino Nano clone.", "cái", 20, "https://example.com/atmega328p.pdf", "", "Kệ A3", "Còn hàng", ""],
  ["Vi điều khiển", "STM32F103CBT6 Bluepill.png", "Raspberry Pi Pico", "Raspberry Pi", "RP2040", "Board RP2040 hai nhân.", "cái", 4, "", "", "Kệ A3", "Có người sử dụng", "Nguyễn Văn An"],
  ["Module", "FT232RL_USB_UART_Type-C.png", "FT232RL USB-UART (Type-C)", "FTDI", "FT232RL", "Mạch chuyển USB sang UART 3.3V/5V.", "cái", 9, "https://example.com/ft232rl.pdf", "https://example.com/mua/ft232", "Kệ B1", "Còn hàng", ""],
  ["Module", "WeAct-T-Link_V2.png", "WeAct T-Link V2 (ST-Link)", "WeAct", "T-Link V2", "Mạch nạp và debug STM32 (clone ST-Link).", "cái", 5, "", "", "Kệ B1", "Còn hàng", ""],
  ["Module", "BQ7695202PFBR.png", "BQ7695202 BMS AFE", "TI", "BQ7695202PFBR", "Vi mạch giám sát pin 3 đến 5 cell.", "cái", 3, "https://example.com/bq7695202.pdf", "", "Kệ B2", "Sắp hết", ""],
  ["Module", "BQ7695202PFBR.png", "MCP2515 CAN Module", "Microchip", "MCP2515", "Module CAN SPI kèm TJA1050.", "cái", 10, "https://example.com/mcp2515.pdf", "https://example.com/mua/mcp2515", "Kệ B2", "Còn hàng", ""],
  ["Module", "FT232RL_USB_UART_Type-C.png", "SN65HVD230 CAN Transceiver", "TI", "SN65HVD230", "Module CAN 3.3V cho ESP32 và STM32.", "cái", 7, "https://example.com/sn65hvd230.pdf", "", "Kệ B2", "Còn hàng", ""],
  ["Nguồn", "TP4056_USB_Type-C_Micro-USB.png", "TP4056 sạc pin Li-ion (Type-C)", "TopPower", "TP4056", "Mạch sạc pin 1 cell 1A có bảo vệ.", "cái", 30, "https://example.com/tp4056.pdf", "https://example.com/mua/tp4056", "Kệ C1", "Còn hàng", ""],
  ["Nguồn", "TP4056_USB_Type-C_Micro-USB.png", "Mạch hạ áp LM2596", "TI", "LM2596", "Buck 3A điều chỉnh được.", "cái", 11, "https://example.com/lm2596.pdf", "", "Kệ C1", "Còn hàng", ""],
  ["Nguồn", "TP4056_USB_Type-C_Micro-USB.png", "Pin Li-ion 18650 (3000mAh)", "Samsung", "INR18650-30Q", "Pin cell 18650.", "viên", 1, "", "", "Kệ C2", "Sắp hết", ""],
  ["Dụng cụ", "Proskit_MT-1220.jpg", "Đồng hồ vạn năng Proskit MT-1220", "Proskit", "MT-1220", "Đồng hồ vạn năng số 3 1/2 digit.", "cái", 4, "", "", "Tủ D1", "Có người sử dụng", "Trần Thị Bình"],
  ["Dụng cụ", "Proskit_MT-1220.jpg", "Mỏ hàn Hakko FX-888D", "Hakko", "FX-888D", "Trạm hàn điều chỉnh nhiệt độ.", "cái", 2, "", "https://example.com/mua/hakko", "Tủ D1", "Đang sửa", ""],
  ["Dụng cụ", "Proskit_MT-1220.jpg", "Máy phân tích logic 8 kênh", "Saleae", "Logic 8", "Phân tích tín hiệu số đến 100MHz.", "cái", 1, "", "", "Tủ D2", "Có người sử dụng", "Lê Quốc Cường"],
  ["Cảm biến", "esp32_cam_ai_thinker.jpg", "Cảm biến nhiệt độ DS18B20", "Maxim", "DS18B20", "Cảm biến nhiệt 1-Wire chống nước.", "cái", 25, "https://example.com/ds18b20.pdf", "", "Kệ E1", "Còn hàng", ""],
  ["Cảm biến", "esp32_cam_ai_thinker.jpg", "IMU MPU-6050", "TDK", "MPU-6050", "Gia tốc kế và con quay 6 trục.", "cái", 14, "https://example.com/mpu6050.pdf", "", "Kệ E1", "Còn hàng", ""],
  ["Cảm biến", "esp32_cam_ai_thinker.jpg", "Cảm biến khoảng cách HC-SR04", "Elecfreaks", "HC-SR04", "Siêu âm 2cm đến 4m.", "cái", 0, "", "", "Kệ E1", "Hết hàng", ""],
  ["Cảm biến", "esp32_cam_ai_thinker.jpg", "Cảm biến dòng ACS712 (30A)", "Allegro", "ACS712", "Cảm biến dòng Hall.", "cái", 6, "https://example.com/acs712.pdf", "", "Kệ E2", "Còn hàng", ""],
  // Hai món cùng tên nhưng khác vị trí: phải giữ cả hai
  ["Dụng cụ", "Proskit_MT-1220.jpg", "Kìm cắt chân linh kiện", "Proskit", "PM-801", "Kìm cắt chân linh kiện nhỏ.", "cái", 5, "", "", "Tủ D1", "Còn hàng", ""],
  ["Dụng cụ", "Proskit_MT-1220.jpg", "Kìm cắt chân linh kiện", "Proskit", "PM-801", "Kìm cắt chân linh kiện nhỏ.", "cái", 3, "", "", "Tủ D2", "Còn hàng", ""],
  // Các dòng "xấu"
  ["Module", "FT232RL_USB_UART_Type-C.png", "FT232RL USB-UART (Type-C)", "FTDI", "FT232RL", "Mạch chuyển USB sang UART 3.3V/5V.", "cái", 9, "https://example.com/ft232rl.pdf", "https://example.com/mua/ft232", "Kệ B1", "Còn hàng", ""],
  ["Module", "WeAct-T-Link_V2.png", "Datasheet độc (link javascript phải bị gỡ)", "WeAct", "X1", "", "cái", 1, "javascript:alert(1)", "", "Kệ B1", "Còn hàng", ""],
  ["Module", "", "Món không có id (PHẢI BỊ LOẠI)", "WeAct", "X2", "", "cái", 1, "", "", "Kệ B1", "Còn hàng", ""]
];

const L = (title, url) => ["", title, url ?? "", "", "", "", "", ""];
const courses = [
  ["Vi điều khiển", "", "", "", "Học vi điều khiển từ AVR đến ARM Cortex-M qua các bài thực hành.", "", "", ""],
  ["Vi điều khiển", "Bài 01: Chớp tắt LED", yt("C01"), "", "", "", "AVR", "Cơ bản"],
  ["Vi điều khiển", "Bài 02: Nút nhấn và chống rung", yt("C02"), "", "", "", "AVR", "Cơ bản"],
  ["Vi điều khiển", "Bài 03: Timer và ngắt", yt("C03"), "", "", "", "AVR", "Ngoại vi"],
  ["Vi điều khiển", "Bài 04: UART", yt("C04"), "", "", "", "AVR", "Ngoại vi"],
  ["Vi điều khiển", "Bài 05: ADC (sắp có)", "", "", "", "", "AVR", "Ngoại vi"],
  ["Vi điều khiển", "Bài 01: GPIO với HAL", yt("C11"), "", "", "", "ARM Cortex-M", "Cơ bản"],
  ["Vi điều khiển", "Bài 02: Ngắt ngoài", yt("C12"), "", "", "", "ARM Cortex-M", "Cơ bản"],
  ["Vi điều khiển", "Bài 03: DMA", yt("C13"), "", "", "", "ARM Cortex-M", "Nâng cao"],
  ["Vi điều khiển", "Bài 04: RTOS (sắp có)", "", "", "", "", "ARM Cortex-M", "Nâng cao"],
  ["Lập trình nhúng với ESP32", "", "", "", "Từ Wi-Fi, MQTT đến OTA trên ESP32.", "", "", ""],
  ["Lập trình nhúng với ESP32", "Bài 01: Bắt đầu với ESP-IDF", yt("E01"), "", "", "", "", ""],
  ["Lập trình nhúng với ESP32", "Bài 02: Kết nối Wi-Fi", yt("E02"), "", "", "", "", ""],
  ["Lập trình nhúng với ESP32", "Bài 03: MQTT", yt("E03"), "", "", "", "", ""],
  ["Lập trình nhúng với ESP32", "Bài 04: Web server", yt("E04"), "", "", "", "", ""],
  ["Lập trình nhúng với ESP32", "Bài 05: Cập nhật OTA", yt("E05"), "", "", "", "", ""],
  ["Lập trình nhúng với ESP32", "Bài 06: Tiết kiệm điện (sắp có)", "", "", "", "", "", ""],
  ["Mạng CAN trong ô tô", "", "", "", "Nền tảng mạng CAN và thực hành với MCP2515.", "", "", ""],
  ["Mạng CAN trong ô tô", "Bài 01: Khung dữ liệu CAN", yt("N01"), "", "", "", "", ""],
  ["Mạng CAN trong ô tô", "Bài 02: Phân xử bus", yt("N02"), "", "", "", "", ""],
  ["Mạng CAN trong ô tô", "Bài 03: Gửi nhận với MCP2515", yt("N03"), "", "", "", "", ""],
  ["Mạng CAN trong ô tô", "Bài 04: Đọc dữ liệu OBD-II", yt("N04"), "", "", "", "", ""]
];
void L;

const rowCount = Math.max(docs.length, inv.length, courses.length);
const resources = [HEADER];
for (let i = 0; i < rowCount; i++) {
  const d = docs[i];
  const row = new Array(HEADER.length).fill("");
  if (d) {
    row.splice(0, 7, d[0], d[1], d[2], d[3], d[4], d[5], d[6]);
    row[31] = d[7] ?? ""; // level
    row[32] = d[8] ?? ""; // source
    row[33] = d[9] ?? ""; // featured
  }
  if (inv[i]) row.splice(8, 13, ...inv[i]);
  if (courses[i]) row.splice(22, 8, ...courses[i]);
  resources.push(row);
}
save("resources", resources);

/* ---------- Events ---------- */
const events = [
  ["title", "date", "time", "place", "summary", "url", "image", "tag", "featured"],
  ["Workshop CAN bus trên ATmega", T(2), "18:00 - 20:00", "Lab A1", "Buổi thực hành gửi nhận khung CAN và đọc tín hiệu bằng logic analyzer.", "https://example.com/dk/can", "gapgocuoituan.png", "Workshop", "x"],
  ["Seminar: Xe điện và hệ thống BMS", T(5), "14:00 - 16:00", "Phòng B1, Tòa nhà Thí nghiệm", "Chia sẻ về kiến trúc BMS và bài toán cân bằng cell.", "https://example.com/dk/bms", "", "Seminar", ""],
  ["Họp câu lạc bộ tháng này", T(5), "19:00", "Online qua Google Meet", "Tổng kết hoạt động và phân công nhiệm vụ.", "", "", "Thông báo", ""],
  ["Hackathon Nhúng 24h", T(12), "08:00 - 17:00", "Lab A1 và A2", "Thi lập trình nhúng theo đề bài bất ngờ, có giải thưởng.", "https://example.com/dk/hackathon", "gapgocuoituan.png", "Cuộc thi", ""],
  ["Workshop PCB với KiCad", T(33), "", "Lab B2", "Thiết kế mạch từ sơ đồ nguyên lý đến Gerber.", "https://example.com/dk/kicad", "", "Workshop", ""],
  ["Demo day cuối kỳ", T(34), "09:00 - 12:00", "Hội trường lớn", "Các nhóm trình bày sản phẩm.", "", "", "Thông báo", ""],
  ["Chương trình chưa chốt lịch", "", "", "", "Sẽ cập nhật ngày và địa điểm sau.", "", "", "Thông báo", ""],
  ["Gặp gỡ cuối tuần", T(-3), "09:00", "Quán cà phê gần trường", "Trò chuyện thân mật giữa các thế hệ thành viên.", "", "gapgocuoituan.png", "Thông báo", ""],
  ["Workshop Arduino cho người mới", T(-10), "18:00 - 20:00", "Lab A1", "Làm quen mạch và lập trình cơ bản.", "https://example.com/dk/arduino", "gapgocuoituan.png", "Workshop", ""],
  ["Seminar: Giao thông thông minh", T(-40), "14:00", "Phòng B1", "Khái quát ITS và V2X.", "", "", "Seminar", ""],
  ["Tuyển thành viên khóa trước", T(-70), "", "Online", "Buổi giới thiệu và phỏng vấn.", "https://example.com/dk/old", "", "Thông báo", ""]
];
save("events", events);

/* ---------- News ---------- */
// Tab News BẮT BUỘC có cột section: headlines (Tiêu điểm) | latest (Tin mới nhất) | media (Báo chí) | features (Chuyên đề).
// Ảnh ghi ở cột id (tên file có đuôi trong public/images/News/).
const news = [
  ["section", "order", "title", "content", "date", "url", "id", "category"],
  ["headlines", 1, "CTIT mở đơn tuyển thành viên đợt 2", "Đăng ký đến hết tháng, không yêu cầu kinh nghiệm.", T(-1), "https://example.com/tin/tuyen-sinh", "CTIT_tren_facebook.png", "Thông báo"],
  ["headlines", 2, "Mạng trên ô tô hiện đại: từ CAN đến Ethernet", "Tổng quan các mạng trong xe và xu hướng sắp tới.", T(-4), "https://example.com/tin/mang-oto", "mang_tren_o_to_hien_dai.png", "Kỹ thuật"],
  ["headlines", 3, "Phần mềm ô tô và AUTOSAR", "Vì sao ngành ô tô chuyển sang phần mềm định nghĩa xe.", T(-9), "https://example.com/tin/autosar", "automotive_software.png", "Kỹ thuật"],
  ["latest", 1, "Hệ thống BMS cho xe điện hoạt động thế nào", "Cân bằng cell và bảo vệ pin.", T(-15), "https://example.com/tin/bms", "bms.jpg", "Kỹ thuật"],
  ["latest", 2, "ECU, cảm biến và bộ điều khiển", "Chuỗi từ cảm biến đến chấp hành.", T(-22), "https://example.com/tin/ecu", "ECU-sensor-controlle.png", "Kỹ thuật"],
  ["latest", 3, "Hệ thống nhúng: bắt đầu từ đâu", "Lộ trình cho người mới.", T(-30), "https://example.com/tin/nhung", "embedded.jpg", "Kỹ thuật"],
  ["latest", 4, "Nhìn lại một học kỳ hoạt động", "Những con số và khoảnh khắc đáng nhớ.", T(-45), "", "CTIT_tren_facebook.png", "Hoạt động"],
  ["latest", 5, "Tin không có ảnh và không có link", "Bản tin ngắn dùng để kiểm tra thẻ thiếu ảnh.", T(-60), "", "", "Hoạt động"],
  ["media", 1, "Báo địa phương đưa tin về câu lạc bộ", "Bài viết giới thiệu hoạt động của CTIT.", T(-18), "https://example.com/bao/ctit", "", "Báo chí"],
  ["media", 2, "Phỏng vấn người sáng lập CTIT", "Hành trình xây dựng câu lạc bộ kỹ thuật.", T(-33), "https://example.com/bao/phong-van", "", "Báo chí"],
  ["features", 1, "Chuyên đề: Xe điện và bài toán pin", "Phân tích các hướng công nghệ pin cho xe điện.", T(-12), "https://example.com/chuyen-de/pin", "bms.jpg", "Chuyên đề"],
  ["features", 2, "Chuyên đề: Phần mềm trong xe", "Từ ECU đến kiến trúc tập trung.", T(-28), "", "automotive_software.png", "Chuyên đề"],
  ["latest", 6, "Tin có link độc (link phải bị gỡ nhưng tin vẫn hiện)", "Kiểm tra lọc link.", T(-2), "javascript:alert(1)", "", "Kỹ thuật"]
];
save("news", news);

/* ---------- Campus ---------- */
save("campus", [
  ["title", "date", "summary", "url", "image", "tag", "place", "featured"],
  ["Một vài thành viên của CTIT", T(-5), "Ảnh chụp sau buổi sinh hoạt định kỳ.", "https://example.com/album/1", "mot_vai_thanh_vien_cua_ctit.jpg", "Đời sống", "Lab A1", "x"],
  ["Cơ học toàn quốc 2026", T(-20), "Đội CTIT tham dự cuộc thi Cơ học toàn quốc.", "https://example.com/album/2", "co_hoc_toan_quoc_2026.JPG", "Cuộc thi", "Hà Nội", ""],
  ["Bàn hàn sau buổi thực hành", T(-12), "Góc làm việc của nhóm.", "", "mot_vai_thanh_vien_cua_ctit.jpg", "Lab", "Lab A1", ""],
  ["Buổi workshop cuối tuần", T(-25), "Các bạn cùng debug mạch.", "", "co_hoc_toan_quoc_2026.JPG", "Workshop", "Lab A2", ""],
  ["Sinh hoạt ngoài trời", T(-35), "Hoạt động gắn kết thành viên.", "", "mot_vai_thanh_vien_cua_ctit.jpg", "Đời sống", "Sân trường", ""],
  ["Buổi thi lập trình nhúng", T(-50), "Các đội làm bài trong 3 giờ.", "", "co_hoc_toan_quoc_2026.JPG", "Cuộc thi", "Lab B1", ""]
]);

/* ---------- Students, About, Overview ---------- */
save("students", [
  ["Tên viết tắt", "Tên đầy đủ", "name", "major", "faculty", "id"],
  ["HCMUT", "Trường Đại học Bách khoa - ĐHQG-HCM", "Huỳnh Hữu Nhật", "Khoa học Máy tính", "Khoa Khoa học và Kỹ thuật Máy tính", "huynhhuunhat.png"],
  ["HCMUT", "", "Quách Hồng Ngọc", "Kỹ thuật Điện tử", "Khoa Điện - Điện tử", "quachhongngoc.jpg"],
  ["HCMUTE", "Trường Đại học Sư phạm Kỹ thuật TP.HCM", "Nguyễn Huỳnh Thanh Tài", "Công nghệ Kỹ thuật Ô tô", "Khoa Cơ khí Động lực", "nguyenhuynhthanhtai.jpg"],
  ["HCMUTE", "", "Trần Nguyễn Ngọc Trâm", "Công nghệ Thông tin", "Khoa Công nghệ Thông tin", "trannguyenngoctram.jpg"],
  ["UIT", "Trường Đại học Công nghệ Thông tin - ĐHQG-HCM", "Vương Tôn Võ", "Kỹ thuật Máy tính", "Khoa Kỹ thuật Máy tính", "vuongtonvo.jpg"]
]);
save("about", [
  ["label", "value"],
  ["Tên", "Đỗ Thành Đạt"],
  ["Trường", "HCM-UTE"],
  ["Ngành", "Công nghệ Kỹ thuật Ô tô"],
  ["Khoa", "Đào tạo Tiên tiến"],
  ["Giới thiệu", "Người sáng lập CTIT, quan tâm điện tử ô tô và hệ thống nhúng."],
  ["Ảnh admin", "admin.png"],
  ["Logo web", "logo.png"]
]);
save("overview", [
  ["label", "value"],
  ["Năm thành lập", "2023"],
  ["Số lượng thành viên", "200+"],
  ["Dự án đã thực hiện", "35"],
  ["Buổi workshop mỗi năm", "24"]
]);

/* ---------- Research, Admissions ---------- */
save("research", [
  ["section", "order", "title", "content", "date", "url", "image", "caption"],
  ["focus", 1, "Điện tử ô tô", "ECU, mạng CAN, BMS và chẩn đoán trên xe.", "", "", "automotive_electronics.png", "Hướng chính"],
  ["focus", 2, "Hệ thống nhúng", "Vi điều khiển, RTOS và giao tiếp ngoại vi.", "", "", "Embedded-system.png", "Hướng chính"],
  ["focus", 3, "Phương tiện và giao thông thông minh", "ITS, V2X và mô phỏng giao thông.", "", "", "iot.png", "Hướng mở rộng"],
  ["project", 1, "Hệ thống giám sát pin xe điện", "Đo điện áp từng cell và cảnh báo qua CAN.", T(-90), "https://example.com/du-an/bms", "hethonggiamsatpinxedien.png", "Đang thực hiện"],
  ["project", 2, "Bộ ghi dữ liệu CAN giá rẻ", "Ghi và phát lại dữ liệu CAN dùng ESP32.", T(-150), "", "", "Hoàn thành"],
  ["achievement", 1, "Giải Ba cuộc thi Cơ học toàn quốc 2026", "Đội CTIT đạt giải Ba.", T(-20), "", "", ""],
  ["publication", 1, "Thiết kế bộ cân bằng cell chủ động", "Bài báo hội nghị sinh viên.", T(-200), "https://example.com/bai-bao/1", "", "Nhóm BMS"]
]);
save("admissions", [
  ["section", "order", "title", "content", "date", "url", "image"],
  ["status", 1, "Đang mở đăng ký đợt 2", "Nhận hồ sơ đến hết tháng này.", "", "https://example.com/dang-ky", ""],
  ["step", 1, "Điền form đăng ký", "Hoàn thành form thông tin cơ bản.", "", "", ""],
  ["step", 2, "Tham gia buổi gặp mặt", "Làm quen với các hướng hoạt động.", "", "", ""],
  ["step", 3, "Làm bài tập nhỏ", "Một bài thực hành ngắn theo hướng bạn chọn.", "", "", ""],
  ["step", 4, "Nhận kết quả", "Thông báo qua email trong vòng một tuần.", "", "", ""],
  ["requirement", 1, "Là sinh viên các ngành kỹ thuật", "", "", "", ""],
  ["requirement", 2, "Yêu thích điện tử và lập trình", "", "", "", ""],
  ["requirement", 3, "Dành được 4 giờ mỗi tuần", "", "", "", ""],
  ["track", 1, "Điện tử ô tô", "Mạng CAN, ECU, BMS, chẩn đoán xe.", "", "https://example.com/huong/oto", "Automotive_electronics.png"],
  ["track", 2, "Hệ thống nhúng", "Vi điều khiển, RTOS, giao tiếp ngoại vi.", "", "https://example.com/huong/nhung", "embeddedsystem.png"],
  ["track", 3, "Phương tiện và giao thông thông minh", "ITS, V2X, mô phỏng.", "", "", "ptvgttm.png"],
  ["timeline", 1, "Mở đăng ký", "", T(-7), "", ""],
  ["timeline", 2, "Gặp mặt thành viên mới", "", T(7), "", ""],
  ["timeline", 3, "Công bố kết quả", "", T(21), "", ""],
  ["faq", 1, "Mình chưa biết gì về điện tử, có tham gia được không?", "Được. Các bạn mới sẽ được hướng dẫn từ đầu.", "", "", ""],
  ["faq", 2, "Có mất phí không?", "Không. Câu lạc bộ không thu phí thành viên.", "", "", ""],
  ["faq", 3, "Sinh viên năm nhất có tham gia được không?", "Được, nhiều thành viên bắt đầu từ năm nhất.", "", "", ""]
]);

console.log(`Đã tạo dữ liệu mẫu trong ${out}`);
