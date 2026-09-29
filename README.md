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

- Dọn code thừa không còn dùng: `components/AdminStudio.tsx`, `components/LocalResourceStudio.tsx`, `lib/sheets-api.ts`, cụm `app/api/` + `lib/resource-store.ts`, `lib/admin-auth.ts`, `lib/env.ts`, `lib/types.ts` (Supabase cũ).
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
