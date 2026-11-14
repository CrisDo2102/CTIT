# CTIT — Closed Thinking Institute of Technology

> **Một tài liệu README duy nhất của dự án.** Bản CTIT full này được dựng dựa trên `CTIT(1).zip` ngày 28/10/2026. Các README theo phiên bản và README.txt trong thư mục ảnh đã được hợp nhất vào đây.

## Bắt đầu nhanh (Windows / VS Code)

Folder dự án trên máy:

```powershell
cd "C:\Users\HOME\Desktop\CTIT"
npm ci
npm run ci
npm run dev
```

Mở `http://localhost:3000` (nếu đang có Next.js chạy cổng 3000 thì dừng tiến trình đó trước). File `.env.local` **không được đóng trong ZIP**. Nếu cần cấu hình Google Sheets/Admin, tạo `.env.local` từ `.env.example` rồi tự điền giá trị riêng trên máy hoặc môi trường Vercel. **Không đưa `.env.local` lên GitHub.**

### Cấu trúc dự án

```text
CTIT/
├── app/                        # Next.js App Router, các trang và CSS
│   ├── imagery/                # Thư viện hình ảnh tự động từ folder
│   ├── research/               # Nghiên cứu
│   └── resources/              # Tài liệu, khóa học, inventory
├── components/                 # UI dùng chung, bao gồm ImageryGallery
├── lib/                        # Bộ đọc Sheet, thư viện và tiện ích
│   └── imagery.ts              # Quét danh mục Imagery từ filesystem
├── public/images/             # Hình ảnh tĩnh trong source
│   └── Imagery/                # Các folder Physics, Math... tự động lên web
├── tests/                      # Unit/E2E tests
├── .env.example                # Chỉ cấu hình mẫu, không chứa mật khẩu thật
├── package.json
└── README.md                   # Hướng dẫn duy nhất
```

## Imagery — Thư viện ảnh không cần Google Sheets

Tạo một hoặc nhiều thư mục con bên dưới `public/images/Imagery`. **Tên thư mục con chính là tên danh mục trên trang web**, tên file là tên ảnh. Không phải khai báo, cập nhật Sheet hay sửa mã nguồn.

```text
public/images/Imagery/
├── Physics/
│   ├── Newton.png
│   └── Electromagnetism.jpg
├── Math/
│   └── Calculus.webp
└── Electronics/
    └── PCB.png
```

Những tên ảnh ở ví dụ trên chỉ minh họa cách đặt file; bản giao không tự thêm ảnh mẫu giả. Sau khi đưa ảnh thật vào:

- Vào `/imagery` để xem **các danh mục** `Physics`, `Math`, `Electronics` cùng ảnh cover đầu tiên và số ảnh.
- Bấm một danh mục để mở trang `/imagery/Physics`, `/imagery/Math`...; tìm tên ảnh, nhấn ảnh để xem lớn, chuyển ảnh bằng ←/→, đóng bằng Esc, tải bản gốc.
- Tên thư mục và tên file có thể có dấu tiếng Việt và dấu cách; hệ thống tự mã hóa đường dẫn URL đúng chuẩn. Tên phải khớp hoa/thường khi deploy lên Linux/Vercel.
- Định dạng hỗ trợ: `.jpg`, `.jpeg`, `.png`, `.webp`, `.avif`, `.gif` (không nhận SVG do rủi ro script từ nội dung SVG, không nhận PDF).
- Mỗi danh mục là **một thư mục con cấp 1**. Chỉ các file ảnh nằm trực tiếp bên trong được hiển thị, thư mục lồng sâu không quét.
- Thư mục trống vẫn hiển thị (số lượng 0). File có dấu chấm đầu tên, symlink, file không phải ảnh bị bỏ qua.
- Imagery **hoàn toàn không sử dụng Google Sheets**. Các mục khác của CTIT (Resources, Courses, Inventory, Research...) vẫn dùng Sheet như trước.

**Tự cập nhật:** Trong local `npm run dev`, tải lại trang sau khi thêm ảnh. Nếu trang chưa cập nhật, dừng/chạy lại dev server. Khi chạy `npm run build` hoặc deploy Vercel, website tạo danh mục từ ảnh có trong source ở **thời điểm build**. Muốn ảnh mới xuất hiện trên Vercel, đưa ảnh vào Git/repository và deploy lại. Chỉ đặt file vào máy Windows **không thể** cập nhật site Vercel tự động.

**Lưu ý bản quyền & dữ liệu:** Chỉ đăng ảnh có quyền công khai. Ảnh trong `public` truy cập được công khai, không dùng để lưu ảnh cá nhân/riêng tư. Nên nén ảnh trước khi thêm vào repository; khuyến nghị WebP/AVIF để tiết kiệm băng thông.

**Các lối vào Imagery**: `/resources` (ô Imagery), menu Resources trên desktop, menu Resources trên điện thoại, footer Resources và tìm kiếm toàn trang (từ khóa "Imagery"). Trang chủ giữ bố cục Bento cũ.

## Vận hành và kiểm thử

```powershell
npm run typecheck
npm run lint
npm test
npm run check:secrets
npm run check:dependencies
npm run build
```

`npm run ci` chạy gộp các bước trên. `npm run test:e2e` cần cài Playwright browsers; kiểm tra trên màn hình desktop và mobile, bao gồm điều khiển bàn phím và Reduced Motion. Khi xem báo cáo build, chỉ kết luận PASS cho các lệnh đã chạy thực tế.

**Triển khai Vercel:** đặt project root đúng `CTIT`, cài dependencies bằng `npm ci`, dùng `npm run build`. Thiết lập secret/CSV trong Project Settings → Environment Variables; không đưa token, mật khẩu vào source ZIP. Bản bàn giao đã loại `node_modules`, `.next`, `.git`, `.env.local` và file build. Sau khi giải nén, chạy `npm ci` để tái tạo dependencies trên Windows.

## Các phần chính của CTIT

- **Trang chủ:** hero điện ảnh, Bento và số liệu tổng hợp có thật; không sao chép layout của trang chủ sang các trang danh sách.
- **Resources:** Tài liệu/Inventory/Courses từ Sheet; Imagery từ folder, vận hành độc lập.
- **Research:** dự án, hướng nghiên cứu, hiệu ứng PCB/CAN chỉ mang tính minh họa (không phải tín hiệu thật).
- **Courses & Saved:** tiến độ, mục đã lưu nằm trong trình duyệt của từng người dùng.
- **UI:** Design System CTIT với gradient cyan–indigo–violet, góc vuông và bóng đổ lệch; `PageHero` có chế độ standard/compact/reading, hỗ trợ Reduce Motion.
- **Admin:** sử dụng mật khẩu qua environment variables; không lưu password trong README.

## Quy tắc ảnh cho các phần khác (dùng Google Sheets)

Khác Imagery, các folder ảnh `About`, `Admissions`, `Campus`, `Courses`, `Events`, `Research`, `Students` và `Resources/Documents`, `Resources/Inventory`, `Resources/Courses` vẫn khớp tên file qua cột `photo`, `image`, `id` trong Google Sheets. Ví dụ `public/images/About/about-photo.jpg` → dòng `photo` của tab About là `about-photo.jpg`. Tên file phải khớp đúng chữ hoa/chữ thường và phần mở rộng. Các tab có thể nhận ảnh Google Drive hoặc URL nếu parser đang hỗ trợ. Hướng dẫn cột chi tiết nằm ở phần tài liệu dự án kế thừa phía dưới.

---

## Thay đổi CTIT 2.1–2.3 đã gộp

- **2.1 Subtle Motion:** Reveal nhẹ 10px; PCB SVG ở Research Hero; dạng sóng CAN/BMS có nhãn mô phỏng; tilt nhẹ trên desktop; particle nhỏ khi lưu; dừng motion khi tab ẩn, hỗ trợ Reduced Motion.
- **2.2 Embedded UX:** token kỹ thuật trong `app/embedded.css`, font mono hệ thống, lưới blueprint mờ, nhãn silkscreen một số Bento, nút hero mở Ctrl+K; bottom tab mobile 5 mục; tìm kiếm không dấu và chỉ mục Research.
- **2.3 Unified Design:** `PageHero` standard/compact/reading, `PageShell`, `SectionHeader`, token trong `app/design-system.css`, compact cho listing và reading cho detail, thiết kế riêng cho trang chủ và Research/News được giữ nguyên.
- **Imagery (bản này):** thêm thư viện phân loại theo thư mục, trang danh mục ảnh, viewer có phím và download, link điều hướng và sitemap, không dùng Sheet.

### Lưu ý các phiên bản trước

Các bản 2.1–2.3 trước đây là ZIP patch (chỉ chứa file thay đổi). **Bản bàn giao hiện tại là toàn bộ source**, vì vậy không cần giải nén các bản patch cũ lên trên. Không có dữ liệu test giả nào được thêm vào Imagery. Những kết quả kiểm thử ghi ở tài liệu cũ chỉ áp dụng cho mã nguồn tại thời điểm đó, không thay thế việc chạy `npm run ci` cho bản full hiện tại.

---

## Tài liệu chi tiết hiện có của dự án (đã hợp nhất)

Phần tiếp theo giữ các hướng dẫn schema và lịch sử triển khai ban đầu để tránh mất thông tin về các cột Google Sheets, cấu trúc trang và bảo mật. Một số tên folder/đường dẫn/phiên bản trong lịch sử đã cũ; hãy ưu tiên mục **Bắt đầu nhanh** và **Imagery** phía trên khi thiết lập bản hiện tại.

> **Bản vá CVE ngày 14/10/2026:** Next.js 16.4.0 gốc có các lỗ hổng RCE/DoS nghiêm trọng. Bản này pin Next.js **16.4.1**, React/React DOM **19.2.9**. Do môi trường biên tập không truy cập npm registry, hãy chạy `npm install next@16.4.1 react@19.2.9 react-dom@19.2.9 --save-exact` trên máy có mạng trước khi đẩy production để lockfile có lại SHA512 integrity chuẩn. Xem `docs/SECURITY-DEPLOY.md`.

> **Cập nhật bảo mật 22/10/2026:** Bản CTIT secure đã tách chẩn đoán riêng sang `/admin/health`; API uptime `/api/health` chỉ trả trạng thái tổng. `/admin` dùng `ADMIN_USERNAME` (mặc định `admin`) và `ADMIN_PASSWORD` ngẫu nhiên tối thiểu **20 ký tự**. Không bao giờ đẩy `.env.local` lên GitHub; xem [`docs/SECURITY-DEPLOY.md`](docs/SECURITY-DEPLOY.md).

# Embedded Roadmap Starter — Tsinghua Link Library

Folder chuẩn dùng trên máy:

```powershell
D:\embedded-roadmap-starter
```

Chạy:

```powershell
cd "D:\embedded-roadmap-starter"
npm install --registry=https://registry.npmjs.org/
npm run build
npm run dev
```

Mở:

```text
http://localhost:3000
http://localhost:3000/resources
http://localhost:3000/admin
```

## Dữ liệu lấy từ đâu

Tài liệu, học viên, giới thiệu, tổng quan, tin tức, sự kiện, khuôn viên đều lấy từ
Google Sheet (xem "Cách nối Google Sheet" bên dưới), không sửa trong code.
`data/resources.ts` chỉ còn định nghĩa kiểu dữ liệu `Resource`.

## Admin demo

Trang `/admin` không còn form thêm link nữa — giờ chỉ là trang hướng dẫn cấu
trúc cột tab Resources. Thêm/sửa/xoá link tài liệu làm thẳng trong Google
Sheet (xem mục "Dashboard trang chủ" bên dưới).

## Dashboard trang chủ (giới thiệu About / tổng quan CTIT / học viên tiêu biểu / resources)

Trang chủ (`/`) và trang `/resources` lấy dữ liệu từ **4 tab** trong cùng 1
Google Sheet:

1. **Giới thiệu (About)** — lấy từ 1 sheet Google Sheet (dạng label/value),
   giống cách tab Overview hoạt động. Ảnh để ở
   `public/images/About/`, đặt tên khớp với giá trị dòng `photo` (hoặc `id`)
   trong sheet.
2. **Tổng quan CTIT** — lấy dữ liệu từ 1 sheet Google Sheet (dạng label/value).
3. **Học viên tiêu biểu** — lấy dữ liệu từ 1 sheet khác, gom nhóm theo cột
   `Tên viết tắt` (tên trường). Ảnh học viên để trong `public/images/Students/`,
   đặt tên khớp với cột `id` (hoặc `photo`).
4. **Resources** (trang chủ mục Featured + trang `/resources`) — lấy từ tab
   Resources, không cần đăng nhập `/admin` để thêm link nữa, thêm thẳng 1 dòng
   trong sheet là xong. Trang `/admin` giờ chỉ còn là trang hướng dẫn cấu trúc
   cột, không còn form nhập tay.

### Cách nối Google Sheet

1. Tạo 1 Google Sheet, làm 4 tab (4 sheet con):

   **Tab "About"** — cột: `label`, `value`. Dòng `name` là bắt buộc (chính
   xác chữ tiếng Anh `name`, không phải "Tên"), các dòng còn lại không có thì
   để trống cũng được:

   | label | value |
   |---|---|
   | name | Đỗ Thành Đạt |
   | school | HCM-UTE |
   | major | Công nghệ Kỹ thuật Ô tô |
   | faculty | Đào tạo Tiên tiến |
   | bio | Mô tả ngắn 2-3 câu về người phụ trách |
   | photo | about-photo.jpg |
   | logo | logo.png |
   | page_title | Giới thiệu |
   | page_intro | Người phụ trách và các số liệu tổng quan về CTIT. |

   3 dòng `logo`/`page_title`/`page_intro` là tuỳ chọn:
   - `logo`: ảnh logo hiện ở Header (góc trái, cạnh chữ CTIT), thay cho ô chữ
     "CT" mặc định. Để trống thì vẫn hiện chữ "CT" như cũ.
   - `page_title`/`page_intro`: chữ H1 to và dòng mô tả nhỏ ở đầu trang
     `/about` (trước giờ 2 dòng này hardcode trong `lib/site-config.ts`). Để
     trống thì trang tự lấy lại 2 câu mặc định đó.

   Lưu ý: KHÔNG cần thêm cột thứ 3 kiểu `id` vào tab About — tab này chỉ có 2
   cột `label | value`, tên file ảnh (`about-photo.jpg`, `logo.png`...) ghi
   thẳng vào cột `value` của đúng dòng đó là đủ.

   **Tab "Overview"** — cột: `label`, `value`. Chỉ để số liệu tổng quan
   ngắn gọn (label muốn ghi tiếng Việt gì cũng được, không bắt buộc tiếng
   Anh như tab About) — không để ảnh hay đoạn giới thiệu dài ở đây, 2 thứ đó
   thuộc về tab About (`photo`, `bio`) ở trên:

   | label | value |
   |---|---|
   | Năm thành lập | 2015 |
   | Học viên đã đào tạo | 500+ |

   **Tab "Students"** — cột: `Tên viết tắt`, `Tên đầy đủ`, `name`, `major`,
   `faculty`, `id` (hoặc `photo`). Tên cột nhận cả tiếng Anh lẫn tiếng Việt,
   không phân biệt hoa/thường/dấu, ghi chú trong ngoặc ở header bị bỏ qua
   (`school` = `Tên viết tắt`, `school_full` = `Tên đầy đủ`, `major` = `Ngành`,
   `faculty` = `Khoa`):

   | Tên viết tắt | Tên đầy đủ | name | major | faculty | id |
   |---|---|---|---|---|---|
   | HCMUT | Trường Đại học Bách khoa - ĐHQG-HCM | Nguyễn Văn A | Khoa học Máy tính | Khoa Máy tính | nguyen-van-a.jpg |

   `Tên viết tắt` và `name` là bắt buộc. `Tên đầy đủ` chỉ cần điền 1 lần cho mỗi
   trường, các dòng khác cùng trường để trống vẫn tự lấy tên đầy đủ đó.

   **Tab "Resources"** — cột: `id`, `title`, `url`, `description`, `type`,
   `topic`, `source`, `featured` (+ tuỳ chọn `level`, `Mục lớn`, `cover`). Chỉ
   `title` và `url` bắt buộc. Tên cột nhận cả tiếng Anh lẫn tiếng Việt, ghi chú
   trong ngoặc ở header được bỏ qua (`url (link sách, link youtube)` vẫn là cột
   `url`, `type (youtube, pdf)` vẫn là cột `type`):

   | id | title | url | description | type | topic | source | featured |
   |---|---|---|---|---|---|---|---|
   | Chuyen-nganh-co-dien-tu.jpg | Nhất nghệ tinh Cơ điện tử | https://... | Sách chuyên ngành | pdf | Cơ điện tử | CTIT | x |

   - **`id` là TÊN FILE ẢNH bìa có đuôi** (vd `Chuyen-nganh-co-dien-tu.jpg`),
     file nằm trong `public/images/Resources/`, tên khớp chính xác kể cả
     hoa/thường. Dòng để trống `id` thì card hiện icon thay cho ảnh, không lỗi.
     Muốn dùng cột riêng cho ảnh thì đặt tên cột `cover` (được ưu tiên hơn `id`).
   - `type` nhận `youtube`/`video` → Video, `pdf`/`sách`/`book` → PDF,
     `datasheet`, `code`/`github`, `tool`, `website`/`web`/`link`, `paper`.
     **Để trống thì tự đoán từ link**: youtube → Video, github → Code, link PDF
     (kể cả link PDF của SharePoint/OneDrive) → PDF, còn lại → Website.
   - `featured` điền `x` hoặc `yes` thì link hiện thêm ở mục "Featured
     resources" trên trang chủ (tối đa 3 link).

   **Cột `photo`/`cover`** (About, Students, Resources) nhận 3 kiểu:
   - Tên file thường CÓ ĐUÔI, vd `nguyen-van-a.jpg` → ảnh phải bỏ trong
     `public/images/Students/` (hoặc `About/`, `Resources/` tương ứng từng
     tab), đúng tên đó, kể cả hoa/thường (Windows không phân biệt nhưng
     Linux/Vercel có). Tên folder viết đúng như trên máy: `About`, `Students`,
     `Resources`, `Campus`; muốn đổi thì sửa ở `lib/photo-url.ts`.
   - Tab About/Students/Resources: ghi tên file vào cột `photo`/`cover`, hoặc
     vào cột `id` (chỉ nhận khi giá trị có đuôi ảnh `.jpg/.png/.webp...`).
   - Link chia sẻ Google Drive (dạng `.../file/d/ID/view` hoặc
     `?id=ID`) → code tự động đổi sang dạng xem ảnh trực tiếp, không cần tự
     tay đổi link. File chỉ cần để chế độ chia sẻ "Anyone with the link".
   - Link URL ảnh đầy đủ khác, vd `https://i.imgur.com/xxxx.jpg` → dùng
     thẳng, không cần bỏ ảnh vào project.

2. Với **từng tab**, vào **File → Share → Publish to web** → chọn đúng tab đó
   (không chọn "Entire Document") → chọn định dạng **CSV** → Publish → copy
   link. Nhớ tích **"Automatically republish when changes are made"** để sau
   này sửa sheet là web tự cập nhật, không cần publish lại thủ công.
3. Mở file `.env.local` (copy từ `.env.example` nếu chưa có), dán 4 link vào:

   ```
   ABOUT_SHEET_CSV_URL=<link CSV của tab About>
   OVERVIEW_SHEET_CSV_URL=<link CSV của tab Overview>
   STUDENTS_SHEET_CSV_URL=<link CSV của tab Students>
   RESOURCES_SHEET_CSV_URL=<link CSV của tab Resources>
   ```

4. Chạy lại `npm run dev`. Sau này chỉ cần sửa trong Google Sheet, tải lại
   trang là thấy dữ liệu mới (không cần sửa code, không cần build lại). Khi
   chạy `npm run dev` luôn lấy dữ liệu mới nhất từ sheet; chạy thật thì cache
   60 giây. Google cần vài phút để republish tab sau khi sửa.

   **Kiểm tra khớp sheet ↔ code:** terminal chạy `npm run dev` in ra cột nào
   đọc được (`[Students]`, `[Resources]`...; `(KHÔNG THẤY)` nghĩa là tab đó
   không có cột ấy) và ảnh nào trong sheet không khớp file trong folder
   (không thấy file, sai hoa/thường, file trong folder chưa ai dùng).

Nếu chưa cấu hình đủ 4 link CSV trên, phần tương ứng sẽ hiện thông báo hướng
dẫn thay vì lỗi trắng trang.

---

## Cập nhật: giao diện kiểu Tsinghua (8 trang)

Trang chủ `/` giờ là trang tổng quát (hero, 8 lối vào, tin mới, sự kiện, tài liệu nổi bật). Mỗi mục menu là 1 trang riêng có banner tiêu đề, giống cấu trúc `tsinghua.edu.cn/en`:

| Trang | Route | Nguồn dữ liệu |
|---|---|---|
| Giới thiệu (About) | `/about` | Tab About + Overview |
| Tuyển sinh (Admissions) | `/admissions` | Viết trong `app/admissions/page.tsx` (nội dung mẫu, sửa lại cho đúng) |
| Trường & Khoa (Schools & Departments) | `/schools` | Tab Students (gom nhóm theo trường, hiện tên đầy đủ) |
| Nghiên cứu (Research) | `/research` | Sheet Nghiên cứu riêng (`RESEARCH_SHEET_CSV_URL`) — xem chi tiết ở mục cập nhật bên dưới |
| Tin tức (News) | `/news` | Tab **News** (mới) |
| Sự kiện (Events) | `/events` | Tab **Events** (hero + lịch sắp diễn ra + ảnh đã diễn ra có lightbox) |
| Podcast | `/podcast` | Chuyển thẳng sang `/resources` (chưa có tab Podcast riêng) |
| Khuôn viên (Campus) | `/campus` | Tab **Campus** (mới, hiện dạng thư viện ảnh) |

`/resources` và `/admin` vẫn giữ nguyên, nằm ở thanh nhỏ phía trên menu.

### 3 tab Google Sheet dạng danh sách (News, Events, Campus)

Tạo thêm 3 tab **News**, **Events**, **Campus**. News dùng các cột: `title`
(bắt buộc), `date`, `summary`, `url`, `image`, `tag`. Cột `image` nhận 3 kiểu
như cột `photo`/`cover` (tên file trong `public/images/News/`, link Drive,
hoặc URL ảnh). Publish từng tab ra CSV như các tab cũ, dán link vào
`.env.local`:

```
NEWS_SHEET_CSV_URL=...
EVENTS_SHEET_CSV_URL=...
CAMPUS_SHEET_CSV_URL=...
RESEARCH_SHEET_CSV_URL=...   # chưa dùng, để dành cho trang Nghiên cứu
```

Thứ tự dòng trong sheet không quan trọng với News/Campus (dòng mới nhất nên
để trên cùng để dễ nhìn khi sửa). Riêng tab **Events** trang tự sắp xếp theo
ngày (không phụ thuộc thứ tự dòng) và dùng thêm 3 cột so với News: `time`
(giờ), `place` (địa điểm), `featured` (ưu tiên làm hero) — trang tự chia
"Sắp diễn ra" / "Đã diễn ra" dựa vào cột `date` so với ngày hôm nay, không
cần cột trạng thái riêng. Xem bảng cột đầy đủ + ví dụ dán thẳng vào Sheets ở
trang `/admin`, mục "Sự kiện". Chưa có link CSV thì trang hiện thông báo
hướng dẫn, không lỗi.

### Footer, menu, liên hệ

Sửa trong `lib/site-config.ts`: tên/đường dẫn menu, link TikTok / Instagram / Facebook / YouTube (đang là `#`), số điện thoại, email. Muốn thêm mạng xã hội khác thì thêm vào mảng `socials` và thêm icon tương ứng trong `components/Footer.tsx`.

### File mới / file đã sửa

- Mới: `lib/site-config.ts`, `components/PageShell.tsx`, `components/FeedList.tsx`, `app/{about,admissions,schools,research,news,events,podcast,campus}/page.tsx`
- Sửa: `components/Header.tsx`, `components/Footer.tsx`, `app/page.tsx`, `app/layout.tsx`, `app/globals.css` (phần thêm ở cuối file), `lib/sheet-data.ts` và `lib/dashboard-types.ts` (thêm ở cuối file), `.env.example`

### Chưa làm

- Menu dropdown và ảnh banner lớn như Tsinghua.

### Cập nhật: khớp sheet ↔ ảnh ↔ code

- Ảnh nằm trong `public/images/{About,Students,Resources,Campus}/`. Ảnh trong
  sheet ghi tên file có đuôi; tên folder viết đúng hoa/thường như trên máy,
  đổi thì sửa ở `lib/photo-url.ts`.
- Tab Resources: cột `id` = tên file ảnh; header có ghi chú trong ngoặc vẫn
  nhận; `type` để trống thì tự đoán từ link; dòng không có `id` vẫn hiện.
- Tab Students: cột `Tên viết tắt` + `Tên đầy đủ`, tên đầy đủ lấy thẳng từ
  sheet.
- `components/SafeImage.tsx`: ảnh không khớp file thì hiện icon / chữ cái đầu
  thay vì ảnh vỡ.
- `app/admin/page.tsx` liệt kê đúng các cột tab Resources đang được code đọc.

---

## Cập nhật: trang /news theo cấu trúc News của CTIT

Trang `/news` dùng **một tab News duy nhất** nhưng chia nội dung bằng cột `section`, theo cấu trúc tham khảo từ Tsinghua: **Headlines → Latest News → In the Media → Features & Voices**. Mỗi nhóm có UI riêng thay vì hiển thị tất cả bằng cùng một loại card.

### Tab `News`

Header chuẩn:

```text
section | order | title | content | date | url | image | category
```

Giá trị `section` nên dùng đúng:

```text
headlines
latest
media
features
```

- `headlines`: bài nổi bật. `order = 1` là bài hero lớn nhất; `order = 2, 3` hiện ở cột phụ.
- `latest`: tin mới, hiện dạng lưới card.
- `media`: bài/bản tin từ bên ngoài, hiện dạng danh sách editorial.
- `features`: bài dạng feature/story, hiện dạng card.
- `order`: số thứ tự **riêng trong từng section**, không viết `step 3` hay `latest 2` vào `section`.
- `title`: bắt buộc.
- `content`: mô tả/ngữ cảnh ngắn. Code cũng chấp nhận header `summary`/`Mô tả` cho tương thích.
- `date`: nên ghi `YYYY-MM-DD`.
- `url`: link nội bộ hoặc link ngoài. Link ngoài tự mở tab mới.
- `image`: tên file trong `public/images/News/`, link Drive hoặc URL ảnh đầy đủ.
- `category`: nhãn như `Research`, `Technology`, `Automotive`, `Embedded`, `Event`, `Community`, `Media`.

Ví dụ:

| section | order | title | content | date | url | image | category |
|---|---:|---|---|---|---|---|---|
| headlines | 1 | Hệ thống giám sát pin xe điện | CTIT phát triển... | 2026-09-28 | | battery.jpg | Research |
| headlines | 2 | Nền tảng Embedded tại CTIT | ... | 2026-09-25 | | embedded.jpg | Technology |
| latest | 1 | Workshop Embedded Systems | ... | 2026-09-27 | | workshop.jpg | Event |
| media | 1 | CTIT trên ... | ... | 2026-09-20 | https://... | media.jpg | Media |
| features | 1 | Một ngày tại CTIT | ... | 2026-09-18 | | ctit.jpg | Community |

Ảnh News đặt tại `public/images/News/` và tên trong Sheet phải khớp chính xác hoa/thường khi deploy Vercel.

## Cập nhật: trang /admissions lấy dữ liệu từ tab Admissions

Trang `/admissions` (Tuyển sinh) trước giờ là nội dung mẫu viết cứng trong
code, giờ lấy từ **1 tab Google Sheet duy nhất** tên `Admissions`. Vì 1 trang
tuyển cần nhiều loại nội dung khác nhau (banner trạng thái, quy trình, điều
kiện, mảng chuyên môn, mốc thời gian, FAQ) mà chỉ có 1 link CSV, tab này dùng
**1 cột `section` để phân loại từng dòng** — dòng nào thuộc phần nào thì ghi
đúng giá trị `section` tương ứng, các cột còn lại dòng nào không cần thì để
trống.

**Tab "Admissions"** — cột: `section` (bắt buộc), `order` (tuỳ chọn), `title`,
`content`, `date`, `url`, `image`. Tên cột nhận cả tiếng Anh lẫn tiếng Việt,
không phân biệt hoa/thường/dấu, giống các tab khác:

| section | order | title | content | date | url | image |
|---|---|---|---|---|---|---|
| status | | Đang mở đơn | Hạn nộp 10/10/2026 | | link Google Form | |
| step | 1 | Tìm hiểu | Xem định hướng, hoạt động và các chủ đề CTIT đang theo đuổi. | | | |
| step | 2 | Chuẩn bị | Chọn lĩnh vực phù hợp như Automotive, MCU, Embedded hoặc Interface. | | | |
| requirement | | Sinh viên năm 2 trở lên | | | | |
| track | | Automotive | Mô tả ngắn về mảng này | | | automotive.jpg |
| timeline | | Mở đơn | | 2026-10-01 | | |
| faq | | Cần biết lập trình trước không? | Không bắt buộc, sẽ được hướng dẫn khi tham gia. | | | |

Giá trị `section` nhận được (không phân biệt hoa/thường/dấu):

- **status** — banner nổi bật đầu trang: `title` là chữ trên badge (vd "Đang
  mở đơn"), `content` là dòng mô tả ngắn (vd hạn nộp), `url` là link Google
  Form → hiện thành nút "Đăng ký ngay". Chỉ dùng 1 dòng, dòng đầu tiên nếu ghi
  nhiều hơn 1.
- **step** — quy trình tham gia, hiện thành thẻ 01/02/03... theo đúng thứ tự.
- **requirement** — điều kiện ứng tuyển, mỗi dòng 1 gạch đầu dòng, chỉ cần
  cột `title`.
- **track** — các mảng chuyên môn đang tuyển, hiện thành thẻ 3 cột. `image`
  tuỳ chọn (tên file trong `public/images/Admissions/`, link Drive, hoặc URL
  ảnh), để trống thì thẻ không có ảnh, không lỗi.
- **timeline** — mốc thời gian, hiện theo dạng dòng thời gian dọc. `date` nên
  ghi dạng `2026-10-01` cho dễ đọc, `title` là tên mốc, `content` là chi tiết
  (tuỳ chọn).
- **faq** — câu hỏi thường gặp: `title` là câu hỏi, `content` là câu trả lời,
  hiện dạng có thể bấm mở/đóng.

`order` tuỳ chọn: điền số để chỉ định thứ tự hiển thị trong từng `section`;
để trống thì tự theo đúng thứ tự dòng xuất hiện trong sheet. Section nào
không có dòng nào thì khối đó tự ẩn trên trang, không hiện thông báo trống.

Publish tab này ra CSV như các tab khác (`File → Share → Publish to web` →
chọn tab `Admissions` → CSV → tích "Automatically republish"), dán link vào
`.env.local`:

```
ADMISSIONS_SHEET_CSV_URL=<link CSV của tab Admissions>
```

File mới: `public/images/Admissions/` (ảnh cho track). Sửa:
`lib/sheet-data.ts` (thêm `getAdmissionsInfo`), `lib/dashboard-types.ts`
(thêm các type `Admissions*`), `lib/photo-url.ts` (thêm folder `admissions`),
`app/admissions/page.tsx`, `app/globals.css` (phần thêm ở cuối file),
`.env.example`.

---

## Cập nhật: trang /research lấy dữ liệu từ tab Research

Giống Admissions, trang `/research` dùng **1 tab Google Sheet duy nhất** tên
`Research`, cột `section` phân loại từng dòng: `focus` / `project` /
`achievement` / `publication`.

**Tab "Research"** — cột: `section` (bắt buộc), `order`, `title`, `content`,
`date`, `url`, `image`, `tag`, `category`:

| section | title | content | date | url | image | tag | category |
|---|---|---|---|---|---|---|---|
| focus | Automotive | Mô tả ngắn hướng nghiên cứu | | | | | |
| project | Hệ thống giám sát pin xe điện | Mô tả ngắn dự án | 2026 | link github/demo | ten-anh.jpg | Đang thực hiện | Automotive |
| achievement | Giải Nhì Embedded Racing 2026 | Đội gồm 4 thành viên... | 2026-05 | link tin tức | | | |
| publication | Tên bài báo | Tóm tắt ngắn | 2026 | link bài báo | | Tên tác giả | |

- **focus** — hướng nghiên cứu, hiện thành khối tab bấm chuyển (giống mục
  "Products & innovations" của st.com): bấm 1 tab → panel đổi ảnh (hoặc chữ
  viết tắt nếu không có ảnh) + mô tả của hướng đó.
- **project** — dự án nghiên cứu. `tag` là trạng thái (vd "Đang thực hiện" /
  "Hoàn thành"), hiện thành badge trên thẻ. `category` (tuỳ chọn) ghi ĐÚNG
  tên 1 dòng `focus` (không phân biệt hoa/thường/dấu) → dự án đó sẽ hiện
  trong khối nổi bật của panel khi bấm đúng tab hướng nghiên cứu tương ứng.
  Để trống `category` thì dự án vẫn hiện bình thường trong lưới, chỉ là
  không có mặt trong panel nổi bật.
- **achievement** — thành tích & giải thưởng, hiện dạng dòng thời gian dọc.
- **publication** — bài báo/ấn phẩm, `tag` dùng làm tên tác giả, tự gom theo
  năm (lấy từ `date`).

`order` tuỳ chọn (số thứ tự hiển thị trong từng `section`, để trống thì theo
đúng thứ tự dòng trong sheet). `image` nhận tên file trong
`public/images/Research/`, link Drive, hoặc URL ảnh. Section nào không có
dòng nào thì khối đó tự ẩn, không hiện thông báo trống.

Trên đầu trang có thêm dải số liệu tổng quan (đếm theo từng `section`) và 1
hàng tab lọc theo loại nội dung (Tất cả / Hướng nghiên cứu / Dự án / Thành
tích / Bài báo) — lọc này độc lập với tab chọn hướng nghiên cứu bên trong
mục "Hướng nghiên cứu".

Publish tab ra CSV, dán link vào `.env.local`:

```
RESEARCH_SHEET_CSV_URL=<link CSV của tab Research>
```

File liên quan: `lib/sheet-data.ts` (`getResearchInfo`), `lib/dashboard-types.ts`
(`ResearchItem`, `ResearchData`), `lib/photo-url.ts` (folder `research`),
`app/research/page.tsx`, `app/research/ResearchExplorer.tsx`,
`public/images/Research/`, `app/globals.css` (phần `/* ===== Research ===== */`).

---

## Cập nhật 2026-09-28 — Resources → Documents + Inventory

### 1. Cấu trúc Resources trên website

`Resources` được dùng như một nhóm tài nguyên tổng, có thể mở rộng về sau.
Hiện tại có 2 nhánh:

- `/resources/documents` — **Tài liệu**
- `/resources/inventory` — **Inventory**

Trang `/resources` là trang tổng quan, hiển thị 2 card lớn để đi vào từng nhánh.

### 2. Navigation / dropdown Tài nguyên

Header đã được làm lại theo kiểu mega-menu lấy cảm hứng từ cách các website kỹ
thuật lớn như TI phân nhóm tài nguyên:

- Không còn mũi tên `↑/↓` bên cạnh chữ **Tài nguyên**.
- Khi hover/focus, chữ **Tài nguyên** đổi màu và có underline active.
- Dropdown là panel rộng, chia thành phần giới thiệu + các nhóm tài nguyên.
- Hiện có:
  - `01 / DOCUMENTS` — Tài liệu
  - `02 / INVENTORY` — Inventory
- Mỗi nhóm có icon, mô tả và nút điều hướng.
- Desktop dùng 2 cột cho hai nhóm; màn hình nhỏ tự chuyển thành 1 cột.
- Menu vẫn dùng `hover` + `focus-within` để có thể điều hướng bằng bàn phím.

### 3. Google Sheet: một tab Resources duy nhất

Documents và Inventory **không tách thành hai Sheet/tab**.
Cả hai nằm trong cùng một tab Google Sheet:

```text
A:G  = Documents
H    = cột trống tô vàng để phân cách
I:U  = Inventory
```

#### Documents — A:G

```text
A  Mục lớn
B  id
C  title
D  url
E  description
F  type
G  topic
```

`id` của Documents là **tên file ảnh**, ví dụ:

```text
Chuyen-nganh-co-dien-tu.jpg
nhat_nghe_tinh_oto.png
tu-sach-nhat-nghe-tinh-chuyen-nganh-co-khi.jpg
```

Ảnh tương ứng nằm trong:

```text
public/images/Resources/Documents/
```

#### Inventory — I:U

```text
I  category
J  id
K  title
L  manufacturer
M  model
N  description
O  unit
P  quantity
Q  datasheet
R  purchase_url
S  location
T  status
U  current_user
```

`id` của Inventory cũng chính là **tên file ảnh**, ví dụ:

```text
STM32F103C8T6_Type-C_(China).jpg
```

Ảnh tương ứng nằm trong:

```text
public/images/Resources/Inventory/
```

Không có cột `image`. Code tự dùng `id` để tìm ảnh.

### 4. Ví dụ Inventory

```text
category       = Microcontrollers
id             = STM32F103C8T6_Type-C_(China).jpg
title          = STM32F103C8T6 Type-C
manufacturer   = STMicroelectronics
model          = STM32F103C8T6
description    = Development board based on STM32F103C8T6, Type-C interface
unit           = pcs
quantity       = 1
datasheet      = https://www.st.com/resource/en/datasheet/stm32f103c8.pdf
purchase_url   = https://www.thegioiic.com/mach-stm32f103c8t6-type-c-china
location       = Electronics Lab
status         = Có người sử dụng
current_user   = Đỗ Thành Đạt
```

`pcs` = pieces, nghĩa là cái/chiếc.

### 5. Code đọc Inventory

`getInventory()` trong `lib/sheet-data.ts` chỉ tìm các cột Inventory trong vùng
**I:U**. Đây là điểm quan trọng vì Documents cũng có `id`, `title`,
`description`; nếu tìm trên toàn bộ header thì code có thể lấy nhầm cột bên trái.

Mapping cố định:

```text
I → category
J → id
K → title
L → manufacturer
M → model
N → description
O → unit
P → quantity
Q → datasheet
R → purchase_url
S → location
T → status
U → current_user
```

Trong development, terminal sẽ in ra mapping `[Inventory]` để dễ phát hiện sai
header hoặc sai vùng Sheet.

### 6. UI Inventory

Trang `/resources/inventory` có:

- Tổng số mặt hàng.
- Tổng số lượng.
- Số mặt hàng đang có sẵn.
- Số mặt hàng sắp hết nếu Sheet dùng trạng thái tương ứng.
- Ô tìm kiếm theo tên, model, manufacturer, category, location, id...
- Filter theo category.
- Filter theo status.
- Nút xoá bộ lọc.
- Card Inventory có ảnh từ `id`.
- Manufacturer/model/description.
- Quantity + unit.
- Location.
- Status badge.
- `current_user` khi có người đang sử dụng.
- Link `Datasheet`.
- Link `Nơi mua` từ `purchase_url`.

### 7. Status Inventory

Giá trị status hiện được giữ theo dữ liệu Sheet. Các trạng thái nên dùng thống nhất,
ví dụ:

```text
Có sẵn
Có người sử dụng
Bảo trì
Mất / Không xác định
```

Không cần thêm `image` hoặc `reorder_level` vào schema hiện tại.

Google Sheets hỗ trợ dropdown/data validation cho các cột trạng thái, nên có thể
thiết lập dropdown để tránh nhập cùng một trạng thái theo nhiều cách khác nhau.
Xem hướng dẫn chính thức của Google Sheets tại:
https://support.google.com/docs/answer/186103

### 8. Tự động kiểm tra ảnh

Khi chạy `npm run dev`, code kiểm tra:

```text
public/images/Resources/Documents/
public/images/Resources/Inventory/
```

Terminal sẽ cảnh báo nếu:

- Sheet có tên ảnh nhưng file không tồn tại.
- Tên ảnh khác hoa/thường.
- Có ảnh trong folder nhưng chưa dòng nào trong Sheet sử dụng.

Điều này đặc biệt quan trọng khi deploy lên Vercel vì filesystem Linux phân biệt
hoa/thường.

### 9. Các file chính đã thay đổi cho Resources / Inventory

```text
components/Header.tsx
    → mega-menu Tài nguyên, bỏ mũi tên ↑/↓, active underline.

components/ResourceCard.tsx
    → card Documents hiện ảnh/type/meta/link.

components/ResourceExplorer.tsx
    → search + filter Documents.

components/InventoryExplorer.tsx
    → search + category/status filter + KPI + Inventory cards.

app/resources/page.tsx
    → Resources hub: Documents + Inventory.

app/resources/documents/page.tsx
    → trang Tài liệu.

app/resources/inventory/page.tsx
    → trang Inventory.

lib/sheet-data.ts
    → đọc Documents A:G và Inventory I:U trong cùng một Sheet.

lib/photo-url.ts
    → thêm folder Resources/Inventory cho ảnh Inventory.

app/globals.css
    → mega-menu, Resources hub và Inventory UI.

public/images/Resources/Documents/
    → ảnh bìa tài liệu.

public/images/Resources/Inventory/
    → ảnh vật tư/thiết bị Inventory.
```

### 10. Quy trình thêm một vật tư mới

1. Đưa ảnh vào:

```text
public/images/Resources/Inventory/
```

2. Đặt `id` trong Sheet **đúng bằng tên file ảnh**, gồm cả extension.
3. Điền dữ liệu vào I:U.
4. Publish/republish tab Resources thành CSV nếu cần.
5. Chạy `npm run dev` và kiểm tra log `[Inventory]`.
6. Mở `/resources/inventory`.

Không cần sửa React code khi chỉ thêm một vật tư mới.

### 11. Mở rộng sau này

Không đổi kiến trúc Sheet hiện tại nếu muốn thêm tài nguyên mới. Có thể mở rộng
Resources thành:

```text
Resources
├── Documents
├── Inventory
├── Equipment
├── Software
├── Projects
├── Learning
└── Labs & Facilities
```

Các mục mới có thể được thêm vào navigation/page sau khi có dữ liệu thực tế.
Không nên thêm tất cả ngay từ đầu để giữ Resources dễ sử dụng.

## Admissions / Tuyển sinh — UI mới

Trang `/admissions` được tổ chức theo hướng **program-style admissions**: phần trạng thái tuyển sinh nằm ở hero, sau đó là các hướng hoạt động, quy trình, điều kiện, timeline và FAQ. Cách phân tầng này tham khảo information architecture của các trang admissions đại học lớn như Tsinghua, nơi Admissions được chia theo loại chương trình rồi đi sâu vào Apply / Overview / Programs / Financial Aid / FAQ thay vì dồn mọi thứ vào một danh sách dài.

### Google Sheet Admissions — schema hiện tại

Giữ **một tab Admissions duy nhất**:

| section | order | title | content | date | url | image |
|---|---:|---|---|---|---|---|
| status | | Đang mở đơn | Hạn nộp 10/10/2026 | | link form | |
| step | 1 | Tìm hiểu | | | | |
| requirement | 1 | Tất cả học sinh, sinh viên | | | | |
| track | 1 | Automotive | Hiểu biết về điện điện tử ô tô | | link | automotive.jpg |
| timeline | 1 | Mở đơn | | 2026-10-01 | | |
| faq | 1 | CTIT dành cho ai? | Tất cả học sinh, sinh viên... | | | |

`section` được code nhận diện thành: `status`, `step`, `requirement`, `track`, `timeline`, `faq`.

### Ý nghĩa từng section

- `status`: trạng thái đợt tuyển sinh. `title` là nhãn trạng thái, `content` là thông tin deadline/mô tả, `url` là link form đăng ký.
- `track`: một hướng hoạt động/chuyên môn. `title` là tên hướng, `content` là mô tả, `image` là ảnh tùy chọn, `url` là link chi tiết tùy chọn.
- `step`: các bước tham gia. Dùng `order` để sắp xếp.
- `requirement`: đối tượng/điều kiện. Chỉ cần `title`.
- `timeline`: các mốc tuyển sinh. `date` là ngày hiển thị, `title` là tên mốc, `content` là mô tả.
- `faq`: câu hỏi thường gặp. `title` là câu hỏi, `content` là câu trả lời.

### Có cần thêm cột không?

**Không bắt buộc thêm cột nào** để chạy UI mới. Schema hiện tại đã đủ.

Nếu muốn mở rộng Admissions về sau theo kiểu nhiều chương trình, có thể thêm một cột tùy chọn `program`:

```text
program | section | order | title | content | date | url | image
```

Ví dụ `program = Member Recruitment 2026`, `program = Workshop`, `program = Summer Program`. **Chưa cần thêm cột này bây giờ** nếu CTIT chỉ có một đợt tuyển thành viên.

### Quy tắc dữ liệu khuyến nghị

- `order`: dùng số `1, 2, 3...` cho `step`, `track`, `timeline`, `faq`.
- `status`: nên thống nhất một số trạng thái như `Đang mở đơn`, `Sắp mở`, `Đã đóng`.
- `track.image` nếu dùng phải là tên file nằm trong `public/images/Admissions/`.
- `track.url` nếu có sẽ hiện nút `Khám phá hướng này`.
- `status.url` sẽ hiện nút `Đăng ký ngay`.
- FAQ nên có cả `title` và `content`; dòng FAQ trống title sẽ không được render.

### Những file đã thay đổi cho Admissions

- `app/admissions/page.tsx` — thay toàn bộ layout thành hero + status + tracks + steps + requirements + timeline + FAQ.
- `app/globals.css` — thêm hệ thống style Admissions mới, responsive desktop/tablet/mobile.
- `lib/dashboard-types.ts` — `AdmissionsTrack` thêm `url`.
- `lib/sheet-data.ts` — đọc `url` cho từng `track` từ Google Sheet.
- `README.md` — cập nhật schema, cách điền dữ liệu và quy tắc mở rộng.

### Kiểm tra nhanh sau khi sửa Sheet

```powershell
npm run dev
```

Mở:

```text
http://localhost:3000/admissions
```

Trong dev mode, terminal sẽ in cảnh báo nếu cột/section Admissions không đúng hoặc ảnh trong `public/images/Admissions/` không khớp tên trong Sheet.


## Cập nhật giao diện & dữ liệu — 2026-09-28

### Admissions

Tab `Admissions` vẫn dùng **một Sheet duy nhất**:

| section | order | title | content | date | url | image |
|---|---:|---|---|---|---|---|
| status | | Đang mở đơn | Hạn nộp 10/10/2026 | | link đăng ký | |
| step | 1 | Tìm hiểu | | | | |
| step | 2 | Đăng ký | | | | |
| step | 3 | Phỏng vấn | | | | |
| step | 4 | Kết quả | | | | |
| requirement | 1 | Tất cả học sinh, sinh viên | | | | |
| track | 1 | Automotive | Hiểu biết về điện điện tử ô tô | | | automotive.jpg |
| timeline | 1 | Mở đơn | | 2026-10-01 | | |
| timeline | 2 | Đóng đơn | | 2026-10-10 | | |
| faq | 1 | CTIT dành cho ai? | Tất cả học sinh, sinh viên... | | | |

**Khuyến nghị:** cột `section` nên giữ đúng các giá trị chuẩn `status`, `step`, `requirement`,
`track`, `timeline`, `faq`; số thứ tự đặt ở cột `order`.

Code hiện tại vẫn **chịu được** các giá trị như `step 3`, `step 4` để không làm mất dữ liệu nếu
lỡ nhập như vậy. Parser sẽ quy chúng về nhóm `step` và lấy số thứ tự từ cột `order`.

### Resources

`Resources` là một Sheet tổng. Phần giao diện chia thành:
- `Documents`
- `Inventory`

Inventory dùng các cột:

`category | id | title | manufacturer | model | description | unit | quantity | datasheet | purchase_url | location | status | current_user`

Trong đó `id` của Inventory là **tên file ảnh**, không cần thêm cột `image`.

### Schools / Học viên

Các câu mô tả giao diện không còn nói người dùng về Google Sheet/database.
Dữ liệu vẫn được cập nhật từ nguồn quản trị hiện tại, nhưng UI chỉ tập trung vào nội dung cộng đồng.

Trong môi trường development, terminal có thêm thống kê:

`[Students] X học viên | Y trường có dữ liệu sau khi lọc.`

Dòng này dùng để kiểm tra nhanh trường hợp Sheet có nhiều dòng nhưng website chỉ hiển thị một số nhóm.

### Footer

Footer đã dùng logo CTIT từ:

`public/images/About/logo.png`

và hiển thị nhãn:

`CTIT`
`Closed Thinking Institute of Technology`

Nếu đổi logo, thay file `logo.png` bằng file mới giữ nguyên tên hoặc cập nhật đường dẫn trong
`components/Footer.tsx`.

### Research

Trang Research có log development để đối chiếu số lượng sau khi lọc:

`[Research] Sau khi lọc: X hướng | Y dự án | Z thành tích | W ấn phẩm.`

Điều này giúp kiểm tra nhanh trường hợp số trên UI khác với số dòng mong muốn trong Sheet.

### Những file được cập nhật trong đợt này

- `lib/sheet-data.ts`
  - Admissions parser nhận `step 3`, `step 4` và các section có hậu tố số.
  - thêm thống kê debug Students.
  - thêm thống kê debug Research.
- `app/admissions/page.tsx`
  - tiếp tục render Admissions từ một Sheet tổng.
- `app/schools/page.tsx`
  - đổi phần mô tả để không lộ cách lưu trữ dữ liệu.
- `components/StudentsShowcase.tsx`
  - đổi mô tả bộ lọc để không lộ Google Sheet/database.
- `components/Footer.tsx`
  - thêm logo CTIT và nhãn `Closed Thinking Institute of Technology`.
- `app/globals.css`
  - style cho logo/footer mới.
- `app/research/page.tsx`
  - tinh gọn phần giới thiệu Research.


### Logo header

- Header: `Closed Thinking Institute of Technology`.
- Footer: `Closed Thinking Institute of Technology`.

## Cập nhật giao diện trang chủ — 2026-10-05

Làm đẹp trang chủ (`/`) theo 3 hướng: hero có hình, chuyển động dùng chung, và ô điều hướng dạng bento.

**File mới**

| File | Vai trò |
| --- | --- |
| `components/motion.tsx` | Chuyển động dùng chung: `Reveal` (hiện dần khi cuộn), `CountUp` (đếm số, giữ tiền/hậu tố như `120+`, `98%`), `useCountUp`. Tôn trọng `prefers-reduced-motion`. |
| `components/HomeStats.tsx` | Dải số liệu dưới hero, lấy từ tab `Overview` của Google Sheet (tối đa 4 số đầu tiên). Không có dữ liệu thì tự ẩn. |
| `components/HomeBento.tsx` | 8 ô điều hướng dạng bento. `Nghiên cứu` là ô lớn, `Khuôn viên` là ô rộng, đều có ảnh nền. |
| `app/home.css` | CSS riêng của trang chủ: hero, dải số liệu, bento, responsive (860px / 560px). |

**File sửa**

- `app/page.tsx`: hero 2 cột (chữ + ảnh có chip nổi), thêm `HomeStats` và `HomeBento`, bọc các khối tin tức / sự kiện / tài liệu nổi bật bằng `Reveal`.
- `app/globals.css`: thêm class `.reveal` / `.is-in` ở cuối file để mọi trang dùng chung.

**Tuỳ chỉnh nhanh**

- Ảnh hero và chip nổi: hằng số `HERO_IMAGE`, `HERO_CHIPS` ở đầu `app/page.tsx`.
- Ảnh các ô bento: object `tiles` ở đầu `components/HomeBento.tsx` (thêm `{ image, size }` cho `href` nào muốn có ảnh; `size` là `"big"` hoặc `"wide"`).
- Dùng hiệu ứng ở trang khác: `import { Reveal, CountUp } from "@/components/motion"` rồi bọc nội dung bằng `<Reveal>`.

Trang `/research` vẫn dùng bản `Reveal` / `useCountUp` riêng trong `ResearchExplorer.tsx`; có thể chuyển sang `components/motion.tsx` sau để bỏ trùng lặp.

### Ảnh hiện đủ + bấm để phóng to — 2026-10-05

- Trước đây ảnh dùng `object-fit: cover` nên bị cắt. Nay ảnh dùng `object-fit: contain` (hiện đủ), phần thừa được lấp bằng chính ảnh đó làm nền mờ.
- Bấm vào ảnh là phóng to ngay khoảng 3/4 màn hình (`components/PeekImage.tsx`, CSS `.peek-*` ở cuối `app/globals.css`). Không còn rê chuột / giữ 2 giây.
  - Đóng: bấm chỗ bất kỳ, nút ✕ hoặc Esc. Trang không cuộn được khi ảnh đang mở. Bấm ảnh không bị chuyển sang trang chi tiết.
  - Màn hình ≤700px dùng 92vw × 80vh cho dễ xem. Tôn trọng `prefers-reduced-motion`.
- Thẻ tiêu điểm (`/news`): bấm bất kỳ đâu trên thẻ thì phóng ảnh; riêng nút "Đọc tiếp" (có `data-peek-skip`) vẫn chuyển sang bài viết.
- Trang `/news`: `Cover` trong `app/news/NewsView.tsx` + class `.nw-media*` trong `app/news/news.css`.
- Trang chủ (Tin tức mới / Sự kiện sắp tới): `components/FeedList.tsx` + class `.feed-media*`, `.feed-img` trong `app/globals.css`.
- Trang `/research`: ảnh Hướng nghiên cứu và Dự án cũng hiện đủ ảnh + nền mờ + bấm để phóng (`ResearchExplorer.tsx`, class `.rx-media*`).

### Dọn code (2026-10-06)

Không đổi giao diện hay cách hoạt động, chỉ làm gọn code. `tsc --noEmit --noUnusedLocals --noUnusedParameters` và `next build` đều chạy sạch (16 trang).

- **Xóa code Supabase cũ không còn ai gọi:** `components/AdminStudio.tsx`, `components/LocalResourceStudio.tsx`, `components/ScrollToTop.tsx`, `lib/sheets-api.ts`, `lib/resource-store.ts`, `lib/admin-auth.ts`, `lib/env.ts`, `lib/types.ts`, toàn bộ `app/api/`, và thư mục rỗng tên `app/{about,...}`. Các biến `SUPABASE_*`, `ADMIN_*`, `PODCAST_SHEET_CSV_URL` không còn dùng nên đã bỏ khỏi `.env.example`.
- **CSS:** xóa các luật của giao diện cũ (News / Research / Admissions / Campus kiểu cũ) còn sót trong `globals.css`, gộp luật bị lặp (ví dụ `.inventory-user` lặp 9 lần). Đã so từng thuộc tính trước/sau bằng parser CSS: không mất luật nào còn lớp được dùng.
- **Gộp code lặp:** `Reveal` (3 bản ở Research / News / Admissions) và `useCountUp` dùng chung ở `components/motion.tsx`; `toneOf`, `formatDate`, `padIndex` ở `lib/format.ts`; icon `ArrowIcon`, `InventoryIcon` ở `components/icons.tsx`. Lớp `.rx-reveal`, `.nw-reveal`, `.adm-reveal` được thay bằng `.reveal` chung.
- Xóa hàm `getFeed` không dùng trong `lib/sheet-data.ts`, đưa `import` nằm giữa file lên đầu, định dạng lại `lib/site-config.ts` (trước đó dồn thành vài dòng dài), thêm `*.tsbuildinfo` vào `.gitignore`.

### Bảo mật trang /admin (2026-10-06)

- **/admin có mật khẩu.** File `proxy.ts` khoá `/admin` bằng HTTP Basic Auth: trình duyệt hiện hộp nhập, tên đăng nhập là `ADMIN_USERNAME` (mặc định `admin`), mật khẩu là `ADMIN_PASSWORD`. Chạy thật mà chưa đặt biến này thì `/admin` trả 503 (tắt hẳn, không bao giờ mở); chạy `npm run dev` mà chưa đặt thì vẫn vào được để tiện sửa. Trên Vercel: Settings → Environment Variables → thêm `ADMIN_PASSWORD` (tối thiểu 20 ký tự ngẫu nhiên) → Redeploy.
- **Bỏ nút "Mở Google Sheet"** khỏi trang `/admin` và bỏ biến `SHEET_EDIT_URL`. Link sửa sheet không nên nằm trên web. Muốn mở sheet thì dùng bookmark riêng; nên để sheet ở chế độ chỉ người được mời mới sửa được.
- **`SUPABASE_*`, `ADMIN_SECRET`** không còn được code nào dùng: xoá khỏi `.env.local` và khỏi Vercel, đồng thời đổi (rotate) key trên Supabase nếu key đó từng là key thật.
- **Header bảo mật** trong `next.config.ts`: `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; riêng `/admin` thêm `no-store` và `noindex`. CSP đã được thêm ở đợt 2026-10-09 (xem mục "Bảo mật và sửa lỗi trùng lặp" ở cuối file).
- `sitemap.ts` và `robots.ts` không còn liệt kê `/admin`, sitemap có đủ các trang công khai.

### Menu điện thoại và trang trạng thái (2026-10-06)

- `components/MobileNav.tsx`: từ 860px trở xuống, thanh menu ngang được thay bằng nút 3 gạch. Mở bằng nút, đóng bằng bấm link, bấm ra ngoài, Esc hoặc khi đổi trang.
- `app/not-found.tsx` (404), `app/loading.tsx` (khung chờ khi chuyển trang), `app/error.tsx` (lỗi, có nút "Thử lại"). `components/StaticBar.tsx` là thanh đầu trang không gọi dữ liệu, dùng cho loading và lỗi.

### Khóa học: /resources/courses (2026-10-06)

Mục thứ 3 của menu **Tài nguyên** (cạnh Tài liệu và Inventory). Chỉ chứa link: mỗi bài là một đường dẫn tới video YouTube, slide, code hoặc tài liệu bên ngoài.

**Dữ liệu nằm trong tab `Resources`, khối thứ 3 từ cột W** (Documents A:G, Inventory I:U, Course W:AB; mỗi khối cách nhau một cột trống). Không cần tab mới, không cần link CSV mới. Dán header vào **ô W1** (không phải A1):

| W | X | Y | Z | AA | AB |
| --- | --- | --- | --- | --- | --- |
| Môn | Title | URL | Type | Description | id |

| Môn | Title | URL | Type | Description | id |
| --- | --- | --- | --- | --- | --- |
| Vi điều khiển | Bài 01: Chớp tắt LED | https://www.youtube.com/... | | | vi-dieu-khien.jpg |
| Vi điều khiển | Bài 02: Nút nhấn | | | | |
| Vi điều khiển | | | | Làm quen vi điều khiển từ AVR đến ARM. | |

- Mỗi dòng là một bài. Thứ tự bài trên web = thứ tự dòng trong sheet (kéo dòng để đổi).
- **Môn** viết giống hệt nhau giữa các dòng của cùng một môn. Thêm môn mới chỉ cần thêm dòng với tên môn mới, không sửa code.
- **Bài chưa có link**: chỉ ghi Môn và Title. Web hiện bài đó mờ với nhãn "Sắp có". Điền URL sau là thành bài bấm được.
- **Type** để trống thì tự đoán theo link (YouTube là Video, GitHub là Code, `.pdf` là PDF, còn lại là Website).
- **Description**: ở dòng có Title thì là mô tả của bài; ở dòng **không có Title và URL** thì là mô tả của cả môn.
- **id** là tên file ảnh bìa của môn (có đuôi, đúng hoa/thường), chỉ cần ghi ở một dòng của môn. Ảnh để trong `public/images/Resources/Courses/`; có thể chia thư mục con theo môn và ghi `Vi-dieu-khien/bia.jpg`. Cũng nhận link Google Drive hoặc URL ảnh. Để trống thì thẻ môn hiện ô chữ cái đầu.
- URL chỉ nhận `http://` và `https://`. Dòng có link khác (vd `javascript:`) bị bỏ qua. Chạy `npm run dev` sẽ có cảnh báo `[Courses] Bỏ qua ... dòng` và cảnh báo thiếu file ảnh ở terminal.
- Header của khối phải liền nhau: ô trống đầu tiên được coi là hết khối. Đừng thêm cột tên `level`, `source`, `featured`, `cover` vào khối: trang Tài liệu cũng tìm các tên này trên toàn sheet và sẽ đọc nhầm.
- **Muốn chia nhánh (vd AVR / ARM) hoặc chia chương**: thêm cột `Track` và/hoặc `Group` ngay sau `id` (AC, AD) rồi điền cho từng bài. Môn có nhiều nhánh sẽ hiện tab chuyển nhánh; `Group` gom các bài liên tiếp dưới một tiêu đề chương.
- Muốn tách khối này ra tab riêng: đặt `COURSES_SHEET_CSV_URL` là link CSV của tab đó.

### Sự kiện và Khuôn viên (2026-10-06)

- **/events** dựng lại: thẻ lớn "Sự kiện tiếp theo" (có đếm ngược "Còn N ngày", thứ trong tuần), lịch sắp tới gom theo tháng, và lưới thẻ ảnh đều nhau cho sự kiện đã diễn ra (hiện 6 cái, bấm "Xem thêm" để mở rộng). Sự kiện không có ảnh vẫn đẹp (ô số ngày / biểu tượng lịch). Cột sheet không đổi. Ngày "hôm nay" tính theo giờ Việt Nam.
- **/campus**: bỏ câu tổng kết cố định ("N khoảnh khắc tại M địa điểm, ghi lại qua K tháng") thay bằng các thẻ số liệu gọn (số ảnh, số địa điểm, khoảng thời gian). Nhóm tháng sắp mới nhất trước; ảnh chưa ghi ngày vào nhóm "Chưa rõ ngày" ở cuối (và không hiện tiêu đề nhóm nếu toàn bộ ảnh đều chưa có ngày). Số ảnh của nhóm chỉ hiện khi từ 2 ảnh trở lên.

## Đồng bộ UI các trang — 2026-10-06

Trước đây mỗi trang tự vẽ banner đầu trang một kiểu (About/Research tối, Schools/Resources/Admin sáng, News/Admissions riêng). Đợt này gom phần chung về một chỗ.

### Thành phần dùng chung mới

| File | Việc làm |
|---|---|
| `components/PageHero.tsx` | Banner đầu trang nền tối + lưới (cùng phong cách /about, /research): nút quay lại mục cha (tuỳ chọn), eyebrow, tiêu đề gradient, mô tả, dải số liệu dạng viên thuốc, cột phụ (`aside`) và vùng nút. |
| `components/ScrollUI.tsx` | Thanh tiến độ cuộn ở mép trên + nút "lên đầu trang". Gắn một lần trong `app/layout.tsx` nên mọi trang đều có. |

CSS của các phần trên nằm cuối `app/globals.css` (class `.ph-*`, `.scroll-progress`, `.to-top`, `.foot-*`).

`Footer.tsx` giờ là footer nhiều cột (giới thiệu + mạng xã hội, Khám phá, Tài nguyên, Liên hệ — lấy từ `nav`/`contact` trong `lib/site-config.ts`). Banner có thêm quầng sáng trôi chậm và vạch nhấn dưới tiêu đề; trang con của /resources có nút "← Tài nguyên" (prop `parent`) thay cho breadcrumb, trang cấp 1 không có gì phía trên nhãn tiếng Anh để khỏi lặp với tiêu đề; nút `.btn` có hiệu ứng nhấc/nhấn; thêm màu chọn chữ và viền focus bàn phím. Đã bỏ dải "Trang trước / Trang sau".

### Trang đã chuyển sang `PageHero`

- `PageShell` (About, Campus, Events…) — About vẫn giữ chữ tiêu đề lớn riêng nhờ class `about-hero`.
- `/schools` — bỏ banner sáng `hero-compact`, dùng `PageShell`.
- `/resources`, `/resources/documents`, `/resources/inventory`, `/resources/courses`, `/resources/courses/[slug]` — nút quay lại mục cha, số liệu chuyển thành viên thuốc trong banner; Inventory giữ thẻ số lượng ở cột phụ, trang khóa học giữ ảnh bìa.
- `/admin`.

### Giữ nguyên banner riêng

`/news`, `/admissions`, `/research` vẫn dùng hero riêng (có nội dung đặc thù: ticket, 3D chip, marquee). Chúng nhận thêm thanh tiến độ cuộn, nút lên đầu trang và footer mới qua Footer/layout.

### Ghi chú

- Các class CSS cũ (`.inventory-hero-layout`, `.inventory-hero-mark`, `.course-hero`, `.course-back`, `.resource-hero-stats`, `.resources-home-hero`) không còn được dùng; có thể xoá khi muốn dọn code.
- Banner có hiệu ứng trượt lên khi vào trang; tự tắt khi người dùng bật "giảm chuyển động".
- Đã chạy `tsc --noEmit` và `next build` thành công (16 route).

### Header điện thoại — 2026-10-07

- Ẩn dải trên cùng, logo/nút 36–40px, tên thương hiệu cắt tối đa 2 dòng để header gọn một hàng. (Ô tìm kiếm toàn trang đã thử rồi bỏ.)

### Trang chủ & banner theo phong cách ti.com — 2026-10-07

Tham khảo bố cục trang chủ ti.com (không dùng màu/logo của TI): ảnh tràn khung, góc vuông, đường kẻ mảnh, chữ đậm, mỗi khối có một liên kết "… →".

| Khối | File | Ghi chú |
|---|---|---|
| Carousel đầu trang | `components/HomeCarousel.tsx` | Slide 1 là giới thiệu CTIT (ảnh `HERO_IMAGE` trong `app/page.tsx`), slide 2 = tin mới nhất, slide 3 = sự kiện đầu tiên lấy từ Google Sheet (không có dữ liệu thì bỏ slide). Tự chuyển 7 giây, dừng khi rê chuột / bấm nút tạm dừng; bật "giảm chuyển động" thì chỉ chuyển bằng nút. |
| Lưới 8 ô khu vực | `components/HomeBento.tsx` | Ảnh trên, tiêu đề + mô tả, dòng "Khám phá … →". Ô không có ảnh dùng nền gradient + số thứ tự. Ảnh cấu hình trong `images` ở đầu file. |
| Tin tức | `components/HomeNews.tsx` | 1 bài nổi bật + danh sách, mỗi dòng "ngày \| chuyên mục". |
| Dải số liệu | `components/HomeStats.tsx` | Nền tối, nằm gần cuối trang (dữ liệu tab Overview). |
| Dải kêu gọi | `app/page.tsx` | "Tham gia CTIT" → `/admissions`. |

- CSS trang chủ: `app/home.css` (viết lại hoàn toàn; class `ti-*`). Banner các trang con (`PageHero`) giờ tràn khung, góc vuông; các liên kết "Xem tất cả" có mũi tên.
- Header: menu desktop thu nhỏ để 8 mục không tràn khung, tên thương hiệu cắt tối đa 2 dòng; menu hamburger bật từ 1020px trở xuống (trước là 860px).
- Sửa ảnh ô Nghiên cứu: trước trỏ tới `/images/Research/embedded.jpg` (không tồn tại), nay dùng `Embedded-system.png`.
- Đã bỏ: dải số liệu ngay dưới hero, bento có ô to/ô rộng, các chip nổi trên hero, 2 nút ở hero (giờ mỗi slide một nút).

### Bổ sung theo st.com — 2026-10-07 (thêm vào, giữ nguyên UI hiện tại)

| Thêm mới | File | Ghi chú |
|---|---|---|
| Thanh "Truy cập nhanh" | `components/HomeQuickStart.tsx` | Dưới carousel; sửa danh sách link ở đầu file. |
| Khối tab "Tài nguyên cho bạn" | `components/HomeTopics.tsx` + dựng dữ liệu trong `app/page.tsx` | Tab Tài liệu / Khóa học / Inventory, mỗi tab 3 mục đầu từ Sheet; tab chưa có dữ liệu thì ẩn; dùng được phím ←/→/Home/End. |
| Banner "Sự kiện nổi bật" | `components/HomeEventBanner.tsx` | Chỉ hiện khi tab Events có dòng đánh dấu `featured`. |
| Dải "Bắt đầu từ đâu" | `components/HomeStartHere.tsx` | 3 cột Học / Tra cứu / Làm, số đếm thật từ Sheet (khóa học, tài liệu, vật tư); cột có 0 mục thì ẩn. |
| Liên kết tiện ích trên cùng | `components/Header.tsx` | Tuyển sinh, Tài liệu, Khóa học, Liên hệ ở dải trên header (ẩn trên điện thoại). |
| Link "Bỏ qua tới nội dung" | `app/layout.tsx` | Hiện khi bấm Tab đầu tiên; mọi `<main>` có `id="main"`. |

CSS nằm cuối `app/home.css` và `app/globals.css`. Chưa làm: ô đăng ký nhận bản tin của footer st.com (cần nơi lưu email).

### Inventory kiểu bảng thông số, trang chi tiết vật tư, Đã lưu — 2026-10-08

Tham khảo cách Infineon tổ chức thông tin (bảng thông số, trang sản phẩm, bookmark). Không cần thêm tab hay cột nào trong Sheet, mọi thứ dùng các cột Inventory / Resources / Courses đang có.

| Tính năng | File | Ghi chú |
|---|---|---|
| Inventory dạng Thẻ / Bảng | `components/InventoryExplorer.tsx` | Nút chuyển Thẻ / Bảng; bấm tiêu đề cột để sắp xếp (tăng, giảm, về thứ tự Sheet); ô "Sắp xếp" cho dạng thẻ. |
| Bộ lọc nằm trong link | `InventoryExplorer.tsx` | `?q=&cat=&st=&view=table&sort=quantity:desc`. Gửi link là người nhận thấy đúng kết quả đã lọc. |
| So sánh 2–3 vật tư | `InventoryExplorer.tsx` | Ô "So sánh" ở mỗi thẻ/dòng, thanh nổi ở đáy màn hình, bảng so sánh Esc để đóng. |
| Trang chi tiết vật tư | `app/resources/inventory/[slug]/page.tsx` | Đường dẫn lấy từ tên (`/resources/inventory/stm32f103c8t6-type-c`), trùng tên thì thêm `-2`. Hiện thông số, datasheet, nơi mua, người đang dùng, vật tư cùng danh mục. |
| Tài liệu / khóa học liên quan | `lib/inventory.ts` (`relatedKeys`) | Tự nối theo mã linh kiện (từ có chữ số, từ 4 ký tự) trong model / tên vật tư với tiêu đề, mô tả, topic của Tài liệu và nội dung Khóa học. Muốn một tài liệu hiện ở vật tư nào thì ghi mã linh kiện đó vào tiêu đề, topic hoặc mô tả. |
| ★ Đã lưu | `lib/saved.ts`, `components/SaveButton.tsx`, `SavedList.tsx`, `app/saved/page.tsx` | Lưu trong trình duyệt (localStorage), không cần đăng nhập. Có ở vật tư (thẻ, bảng, chi tiết), tài liệu, khóa học. Link "★ Đã lưu (n)" ở dải trên cùng và menu điện thoại. |
| Đã học + tiến độ | `components/LessonDone.tsx` | Ô tròn ở mỗi bài có link của khóa học, thanh "Đã học x/y" theo từng nhánh. Cũng lưu trong trình duyệt. |

- Dùng chung: `lib/inventory.ts` (slug, trạng thái, từ khóa liên quan), `lib/format.ts` thêm `fold`, `slugify`.
- Xóa import `Link` thừa ở `components/HomeNews.tsx`.
- Chưa dọn: `components/SearchDialog.tsx`, `lib/search.ts`, `app/api/search/` đang không được dùng ở đâu.

## Bảo mật và sửa lỗi trùng lặp — 2026-10-09

Đợt này không làm thêm giao diện mới, chỉ siết bảo mật, sửa lỗi trùng lặp và hai lỗi UI. `tsc --noEmit` và `next build` chạy sạch; đã chạy thử bản production để kiểm tra /admin và header.

### Việc cần làm trên máy chủ / tài khoản (code không tự làm được)

- **Đổi (rotate) `SUPABASE_SERVICE_ROLE_KEY` trên Supabase** nếu key đó là key thật, rồi xoá `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ADMIN_SECRET` khỏi `.env.local` và khỏi Vercel. Code không còn dùng các biến này. Không gửi file `.env.local` (hoặc zip có chứa nó) cho ai.
- `ADMIN_PASSWORD` trên Vercel phải dài ít nhất 20 ký tự, nếu không `/admin` tự tắt (503).
- Nên bật **Vercel Firewall → Rate Limiting** cho đường dẫn `/admin`. Bộ chống dò mật khẩu trong code nằm trong bộ nhớ từng instance nên trên serverless chỉ chặn được phần nào.

### Sửa giao diện

- **Ảnh "Các hướng hoạt động" (`/admissions`)**: bấm vào ảnh là phóng to như Nghiên cứu và Tin tức. Dùng `PeekImage` trong `TrackCard` (`app/admissions/AdmissionsView.tsx`), CSS `.adm-peek*` trong `app/admissions/admissions.css`. Ảnh hiện đủ (contain) + nền mờ thay vì bị cắt. Bấm phần chữ của thẻ vẫn mở link như cũ.
- **Thẻ Inventory**: nhãn trạng thái ("Có người sử dụng"...) chuyển sang góc trái ảnh, nút ★ ở góc phải, hết đè nhau (`.inventory-image .inventory-status` trong `app/globals.css`). Nhãn dài bị cắt bằng dấu "…". Trang chi tiết vật tư: nhãn trạng thái dùng `position: static` trong `.item-status-row` để nằm đúng hàng.

### Bảo mật

| Hạng mục | File | Nội dung |
| --- | --- | --- |
| Header + CSP | `next.config.ts` | Thêm `Content-Security-Policy` (default/connect `'self'`, ảnh `https:`, `object-src 'none'`, `base-uri`, `form-action`, `frame-ancestors`, `frame-src` chỉ Spline), `Strict-Transport-Security` (chỉ khi chạy thật), `Cross-Origin-Opener-Policy`, `X-DNS-Prefetch-Control`, mở rộng `Permissions-Policy`. Script vẫn cần `'unsafe-inline'` vì Next.js chèn script nội tuyến; muốn bỏ phải dùng nonce (mọi trang thành render động, mất cache). Dev có thêm `'unsafe-eval'`. |
| Admin | `proxy.ts` | Sai 5 lần liên tiếp từ một IP thì khoá 15 phút (HTTP 429, có `Retry-After`). So mật khẩu qua SHA-256, không dừng sớm. Chạy thật mà `ADMIN_PASSWORD` thiếu hoặc dưới 20 ký tự thì `/admin` trả 503. Lần mở trang đầu (chưa gửi mật khẩu) không tính là sai. |
| Lọc link | `lib/safe-url.ts` (mới) | `safeHttpUrl` chỉ nhận `http(s)`, chặn `javascript:`, `data:`, link có `user@`, ký tự điều khiển, link quá dài. `safeHref` cho phép thêm đường dẫn nội bộ `/...` nhưng chặn `//evil.com`. |
| Link từ Sheet | `lib/sheet-data.ts` | Mọi cột url (Resources, datasheet, nơi mua, News, Events, Campus, Research, Admissions) đi qua `safeHttpUrl`. Dòng Resources có url không hợp lệ bị bỏ qua (dev có log). |
| Ảnh | `lib/photo-url.ts` | `resolvePhotoUrl` chặn scheme lạ, `//host`, `\`, `..`; tên file được mã hoá từng đoạn nên ký tự `#` `?` `%` trong tên không làm hỏng đường dẫn. |
| Tải Sheet | `lib/sheet-data.ts` (`fetchSheetRows`) | Chỉ nhận `https://` thuộc `docs.google.com`, `*.google.com`, `*.googleusercontent.com`; timeout 10 giây; giới hạn 5MB. Link khác bị từ chối kèm cảnh báo trong log. **Nếu dùng link CSV không phải Google thì phải sửa `SHEET_HOST` ở đầu hàm.** |
| Đã lưu ★ | `lib/saved.ts` | Dữ liệu `localStorage` được kiểm tra từng mục: bỏ mục hỏng, bỏ mục trùng `id`, cắt độ dài, tối đa 200 mục, `href` đi qua `safeHref`. |
| Spline | `app/research/ResearchExplorer.tsx` | `NEXT_PUBLIC_SPLINE_URL` chỉ được dùng khi là `https://*.spline.design/...`; iframe có `sandbox` và `referrerPolicy="no-referrer"`. |

### Sửa lỗi trùng lặp

- **Key React trùng**: `components/SearchDialog.tsx` (nhiều kết quả cùng link, ví dụ mọi Học viên đều trỏ `/schools`), `components/StudentsShowcase.tsx` (hai học viên cùng tên cùng trường), `app/news/NewsView.tsx` (cùng title + order). Đều thêm chỉ số vào key.
- **Mục trùng trong danh sách**: `app/api/search/route.ts` bỏ mục trùng (loại + link + tên); `app/sitemap.ts` bỏ URL trùng bằng `Set`.
- **Dòng trùng trong Google Sheet** (`lib/sheet-data.ts`, hàm `dropDuplicates` / `dedupeBy` ở `lib/safe-url.ts`, giữ dòng đầu tiên, dev có log số dòng bỏ):
  - Resources: cùng title + url.
  - Students: cùng trường + tên + ngành + khoa.
  - News: cùng section + title + date + url.
  - Events: cùng title + date + place + url.
  - Campus: cùng title + date + ảnh.
  - Inventory: **chỉ** gom dòng giống hệt ở mọi cột. Cùng tên nhưng khác số lượng, vị trí hoặc người dùng vẫn được giữ (là hai món khác nhau). Slug của hai món cùng tên vẫn là `ten`, `ten-2`.

### Kiểm tra sau khi deploy

1. Mở `/admin` không mật khẩu → hộp đăng nhập (401). Nhập sai 5 lần → 429.
2. Mở DevTools → Network, xem header của trang chủ có `Content-Security-Policy`. Nếu Console báo vi phạm CSP (ví dụ ảnh/iframe từ nguồn mới), thêm nguồn đó vào `csp` trong `next.config.ts`.
3. `/admissions`: bấm ảnh một hướng hoạt động → phóng to; bấm ra ngoài hoặc Esc để đóng.
4. `/resources/inventory`: thẻ có nhãn trạng thái ở góc trái, ★ ở góc phải.

### Chưa làm / lưu ý

- Chưa dùng nonce cho CSP (xem trên).
- Chống dò mật khẩu `/admin` chỉ là best-effort; cần Vercel Firewall để chặn tuyệt đối.
- Chưa có kiểm thử tự động; các thay đổi trên được kiểm bằng `tsc`, `next build` và chạy thử bản production.

## Giao diện bổ sung theo st.com — 2026-10-09

Tham khảo trang chủ st.com (không dùng logo/màu của ST). Không cần thêm tab hay cột trong Sheet. CSS mới nằm trong `app/extras.css` (nhập ở `app/layout.tsx`, sau `globals.css`). `tsc` và `next build` chạy sạch; chưa kiểm bằng mắt trên trình duyệt, nên sau khi chạy `npm run dev` hãy xem lại các điểm ở cuối mục này.

| Tính năng | File | Ghi chú |
|---|---|---|
| Ô tìm kiếm toàn trang (đã có code nhưng trước đây chưa gắn vào đâu và chưa có CSS) | `components/SearchDialog.tsx`, `components/SearchTrigger.tsx`, `components/Header.tsx` | Nút "Tìm kiếm" ở dải trên header (desktop) và nút kính lúp cạnh menu (từ 1020px trở xuống). Mở bằng nút, `Ctrl/⌘+K` hoặc phím `/`. Dữ liệu từ `/api/search`. |
| Chip lọc theo loại + số kết quả | `SearchDialog.tsx` | Tất cả / Trang / Tài liệu / Inventory / Khóa học / Tin tức / Sự kiện / Học viên, chỉ hiện loại có kết quả. |
| Lịch sử tìm kiếm, gợi ý, mục đã lưu | `SearchDialog.tsx`, `lib/search-history.ts` | Khi chưa gõ: "Tìm gần đây" (tối đa 8, lưu `localStorage`, xoá từng mục hoặc tất cả), "Gợi ý", và 4 mục ★ đã lưu gần nhất. |
| Bộ lọc Inventory kiểu product selector | `components/InventoryExplorer.tsx` | Thanh bên với nhóm Danh mục / Hãng / Trạng thái (tick nhiều ô; cùng nhóm = HOẶC, khác nhóm = VÀ), số kết quả cạnh mỗi ô, "Xem thêm", công tắc "Chỉ hiện món còn hàng", dải chip bộ lọc đang áp dụng, nút "Xóa tất cả". Trên điện thoại bộ lọc là ngăn kéo từ đáy. Link giữ bộ lọc: `?cat=A&cat=B&mk=Hãng&st=Trạng thái&stock=1`. Link cũ `?cat=...&st=...` vẫn chạy. |
| Thanh điều hướng trong trang | `components/PageSubNav.tsx` | Dính dưới header, làm sáng mục đang đọc khi cuộn. Đang dùng ở trang chi tiết vật tư (Tổng quan / Thông số / Tài liệu liên quan / Cùng danh mục); dùng lại ở trang khác bằng `<PageSubNav items={[{ id, label }]} />` rồi đặt `id` cho từng phần. |
| Nút "Sao chép link" | `components/CopyLink.tsx` | Ở trang chi tiết vật tư, cạnh Datasheet / Nơi mua / ★. |
| Sự kiện sắp tới dạng thẻ ngày | `components/HomeUpcomingEvents.tsx`, `app/page.tsx` | Trang chủ: khối ngày lớn + loại + nơi + giờ + tiêu đề. Chỉ hiện sự kiện từ hôm nay trở đi (giờ Việt Nam), ngày dạng `2026-10-13` hoặc `13/10/2026`. Không có sự kiện nào hợp lệ thì tự quay về danh sách cũ (`FeedList`). |
| Footer | `components/Footer.tsx` | Dải "Muốn cùng làm với CTIT?" (Tham gia CTIT, Lịch sự kiện), thêm cột Hỗ trợ, hàng liên kết cuối trang. Chưa làm ô nhận bản tin của st.com vì cần nơi lưu email. |

Cần xem lại bằng mắt: (1) nút tìm kiếm trên dải trên header có đủ chỗ không; (2) nút kính lúp cạnh menu ở 860–1020px; (3) thanh `PageSubNav` có dính đúng dưới header không; (4) màu chữ nút trong dải kêu gọi của footer (nền tối); (5) ngăn kéo bộ lọc Inventory trên điện thoại.

### Ô "Khám phá CTIT" có ảnh tự đổi — 2026-10-09

Trang chủ, khối "Khám phá CTIT" (8 ô): mỗi ô hiện ảnh của chính mục đó và tự đổi ảnh mỗi vài giây.

| Ô | Ảnh lấy từ |
|---|---|
| 01 Giới thiệu | Logo (`logo` trong tab About; trống thì dùng `/images/About/logo.png`), hiện đủ trên nền sáng |
| 02 Tuyển sinh | Mọi ảnh của các "hướng hoạt động" trong tab Admissions |
| 03 Trường & Khoa | Tạm chưa có ảnh (không dùng ảnh học viên), ô hiện số thứ tự. Khi có ảnh khác, điền đường dẫn vào `"/schools": pics([...])` trong `app/page.tsx` |
| 04 Nghiên cứu | Mọi ảnh trong tab Research (hướng, dự án, thành tích, ấn phẩm) |
| 05 Tin tức / 06 Sự kiện / 08 Khuôn viên | Mọi ảnh trong tab News / Events / Campus |
| 07 Tài nguyên | Ảnh bìa Tài liệu + ảnh Khóa học + ảnh Inventory |

- Code: `components/HomeBento.tsx` (client, nhận `images` từ `app/page.tsx`), CSS ở cuối `app/extras.css`.
- Cách chạy: đổi ảnh mỗi 3,8–5,2 giây, các ô so le nhau (không đổi cùng lúc), chuyển bằng hiệu ứng mờ dần, có chấm báo vị trí (tối đa 8 chấm) và số thứ tự ở góc. Ảnh kế tiếp được tải trước. Mỗi ô lấy tối đa 24 ảnh, bỏ ảnh trống và trùng.
- Dừng đổi khi bật "giảm chuyển động" của hệ điều hành hoặc khi tab đang ẩn. Ảnh lỗi (sai tên, chưa bỏ file vào folder) tự bị loại khỏi vòng xoay. Mục nào không có ảnh nào thì hiện số thứ tự như cũ.
- Muốn đổi tốc độ: sửa `3800` và `2200` trong `TileMedia`. Muốn mục nào hiện đủ ảnh thay vì cắt: thêm vào `CONTAIN`.
- Đã kiểm: `tsc`, `next build`, và HTML trang chủ (ô Giới thiệu ra logo). Chưa kiểm với dữ liệu Sheet thật và bằng mắt trên trình duyệt.

### Trang Đã lưu, tiến độ Khóa học, bộ lọc Tài liệu — 2026-10-09

Không cần thêm cột hay tab trong Sheet. CSS mới ở cuối `app/extras.css`. Đã kiểm `tsc`, `next build` và các trang trả về 200; chưa thử bằng mắt với dữ liệu thật.

**Trang `/saved`** (`components/SavedList.tsx`, `lib/saved.ts`)
- Ô tìm trong danh sách đã lưu, chip lọc theo nhóm (Vật tư / Tài liệu / Khóa học) có số lượng, sắp xếp (mới lưu trước, cũ nhất, A → Z).
- Mỗi mục hiện "Lưu hôm nay / 3 ngày trước...".
- "Chọn nhiều" để bỏ lưu hàng loạt; "Sao chép danh sách" và "Tải về (.md)" (link nội bộ được đổi thành link đầy đủ để gửi cho người khác).
- Bỏ lưu / Xóa tất cả không còn hộp xác nhận mà có thanh **Hoàn tác** 8 giây. Hoàn tác trả mục về đúng thời điểm lưu cũ.
- `useSaved` thêm `removeMany` và `restore`; `useDone` thêm `setMany`.

**Khóa học** (`components/CourseProgressUI.tsx`)
- Trang danh sách: dải "Tiến độ của bạn" (tổng bài đã học, số khóa đã xong) kèm nút **Học tiếp** tới khóa đang học dở; mỗi thẻ khóa có thanh tiến độ nhỏ, đủ bài thì hiện "✓ Hoàn thành". Chưa học bài nào thì các phần này không hiện.
- Trang một khóa: nút chính đổi theo tiến độ (Bắt đầu học → **Học tiếp: <tên bài chưa xong>** → Học lại từ đầu); thêm "Đánh dấu cả nhánh đã học", "Đặt lại tiến độ" và lời chúc khi xong nhánh.
- Tiến độ vẫn lưu trong trình duyệt (`ctit-done`), id bài vẫn là `<khóa>:<nhánh>:<số bài>`, nên dữ liệu cũ dùng tiếp được.

**Tài liệu** (`components/ResourceExplorer.tsx`, `components/FacetGroup.tsx`)
- Bộ lọc thanh bên kiểu product selector như Inventory: Lĩnh vực / Loại / Cấp độ / Nguồn (nhóm nào chỉ có một giá trị thì tự ẩn), tick nhiều ô, số kết quả cạnh mỗi ô, chip bộ lọc đang áp dụng, ngăn kéo trên điện thoại.
- Thêm công tắc "Chỉ hiện mục đã lưu ★" và sắp xếp (mặc định / A → Z / Z → A). Lĩnh vực vẫn giữ đúng thứ tự trong Sheet.
- Link giữ bộ lọc: `?q=&cat=&type=&lv=&src=&saved=1&sort=az`.
- `FacetGroup` được tách ra dùng chung cho Inventory và Tài liệu.

### Gọn lại và giảm độ phức tạp thuật toán — 2026-10-11

Không đổi giao diện hay hành vi; đã đối chiếu kết quả cũ và mới. Số đo chạy bằng Node trên dữ liệu ngẫu nhiên (máy tạm, chỉ để so sánh tương đối).

| Chỗ | Trước | Sau | Kết quả |
|---|---|---|---|
| Bộ lọc facet của Inventory và Tài liệu (`lib/facets.ts`, mới) | Mỗi nhóm lọc lại toàn bộ dữ liệu để đếm: O(N·F²); hai explorer chép lại cùng một đoạn logic | Một lượt duyệt O(N·F): mỗi món đếm số nhóm nó "trượt", trượt 0 thì vào kết quả và mọi số đếm, trượt đúng 1 nhóm thì chỉ tính cho nhóm đó. Đổi cách sắp xếp không phải lọc lại. Đọc/ghi link và tick/bỏ tick cũng dùng chung | Đối chiếu 300 bộ dữ liệu ngẫu nhiên: 0 chỗ lệch. Nhanh khoảng 2 lần (N=20.000: 4,3 ms → 1,9 ms). Hai file explorer ngắn đi, thêm bộ lọc mới chỉ cần khai báo getter |
| Nút ★ và ô "đã học" (`lib/saved.ts`) | Mỗi nút tự đọc và kiểm tra lại cả danh sách `localStorage`: n nút × m mục mỗi lần đổi; `has` là hàm mới mỗi lần render nên các `useMemo` dùng nó bị tính lại | Nhớ kết quả phân tích của chuỗi gần nhất, cả trang chỉ phân tích một lần mỗi khi dữ liệu đổi; `has` ổn định (`useCallback`); bỏ lưu / hoàn tác / đánh dấu dùng chung một đường | O(n·m) → O(m) mỗi lần đổi |
| Tìm kiếm (`lib/search.ts`) | Mỗi phím gõ bỏ dấu lại tất cả mục (NFD + regex), `indexOf` trong hàm sắp xếp | Bỏ dấu một lần cho mỗi mục (`WeakMap`), thứ hạng loại tra bằng `Map` | 5.000 mục: 10,6 ms → 1,8 ms mỗi lần gõ, kết quả giống hệt. Với dữ liệu thật vài trăm mục thì cả hai đều chưa đáng kể |
| `components/SavedList.tsx` | Nhóm theo loại bằng lọc lại cho từng loại | Gom một lượt bằng `Map` | O(N·K) → O(N) |
| `lib/sheet-data.ts` (`checkLocalImages`, chỉ chạy khi dev) | Tìm file bằng quét mảng cho từng ảnh | Tra bằng `Set` và `Map` | O(ảnh × file) → O(ảnh + file) |

Muốn thêm một nhóm lọc mới cho Inventory hoặc Tài liệu: thêm khoá vào `FACET_KEYS`, một dòng vào `GET`, `TITLE`, `PARAM` ở đầu file explorer, rồi thêm giá trị vào `options`.

### Sự kiện: Thêm vào lịch và Lịch tháng — 2026-10-12

Không cần thêm cột trong Sheet. Dùng các cột sẵn có của tab Events: `date` (YYYY-MM-DD), `time`, `place`, `summary`, `url`.

- **Thêm vào lịch** (`components/AddToCalendar.tsx`, `lib/calendar.ts`): ở sự kiện nổi bật, từng dòng "Lịch sắp tới" và trong Lịch tháng (chỉ sự kiện từ hôm nay trở đi). Hai cách: link **Google Calendar** (mở tab mới) và tải file **.ics** (Apple, Outlook...).
  - Giờ lấy từ cột `time` bằng chữ tự do: `18:00 - 20:00`, `18h30–20h`, `9 giờ`. Chỉ ghi một giờ thì mặc định kéo dài 2 tiếng; ghi qua nửa đêm (`22:00 - 01:00`) thì kết thúc sang hôm sau; không có giờ (hoặc chữ như "Cả ngày") thì thành sự kiện cả ngày.
  - Giờ được hiểu là giờ Việt Nam (UTC+7) và đổi sang UTC để lịch của người xem ở múi giờ nào cũng hiện đúng. Sự kiện chưa có ngày dạng `YYYY-MM-DD` thì không hiện nút.
  - File .ics đã escape ký tự đặc biệt, xuống dòng đúng chuẩn (CRLF, cắt dòng theo byte để không vỡ chữ có dấu).
- **Lịch tháng** (`components/EventsMonth.tsx`): nút chuyển **Danh sách | Lịch tháng** ở đầu trang `/events` (chỉ hiện khi có ít nhất một sự kiện có ngày hợp lệ). Lưới bắt đầu từ Thứ hai, có nút tháng trước / sau / Hôm nay, ô có sự kiện hiện tên (trên điện thoại chỉ hiện chấm). Bấm một ngày để xem chi tiết, chưa chọn ngày thì liệt kê mọi sự kiện của tháng. Mở ở tháng hiện tại; nếu tháng đó không có sự kiện thì nhảy tới sự kiện sắp tới gần nhất. Vẫn tuân theo bộ lọc nhãn ở trên. Sự kiện chưa có ngày chỉ nằm ở chế độ Danh sách.
- Đã kiểm: `lib/calendar.ts` bằng 22 phép thử (giờ, múi giờ, qua nửa đêm, cả ngày, gấp dòng, lưới tháng nhuận); HTML của hai component bằng 15 phép thử với dữ liệu mẫu; `tsc`, `next build`. Chưa xem bằng mắt trên trình duyệt và chưa thử nhập file .ics vào ứng dụng lịch thật.

### Cách cập nhật khi giải nén đè, và cách biết đang chạy đúng bản mới — 2026-10-12

Zip cập nhật chỉ có **mã nguồn** (khoảng 11 MB, phần lớn là ảnh trong `public/images`). Không có `node_modules`, `.next` và `.env.local`, nên đè lên không làm mất dữ liệu cấu hình của bạn.

1. Giải nén đè sao cho các thư mục `app/`, `components/`, `lib/`, `data/` của dự án được thay bằng bản mới (đừng để thành `CTIT/CTIT/...`). Giữ nguyên `.env.local` của bạn.
2. **Xóa thư mục `.next`.** Nếu chạy bằng `npm start` mà chưa build lại thì vẫn đang chạy bản cũ nằm trong `.next`.
3. `npm install`, rồi `npm run dev` (hoặc `npm run build` rồi `npm start`).
4. Mở trang chủ, kéo xuống chân trang: dòng nhỏ **"v2026.10.12 · dựng <giờ> · Có gì mới"**. Thấy dòng này là đang chạy bản mới; bấm vào để xem trang `/changelog`. Không thấy nghĩa là trình duyệt đang nối vào bản cũ.
5. Thêm một dấu hiệu nhìn là thấy ngay: **thanh màu chạy ở mép trên màn hình** mỗi khi bấm chuyển trang (`components/RouteProgress.tsx`).

Mỗi lần cập nhật hãy thêm một mục lên đầu `data/changelog.ts`: số phiên bản ở chân trang và trang "Có gì mới" tự đổi theo.

Ngoài ra: dòng CSP `upgrade-insecure-requests` giờ chỉ bật khi chạy trên Vercel (`process.env.VERCEL`). Trước đó chạy `npm start` ở `http://localhost` có thể làm vỡ CSS/JS trên một số trình duyệt vì bị ép sang https.

### UX: thông báo, quay lại giữ bộ lọc, gợi ý khi rỗng, ngăn kéo bộ lọc, bàn phím — 2026-10-12

Rà các luồng tìm tài liệu, tra vật tư, lưu mục và tìm kiếm, sửa những chỗ dùng chưa tiện:

| Vấn đề | Cách xử lý | File |
|---|---|---|
| Bấm ★ chỉ thấy sao đổi màu, không biết đã lưu ở đâu, bấm nhầm không gỡ được | Thông báo nhỏ "Đã lưu “…”" kèm **Hoàn tác** và link **Xem Đã lưu** (5 giây, trình đọc màn hình đọc được) | `components/ToastHost.tsx`, `lib/toast.ts`, `components/SaveButton.tsx` |
| Từ trang chi tiết vật tư bấm "← Inventory" thì mất bộ lọc đang đặt | Nhớ bộ lọc của danh sách trong tab (sessionStorage); nút quay lại về đúng bộ lọc, ghi chú "· giữ bộ lọc". Dùng chung cho mọi trang con qua `PageHero` | `lib/list-memory.ts`, `components/BackLink.tsx`, `components/PageHero.tsx` |
| Lọc ra rỗng chỉ báo "thử xoá bộ lọc" | Gợi ý từng bộ lọc kèm số kết quả sẽ có nếu bỏ nó ("Bỏ **Hãng: ST** · 12 kết quả"), cộng nút bỏ từ khóa / còn hàng / đã lưu và Xóa tất cả. Số kết quả lấy sẵn từ bước đếm facet (không tính thêm), đã đối chiếu 694 trường hợp: lệch 0 | `components/EmptyResults.tsx`, hai explorer |
| Bộ lọc trên điện thoại không đóng được bằng cách bấm ra ngoài, trang phía sau vẫn cuộn | Nền mờ bấm để đóng, phím Esc, khóa cuộn trang khi ngăn kéo mở | `components/FilterDrawerBackdrop.tsx` |
| Ô tìm kiếm: Tab chạy ra trang phía sau, đóng xong mất vị trí bàn phím, không biết tìm tiếp ở đâu | Tab chạy vòng trong hộp thoại, đóng thì trả con trỏ về nút đã mở, thêm dòng "Tìm “…” trong: Tài liệu · Vật tư" (mở sẵn từ khóa, vì hai trang đọc `?q=`) | `components/SearchDialog.tsx` |
| Số kết quả đổi khi lọc nhưng trình đọc màn hình không biết | Số kết quả của Inventory và Tài liệu có `role="status"` | hai explorer |

Đã kiểm: `tsc`, `next build`, HTML render của `EmptyResults` / `ToastHost` / `SaveButton` / `FilterDrawerBackdrop`, và đối chiếu số gợi ý bỏ lọc. Chưa thử bằng tay trên trình duyệt (thông báo ★, ngăn kéo trên điện thoại, vòng Tab trong ô tìm kiếm); mục "Kiểm tra bằng tay" dưới đây:

1. Bấm ★ ở một thẻ vật tư: thanh đen ở đáy hiện "Đã lưu …", bấm Hoàn tác thì sao tắt.
2. Ở `/resources/inventory` tick vài bộ lọc, mở một món, bấm "← Inventory": về đúng bộ lọc đó.
3. Gõ từ khóa không có kết quả hoặc tick hai nhóm không giao nhau: thấy các nút "Bỏ …· N kết quả".
4. Thu hẹp cửa sổ dưới 960px, mở "Bộ lọc": bấm nền mờ hoặc Esc thì đóng.
5. `Ctrl+K`, bấm Tab liên tục: con trỏ không ra khỏi hộp thoại; Esc đóng thì con trỏ về nút Tìm kiếm.

### UX (đợt 2): tiêu đề trang, thông báo khi trống dữ liệu, bàn phím và cảm ứng — 2026-10-12

| Vấn đề thấy khi rà | Cách xử lý | File |
|---|---|---|
| 9 chỗ (Sự kiện, Tin tức, Tuyển sinh, Học viên, Khuôn viên, Giới thiệu, Tổng quan, Tài liệu, danh sách tin/sự kiện ở trang chủ) hiện câu "Kiểm tra biến môi trường ... trong `.env.local`" cho cả người xem khi Sheet trống hoặc tải lỗi | `NoData` / `NoDataMessage`: khi `npm run dev` vẫn nói rõ biến nào cần kiểm tra; ở production chỉ hiện "Nội dung … đang được cập nhật. Bạn quay lại sau nhé." kèm nút về Trang chủ / Tài nguyên | `components/NoData.tsx` và các component trên |
| 10 trong 18 trang không có tiêu đề riêng, tab trình duyệt trang nào cũng là "CTIT" | Tiêu đề và mô tả lấy từ `nav` trong `lib/site-config.ts` (`lib/page-meta.ts`), layout gắn hậu tố " · CTIT" (ví dụ "Sự kiện · CTIT"). Tài liệu và Inventory có tiêu đề riêng | `lib/page-meta.ts`, `app/layout.tsx`, `app/*/page.tsx` |
| Trang 404 không có cách tìm tiếp | Thêm nút Tìm kiếm (Ctrl+K) | `app/not-found.tsx` |
| Nhiều nút không có viền focus khi bấm Tab | Viền focus mặc định cho mọi phần tử bấm được (độ ưu tiên 0 nên kiểu riêng của từng thành phần vẫn thắng); ô nhập của hộp tìm kiếm có gạch chân khi focus | `app/extras.css` |
| Nút và ô lọc nhỏ khó bấm trên điện thoại | Với màn hình cảm ứng (`pointer: coarse`) vùng bấm tối thiểu 44px cho chip, ô lọc, nút ★, nút điều hướng lịch | `app/extras.css` |
| Cuộn mượt khi máy bật "giảm chuyển động" | Tắt cuộn mượt trong trường hợp đó | `app/extras.css` |

Đã kiểm trên bản `next start`: tiêu đề của cả 15 địa chỉ, 6 trang không còn lộ câu kỹ thuật, 404 có nút Tìm kiếm; `NoData` ở cả hai chế độ (dev hiện tên biến, production hiện câu thân thiện). Chưa kiểm bằng tay: vòng focus và vùng bấm 44px trên thiết bị cảm ứng thật.

Chưa làm: phóng to ảnh (`PeekImage`) chỉ dùng được bằng chuột, vì ảnh nằm trong thẻ link, thêm nút bấm bên trong sẽ thành "nút trong link". Người dùng bàn phím vẫn mở được bài/link của thẻ.

### UX (đợt 3), làm theo tài liệu tìm trên mạng — 2026-10-12

Nguồn tham khảo: Baymard Institute (UX bộ lọc), Algolia (UX tìm kiếm và bộ lọc), Contentsquare (bộ lọc trên điện thoại), W3C WCAG 2.2 (tiêu chí 2.4.11 Focus Not Obscured), các bài về khôi phục vị trí cuộn trong trang dựng bằng JavaScript.

| Khuyến nghị | Trạng thái | Việc làm |
|---|---|---|
| Bấm Back từ trang chi tiết thì bộ lọc vẫn còn | Đã có từ trước | Bộ lọc nằm trong link (`?cat=...`), `BackLink` nhớ link danh sách |
| Có số kết quả, bỏ lọc dễ dàng, hiện bộ lọc đang áp dụng | Đã có | Số kết quả cạnh mỗi ô, chip bộ lọc, nút Xóa tất cả |
| Nút Bộ lọc trên điện thoại phải luôn thấy được khi cuộn | **Mới** | Thanh "N mặt hàng · Bộ lọc (n) · Sắp xếp" dính dưới header ở màn hình ≤ 960px (`app/extras.css`) |
| Ngăn kéo bộ lọc có nút "Xem N kết quả" | **Mới** | Nút dính ở cuối ngăn kéo, `components/InventoryExplorer.tsx`, `ResourceExplorer.tsx` |
| Quay lại danh sách phải về đúng vị trí cuộn | **Mới** | `lib/scroll-memory.ts`: nhớ vị trí lúc bấm sang trang khác, trả lại khi quay về bằng nút Back của trình duyệt hoặc nút "← Danh sách". Đợi danh sách lọc xong mới cuộn (trình duyệt tự khôi phục sẽ cuộn sớm và kẹt ở đáy trang còn ngắn). Chỉ dùng cho đúng bộ lọc cũ, còn mới trong 30 phút, dùng một lần; vào từ menu thì vẫn ở đầu trang |
| Thanh dính không được che phần tử đang focus bằng bàn phím (WCAG 2.2, 2.4.11) | **Mới** | `components/StickyOffsets.tsx` đo chiều cao header thật vào `--header-h`; `PageSubNav` báo `--subnav-h`; `scroll-padding-top` tính từ hai biến này (trước đó là số cứng 130px) và thêm `scroll-padding-bottom` cho thanh thông báo ở đáy |

Đã kiểm: `tsc`, `next build`, các trang trả 200, và 9 phép thử logic khôi phục cuộn (vào mới, bấm "← Danh sách", nút Back, khác bộ lọc, quá 30 phút, dữ liệu hỏng...). Chưa thử trên trình duyệt và điện thoại thật: cảm giác thanh dính, nút "Xem N kết quả", vị trí cuộn sau khi quay lại.

Chưa làm: tài liệu cho rằng nên ẩn hẳn ô lọc không có kết quả; hiện đang làm mờ và khóa ô đó (vẫn thấy được còn bao nhiêu mục ở nhóm khác), có thể đổi nếu cần. Trên điện thoại, một số nguồn khuyên bộ lọc chỉ áp dụng khi bấm "Xem N kết quả" thay vì cập nhật ngay; hiện tại vẫn cập nhật ngay vì danh sách ngắn và chạy trên máy người dùng.

### Sửa menu chính: gạch chân bị dính nhau — 2026-10-13

Lỗi: đang ở trang Sự kiện, rê chuột vào Tài nguyên thì hai mục cùng bị gạch chân và nối liền thành một vệt dài (các mục menu dính sát nhau, gạch là viền dưới của cả ô link). Riêng "Tài nguyên" còn có thêm một gạch thứ hai nằm thấp hơn.

Cách sửa (`app/globals.css`): mọi mục menu, kể cả "Tài nguyên", dùng chung một kiểu gạch chân là `::after`, thụt vào đúng bằng khoảng đệm (`--nav-pad`, 12px; 9px ở màn hình ≥ 1021px) nên chỉ dài bằng chữ và luôn có khe hở giữa hai mục. Đã bỏ viền dưới và `span::after` cũ.

Đã kiểm bằng trình duyệt thật (Chromium không giao diện): dựng lại đúng tình huống lỗi trước và sau khi sửa; menu không tràn ngang ở 1021, 1100, 1280 và 1440px.

## Kiểm thử, CI và vận hành — 2026-10-13

Đợt này làm hai bước đầu trong lộ trình "đủ full stack": (1) kiểm thử + lint + CI, (2) chịu lỗi cho tầng dữ liệu và theo dõi tình trạng. Chưa có cơ sở dữ liệu hay tài khoản.

**Sau khi giải nén đè, chạy `npm install`** (có thêm gói dev: Vitest, Playwright, ESLint, axe-core; `package-lock.json` đã đổi).

### Lệnh

| Lệnh | Việc |
|---|---|
| `npm run typecheck` | Kiểm tra kiểu TypeScript |
| `npm run lint` | ESLint (cấu hình `eslint.config.mjs`, dựa trên `eslint-config-next`) |
| `npm test` | 185 bài đơn vị (Vitest), chạy dưới 3 giây |
| `npm run build` rồi `npm run test:e2e` | 45 bài trên trình duyệt thật (Playwright) × 2 cỡ màn hình (máy tính, Pixel 7) = 90 lượt, trong đó 15 lượt bỏ qua có chủ đích (bài chỉ dành cho máy tính hoặc chỉ dành cho điện thoại) |
| `npm run check:secrets` | Quét khóa bí mật trong mã nguồn |
| `npm run ci` | typecheck + lint + test + quét khóa + build, giống bước đầu của CI |

E2E chạy trên bản build (`next start`), **không cấu hình Google Sheet nào** và đặt `ADMIN_PASSWORD` riêng (xem `playwright.config.ts`), nên không phụ thuộc mạng hay dữ liệu thật và không bị `.env.local` làm lệch. Lần đầu chạy máy mới: `npx playwright install chromium`. Nếu mạng không tải được trình duyệt, đặt `PW_CHROMIUM_PATH` trỏ tới một Chromium có sẵn.

### Các bài kiểm thử đang bảo vệ điều gì

| Nhóm | File | Bảo vệ |
|---|---|---|
| Bộ lọc facet | `tests/unit/facets.test.ts` | Thuật toán một lượt cho đúng kết quả và số đếm như cách lọc từng nhóm (300 bộ dữ liệu ngẫu nhiên) |
| Lịch | `tests/unit/calendar.test.ts` | Đọc giờ từ chữ tự do, đổi giờ Việt Nam sang UTC, qua nửa đêm, sự kiện cả ngày, escape và gấp dòng file .ics, lưới tháng |
| Link an toàn | `tests/unit/safe-url.test.ts` | Chặn `javascript:`, `data:`, `//host`, `user@host`, `..` trong link và đường dẫn ảnh |
| Tìm kiếm | `tests/unit/search.test.ts` | Tìm không dấu ra có dấu, đủ mọi từ, thứ hạng |
| Khôi phục cuộn | `tests/unit/scroll-memory.test.ts` | Chỉ trả vị trí khi thật sự quay lại, đúng bộ lọc, còn mới, dùng một lần, chịu được dữ liệu hỏng |
| Tầng đọc Sheet | `tests/unit/sheet-source.test.ts` | Chặn link không phải Google, lỗi thì dùng bản tốt gần nhất, phục hồi khi Sheet trở lại, giới hạn dung lượng, `/api/health` không lộ link |
| Tầng dữ liệu đầu-cuối | `tests/unit/sheet-data.test.ts` | CSV giả như Sheet trả về: bỏ link nguy hiểm, bỏ dòng trùng, đọc ô có dấu phẩy |
| Component | `tests/unit/components.test.tsx` | Gợi ý khi lọc rỗng, câu thân thiện ở production (không lộ `.env.local`), nút thêm vào lịch, lịch tháng, số phiên bản ở chân trang |
| Khung trang | `tests/e2e/shell.spec.ts` | Tiêu đề từng trang, 404, không tràn ngang ở cả hai cỡ màn hình |
| Tìm kiếm | `tests/e2e/search.spec.ts` | Mở bằng nút và Ctrl+K, Tab chạy vòng, Esc đóng và trả con trỏ, lịch sử tìm kiếm, lối tìm tiếp |
| Menu | `tests/e2e/nav.spec.ts` | Lỗi gạch chân dính nhau không quay lại; menu không tràn ở 1021px |
| Bảo mật | `tests/e2e/security.spec.ts` | CSP và header, `/admin` (401, đúng mật khẩu, khóa 429 sau 5 lần sai), `/api/health`, `/api/search` |
| Khả năng truy cập | `tests/e2e/a11y.spec.ts` | Quét axe-core (WCAG 2.x A/AA) 7 trang, chặn lỗi "serious" và "critical" |

Mỗi nhóm được kiểm tra bằng cách **phá code cố ý** (bỏ bản dữ liệu dự phòng, đếm facet sai, cho `javascript:` lọt qua, đổi múi giờ, cho gạch chân dài hết ô) để chắc bài kiểm thử thật sự báo lỗi; cả năm lần đều bị bắt.

### Tìm ra khi viết kiểm thử (đã sửa)

- Phím **Esc chỉ đóng được ô tìm kiếm khi con trỏ đang ở ô nhập**; ở nút khác không có tác dụng. Giờ xử lý ở cấp cả hộp thoại.
- Ba lỗi thật do ESLint chỉ ra: component khai báo bên trong lúc render (`HomeNews`), ghi vào ref lúc render (`HomeBento`), `aria-pressed` trên `role="gridcell"` sai chuẩn (`EventsMonth`, đã đổi sang nhóm nút bấm thường).

### Chịu lỗi cho dữ liệu và `/api/health`

- `lib/sheet-source.ts` (tách khỏi `sheet-data.ts`): mỗi lần tải Sheet có kết quả `ok`, `stale`, `failed`, `rejected` hoặc `missing`. Khi lần tải mới **lỗi (HTTP lỗi, quá thời gian, quá lớn) mà trước đó đã tải được**, trang dùng bản tốt gần nhất (`stale`) thay vì trống. Bản này nằm trong bộ nhớ của tiến trình, nên trên Vercel chỉ giữ khi instance còn sống: đây là lớp đỡ thêm, không thay cho bộ đệm 60 giây của Next.js. Lỗi tải giờ cũng được ghi log ở production (trước đây im lặng).
- `GET /api/health`: tải thử từng Sheet đã cấu hình (kết quả đệm 60 giây nên gọi dồn dập cũng chỉ tải tối đa mỗi phút một lần). `200 ok` mọi Sheet tải được hoặc chưa cấu hình; `200 degraded` có Sheet đang dùng bản cũ; `503 down` có Sheet lỗi hẳn. Không trả về link hay nội dung, chỉ trạng thái tổng và phiên bản. Xem chi tiết từng tab tại `/admin/health` (cần mật khẩu). Trỏ UptimeRobot / Better Stack vào `/api/health` để được báo khi Sheet hỏng.

### CI

`.github/workflows/ci.yml`: mỗi lần đẩy lên `main` hoặc mở pull request chạy typecheck, lint, test đơn vị, build, rồi E2E; lỗi thì lưu báo cáo Playwright 7 ngày.

### Quyết định và giới hạn

- ESLint: hai quy tắc để mức **cảnh báo** thay vì lỗi, có ghi lý do trong `eslint.config.mjs`: `react-hooks/set-state-in-effect` (nhiều component cố ý đọc link/`localStorage` sau khi trang hiện ra để tránh lỗi hydration; hiện còn 9 chỗ) và `@next/next/no-img-element` (ảnh lấy từ Google Drive theo link trong Sheet). Hiện 0 lỗi, 22 cảnh báo.
- Kiểm tra axe-core ở E2E tắt hiệu ứng hiện dần (`reducedMotion`) vì đo màu lúc phần tử còn nửa trong suốt cho kết quả giả. Axe chỉ phát hiện được một phần lỗi truy cập; vẫn cần thử bằng tay với bàn phím và trình đọc màn hình.
- Chưa có test cho các thành phần cần dữ liệu Sheet thật (ngăn kéo bộ lọc, ★ và Hoàn tác, tiến độ khóa học) ở mức E2E vì E2E cố ý chạy không có Sheet. Muốn thêm: dựng một Sheet thử hoặc một máy chủ CSV giả và đặt `*_SHEET_CSV_URL` trỏ vào (hiện bị chặn bởi danh sách tên miền Google cho phép).
- Lần chạy E2E trong môi trường tạo ra bản này dùng Chromium có sẵn qua `PW_CHROMIUM_PATH`; CI trên GitHub dùng trình duyệt cài bằng `playwright install`. Workflow CI **chưa được chạy thật trên GitHub** (không có quyền ở đây), chỉ các lệnh bên trong nó đã được chạy.

## Giám sát và vệ sinh bảo mật — 2026-10-14

Hai gói đầu trong danh sách khoảng trống kiến trúc: (1) giám sát, (2) vệ sinh bảo mật. Hướng dẫn vận hành chi tiết nằm trong `docs/runbooks/` (`monitoring.md`, `secret-rotation.md`) và `SECURITY.md`.

### Phát hiện quan trọng nhất: Next.js 16.2.9 có 17 lỗ hổng đã công bố

`npm audit` cho thấy `next@16.2.9` (bản dự án đang ghim) nằm trong vùng ảnh hưởng của 17 thông báo bảo mật, gồm **3 mức critical** (thực thi mã từ xa liên quan API tối ưu ảnh và `next/og`), nhiều mức high (giả mạo yêu cầu phía server, vượt qua proxy trong một cấu hình Turbopack) và các lỗi đầu độc cache trang SSG/ISR. Đã nâng lên **`next@16.4.0`** (ghim chính xác, cùng dòng 16, không phải nâng cấp lớn): gói chạy thật **0 lỗ hổng**.

Nâng cấp đã được kiểm chứng bằng toàn bộ bộ kiểm thử: typecheck, lint, bài đơn vị, build, và E2E (kể cả bài `/admin` khóa sau 5 lần sai); lần chạy trên bản 16.4.0: 58 lượt pass, 0 lỗi. Mức độ ảnh hưởng thực tế với dự án này khá thấp vì không dùng `next/image` hay `next/og`, nhưng vẫn nên ở bản đã vá.

Còn 5 cảnh báo mức high **chỉ nằm trong công cụ dev** (chuỗi `eslint-config-next` → `braces`, lỗi dùng hết bộ nhớ khi xử lý chuỗi đặc biệt). Chúng không được đưa vào bản chạy thật và chỉ chạy trên máy lập trình khi lint chính mã của mình, nên chấp nhận; CI kiểm tra riêng gói chạy thật (`npm audit --omit=dev`). Bản sửa mà `npm audit` đề nghị là hạ xuống `eslint-config-next@14`, không nên làm theo.

### Giám sát

| Việc | Cách | File |
|---|---|---|
| Biết lỗi phía máy chủ | Next gọi `onRequestError` khi một yêu cầu lỗi: ghi nhật ký JSON `"event":"server_error"` (không kèm tiêu đề, cookie, tham số link) và báo ra kênh cảnh báo | `instrumentation.ts` |
| Biết lỗi phía trình duyệt | Lỗi JavaScript chưa xử lý, lời hứa bị từ chối, và lỗi hiển thị trang (`app/error.tsx`, `app/global-error.tsx`) gửi về `/api/report`. Bỏ qua lỗi không phải của site (ResizeObserver, tải chunk lỗi sau khi vừa cập nhật), tối đa 5 báo cáo mỗi lần mở trang, cùng lỗi chỉ báo một lần | `lib/report-client.ts`, `components/ErrorReporter.tsx`, `app/api/report/route.ts` |
| Cảnh báo chủ động | `ALERT_WEBHOOK_URL` (Discord hoặc Slack). Cùng lỗi tối đa một lần mỗi 15 phút, tối đa 20 tin mỗi giờ; URL phải là https và không phải địa chỉ nội bộ | `lib/alert.ts` |
| Tự báo khi Google Sheet hỏng | `/api/health` gửi cảnh báo khi trạng thái là `degraded` hoặc `down`; công cụ giám sát bên ngoài gọi định kỳ vào đây sẽ vừa biết trang chết vừa kích hoạt cảnh báo | `app/api/health/route.ts` |
| Kiểm tra kênh cảnh báo | Nút "Gửi cảnh báo thử" ở `/admin` (cần mật khẩu và kiểm tra cùng nguồn gốc để chống CSRF) | `app/admin/test-alert/route.ts`, `components/AdminMonitoring.tsx` |
| Tốc độ người dùng thật | Vercel Speed Insights, chỉ nạp khi chạy trên Vercel (không cookie) | `app/layout.tsx` |
| Nhật ký có cấu trúc | Một dòng JSON mỗi sự kiện, cắt chuỗi dài, để tìm trong Vercel Logs | `lib/log.ts` |

`/api/report` là điểm công khai nên phòng thủ nhiều lớp: chỉ nhận cùng nguồn gốc (`Origin`, `Sec-Fetch-Site`), tối đa 4 KB, kiểm tra từng trường, 20 báo cáo mỗi 10 phút mỗi IP, và phần cảnh báo ra ngoài có giới hạn riêng.

**Việc mày cần làm một lần (khoảng 15 phút, từng bước trong `docs/runbooks/monitoring.md`):** tạo webhook Discord/Slack và đặt `ALERT_WEBHOOK_URL` trên Vercel rồi redeploy; bấm "Gửi cảnh báo thử" ở `/admin`; thêm một monitor UptimeRobot hoặc Better Stack trỏ vào `/api/health`; bật Speed Insights trong Vercel.

### Vệ sinh bảo mật

- **Mật khẩu admin mẫu:** `proxy.ts` giờ tắt `/admin` (503) trên bản chạy thật nếu `ADMIN_PASSWORD` bắt đầu bằng giá trị mẫu hoặc dễ đoán (`change…`, `password…`, `admin…`, `your…`, `test…`, `example…`, `12345…`, `qwerty…`), cùng với quy tắc đã có (trống hoặc dưới 20 ký tự).
- **Quét khóa bí mật** (`scripts/secret-scan.mjs`, `npm run check:secrets`, chạy trong CI): bắt khóa riêng, khóa AWS/GitHub/Stripe/Slack/Google, webhook Discord/Slack, khóa `service_role` của Supabase (cả dạng JWT lẫn dạng `sb_secret_`), link xuất bản thật của Google Sheet, biến tên "bí mật" gán giá trị dài thật, và file `.env` thật bị theo dõi trong git. Không bao giờ in giá trị ra màn hình. Bỏ qua giá trị mẫu (`YOUR_…`, `change-this…`) và khóa `anon` công khai.
- **Dependabot** (`.github/dependabot.yml`): PR cập nhật thư viện hằng tuần (gom bản vá và bản nhỏ), cập nhật GitHub Actions hằng tháng. Mỗi PR chạy CI.
- **CI** (`.github/workflows/ci.yml`): quyền tối thiểu `contents: read`; thêm bước quét khóa bí mật và job `audit` riêng (`npm audit --omit=dev --audit-level=high`).
- **Điểm liên hệ bảo mật:** `public/.well-known/security.txt` (chuẩn RFC 9116, có `Expires`, **nhớ gia hạn trước ngày 13/10/2027**) và `SECURITY.md`.
- **Hướng dẫn xử lý khóa:** `docs/runbooks/secret-rotation.md` (danh sách khóa, cách đổi từng loại, việc cần làm khi lộ khóa).

**Còn việc phải làm thủ công trên GitHub** (code không làm thay được): bật Secret scanning + Push protection (repo → Settings → Code security) và bật bảo vệ nhánh `main` (bắt buộc CI xanh mới gộp).

### Đính chính

Ở các lần trao đổi trước tao đã nói `.env.local` trong zip ban đầu có khóa Supabase `service_role` **thật**. Điều đó **sai**: tao suy ra từ tên biến mà không kiểm tra giá trị. Giá trị thật là chuỗi mẫu (`YOUR_...`), nên không có khóa Supabase nào bị lộ qua file đó, và việc "đổi khóa Supabase" không còn cần thiết (chỉ cần nếu mày từng dán khóa thật vào Supabase). Điều **đáng lo hơn** tao tìm ra khi kiểm tra lại: `ADMIN_PASSWORD` trong `.env.local` là chuỗi mẫu kiểu `change-this-…`. Nếu giá trị đó (hoặc một mật khẩu đoán được) đang được đặt trên Vercel thì phải đổi ngay sang chuỗi ngẫu nhiên.

### Chưa kiểm chứng được

- Webhook chỉ được kiểm thử với `fetch` giả (định dạng Discord/Slack, giới hạn tần suất, xử lý lỗi), **chưa gửi thử vào Discord/Slack thật**. Nút "Gửi cảnh báo thử" ở `/admin` là cách mày kiểm tra.
- Vercel Speed Insights chưa được thử trên Vercel thật (chỉ chắc là build và không chạy ngoài Vercel).
- Workflow CI chưa chạy trên GitHub, `security.txt` và Dependabot chỉ kiểm tra cú pháp.
- Bộ đếm giới hạn tần suất nằm trong bộ nhớ từng instance nên trên serverless là "hết sức có thể"; chặn tuyệt đối cần Vercel Firewall.

## Dữ liệu mẫu, kiểm thử có dữ liệu và các lỗi tìm ra — 2026-10-15

Trước đây mọi phần giao diện cần dữ liệu (bộ lọc, ★, tiến độ khóa học, lịch, ảnh tự đổi) **chưa từng được chạy với dữ liệu giống thật** trong môi trường kiểm thử, vì không có quyền đọc Google Sheet. Đợt này thêm một chế độ dữ liệu mẫu, rồi dùng nó để xem tận mắt và viết kiểm thử cho các phần đó. Kết quả: tìm ra và sửa 6 lỗi mà các bài kiểm thử cũ không thể thấy.

### Chạy site bằng dữ liệu mẫu

```
npm run dev:fixtures      # mở http://localhost:3000, không cần .env.local, Google Sheet hay mạng
npm run fixtures          # tạo lại các file CSV mẫu (tests/fixtures/*.csv) từ scripts/make-fixtures.mjs
```

- Dữ liệu mẫu (tiếng Việt, ảnh dùng file có sẵn trong `public/images`): 24 tài liệu, 26 món Inventory, 3 khóa học (nhiều bài, có nhánh), 11 sự kiện, 13 tin tức, ảnh khuôn viên, học viên, hướng nghiên cứu, tuyển sinh. Ngày trong dữ liệu mẫu viết dạng `{{today+3}}` và đổi thành ngày thật lúc đọc, nên "sắp diễn ra / đã diễn ra" luôn đúng dù chạy vào hôm nào.
- Có chủ ý cài vài dòng "xấu" để kiểm tra bị loại đúng: dòng trùng, link `javascript:` và `data:`, dòng thiếu link, món thiếu id.
- Cách hoạt động (`lib/sheet-source.ts`): đặt `SHEET_FIXTURES_DIR` và link Sheet dạng `https://docs.google.com/spreadsheets/d/e/FIXTURE-events/pub?output=csv` thì tab đó đọc từ `events.csv` trong thư mục đó thay vì gọi Google. Tên file chỉ nhận chữ, số, gạch nối (không đọc được file ngoài thư mục).
- **An toàn:** tự tắt khi chạy trên Vercel (`VERCEL` được đặt), in cảnh báo lớn lúc khởi động, và `/admin/health` trả `fixtures: true` khi đang bật để không ai nhầm với dữ liệu thật. Không đặt `SHEET_FIXTURES_DIR` trên máy chủ thật.

### Kiểm thử

| Lệnh | Việc |
|---|---|
| `npm test` | 217 bài đơn vị, trong đó `fixtures.test.ts` chạy dữ liệu mẫu qua đúng các hàm đọc thật |
| `npm run build:fixtures` | Build bản dùng dữ liệu mẫu vào thư mục riêng `.next-fixtures` (không đụng `.next`) |
| `npm run e2e:all` | `build` + `build:fixtures` + toàn bộ E2E |

E2E giờ có hai nhóm, mỗi nhóm một server (xem `playwright.config.ts`): `tests/e2e` chạy **không có Sheet nào** (khung trang, bảo mật, trạng thái trống), `tests/e2e-data` chạy **với dữ liệu mẫu** (cổng 3101). Nhóm có dữ liệu kiểm tra:
- **Inventory:** 26 món, bỏ dòng trùng, giữ hai món cùng tên, nhãn trạng thái, ô thống kê, tick bộ lọc cập nhật số đếm và link, gợi ý khi lọc ra rỗng, ngăn kéo bộ lọc trên điện thoại (Xem N kết quả, Esc, nền mờ, khóa cuộn), thanh bộ lọc dính, ô thống kê 2×2.
- **Tài liệu:** 24 mục, 3 mục nổi bật, tiêu đề dài không vỡ bố cục, lọc HOẶC trong nhóm và VÀ giữa các nhóm, sắp xếp.
- **★ và Đã lưu:** thông báo + Hoàn tác, dừng đếm giờ khi rê chuột (dùng đồng hồ giả), nhóm/tìm/chọn nhiều/sao chép, dữ liệu lưu hỏng không làm lỗi trang, số mục đã lưu.
- **Khóa học:** nút Bắt đầu / Học tiếp / Học lại, thanh tiến độ, tiến độ riêng từng nhánh, thẻ khóa học và dải tổng kết, đặt lại.
- **Sự kiện:** link Google Calendar đúng giờ, tải file `.ics` hợp lệ, lịch tháng (hôm nay, bấm ngày, đổi tháng, lọc nhãn), thẻ ngày ở trang chủ chỉ có sự kiện từ hôm nay.
- **Trang chủ và tìm kiếm:** 7 ô có ảnh (ô Trường & Khoa chỉ hiện số), mọi ảnh tải được, ảnh tự đổi và dừng khi bật giảm chuyển động, tìm kiếm không dấu, chip lọc loại.
- **Quay lại danh sách:** giữ bộ lọc và vị trí cuộn.
- **Chất lượng mọi trang có dữ liệu (13 trang):** không tràn ngang, không có link `javascript:`/`data:`, không lỗi JavaScript, quét axe-core.

### Lỗi tìm ra nhờ chạy với dữ liệu (đã sửa)

1. **Nhãn trạng thái sai:** "Sắp hết" bị hiện là "Hết hàng" (và tô đỏ), vì mã kiểm tra chữ "hết" trước chữ "sắp". Bộ lọc Trạng thái vì thế có hai mục cùng ghi "Hết hàng". Sửa bằng một hàm phân loại duy nhất `statusKind` trong `lib/inventory.ts` cho nhãn, màu và số thống kê.
2. **Ô "Đang có sẵn" luôn là 0** nếu Sheet ghi "Còn hàng" (mã chỉ nhận `available`, `có sẵn`, `sẵn sàng`, `in stock`). Giờ tính theo cùng phân loại ở trên.
3. **Ô thống kê đầu của Inventory** ghi nhãn "Danh mục" nhưng hiện tổng số mặt hàng; đổi thành "Tổng mặt hàng".
4. **Tìm kiếm vật tư mở danh sách lọc theo tên** thay vì trang chi tiết của đúng món; giờ mở `/resources/inventory/<slug>` (cùng cách đặt slug với trang Inventory).
5. **Hướng dẫn trong `/admin` cho tab Tin tức sai:** ghi cột `title, date, summary, url, image, tag` trong khi code **bắt buộc có cột `section`** (`headlines` / `latest` / `media` / `features`). Làm theo hướng dẫn cũ sẽ ra 0 tin tức. Đã sửa `lib/admin-guide.ts`.
6. **Bố cục điện thoại:** 4 ô thống kê của Inventory xếp dọc chiếm gần nửa màn hình trước món đầu tiên; giờ lưới 2×2.

Cải tiến kèm theo (từ kiểm thử tìm ra): thông báo ★ hiện 8 giây thay vì 5 và **dừng đếm giờ khi rê chuột hoặc focus** (WCAG 2.2.1); menu điện thoại hiện số mục đã lưu (dải trên cùng bị ẩn ở màn hình nhỏ nên trước đây không thấy được); cột footer rộng hơn để email không bị ngắt giữa chừng.

### Giới hạn

- Dữ liệu mẫu không thay được dữ liệu thật: nó kiểm chứng giao diện và logic xử lý Sheet, **không** kiểm chứng việc đọc Google Sheet thật (độ trễ của Google, định dạng cột trong Sheet của bạn có thể khác mẫu). Nên chạy `npm run dev` với Sheet thật rồi đối chiếu.
- Hầu hết cột trong mẫu theo hướng dẫn `/admin`; riêng tab Resources gộp 3 khối cạnh nhau (Tài liệu, Inventory, Khóa học) nên cột `level`, `source`, `featured` của Tài liệu được đặt ở cuối. Nếu Sheet thật đặt chúng ở chỗ khác, code vẫn tìm theo tên cột.
- Chạy cả bộ E2E mất khoảng 12 phút trên máy có 3 trình duyệt song song (218 lượt).

## Trang chủ điện ảnh (học cách trình bày của Tesla) và ảnh nhẹ hơn — 2026-10-16

**Ý 0, ảnh:** logo `About/logo.png` từ 2000×2000 (1,4 MB) xuống 384×384 (116 KB), nhìn không khác; ảnh vật tư 2560×2560 xuống 1024. Giữ nguyên tên file nên Sheet không cần sửa. Ảnh trong `public/images` được trình duyệt giữ 1 ngày (`stale-while-revalidate` 7 ngày, không đặt `immutable` vì tên file không có mã băm: thay ảnh cùng tên thì có thể mất tới 1 ngày mới thấy). Logo header/footer có `width`/`height` chống nhảy bố cục; ảnh hero đầu có `fetchpriority="high"`. `tests/unit/asset-budget.test.ts` giữ ngân sách: không ảnh nào quá 700 KB hoặc 2600px, logo dưới 150 KB, tổng dưới 12 MB.

**Ý 1, trang chủ:** hero cao đúng bằng màn hình; `Header overlay` (header nổi trong suốt trên ảnh, cuộn thì nền kính mờ, `components/HeaderScroll.tsx`); nút phụ "Khám phá" cuộn xuống; mỗi hướng hoạt động trong tab Admissions (mục track, tối đa 4) là một màn hình (`components/HomeTracks.tsx`); bỏ dải "Truy cập nhanh" dưới hero cho gọn. CSS riêng ở `app/cinematic.css` (chỉ trang chủ nạp). Các trang khác vẫn dùng header trắng dính.

**Lưu ý thiết kế:** chữ hero đặt ở phần dưới ảnh, không đặt giữa như Tesla, vì ảnh tập thể có mặt người ở giữa khung. Ba ảnh hướng hoạt động hiện tại là sơ đồ kỹ thuật nhỏ (660–840 px, nền trắng) nên đặt trong khung thẻ chứ không phóng tràn nền. Muốn đẹp như Tesla cần ảnh thật khổ rộng (từ 1920px) của phòng lab, xe, mạch.

**Đã kiểm chứng:** `tests/e2e-data/cinematic.spec.ts` (hero bằng chiều cao màn hình và ảnh đầu tải ưu tiên; header trong suốt rồi kính mờ khi cuộn và trả lại; ba hướng hoạt động đủ tiêu đề, hai nút; chữ và ảnh không dính mép màn hình; nút Khám phá cuộn tới đúng chỗ, tiêu đề không bị header che; các trang khác vẫn header trắng dính) và `tests/e2e/performance.spec.ts` (logo dưới 150 KB và có bộ đệm đúng; khi chưa có dữ liệu nút Khám phá trỏ tới `#kham-pha`): 22 lượt pass. Trang chủ qua axe (WCAG A/AA) không có lỗi nghiêm trọng và không tràn ngang. Chưa thử Firefox/Safari.


---

## Phụ lục: hướng dẫn README đã hợp nhất từ các thư mục cũ

### CTIT-2.2-EMBEDDED-UX-README.md

# CTIT 2.2 — Embedded Identity & UX Patch

Nguồn: đúng bản `1 (1).zip` người dùng gửi ngày 28/10/2026.

##### Cài đặt (Windows / PowerShell)

Đây là ZIP **chỉ chứa các file thay đổi**, không phải toàn bộ dự án.

1. Lưu hoặc commit các thay đổi hiện tại của CTIT trước, vì thao tác đè sẽ thay các file trùng tên.
2. Giải nén ZIP này thẳng vào `C:\Users\HOME\Desktop\CTIT` (các thư mục `app`, `components`, `lib`, `tests` nằm ngay bên trong CTIT, không có cấp thư mục CTIT lồng).
3. Chạy:

```powershell
cd "C:\Users\HOME\Desktop\CTIT"
npm run ci
npm run dev
```

4. Kiểm tra trang chủ trên desktop, mobile (đặc biệt ở độ rộng 320px, 375px, 390px, 768px), `/resources`, `/research`, `/saved`, `/admin` và hộp tìm kiếm.
5. Chỉ push qua Pull Request sau khi CI trên máy Windows đạt.

##### Thay đổi thực hiện

- Giữ nguyên bộ UI cũ (header kính mờ, hero điện ảnh, gradient cyan → indigo → violet, card góc vuông và bóng lệch).
- Thêm `app/embedded.css`: design token ngữ nghĩa `--color-*`, `--motion-*`, font mono hệ thống cho nhãn kỹ thuật (không phát sinh font download). Không thay thế `--tsinghua-*` hiện có để tránh rủi ro CSS.
- Trang chủ có grid chấm kỹ thuật cực nhẹ chỉ ở phần Khám phá; một số ô Bento có nhãn silkscreen minh họa `U1 / CTIT` (chỉ trang trí, không phải ID vật tư thật).
- Nút tìm kiếm trong hero tái sử dụng SearchDialog hiện hành và shortcut Ctrl+K (không tạo modal hoặc backend mới).
- Thanh tab mobile 5 mục: Trang chủ, Tìm, Tài nguyên, Đã lưu (có số lượng), Menu (mở drawer đã có). Hỗ trợ CSS safe-area cho iPhone, nhãn dễ hiểu, focus bàn phím. Trang Admin không hiển thị thanh này.
- Tìm kiếm: thêm **Nghiên cứu** vào chỉ mục thực lấy từ Research Sheet; sửa lỗi giới hạn top-60 **trước** khi lọc loại. Chỉ render tối đa 60 kết quả được chọn, nhưng chip hiển thị tổng số khớp thực.
- Bổ sung kiểm thử tìm kiếm với fixture và ca nhiều kết quả.

##### Kết quả kiểm tra trong môi trường tạo bản vá

- `npm run typecheck`: **PASS**.
- ESLint trên các file có thay đổi: **0 errors**, có warning cũ từ các component trước khi sửa.
- Parse CSS qua PostCSS: **PASS**.
- Smoke test hàm tìm kiếm + render SSR thanh mobile: **PASS**.
- `npm run check:dependencies` và `npm run check:secrets`: **PASS**.
- `npm test` chưa chạy được: dependencies native Rolldown trong ZIP là cho Windows, môi trường dựng patch là Linux.
- `npm run build` chưa chạy được: thiếu native SWC Linux, không truy cập được registry để cài tự động.

##### Bảo mật / dữ liệu

- Không đóng gói `.env.local`, `.git`, `node_modules`, `.next`, cache hoặc bí mật.
- Không thay nguồn CSV/Google Sheets, không đổi logic admin/password/middleware.
- Không phát sinh số liệu mô phỏng mang nhãn LIVE; mã chip U1 chỉ là chi tiết trang trí.
- Không thêm npm package.

Nếu CTIT local của bạn đã thay đổi sau khi ZIP gốc được gửi, cần xem diff/commit trước khi giải nén đè.


### CTIT-2.3-README.md

# CTIT 2.3 — Unified Design System Overlay

Bản vá dựa trên `CTIT.zip` mới nhất trong cuộc trò chuyện (28/10/2026), giữ nguyên hero điện ảnh trang chủ và dữ liệu Google Sheets.

##### Cài trên Windows (không tạo backup)

1. Giải nén toàn bộ nội dung ZIP vào `C:\Users\HOME\Desktop\CTIT`, chọn **Replace / Ghi đè**.
2. Không giải nén thành một thư mục CTIT con; ở gốc ZIP có `app/`, `components/`, `tests/`.
3. Trong VS Code Terminal:

   cd "C:\Users\HOME\Desktop\CTIT"
   npm run ci
   npm run dev

4. Kiểm tra /resources, /resources/documents, /resources/inventory, /resources/courses, /events, /schools, /campus, /saved và 2 trang chi tiết.
5. So sánh mobile ~390px, desktop ~1440px; kiểm tra Light/Dark và Reduce Motion.

##### Các thay đổi chính

- PageHero có `standard`, `compact`, `reading`; tương thích API cũ, có màu nhấn ngữ nghĩa.
- PageShell chọn compact cho các trang danh sách, giữ `about` nguyên chuẩn cũ.
- SectionHeader dùng chung, đã tích hợp trang Resources.
- CSS hệ thống riêng `app/design-system.css` với tokens, type scale, hiệu ứng nhẹ, xử lý mobile.
- Resources, Documents, Inventory, Courses, Saved: dùng compact hero; các trang chi tiết khóa học và linh kiện dùng reading hero.
- Events, Schools, Campus: thừa hưởng compact từ PageShell.
- Research, News: giữ hero custom; chỉ đánh dấu accent để dùng mở rộng trong tương lai.
- Hiển thị số liệu bằng 0 đúng thực tế; không dùng số liệu giả.
- Unit test mới cho PageHero và SectionHeader.
- Không thêm npm dependency, không sửa page chủ, header/footer, data hay auth.

##### Kiểm thử ở môi trường dựng bản vá

- TypeScript `tsc --noEmit`: PASS.
- ESLint cho các file sửa: PASS (0 errors).
- PostCSS parse stylesheet: PASS.
- SSR smoke test PageHero compact/reading, stat 0, SectionHeader: PASS.
- Dependency security floor và secret scanner: PASS.
- Production build: CHƯA chạy thành công, do công cụ môi trường Linux không tải được SWC từ npm registry (EAI_AGAIN). Cần xác nhận trên Windows với `npm run ci`.
- Vitest full suite: CHƯA chạy trong môi trường này, vì ZIP gốc chứa native binaries Windows; vẫn cần chạy trên máy người dùng.

##### Lưu ý

- Bản vá chỉ chứa các file được thay đổi. Không có `.env.local`, `.git`, `node_modules`, `.next` hoặc backup.
- Nếu sau lúc tạo CTIT.zip bạn đã chỉnh các file trong ZIP này ở máy, xem thay đổi trước khi ghi đè để tránh mất những chỉnh sửa đó.


### CTIT-MOTION-README.md

# CTIT 2.1 — Subtle Motion Patch

**Dùng với đúng bản CTIT.zip người dùng đã gửi ngày 25/10/2026.**

##### Cài đặt trên Windows

1. Sao lưu folder `C:\Users\HOME\Desktop\CTIT`.
2. Giải nén **nội dung** ZIP này **trực tiếp vào** `C:\Users\HOME\Desktop\CTIT`, chọn Replace khi được hỏi. ZIP không có folder `CTIT` lồng bên trong.
3. Không cần chạm tới `.env.local`, `.git`, `node_modules` hoặc `.next`. ZIP không chứa những tệp này.
4. Mở VS Code Terminal:

   ```powershell
   cd "C:\Users\HOME\Desktop\CTIT"
   npm ci
   npm run ci
   ```

5. Chạy `npm run dev` và xem trang `/research` (PCB trong hero, CAN/BMS dạng sóng trên thẻ dự án phù hợp nếu dự án không có ảnh); thử lưu một mục vật tư/tài liệu khi dùng chuột desktop.
6. Kiểm tra mobile, Light/Dark và tùy chọn Windows **Reduce Motion** trước khi push GitHub qua Pull Request.

##### Đã sửa

- Reveal nhẹ (10px, 340ms, không blur/zoom).
- PCB SVG trong Research Hero khi không bật Spline iframe; xung tín hiệu chỉ chạy khi trong viewport, tab hiển thị và người dùng không bật Reduce Motion.
- Waveform CAN/BMS nhỏ được gắn **có điều kiện** cho dự án liên quan, khi không có ảnh minh họa. Có nhãn rõ là **mô phỏng**, tuyệt đối không gọi là dữ liệu LIVE.
- 3D tilt giới hạn ±2° cho card dự án nổi bật trên chuột desktop.
- 6 particle nhỏ chỉ khi người dùng thực sự lưu mục bằng chuột desktop; vẫn giữ toast xác nhận và nút Hoàn tác cũ.
- Bổ sung bài test cho 2 minh họa SVG.
- Không cài thêm npm package nào, không thay giao diện tổng thể, không đổi nguồn Google Sheets.

##### Lưu ý

- Đây là **bản vá đè 9 tệp**, không phải dự án đầy đủ.
- Nếu repo đã có chỉnh sửa khác sau ngày nhận ZIP, xem diff trước khi đè.
- Dạng sóng chỉ là **đồ họa minh họa**, không phải telemetry có kết nối BMS.
- Chưa tự động đẩy GitHub hay Vercel.


### public/images/About/README.txt

Bỏ ảnh người phụ trách vào đây, ví dụ: about-photo.jpg

Trong Google Sheet (tab About), dòng `photo` (hoặc dòng `id`) ghi ĐÚNG tên file
có cả đuôi: about-photo.jpg  -> web tự link tới /images/About/about-photo.jpg

Tên phải khớp chính xác, kể cả chữ hoa/thường và đuôi file.


### public/images/Admissions/README.txt

Ảnh cho các dòng "track" (mảng chuyên môn) trong tab Admissions đặt tại đây.

Cột image trong sheet nhận:
- tên file có đuôi, khớp CHÍNH XÁC hoa/thường: automotive.jpg -> /images/Admissions/automotive.jpg
- Google Drive share link
- URL ảnh trực tiếp

Để trống cột image thì thẻ mảng chuyên môn chỉ hiện tiêu đề + mô tả, không có ảnh, không lỗi.


### public/images/Campus/README.txt

Ảnh cho tab Campus đặt tại đây (1 dòng sheet = 1 ảnh).

Cột image trong sheet nhận:
- tên file có đuôi, khớp CHÍNH XÁC hoa/thường: lab-01.jpg -> /images/Campus/lab-01.jpg
  (nên đặt chữ thường, không dấu, không cách)
- Google Drive share link
- URL ảnh trực tiếp

Kích thước: ngang 3:2 hoặc 4:3, rộng ~1600px, dưới 500KB.
Cột summary là note hiện trong lightbox, khoảng 1-2 câu (tối đa ~120 ký tự).


### public/images/Courses/README.txt

Ảnh bìa cho các dòng "course" (môn học) trong tab Courses đặt tại đây.

Cột image trong sheet nhận:
- tên file có đuôi, khớp CHÍNH XÁC hoa/thường: vi-dieu-khien.jpg -> /images/Courses/vi-dieu-khien.jpg
- Google Drive share link
- URL ảnh trực tiếp

Để trống cột image thì thẻ môn học hiện ô chữ cái đầu có màu, không lỗi.


### public/images/Events/README.txt

Ảnh cho tab Events đặt tại đây (1 dòng sheet = 1 sự kiện, ảnh không bắt buộc).

Cột image trong sheet nhận:
- tên file có đuôi, khớp CHÍNH XÁC hoa/thường: can-workshop.jpg -> /images/Events/can-workshop.jpg
  (nên đặt chữ thường, không dấu, không cách)
- Google Drive share link
- URL ảnh trực tiếp

Kích thước: ngang 16:9 hoặc 4:3, rộng ~1600px, dưới 500KB.
Cột summary hiện ở thẻ lịch (sắp diễn ra) và trong lightbox (đã diễn ra),
khoảng 1-2 câu (tối đa ~120 ký tự).


### public/images/Research/README.txt

Ảnh cho tab Research đặt tại đây (jpg / png / webp).

Trong Google Sheet (tab Research), cột `id` ghi ĐÚNG tên file có cả đuôi.
Ví dụ: es.png -> /images/Research/es.png

- dòng "focus": ảnh này hiện thay cho chữ viết tắt (ES, AE, ...) trong panel hướng nghiên cứu
- dòng "project": ảnh dự án

Tên phải khớp chính xác, kể cả chữ hoa/thường và đuôi file.
Cột `image` (nếu có) vẫn dùng được và được ưu tiên hơn `id`; nhận tên file, link Google Drive hoặc URL ảnh.
Để trống cả hai thì focus hiện chữ viết tắt, project chỉ hiện chữ, không lỗi.


### public/images/Resources/Courses/README.txt

Ảnh bìa cho các môn trong khối Course (cột id, ô AB trong tab Resources) đặt tại đây.

Cột id nhận:
- tên file có đuôi, khớp CHÍNH XÁC hoa/thường: vi-dieu-khien.jpg
- đường dẫn có thư mục con theo môn: Vi-dieu-khien/bia.jpg
- Google Drive share link
- URL ảnh trực tiếp

Chỉ cần ghi id ở MỘT dòng của môn. Để trống thì thẻ môn hiện ô chữ cái đầu có màu, không lỗi.
Ảnh nên tỉ lệ 4:3 hoặc 16:9, rộng khoảng 1200px, dưới 300KB.


### public/images/Resources/Documents/README.txt

Bỏ ảnh bìa tài liệu vào đây (jpg/png/webp).

Trong Google Sheet (tab Resources), cột `id` ghi ĐÚNG tên file có cả đuôi.
Ví dụ: Chuyen-nganh-co-dien-tu.jpg
-> web tự link tới /images/Resources/Documents/Chuyen-nganh-co-dien-tu.jpg
Tên phải khớp chính xác, kể cả chữ hoa/thường và đuôi file.


### public/images/Resources/Inventory/README.txt

Ảnh của Inventory sẽ được đặt trong folder này.


### public/images/Students/README.txt

Bỏ ảnh học viên vào đây (jpg/png/webp).

Trong Google Sheet (tab Students), cột `id` (hoặc `photo`) ghi ĐÚNG tên file có
cả đuôi. Ví dụ file "nguyen-van-a.jpg" thì trong sheet ghi: nguyen-van-a.jpg
-> web tự link tới /images/Students/nguyen-van-a.jpg

Tên phải khớp chính xác, kể cả chữ hoa/thường và đuôi file. Sai tên thì card
hiện chữ cái đầu thay cho ảnh (npm run dev sẽ báo trong terminal).

---

# Cập nhật hero PCB STM32

Slide giới thiệu ở trang chủ sử dụng bo mạch phối cảnh tự dựng bằng CSS/SVG: chip có chiều dày, 64 chân kim loại, pad, via, tụ SMD, thạch anh, SWD và LED. Không tải hình, logo hoặc model từ ST. Đây là minh họa thiết kế, không phải sơ đồ điện để chế tạo PCB.

## Thay đổi
- `components/PCBHero.tsx`: bo mạch và điều khiển chuyển động.
- `app/pcb-hero.css`: vật liệu, phối cảnh, đường mạch indigo/cyan/violet và bố cục responsive.
- `components/HomeCarousel.tsx`: tích hợp PCB qua thuộc tính `pcb`, thêm nút tắt chuyển động.
- `app/page.tsx`: bật PCB cho slide giới thiệu, giữ slide tin/sự kiện từ Sheets.

Khi vào trang, vệt sáng lướt qua mặt chip. Xung sáng chạy ra ngoài dọc đường đồng. Chuột làm nghiêng nhẹ trên máy tính; cuộn làm bo mạch đổi góc và thu nhỏ. Dừng hoạt hình khi slide ẩn, ra khỏi viewport, tab trình duyệt ẩn hoặc người dùng tắt. Hỗ trợ prefers-reduced-motion. Hình nền có sẵn trong HTML trước khi hydrate. Không thêm thư viện.

## Chạy
### Cập nhật đè lên dự án hiện có

1. Tắt server đang chạy bằng `Ctrl+C` trong terminal.
2. Giải nén `CTIT-PCB-STM32.zip` vào một thư mục tạm.
3. Mở thư mục `CTIT` vừa giải nén, chép **nội dung bên trong** vào thư mục dự án cũ (nơi có `package.json`), chọn **Replace files**. Không tạo thư mục lồng `CTIT\CTIT`.
4. Giữ nguyên `.env.local` đang dùng trên máy; bản ZIP không chứa cấu hình riêng này.
5. Nếu đã chép bản ZIP trước đó, xóa file `PCB-HERO-README.md` cũ trong thư mục dự án. Giải nén đè không tự xóa file đã bỏ khỏi ZIP. Hướng dẫn nay nằm trong `README.md`.
6. Mở terminal tại thư mục dự án và chạy các lệnh dưới đây. Sau khi server sẵn sàng, mở trang rồi nhấn **Ctrl+F5** để tải lại giao diện.

```powershell
npm ci
npm run dev
```

Xem với dữ liệu mẫu: `npm run dev:fixtures`.
Build thật: `npm run build`. Kiểm tra kiểu: `npm run typecheck`.

## Kiểm tra bản giao
- TypeScript: đạt.
- Build production bằng dữ liệu mẫu (`npm run build:fixtures`): đạt, 23 trang.
- Build còn 3 cảnh báo có sẵn ở `lib/imagery.ts` về truy vết filesystem.
- Chưa xác minh trực quan trong trình duyệt: hệ thống preview truyền `--host` và `--strictPort`, không tương thích lệnh Next.js của dự án. Cần xem desktop/mobile khi chạy local.
- Chưa triển khai Vercel/Firebase; chưa thay đổi repository từ xa.

Ảnh Campus cũ vẫn có trong public. Để trở lại hero ảnh cũ, bỏ `pcb: true` trong slide đầu của `app/page.tsx`.

### Đồng bộ màu hero với CTIT

Hero dùng lại các biến màu của site: `--tsinghua-purple` (#4f46e5), `--accent-cyan` (#38bdf8) và `--accent-violet` (#a855f7). PCB phủ tím than, đường mạch indigo nhạt, xung sáng cyan xen violet. Chip giữ chất liệu graphite với phản chiếu tím nhẹ; chân và pad dùng bạc lạnh. CTA chính chuyển sang indigo, nút phụ và trạng thái focus theo cùng bảng màu. Không đổi bố cục hoặc cơ chế chuyển động.

Các sắc nền và đường mạch riêng nằm trong nhóm biến `--pcb-*` đầu `app/pcb-hero.css`.

### Trang tuyển sinh — bố cục tham khảo TI

Trang `/admissions` được chỉnh riêng theo cách tổ chức nội dung của https://www.ti.com/: banner lớn, nhóm nội dung rõ ràng, thẻ góc vuông, dải số liệu và lời mời hành động cuối trang. Giữ bảng màu CTIT indigo/cyan/violet; không dùng màu đỏ, logo hay ảnh TI.

- Hero ảnh rộng: ưu tiên ảnh đầu tiên có trong các hướng hoạt động của Admissions; nếu chưa có, dùng ảnh Campus sẵn trong dự án. Chữ được phủ nền tối để dễ đọc.
- Dải thông tin tuyển sinh dùng `status.title`, `status.content`, `status.url`. Khi chưa có dữ liệu, chỉ hướng người xem liên hệ, không tự công bố đang mở tuyển.
- Thanh điều hướng dính theo các phần có dữ liệu, kèm đánh dấu mục đang xem.
- Các hướng hoạt động hiển thị dạng thẻ ảnh; quy trình dùng lưới các bước, không bắt cuộn ngang trên điện thoại.
- Giữ điều kiện, mốc thời gian và FAQ từ Google Sheets. FAQ dùng thẻ details, thao tác được bằng bàn phím.
- Bổ sung các lối vào Giới thiệu, Khóa học và Nghiên cứu; dải số liệu tính trực tiếp từ dữ liệu tuyển sinh.
- Responsive: thẻ chuyển 3 → 2 → 1 cột; nút có focus rõ và tôn trọng giảm chuyển động.

Tệp thay đổi: `app/admissions/AdmissionsView.tsx` và `app/admissions/admissions.css`. Các trang khác giữ nguyên. Hướng dẫn cập nhật đè ở phần hero PCB phía trên vẫn áp dụng; giữ `.env.local`.

Đối chiếu tham khảo: đã đọc cấu trúc nội dung trang TI qua web; chưa kiểm tra ảnh chụp TI vì bước duyệt mở trình duyệt bị lỗi quá tải. Chưa xác minh trực quan bản tuyển sinh trong trình duyệt; hệ thống preview hiện truyền tham số không tương thích với Next.js. Kiểm tra cú pháp CSS và TypeScript đã đạt.

Build production với dữ liệu mẫu (`npm run build:fixtures`) đã đạt; còn 3 cảnh báo truy vết filesystem có sẵn ở `lib/imagery.ts`.

### Banner STM32 cố định và ô Giới thiệu

Trang chủ giữ banner STM32 cố định, không tự chuyển sang tin tức/sự kiện và không hiện các nút điều khiển carousel khi chỉ có một banner. Tin tức và sự kiện vẫn nằm ở những phần riêng phía dưới. Nút tắt chuyển động chỉ điều khiển hiệu ứng PCB, không chuyển nội dung banner. Đã tăng khoảng trống dưới khối nội dung để tránh chồng nút.

Ô Giới thiệu trong “Khám phá CTIT” thay ảnh logo bằng bản thu nhỏ của chính PCB STM32. Bản thu nhỏ tĩnh, không đăng ký listener chuột/cuộn riêng. Link vẫn dẫn đến `/about`. Logo nhận diện ở header và nội dung trang `/about` không đổi; Trường & Khoa giữ nguyên để thực hiện sau.

## Nâng cấp thư viện khóa học — giữ nguyên Google Sheets

### Cấu trúc dữ liệu không thay đổi

Vẫn gọi `getCourses()` với `COURSES_SHEET_CSV_URL`, hoặc nguồn Resources hiện có nếu biến đó để trống. Vẫn tìm khối bắt đầu bằng header `Môn` trong vùng Course (thường từ cột W); không tạo tab Lessons/Paths, không yêu cầu chuyển cơ sở dữ liệu.

| Cột đang dùng | Vai trò giữ nguyên |
| --- | --- |
| Môn | Tên môn, dùng gom khóa và tạo slug như trước |
| Title / Tiêu đề / Tên bài | Tên bài |
| URL / Link / Đường dẫn | Liên kết HTTP(S); trống thì bài hiện “Sắp có” |
| Type / Định dạng / Hình thức | Video, PDF, Code…; parser hiện tại vẫn chuẩn hóa như trước |
| Description / Mô tả | Mô tả bài; dòng không có Title và URL dùng mô tả môn/nhánh |
| id / image / Ảnh | Ảnh khóa theo quy ước ảnh hiện tại |
| Track / Nhánh (tùy chọn) | Nhánh học trong môn |
| Group / Chương / Nhóm bài / Phần (tùy chọn) | Nhóm bài/chương |

Giữ thứ tự dòng trong Sheet. Không tự đổi `slug`; không đổi key `ctit-done`. ID tiến độ vẫn là `course.slug:track.slug:index`. Vì ID cũ phụ thuộc vị trí bài, chèn/xóa/đổi thứ tự bài trong Sheet có thể làm tiến độ cũ lệch bài; bản này không âm thầm chuyển cơ chế ID.

### Danh mục `/resources/courses`

- Lưới môn tạo từ dữ liệu thật; số nhánh/bài tính từ đề cương.
- Tìm kiếm không dấu với ba loại kết quả: Khóa học / Nhánh học / Bài học. Không gọi nhánh là lộ trình nhiều khóa vì Sheet chưa có quan hệ đó.
- Lọc theo môn, định dạng và tiến độ khóa. Sắp xếp theo đề cương, tên A–Z, ít bài nhất (không phải thời lượng).
- Phân trang 12 kết quả; điều kiện nằm trên URL (`q`, `subject`, `type`, `progress`, `sort`, `view`, `page`), có thể sao chép link.
- “Tiếp tục học” chỉ xuất hiện khi có tiến độ thực, dẫn đến bài có link chưa hoàn thành. Thẻ dùng tiến độ cũ trong trình duyệt.

### Trang chi tiết

- Mục lục bên trái, chia chương theo Group, tìm bài trong nhánh; điện thoại đưa mục lục lên trên.
- Link bài dạng `/resources/courses/<slug>?track=<track>&lesson=<index>`; index bắt đầu từ 0. Link cũ chỉ có slug/track vẫn hoạt động.
- Bài trước / Bài tiếp theo; đánh dấu đã học vẫn dùng `LessonDone` và `useDone` cũ. Chuyển bài không tự đánh dấu hoàn thành.
- Nhớ bài đã chọn gần nhất bằng `ctit-last-lesson:<course>:<track>` trên trình duyệt; URL có lesson ưu tiên hơn vị trí đã lưu.
- Các mục Bài học / Tổng quan / Tài liệu / Vật tư / Hỗ trợ.
- Video YouTube chỉ được tải sau khi bấm xem, dùng host `youtube-nocookie.com`. URL có `t`/`start` được giữ mốc bắt đầu; không lưu thời điểm phát video. Có link mở nguồn nếu video không cho nhúng. Các nguồn khác vẫn mở trực tiếp, không tự nhúng iframe tùy ý.
- CSP chỉ bổ sung host iframe YouTube này, giữ các hạn chế khác.
- Tài liệu lấy từ những bài có link và định dạng khác Video trong nhánh. Vật tư hiện dẫn đến Inventory, ghi rõ chưa có danh sách theo khóa; chưa có nút Mượn hay xác nhận tồn kho tự động. Hỗ trợ mở email có tên khóa và bài, không phải hệ thống hỏi đáp lưu trên server.

### Chưa triển khai khi chưa có dữ liệu tương ứng

Không tự bịa thời lượng, mức độ, ngày cập nhật, ngôn ngữ, lượt xem, đánh giá, mã khóa hay cờ lỗi thời. Chưa có Paths/Roadmap liên khóa, vật tư theo từng khóa, Wokwi, liên kết Events/Imagery, quiz, chuỗi ngày học, chứng nhận có xác minh hoặc AI Tutor. Chưa thêm API key hoặc dịch vụ trả phí. Các phần này cần nguồn dữ liệu/quy ước liên kết được xác định trước.

### Kiểm tra

TypeScript đạt; production build dùng fixture đạt; 4 kiểm thử link video đạt (host chính xác, scheme, video ID và mốc thời gian). Đã so sánh byte với bản gốc: `lib/sheet-data.ts`, `lib/dashboard-types.ts`, `lib/saved.ts` giữ nguyên. Chưa xác minh trực quan trong trình duyệt do giới hạn preview đã ghi ở trên. Build còn các cảnh báo tracing filesystem sẵn có trong `lib/imagery.ts`.

Chép đè bản ZIP, giữ `.env.local`, chạy lại server. Không cần sửa Google Sheet để dùng bản nâng cấp này.

### Kết nối khóa học với Inventory

Tab **Vật tư** trong từng nhánh tra cứu theo mã model/linh kiện xuất hiện trong tên, mô tả môn, chương hoặc bài. Dùng cùng quy tắc đối chiếu với trang chi tiết Inventory. Đây là vật tư liên quan, không phải danh sách bắt buộc. Muốn một board xuất hiện, điền mã model của board vào mô tả bài bằng các cột hiện có. Trang hiển thị trạng thái và số lượng từ Inventory, có liên kết tới đúng mục kho. Khi lượng ghi trong Sheet lớn hơn 0 và trạng thái cho phép hỏi mượn, nút **Hỏi mượn qua email** mở bản nháp với tên vật tư và khóa học. Người học tự gửi email, kho không bị trừ số lượng.

Nút **Học tiếp** ở dải tổng kết mở đúng nhánh và bài có liên kết đầu tiên chưa đánh dấu xong. Thứ tự được lấy từ Sheet và tiến độ lấy từ trình duyệt đang dùng.

## Thư viện học tập CTIT — lộ trình, quiz và chứng nhận

Phiên bản này bổ sung dữ liệu **tùy chọn**. Sheet hiện tại vẫn cấp môn, nhánh và bài bằng khối **Môn, Title, URL, Type, Description, id, Track, Group**. Tiếp tục nhập bài theo thứ tự dòng hiện tại. Dữ liệu cũ và đường dẫn khóa vẫn hoạt động. Không cần triển khai Supabase hay sửa Google Sheet để chạy site.

**Danh mục và Roadmap.** Mở `/resources/courses` để tìm theo Lộ trình, Khóa học, Nhánh học hoặc Bài học. Có 10 ô chủ đề kèm mô tả và số khóa. Khi chưa khai báo category, trang gợi ý chủ đề theo tên môn/nhánh. Các mục “Tiếp tục học”, “Mới cập nhật” và “Lộ trình đề xuất” chỉ xuất hiện khi có dữ liệu. Trang `/roadmap` đọc cùng danh sách lộ trình và tổng hợp tiến độ bài học trên thiết bị hiện tại. Nếu chưa cấu hình Paths, bộ gợi ý chọn các khóa có thật theo thứ tự chủ đề, chỉ hiện lộ trình khi tìm được ít nhất hai khóa phù hợp.

**Dữ liệu mở rộng trong khối Course hiện có.** Nếu cần metadata, đặt các cột tùy chọn liền trong khối Course, trước cột phân cách trống. Không ghi vào các khối Documents hoặc Inventory. Điền metadata môn trên dòng tổng quan đầu tiên của môn (Môn có giá trị, Title/URL/Track để trống).

| Cột tùy chọn | Cách nhập và sử dụng |
| --- | --- |
| code, category | Ví dụ MCU-02 và STM32 / ARM Cortex-M. Mã hiển thị theo giá trị người quản trị nhập. |
| level, language | Cơ bản / Trung bình / Nâng cao hoặc basic / intermediate / advanced. Ngôn ngữ dùng nhãn người đọc hiểu, ví dụ Tiếng Việt. |
| duration_min, updated | Tổng số phút và ngày YYYY-MM-DD. Nhãn Mới hiện trong 14 ngày tính từ ngày cập nhật. |
| status, requires_hardware | pending hoặc Cần cập nhật để hiện cảnh báo. Phần cứng nhập true / false hoặc có / không. Ô trống biểu thị chưa rõ. |
| views, rating, rating_count | Sắp xếp Phổ biến theo views từ Sheet. Điểm 0–5 chỉ hiển thị khi có ít nhất 5 lượt. |
| instructor, outcomes, prerequisites | Người dạy, kết quả học tập, slug các khóa tiền đề ngăn cách bằng dấu phẩy hoặc gạch đứng. |
| lesson_duration_min | Điền trên dòng bài để hiện thời lượng trong mục lục. |
| quiz_json | Điền trên dòng bài. Mảng 3–5 câu, mỗi câu có question, options (2–5 lựa chọn), answer (chỉ số bắt đầu từ 0), explanation tùy chọn. Quiz phục vụ tự kiểm tra, đáp án có trong dữ liệu công khai. |

Ví dụ ô quiz_json của một bài GPIO:

```json
[{"question":"Thanh ghi đầu ra điều khiển gì?","options":["Mức logic chân ra","Tần số CPU"],"answer":0},{"question":"Khi đọc nút nhấn, GPIO dùng chế độ nào?","options":["Đầu vào","Đầu ra"],"answer":0},{"question":"Điện trở kéo lên giúp chân hở có mức nào?","options":["Thấp","Cao"],"answer":1}]
```

**Lộ trình tự biên soạn.** Có thể tạo tab Paths riêng trên Google Sheet với header `slug,title,summary,course_slugs`, rồi gán URL CSV đã publish cho `PATHS_SHEET_CSV_URL`. Ví dụ `course_slugs` là `vi-dieu-khien|lap-trinh-nhung-voi-esp32` nếu site thực sự có hai slug này. Thứ tự từ trái sang phải là thứ tự học. Slug không tồn tại bị bỏ qua và được báo tại `/admin`. Khi đã cấu hình Paths, trang chỉ dùng lộ trình quản trị viên khai báo.

**Video và thực hành.** YouTube chỉ tải sau thao tác bấm xem, lưu vị trí trên thiết bị mỗi 5 giây và khi tạm dừng nếu Player API hoạt động. Video xong sẽ xóa mốc. Link có mốc thời gian vẫn được giữ khi xem từ đầu. Với Wokwi, điền URL HTTPS của dự án công khai vào URL bài, ví dụ dạng `https://wokwi.com/projects/<id số>`. Người học bấm Mở mô phỏng Wokwi hoặc mở nguồn trực tiếp nếu nhà cung cấp hạn chế nhúng. Sheet vẫn là nguồn cho các liên kết. Trang hiển thị album và sự kiện khi tên khớp tên khóa (bỏ qua hoa thường); bản ghi workshop đưa vào khóa qua URL bài như trước.

**Thành tích.** Chuỗi ngày học tính từ lần đánh dấu một bài mới hoàn thành, theo ngày Việt Nam và trên thiết bị đó. Dữ liệu cũ vẫn giữ nguyên, không suy đoán ngày học trong quá khứ. Chứng nhận do CTIT cấp thủ công trong tab Google Sheet tùy chọn với header `code,recipient,course,issued`. Publish CSV và cấu hình `CERTIFICATES_SHEET_CSV_URL`. Chỉ đưa thông tin được phép công khai vào tab đã publish. Mỗi mã ngẫu nhiên duy nhất đại diện một chứng nhận đã cấp. Người nhận vào `/verify` nhập mã để xem và in/lưu PDF. Tích hoàn thành trong trình duyệt không tự phát hành chứng nhận.

**Phạm vi.** Phiên bản này chưa kết nối AI Tutor trả phí, chưa đồng bộ tiến độ giữa thiết bị. Liên kết sự kiện không tự tạo khóa từ bản ghi. Hướng dẫn cũ mô tả giới hạn trước đây; phần này là hướng dẫn hiện hành. Chép đè ZIP, giữ .env.local, khởi động lại server. Với Sheet cũ, các bộ lọc có thể không có kết quả nếu môn chưa khai báo metadata tương ứng.


## Trang giới thiệu — chip CTIT và mạch kết nối (09/11/2026)

### Cập nhật đè lên bản CTIT hiện có

Gói `CTIT-cap-nhat-gioi-thieu.zip` là bản cập nhật sáu file. Giải nén trực tiếp vào thư mục CTIT đang chứa `package.json` và `README.md`, sau đó chấp nhận thay thế các file trùng tên. ZIP không có thư mục CTIT bọc ngoài.

README trong gói này giữ nguyên toàn bộ 150.200 byte của README gốc được gửi trong `1(1).zip`, rồi nối thêm mục này. Không tạo README phụ và không dùng README ngắn từ bộ giao diện thử trước đó.

Không cần chép lại node_modules, không thay package.json/package-lock.json hoặc biến môi trường. Nếu dự án đã cài thư viện, chạy `npm run dev` rồi mở `/about`; khi triển khai chạy `npm run build` theo quy trình hiện tại. Nếu đang chạy bản production bằng `npm start`, cần build và khởi động lại để thấy thay đổi.

### Phần đã tích hợp

- Trang `/about` dùng chip CTIT chữ nhật, chân hai cạnh và mạch kết nối. Header, footer và metadata dùng các thành phần gốc của website.
- Bốn mục Sứ mệnh, Cách làm, Con người, Giá trị tạo ra: rê chuột, focus bàn phím hoặc nhấn để đổi đoạn giới thiệu và nhóm mạch đang sáng.
- Bố cục responsive, nút tạm dừng/tiếp tục chuyển động, hỗ trợ prefers-reduced-motion và hỏi đáp bằng details/summary.
- Màu trang lấy từ biến thương hiệu sẵn có: --tsinghua-purple, --tsinghua-purple-2, --tsinghua-lavender, --tsinghua-border, --ink, --muted và --paper.
- Vẫn đọc getAboutInfo và getOverviewStats. pageTitle/pageIntro trong Sheet tiếp tục ghi đè tiêu đề và đoạn giới thiệu khi có dữ liệu. Hồ sơ người phụ trách và số liệu tổng quan vẫn dùng AboutIntro/CtitOverview; các khối này chỉ hiện khi có dữ liệu, không thêm số liệu giả.
- Không tạo route /gioi-thieu song song. Trang chủ và các trang khác không thuộc bản cập nhật này.

### File cập nhật

| File | Vai trò |
| --- | --- |
| app/about/page.tsx | Route hiện có, nối dữ liệu Sheet với giao diện mới |
| components/ctit-about/AboutPage.tsx | Nội dung, chip inline và tương tác |
| components/ctit-about/ctit-about.css | CSS được giới hạn trong .ctit-about |
| public/images/ctit-about-chip.svg | Bản vector gốc để chỉnh sửa |
| scripts/sync-about-chip.py | Đồng bộ SVG đã chỉnh vào component |
| README.md | Toàn bộ nội dung cũ cùng phần cập nhật này |

### Chỉnh sửa hình chip

Chỉnh `public/images/ctit-about-chip.svg` bằng editor hoặc phần mềm vector. Các nhóm có ID: board, traces, traces-mission, traces-method, traces-people, traces-output, pins, chip-shadow, chip-body, chip-labels, components và board-labels. Giữ tên ID khi chỉnh nếu vẫn dùng CSS tương tác hiện tại.

Sau khi sửa SVG, chạy từ gốc dự án:

```sh
python scripts/sync-about-chip.py
```

Script chỉ dùng Python 3 chuẩn, không cần pip. Nó đồng bộ hình vào AboutPage.tsx; trang dùng SVG inline để tô sáng nhóm mạch. Nội dung giới thiệu chỉnh trong component; dữ liệu hồ sơ và thống kê vẫn chỉnh qua Sheet.

Dáng chip lấy cảm hứng từ IC công suất trên trang https://www.infineon.com/part/BTS80014-SWPF-1ES (PG-TSDSO-24). Hình CTIT được vẽ mới; các chân và đường mạch chỉ phục vụ minh họa thương hiệu, không phải pinout, footprint hoặc sơ đồ điện của linh kiện.

### Kiểm tra bản cập nhật

- TypeScript: `node node_modules/typescript/bin/tsc --noEmit --incremental false` đã đạt sau tích hợp.
- Production build `node node_modules/next/dist/bin/next build --webpack` đã đạt, tạo thành công route /about. Dữ liệu Google Sheets thực của người dùng không được truy cập trong môi trường kiểm tra; logic đọc Sheet gốc được giữ.
- README gốc được so sánh theo byte với file trong ZIP đầu vào để bảo đảm không mất phần cũ.


## PCB artwork routing — 2026-11-10

- Homepage: ordered pin fan-out with 45-degree diagonals, aligned plated pads and inline resistor packages; removed floating decorative components.
- About: four independent parallel trace groups, aligned component pads and fewer animated pulses.
- Artwork remains editable in `components/PCBHero.tsx` and `public/images/ctit-about-chip.svg`. Run `python scripts/sync-about-chip.py` after editing the About SVG.
- Visual illustration only; not a fabrication layout or electrical pinout.


## Không gian học tập CTIT — 11/11/2026

### Phạm vi bản cập nhật
- `/learn`: cửa vào học tập, ba nhóm Cơ bản / Trung bình / Nâng cao, câu hỏi chọn hướng học, chip kiến thức tương tác, danh sách 10 chủ đề, tiến độ, mục tiêu tuần, sự kiện và tài nguyên.
- `/roadmap`: bản đồ mạch ngang, tiến độ từng khóa, đường nét đứt nối khóa dùng chung. Danh sách thứ tự bên dưới vẫn giữ để đọc và điều hướng bằng bàn phím.
- Có liên kết Học tập trong menu Tài nguyên, menu di động, trang Tài nguyên và danh mục khóa. Sitemap thêm `/learn` và `/roadmap`.

### Dữ liệu và chỉnh sửa
- Không cần thêm tab hoặc cột Google Sheet. Dữ liệu lấy từ `getCourses()`, `getLearningPaths()` và `getEvents()` đang có.
- Nội dung ba thẻ và hình thức học: `data/learn-hub.ts`. Giao diện: `app/learn/learn.css`. Chip vẽ bằng HTML/CSS/SVG trong `components/learn/LearningChip.tsx`, không dùng ảnh hãng hoặc thư viện 3D.
- Ba thẻ đếm chính xác `info.level`; khóa chưa có cấp độ chỉ xuất hiện trong danh mục đầy đủ. URL dùng giá trị cấp độ tiếng Việt đã được parser chuẩn hóa.
- Tổng giờ dùng `info.minutes` của khóa nếu có; nếu thiếu, cộng thời lượng các bài đã khai báo. Không cộng hai lần thời lượng khóa và bài. Số bài gồm cả bài dự kiến của danh mục.
- Bộ chọn tạo URL với `topic`, `level`, `hardware`. Chưa biết C thì gợi ý C trước; chưa có board thì chỉ chọn khóa có `requires_hardware=false`. Khi không có khóa khớp, liên kết nới bộ lọc về chủ đề và báo rõ.
- Sự kiện lấy tối đa 3 mục từ ngày hiện tại theo múi giờ Việt Nam, sắp xếp tăng dần. Chưa có lịch thì hiện trạng thái trống; không dựng workshop hoặc lịch lab giả.
- Hỏi mentor mở email tới `contact.email` cùng mẫu câu hỏi. Đây không phải form xác nhận đặt lịch.

### Tiến độ và roadmap
- Dùng cùng `useDone()` với danh mục và lớp học. Chỉ bài đã có URL được tính vào tiến độ.
- Tiếp tục học trỏ đến bài chưa hoàn thành đầu tiên trong một khóa đang học dở; không tuyên bố đó là bài xem gần nhất.
- Mục tiêu tuần: 5 ngày, tuần bắt đầu thứ Hai, lấy ngày học đã ghi trong `ctit-study-days`. Một ngày chỉ tính một lần; học đủ 7 ngày vẫn hiện 7/5, thanh đạt mức tối đa 5.
- Roadmap là thứ tự gợi ý, không khóa truy cập khóa học. Khóa chưa có bài khả dụng hiện Sắp có. Đã học các bài hiện có không đồng nghĩa được cấp chứng nhận.
- Tiến độ nằm trên trình duyệt hiện tại, không có đồng bộ tài khoản và không có xác thực điểm phía server trong bản này.

### Chuyển động và khả năng truy cập
- Chip có nút tách/thu lớp và dừng chuyển động; hotspot là liên kết thật. Danh sách 10 chủ đề bên dưới là cách điều hướng thay thế.
- Roadmap có nút dừng, cuộn riêng trong khung, hỗ trợ focus và bàn phím. Dừng hiệu ứng khi ngoài màn hình, tab ẩn, hoặc người dùng bật reduced motion.
- Mobile giảm góc nghiêng; không yêu cầu rê chuột để điều hướng.

### Áp dụng và xác minh
- Giải nén bản cập nhật vào thư mục CTIT có `package.json`, cho phép thay thế các file trùng tên. Không cần đổi dependencies.
- Bản cập nhật không chứa `.env.local`, `node_modules`, `.next` hoặc dữ liệu thử. Giữ nguyên cấu hình Sheet trên máy đang chạy.
- Đã chạy TypeScript toàn dự án và `next build --webpack` với fixtures thành công. Chưa xác minh trình duyệt và dữ liệu Sheet thực: công cụ preview của môi trường truyền `--host` không được Next.js hỗ trợ.
- Phạm vi này chưa triển khai hệ truyền động, mô phỏng BLDC, PCB bung lớp, quy trình chứng nhận hay gửi yêu cầu vật tư.


## Sửa Tài nguyên và người sử dụng Inventory — 14/11/2026

- Bỏ thẻ LEARNING SPACE / Không gian học tập khỏi `/resources`. Giữ đúng bốn thẻ Tài liệu, Inventory, Khóa học, Imagery; số nhóm tài nguyên đổi về 4.
- Phạm vi gỡ là thẻ ở trang Tài nguyên. Route `/learn` và các tính năng học tập khác không bị xóa trong bản vá này.
- Inventory dạng bảng có thêm cột Người sử dụng, hỗ trợ sắp xếp tăng/giảm bằng tiêu đề cột và lựa chọn Người sử dụng A → Z.
- Ô tìm kiếm Inventory tìm được cả tên người sử dụng cùng các trường vật tư cũ.
- Dạng thẻ, bảng, so sánh và trang chi tiết thống nhất nhãn Người sử dụng. Ô `current_user` trống hiển thị Chưa cập nhật thay vì mất hẳn dòng thông tin; không suy đoán tên từ trạng thái vật tư.
- Dữ liệu tên tiếp tục đọc nguyên từ `current_user` (cột U trong bố cục Inventory I:U) của Sheet đang cấu hình. Không thêm cột Sheet, không thêm người dùng giả, không đổi dữ liệu kho.
- Áp dụng: giải nén bản vá vào thư mục CTIT có package.json, thay thế bốn file có trong ZIP. README cũ được giữ nguyên toàn bộ và nối thêm phần này; không có README thứ hai.

- Xác minh: TypeScript toàn dự án và build production bằng webpack với fixtures đều đạt; HTML production có đúng bốn thẻ tài nguyên và nhãn Người sử dụng. Chưa kiểm tra dữ liệu Google Sheet thực hoặc tương tác trong trình duyệt.


## Gỡ hoàn toàn Learning Space — 14/11/2026

Phần này thay thế phạm vi gỡ thẻ ở ghi chú ngay trước. Các ghi chú triển khai Learning Space cũ ở trên chỉ là lịch sử, không còn mô tả tính năng hiện tại.

- Gỡ route `/learn`, toàn bộ menu desktop/mobile, liên kết quay lại hub, mục sitemap, chip mục lục, bộ chọn hướng học, thẻ cá nhân và dữ liệu biên tập riêng của hub.
- Gỡ bản đồ mạch đi kèm trong `components/learn`; `/roadmap` trở về danh sách lộ trình lấy từ Sheet như trước. Khóa học, bài học, quiz và tiến độ cũ vẫn hoạt động.
- Tài nguyên còn bốn thẻ Tài liệu / Inventory / Khóa học / Imagery. Bản sửa Người sử dụng Inventory được giữ trong gói này.
- Dừng server bằng Ctrl+C, giải nén ZIP vào thư mục chứa package.json rồi chạy `powershell -NoProfile -ExecutionPolicy Bypass -File .\remove-learning-space.ps1`.
- Script chỉ xóa chín file đã bỏ thuộc Learning Space, thư mục feature nếu rỗng và cache build `.next`, `.next-preview`, `.next-fixtures`; không đụng `.env.local`, ảnh hoặc dữ liệu Sheet. Chạy lại script cũng an toàn.
- Bắt buộc chạy script vì giải nén đè không xóa file cũ. Sau đó dùng `npm run dev`; nếu chạy production thì `npm run build` trước `npm start`.

- Đã build production webpack với fixtures thành công sau khi gỡ; kiểm tra manifest không còn route /learn và HTML Tài nguyên không còn menu Learning Space.


## Sửa đúng cột người sử dụng Inventory — 14/11/2026

- Đã đối chiếu CSV thực: cột A trống khiến khối Inventory chuyển từ I:U sang J:V. `status` ở U, `current_user` ở V. Bộ dò cũ chỉ tìm tới U rồi fallback vị trí 20 nên lấy trạng thái làm tên người.
- `getInventory()` nhận diện khối qua header category/manufacturer, dò theo tên trong khối đó tới cột phân cách; không giới hạn chữ cái cột và không fallback sang vị trí đoán trước.
- Không tìm thấy một header thì trường đó rỗng; thiếu current_user không được dùng status thay thế. Hỗ trợ header tiếng Việt Người sử dụng / Người đang sử dụng / Người dùng.
- Đã chạy hàm getInventory với CSV thực: khớp đúng status và current_user của 10 vật tư. Đã kiểm tra thêm bố cục bỏ cột trống đầu, thiếu current_user và header tiếng Việt.
- Bản vá chỉ gồm lib/sheet-data.ts và README.md. Chép đè rồi khởi động lại server; production cần build lại. Không cần script PowerShell hay sửa Sheet. Các sửa đổi gỡ Learning Space trước đó được giữ nguyên.

- TypeScript và production build webpack với fixtures: đạt.
