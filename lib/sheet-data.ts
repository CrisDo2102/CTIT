import { existsSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import type {
  AboutInfo,
  AdmissionsData,
  OverviewStat,
  ResearchData,
  Student
} from "@/lib/dashboard-types";
import type { CampusItem, Course, CourseLesson, CourseTrack, EventItem, FeedItem } from "@/lib/dashboard-types";
import type { Resource } from "@/data/resources";
import { imageFolderName, isLocalImageRef, resolvePhotoUrl, type PhotoFolder } from "@/lib/photo-url";

export type InventoryItem = {
  category: string;
  id: string;
  title: string;
  manufacturer: string;
  model: string;
  description: string;
  unit: string;
  quantity: number;
  datasheet: string;
  purchaseUrl: string;
  location: string;
  status: string;
  currentUser: string;
  image: string;
};

const overviewSheetUrl = process.env.OVERVIEW_SHEET_CSV_URL ?? "";
const studentsSheetUrl = process.env.STUDENTS_SHEET_CSV_URL ?? "";
const aboutSheetUrl = process.env.ABOUT_SHEET_CSV_URL ?? "";
const resourcesSheetUrl = process.env.RESOURCES_SHEET_CSV_URL ?? "";

/**
 * Parse mot chuoi CSV don gian (co ho tro field co dau ngoac kep chua dau phay).
 * Du du cho nhu cau doc Google Sheet publish-to-web dang CSV.
 */
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (char === '"' && next === '"') {
        field += '"';
        i++;
      } else if (char === '"') {
        inQuotes = false;
      } else {
        field += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else if (char === "\r") {
      // bo qua, \n se ket thuc dong
    } else {
      field += char;
    }
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return rows.filter((r) => r.some((cell) => cell.trim() !== ""));
}

const isDev = process.env.NODE_ENV !== "production";

async function fetchSheetRows(url: string, label = "Sheet"): Promise<string[][]> {
  if (!url) {
    if (isDev) {
      console.warn(`[${label}] Chưa có link CSV trong .env.local nên phần này sẽ trống.`);
    }
    return [];
  }

  try {
    // npm run dev: luon lay du lieu moi nhat tu sheet (khong cache), sua sheet
    // xong F5 la thay. Chay that (build/start): cache 60 giay.
    const res = await fetch(url, isDev ? { cache: "no-store" } : { next: { revalidate: 60 } });
    if (!res.ok) {
      if (isDev) {
        console.warn(`[${label}] Không tải được sheet (HTTP ${res.status}). Kiểm tra link CSV trong .env.local.`);
      }
      return [];
    }
    const text = await res.text();
    return parseCsv(text);
  } catch (error) {
    if (isDev) {
      console.warn(`[${label}] Lỗi khi tải sheet:`, error);
    }
    return [];
  }
}

// Chuan hoa ten cot de so khop: bo phan ghi chu trong ngoac, bo dau tieng Viet,
// bo khoang trang/ky tu la, chu thuong.
//   "url (link sách, link youtube, ....)" -> "url"
//   "Tên viết tắt" -> "tenviettat",  "school_full" -> "schoolfull"
function normalizeHeader(value: string): string {
  return value
    .replace(/\([^)]*(\)|$)/g, "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]/g, "");
}

// Tim cot theo 1 trong nhieu ten (tieng Anh hoac tieng Viet). Tra ve -1 neu khong co.
function columnIndexAny(header: string[], names: string[]): number {
  const wanted = names.map(normalizeHeader);
  return header.findIndex((cell) => wanted.includes(normalizeHeader(cell)));
}

function columnIndex(header: string[], name: string): number {
  return columnIndexAny(header, [name]);
}

function cellAt(row: string[], index: number): string {
  return index === -1 ? "" : (row[index] ?? "").trim();
}

// Ten anh trong sheet co the nam o cot "photo"/"cover" HOAC o cot "id".
// Cot "id" chi duoc dung lam ten anh khi gia tri co duoi anh (vd
// "nguyen-van-a.jpg") - de cot id kieu so/ma ("001") khong bi hieu nham thanh
// ten anh. "photo"/"cover" luon duoc uu tien neu co gia tri.
const IMAGE_FILE_PATTERN = /\.(jpe?g|png|webp|gif|avif|svg)$/i;

function pickImageRef(explicit: string, id: string): string {
  if (explicit) {
    return explicit;
  }
  return IMAGE_FILE_PATTERN.test(id) ? id : "";
}

// CHI CHAY KHI npm run dev: doi chieu ten anh trong sheet voi file that trong
// public/images/<Folder>/ va in ket qua ra terminal.
//   - anh ghi trong sheet ma khong co file (hoac sai hoa/thuong)
//   - file trong folder ma khong dong nao trong sheet dung toi
function checkLocalImages(label: string, folder: PhotoFolder, refs: string[]): void {
  if (!isDev) {
    return;
  }

  const folderName = imageFolderName(folder);
  const dir = path.join(process.cwd(), "public", "images", folderName);
  if (!existsSync(dir)) {
    console.warn(`[${label}] Không thấy folder public/images/${folderName}/ (tên folder phải đúng hoa/thường).`);
    return;
  }

  const files = readdirSync(dir).filter((file) => file.toLowerCase() !== "readme.txt");
  const used = new Set<string>();
  for (const ref of refs) {
    if (!isLocalImageRef(ref)) {
      continue;
    }
    const name = ref.trim();
    // Ten co thu muc con (vd Vi-dieu-khien/cover.jpg): kiem tra dung duong dan, chan ".." de khong thoat khoi folder anh.
    if (name.includes("/")) {
      const full = path.resolve(dir, name);
      if (!name.split("/").includes("..") && full.startsWith(path.resolve(dir) + path.sep) && existsSync(full)) {
        used.add(name);
      } else {
        console.warn(`[${label}] Không thấy file "${name}" trong public/images/${folderName}/ (kiểm tra tên thư mục con và hoa/thường).`);
      }
      continue;
    }
    if (files.includes(name)) {
      used.add(name);
      continue;
    }
    const similar = files.find((file) => file.toLowerCase() === name.toLowerCase());
    if (similar) {
      used.add(similar);
      console.warn(`[${label}] Ảnh "${name}" sai hoa/thường, file thật là "${similar}" (Linux/Vercel sẽ không hiện).`);
    } else {
      console.warn(`[${label}] Không thấy file "${name}" trong public/images/${folderName}/.`);
    }
  }

  const unused = files.filter((file) => !used.has(file));
  if (unused.length > 0) {
    console.log(`[${label}] Ảnh trong public/images/${folderName}/ chưa dòng nào trong sheet dùng: ${unused.join(", ")}`);
  }
}

/**
 * Id cua moi tai lieu tu tao tu title (cot "id" trong sheet la TEN ANH, khong phai key) (bo dau,
 * chi con chu/so, noi bang gach ngang). Trung ten thi tu them so o cuoi
 * de khong bi trung key khi render list.
 */
function slugify(title: string, used: Set<string>): string {
  const base =
    title
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-+|-+$)/g, "") || "resource";

  let slug = base;
  let counter = 2;
  while (used.has(slug)) {
    slug = `${base}-${counter}`;
    counter++;
  }
  used.add(slug);
  return slug;
}

export async function getOverviewStats(): Promise<OverviewStat[]> {
  const rows = await fetchSheetRows(overviewSheetUrl, "Overview");
  if (rows.length < 2) {
    return [];
  }

  const [header, ...body] = rows;
  const labelIndex = columnIndex(header, "label");
  const valueIndex = columnIndex(header, "value");
  if (labelIndex === -1 || valueIndex === -1) {
    return [];
  }

  return body
    .map((row) => ({
      label: (row[labelIndex] ?? "").trim(),
      value: (row[valueIndex] ?? "").trim()
    }))
    .filter((stat) => stat.label && stat.value);
}

export async function getAboutInfo(): Promise<AboutInfo | null> {
  const rows = await fetchSheetRows(aboutSheetUrl, "About");
  if (rows.length < 2) {
    return null;
  }

  const [header, ...body] = rows;
  const labelIndex = columnIndex(header, "label");
  const valueIndex = columnIndex(header, "value");
  if (labelIndex === -1 || valueIndex === -1) {
    return null;
  }

  // Gom cac dong label/value (name, school, major, faculty, bio, photo) thanh 1 object duy nhat.
  // Nhan khong phan biet hoa/thuong/dau, nhan ca ten tieng Viet ("Tên", "Trường", "Ảnh admin"...).
  const map = new Map<string, string>();
  for (const row of body) {
    const label = normalizeHeader(row[labelIndex] ?? "");
    const value = (row[valueIndex] ?? "").trim();
    if (label) {
      map.set(label, value);
    }
  }
  const pick = (...names: string[]) => {
    for (const name of names) {
      const value = map.get(normalizeHeader(name));
      if (value) {
        return value;
      }
    }
    return "";
  };

  const name = pick("name", "Tên", "Họ tên", "Họ và tên");
  if (!name) {
    return null;
  }

  const photo = pickImageRef(pick("photo", "Ảnh admin", "Ảnh"), pick("id"));
  const logo = pick("logo", "Logo web", "Logo");
  checkLocalImages("About", "about", [photo, logo]);

  return {
    name,
    school: pick("school", "Trường"),
    major: pick("major", "Ngành"),
    faculty: pick("faculty", "Khoa"),
    bio: pick("bio", "Giới thiệu", "Mô tả"),
    photo,
    // Logo web: ghi ten file anh (vd logo.png, de trong public/images/About/)
    // hoac link anh day du (Google Drive share link cung duoc, xem README).
    logo,
    // Tuy chon: tieu de + mo ta ngan o dau trang /about. De trong thi trang
    // tu dung gia tri mac dinh trong lib/site-config.ts (nav[].label / .intro).
    pageTitle: pick("page_title", "Tiêu đề trang"),
    pageIntro: pick("page_intro", "Mô tả trang")
  };
}

const FEATURED_TRUE_VALUES = new Set(["true", "yes", "y", "x", "1", "co", "có", "✓"]);

// Gia tri cot "type" nhieu kieu (youtube, pdf, sách...) -> gom ve loai chuan de
// bo loc/icon ben trang Resources dung. Khong nhan ra thi giu nguyen gia tri.
const RESOURCE_TYPE_ALIASES = new Map<string, string>([
  ["youtube", "Video"],
  ["yt", "Video"],
  ["video", "Video"],
  ["clip", "Video"],
  ["pdf", "PDF"],
  ["sach", "PDF"],
  ["book", "PDF"],
  ["ebook", "PDF"],
  ["giaotrinh", "PDF"],
  ["slide", "PDF"],
  ["datasheet", "Datasheet"],
  ["code", "Code"],
  ["github", "Code"],
  ["repo", "Code"],
  ["tool", "Tool"],
  ["congcu", "Tool"],
  ["website", "Website"],
  ["web", "Website"],
  ["link", "Website"],
  ["blog", "Website"],
  ["paper", "Paper"],
  ["baibao", "Paper"]
]);

function normalizeResourceType(raw: string): string {
  return RESOURCE_TYPE_ALIASES.get(normalizeHeader(raw)) ?? raw;
}

// Cot type de trong thi doan loai tu link: youtube -> Video, github -> Code,
// file .pdf / link PDF cua SharePoint, OneDrive -> PDF, con lai -> Website.
function detectTypeFromUrl(url: string): string {
  const value = url.toLowerCase();
  if (/(youtube\.com|youtu\.be)/.test(value)) {
    return "Video";
  }
  if (/(github|gitlab)\.com/.test(value)) {
    return "Code";
  }
  if (/\.pdf($|[?#])/.test(value) || /sharepoint\.com\/:b:\//.test(value) || /1drv\.ms\/b\//.test(value)) {
    return "PDF";
  }
  return "Website";
}

export async function getResources(): Promise<Resource[]> {
  const rows = await fetchSheetRows(resourcesSheetUrl, "Resources");
  if (rows.length < 2) {
    return [];
  }

  const [header, ...body] = rows;
  // Moi cot nhan nhieu ten, ghi chu trong ngoac cua header duoc bo qua
  // ("url (link sách, link youtube, ....)" van la cot url).
  const idIndex = columnIndexAny(header, ["id"]);
  const coverIndex = columnIndexAny(header, ["cover", "Ảnh bìa"]);
  const categoryIndex = columnIndexAny(header, ["Mục lớn", "category", "Danh mục"]);
  const titleIndex = columnIndexAny(header, ["title", "Tiêu đề", "Tên tài liệu"]);
  const urlIndex = columnIndexAny(header, ["url", "link", "Đường dẫn"]);
  const descriptionIndex = columnIndexAny(header, ["description", "Mô tả"]);
  const typeIndex = columnIndexAny(header, ["type", "Loại"]);
  const topicIndex = columnIndexAny(header, ["topic", "Chủ đề"]);
  const levelIndex = columnIndexAny(header, ["level", "Cấp độ", "Mức độ"]);
  const sourceIndex = columnIndexAny(header, ["source", "Nguồn"]);
  const featuredIndex = columnIndexAny(header, ["featured", "Nổi bật"]);

  if (isDev) {
    const cell = (index: number) => (index === -1 ? "(KHÔNG THẤY)" : `"${header[index].trim()}"`);
    console.log(
      `[Resources] ${body.length} dòng | id/ảnh: ${cell(coverIndex !== -1 ? coverIndex : idIndex)} | title: ${cell(titleIndex)} | ` +
        `url: ${cell(urlIndex)} | type: ${cell(typeIndex)} | topic: ${cell(topicIndex)} | source: ${cell(sourceIndex)} | featured: ${cell(featuredIndex)}`
    );
    if (titleIndex === -1 || urlIndex === -1) {
      console.warn(
        `[Resources] Thiếu cột bắt buộc title hoặc url. Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}. ` +
          `Kiểm tra RESOURCES_SHEET_CSV_URL có phải link của tab Resources (có gid) không.`
      );
    }
  }

  if (titleIndex === -1 || urlIndex === -1) {
    return [];
  }

  const usedIds = new Set<string>();
  const imageRefs: string[] = [];
  const resources: Resource[] = [];
  let skipped = 0;

  for (const row of body) {
    const title = cellAt(row, titleIndex);
    const url = cellAt(row, urlIndex);
    if (!title || !url) {
      skipped += 1;
      continue;
    }

    // Anh bia: cot cover, hoac cot id neu id la ten file anh co duoi.
    const imageRef = pickImageRef(cellAt(row, coverIndex), cellAt(row, idIndex));
    if (imageRef) {
      imageRefs.push(imageRef);
    }

    const rawType = cellAt(row, typeIndex);
    resources.push({
      id: slugify(title, usedIds),
      title,
      description: cellAt(row, descriptionIndex),
      url,
      type: rawType ? normalizeResourceType(rawType) : detectTypeFromUrl(url),
      topic: cellAt(row, topicIndex),
      level: cellAt(row, levelIndex),
      source: cellAt(row, sourceIndex),
      category: cellAt(row, categoryIndex),
      featured: FEATURED_TRUE_VALUES.has(cellAt(row, featuredIndex).toLowerCase()),
      cover: imageRef ? resolvePhotoUrl(imageRef, "resources") : ""
    });
  }

  if (isDev) {
    if (skipped > 0) {
      console.warn(`[Resources] Bỏ qua ${skipped} dòng thiếu title hoặc url.`);
    }
    checkLocalImages("Resources/Documents", "resources", imageRefs);
  }

  return resources;
}

export async function getInventory(): Promise<InventoryItem[]> {
  const rows = await fetchSheetRows(resourcesSheetUrl, "Inventory");
  if (rows.length < 2) return [];

  const [header, ...body] = rows;
  // Inventory nam cung Sheet voi Documents: Documents A:G, cot H la vach
  // phan cach, Inventory bat dau tu I. Ta tim theo ten header de khong phu thuoc
  // tuyet doi vao chu cai cot, nhung van bo qua H va cac cot khong lien quan.
  // Quan trọng: Sheet có H là vạch vàng, Inventory bắt đầu đúng từ I.
  // Vì Documents cũng có các cột `id`, `title`, `description` nên không thể
  // dùng findIndex toàn header (nó sẽ lấy cột B/C/E của Documents). Ta chỉ
  // tìm trong vùng I:U của Inventory.
  const inventoryColumn = (offset: number, names: string[]) => {
    const start = 8; // I
    const end = Math.min(header.length, 21); // U
    const wanted = names.map(normalizeHeader);
    for (let index = start; index < end; index += 1) {
      if (wanted.includes(normalizeHeader(header[index]))) return index;
    }
    return start + offset;
  };
  const categoryIndex = inventoryColumn(0, ["category", "Danh mục"]); // I
  const idIndex = inventoryColumn(1, ["id"]); // J
  const titleIndex = inventoryColumn(2, ["title", "Tên vật tư", "Tên sản phẩm"]); // K
  const manufacturerIndex = inventoryColumn(3, ["manufacturer", "Hãng", "Nhà sản xuất"]); // L
  const modelIndex = inventoryColumn(4, ["model", "Mã sản phẩm"]); // M
  const descriptionIndex = inventoryColumn(5, ["description", "Mô tả"]); // N
  const unitIndex = inventoryColumn(6, ["unit", "Đơn vị"]); // O
  const quantityIndex = inventoryColumn(7, ["quantity", "Số lượng", "Qty"]); // P
  const datasheetIndex = inventoryColumn(8, ["datasheet", "Data sheet", "Tài liệu kỹ thuật"]); // Q
  const purchaseUrlIndex = inventoryColumn(9, ["purchase_url", "purchase url", "link mua", "nơi mua", "mua hàng"]); // R
  const locationIndex = inventoryColumn(10, ["location", "Vị trí"]); // S
  const statusIndex = inventoryColumn(11, ["status", "Trạng thái"]); // T
  const currentUserIndex = inventoryColumn(12, ["current_user", "current user", "người sử dụng", "người đang sử dụng"]); // U

  if (isDev) {
    const cell = (index: number) => (index === -1 ? "(KHÔNG THẤY)" : `"${header[index].trim()}"`);
    console.log(
      `[Inventory] ${body.length} dòng | I:U | category: ${cell(categoryIndex)} | id/ảnh: ${cell(idIndex)} | title: ${cell(titleIndex)} | ` +
        `quantity: ${cell(quantityIndex)} | datasheet: ${cell(datasheetIndex)} | purchase_url: ${cell(purchaseUrlIndex)} | location: ${cell(locationIndex)} | status: ${cell(statusIndex)} | current_user: ${cell(currentUserIndex)}`
    );
  }

  if (idIndex === -1 || titleIndex === -1) return [];

  const imageRefs: string[] = [];
  const items: InventoryItem[] = [];
  for (const row of body) {
    const id = cellAt(row, idIndex);
    const title = cellAt(row, titleIndex);
    if (!id || !title) continue;

    const rawQuantity = cellAt(row, quantityIndex).replace(/,/g, ".");
    const quantity = Number(rawQuantity) || 0;
    const image = IMAGE_FILE_PATTERN.test(id) ? resolvePhotoUrl(id, "resourceInventory") : "";
    if (image) imageRefs.push(id);

    items.push({
      category: cellAt(row, categoryIndex),
      id,
      title,
      manufacturer: cellAt(row, manufacturerIndex),
      model: cellAt(row, modelIndex),
      description: cellAt(row, descriptionIndex),
      unit: cellAt(row, unitIndex),
      quantity,
      datasheet: cellAt(row, datasheetIndex),
      purchaseUrl: cellAt(row, purchaseUrlIndex),
      location: cellAt(row, locationIndex),
      status: cellAt(row, statusIndex),
      currentUser: cellAt(row, currentUserIndex),
      image
    });
  }

  if (isDev) checkLocalImages("Resources/Inventory", "resourceInventory", imageRefs);
  return items;
}

export async function getStudents(): Promise<Student[]> {
  const rows = await fetchSheetRows(studentsSheetUrl, "Students");
  if (rows.length < 2) {
    return [];
  }

  const [header, ...body] = rows;
  // Moi cot nhan ca ten tieng Anh lan tieng Viet, khong phan biet hoa/thuong/dau.
  const schoolIndex = columnIndexAny(header, ["school", "Tên viết tắt", "viết tắt", "Trường"]);
  const schoolFullIndex = columnIndexAny(header, ["school_full", "Tên đầy đủ", "Tên trường", "Tên trường đầy đủ"]);
  const nameIndex = columnIndexAny(header, ["name", "Họ tên", "Họ và tên", "Tên học viên"]);
  const majorIndex = columnIndexAny(header, ["major", "Ngành"]);
  const facultyIndex = columnIndexAny(header, ["faculty", "Khoa"]);
  const photoIndex = columnIndexAny(header, ["photo", "Ảnh"]);
  const idIndex = columnIndexAny(header, ["id"]);

  if (isDev) {
    // In ra terminal (noi chay npm run dev) de biet code doc duoc cot nao trong sheet.
    const cell = (index: number) => (index === -1 ? "(KHÔNG THẤY)" : `"${header[index].trim()}"`);
    console.log(
      `[Students] ${body.length} dòng | viết tắt: ${cell(schoolIndex)} | đầy đủ: ${cell(schoolFullIndex)} | ` +
        `tên: ${cell(nameIndex)} | ngành: ${cell(majorIndex)} | khoa: ${cell(facultyIndex)} | ` +
        `ảnh: ${cell(photoIndex !== -1 ? photoIndex : idIndex)}`
    );
    if (schoolIndex === -1 || nameIndex === -1) {
      console.warn(
        `[Students] Thiếu cột bắt buộc "Tên viết tắt" hoặc "name". Header đang đọc được: ` +
          header.map((h) => `"${h.trim()}"`).join(", ") +
          `. Kiểm tra STUDENTS_SHEET_CSV_URL có phải link của tab Students (có gid) không.`
      );
    } else if (schoolFullIndex === -1) {
      console.warn(
        `[Students] Tab Students chưa có cột "Tên đầy đủ" (hoặc sheet chưa republish) nên web chỉ hiện tên viết tắt. ` +
          `Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}`
      );
    }
  }

  if (schoolIndex === -1 || nameIndex === -1) {
    return [];
  }

  const students = body
    .map((row) => ({
      school: cellAt(row, schoolIndex),
      schoolFull: cellAt(row, schoolFullIndex),
      name: cellAt(row, nameIndex),
      major: cellAt(row, majorIndex),
      faculty: cellAt(row, facultyIndex),
      photo: pickImageRef(cellAt(row, photoIndex), cellAt(row, idIndex))
    }))
    .filter((student) => student.school && student.name);

  if (isDev) {
    const schoolCount = new Set(students.map((student) => student.school)).size;
    console.log(`[Students] ${students.length} học viên | ${schoolCount} trường có dữ liệu sau khi lọc.`);
  }

  checkLocalImages("Students", "students", students.map((student) => student.photo));

  // Chi can dien "Tên đầy đủ" 1 lan cho moi truong: dong nao de trong se lay
  // ten day du cua dong dau tien cung truong (khop theo ten viet tat).
  const fullBySchool = new Map<string, string>();
  for (const student of students) {
    const key = student.school.toLowerCase();
    if (student.schoolFull && !fullBySchool.has(key)) {
      fullBySchool.set(key, student.schoolFull);
    }
  }

  return students.map((student) => ({
    ...student,
    schoolFull: student.schoolFull || fullBySchool.get(student.school.toLowerCase()) || ""
  }));
}

// groupStudentsBySchool chuyen sang lib/student-utils.ts (ham thuan, khong
// dung fetch/process.env) de StudentsShowcase (client component) dung
// truc tiep duoc ma khong keo theo code fetch server vao bundle client.
export { groupStudentsBySchool } from "@/lib/student-utils";


// ---- Tab dạng danh sách: News / Events / Podcast / Campus ----
// Cột: title (bắt buộc), date, summary, url, image, tag. Thứ tự dòng trong sheet = thứ tự hiển thị.

// Moi tab co folder anh rieng: public/images/News (Events/Campus xu ly rieng, xem duoi).
export type NewsItem = FeedItem & {
  section: string;
  order: number;
  category: string;
};

export async function getNews(): Promise<NewsItem[]> {
  const url = process.env.NEWS_SHEET_CSV_URL ?? "";
  const rows = await fetchSheetRows(url, "News");
  if (rows.length < 2) return [];

  const [header, ...body] = rows;
  const col = {
    section: columnIndexAny(header, ["section", "Mục", "Phần"]),
    order: columnIndexAny(header, ["order", "Thứ tự"]),
    title: columnIndexAny(header, ["title", "Tiêu đề"]),
    content: columnIndexAny(header, ["content", "Nội dung", "summary", "Mô tả"]),
    date: columnIndexAny(header, ["date", "Ngày"]),
    url: columnIndexAny(header, ["url", "link", "Đường dẫn"]),
    image: columnIndexAny(header, ["image", "Ảnh", "cover", "photo"]),
    // Sheet News dùng cột "id" để ghi tên file ảnh (vd bms.jpg)
    id: columnIndexAny(header, ["id"]),
    category: columnIndexAny(header, ["category", "Danh mục", "Loại", "tag", "Nhãn"])
  };

  if (col.section === -1 || col.title === -1) {
    if (isDev) {
      console.warn(
        `[News] Thiếu cột bắt buộc section hoặc title. Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}.`
      );
    }
    return [];
  }

  const items: NewsItem[] = [];
  const imageRefs: string[] = [];

  for (const row of body) {
    const title = cellAt(row, col.title);
    if (!title) continue;

    const rawSection = cellAt(row, col.section);
    const sectionKey = normalizeHeader(rawSection);
    // Cho phép ghi tiếng Việt trong sheet: Tiêu điểm / Tin mới nhất / Báo chí / Chuyên đề
    const NEWS_SECTION_ALIASES: Record<string, string> = {
      tieudiem: "headlines",
      tinmoinhat: "latest",
      tinmoi: "latest",
      baochi: "media",
      truyenthong: "media",
      chuyende: "features",
      gocnhin: "features"
    };
    const section = NEWS_SECTION_ALIASES[sectionKey] ?? sectionKey;
    const orderRaw = cellAt(row, col.order);
    const order = Number(orderRaw) || 0;
    const image = pickImageRef(cellAt(row, col.image), cellAt(row, col.id));
    if (image) imageRefs.push(image);

    items.push({
      section,
      order,
      title,
      date: cellAt(row, col.date),
      summary: cellAt(row, col.content),
      url: cellAt(row, col.url),
      image: resolvePhotoUrl(image, "news"),
      tag: cellAt(row, col.category),
      category: cellAt(row, col.category)
    });
  }

  if (isDev) {
    console.log(
      `[News] ${items.length} dòng | section: ${header[col.section]} | order: ${header[col.order] ?? "(không có)"} | ` +
        `title: ${header[col.title]} | content: ${header[col.content] ?? "(không có)"} | ` +
        `date: ${header[col.date] ?? "(không có)"} | url: ${header[col.url] ?? "(không có)"} | ` +
        `image: ${header[col.image] ?? "(không có)"} | category: ${header[col.category] ?? "(không có)"}`
    );
    checkLocalImages("News", "news", imageRefs);
  }

  return items.sort((a, b) => {
    const sectionOrder = ["headlines", "latest", "media", "features"];
    const sa = sectionOrder.indexOf(a.section);
    const sb = sectionOrder.indexOf(b.section);
    if (sa !== sb) return (sa === -1 ? 99 : sa) - (sb === -1 ? 99 : sb);
    return a.order - b.order;
  });
}
// ---- Tab Campus ----
// Cột: title (bắt buộc), date (2026-09-20), summary, url, image, tag, place, featured (x = ảnh hero).
// Thứ tự dòng trong sheet = thứ tự hiển thị (mới nhất để trên cùng).
const CAMPUS_SUMMARY_MAX = 120;
const CAMPUS_IMAGE_MAX_KB = 500;

export async function getCampus(): Promise<CampusItem[]> {
  const campusUrl = process.env.CAMPUS_SHEET_CSV_URL ?? "";
  const rows = await fetchSheetRows(campusUrl, "Campus");
  if (rows.length < 2) {
    if (isDev && campusUrl) {
      console.warn("[Campus] Tải được sheet nhưng chưa có dòng dữ liệu (cần dòng header + ít nhất 1 dòng ảnh). Kiểm tra link có đúng tab Campus (gid) không.");
    }
    return [];
  }

  const [header, ...body] = rows;
  const col = {
    title: columnIndexAny(header, ["title", "Tiêu đề"]),
    date: columnIndexAny(header, ["date", "Ngày"]),
    summary: columnIndexAny(header, ["summary", "Mô tả", "Ghi chú"]),
    url: columnIndexAny(header, ["url", "link", "Đường dẫn"]),
    image: columnIndexAny(header, ["image", "Ảnh"]),
    tag: columnIndexAny(header, ["tag", "Nhãn", "Loại"]),
    place: columnIndexAny(header, ["place", "Địa điểm"]),
    featured: columnIndexAny(header, ["featured", "Nổi bật"])
  };

  if (col.title === -1) {
    if (isDev) {
      console.warn(
        `[Campus] Thiếu cột bắt buộc title. Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}. ` +
          `Kiểm tra CAMPUS_SHEET_CSV_URL có phải link của tab Campus (có gid) không.`
      );
    }
    return [];
  }

  const items: CampusItem[] = [];
  body.forEach((row, i) => {
    const line = i + 2; // dong that trong sheet (dong 1 la header)
    const title = cellAt(row, col.title);
    const image = cellAt(row, col.image);
    if (!title) {
      if (isDev && image) {
        console.warn(`[Campus] Dòng ${line} có ảnh "${image}" nhưng thiếu title nên bị bỏ qua.`);
      }
      return;
    }
    const date = cellAt(row, col.date);
    const summary = cellAt(row, col.summary);
    if (isDev) {
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.warn(`[Campus] Dòng ${line}: date "${date}" chưa theo dạng 2026-09-20 (cột nên để định dạng Plain text).`);
      }
      if (summary.length > CAMPUS_SUMMARY_MAX) {
        console.warn(`[Campus] Dòng ${line}: summary dài ${summary.length} ký tự (nên ≤ ${CAMPUS_SUMMARY_MAX}).`);
      }
    }
    items.push({
      title,
      date,
      summary,
      url: cellAt(row, col.url),
      image,
      tag: cellAt(row, col.tag),
      place: cellAt(row, col.place),
      featured: FEATURED_TRUE_VALUES.has(cellAt(row, col.featured).toLowerCase())
    });
  });

  if (isDev) {
    console.log(
      `[Campus] ${items.length} ảnh | cột đọc được: ` +
        Object.entries(col).map(([name, index]) => `${name} ${index === -1 ? "✗" : "✓"}`).join(", ")
    );
    if (items.filter((item) => item.featured).length > 1) {
      console.warn("[Campus] Có nhiều dòng featured, chỉ dòng đầu tiên được dùng làm ảnh hero.");
    }
    for (const item of items) {
      if (!isLocalImageRef(item.image)) {
        continue;
      }
      try {
        const kb = statSync(path.join(process.cwd(), "public", "images", imageFolderName("campus"), item.image)).size / 1024;
        if (kb > CAMPUS_IMAGE_MAX_KB) {
          console.warn(`[Campus] Ảnh "${item.image}" nặng ${Math.round(kb)}KB (nên < ${CAMPUS_IMAGE_MAX_KB}KB, rộng ~1600px).`);
        }
      } catch {
        // thieu file da duoc checkLocalImages bao ben duoi
      }
    }
  }

  checkLocalImages("Campus", "campus", items.map((item) => item.image));
  return items.map((item) => ({ ...item, image: resolvePhotoUrl(item.image, "campus") }));
}

// ---- Tab Events ----
// Cot: title (bat buoc), date (2026-10-05), time (vd "18:00 - 20:00"), place,
// summary, url, image, tag, featured (x = uu tien lam hero).
// Trang /events tu chia Sap dien ra / Da dien ra dua vao date so voi hom nay
// (component EventsJournal), sheet KHONG can cot rieng danh dau qua khu/sap toi.
const EVENTS_SUMMARY_MAX = 120;
const EVENTS_IMAGE_MAX_KB = 500;

export async function getEvents(): Promise<EventItem[]> {
  const eventsUrl = process.env.EVENTS_SHEET_CSV_URL ?? "";
  const rows = await fetchSheetRows(eventsUrl, "Events");
  if (rows.length < 2) {
    if (isDev && eventsUrl) {
      console.warn("[Events] Tải được sheet nhưng chưa có dòng dữ liệu (cần dòng header + ít nhất 1 dòng sự kiện). Kiểm tra link có đúng tab Events (gid) không.");
    }
    return [];
  }

  const [header, ...body] = rows;
  const col = {
    title: columnIndexAny(header, ["title", "Tiêu đề"]),
    date: columnIndexAny(header, ["date", "Ngày"]),
    time: columnIndexAny(header, ["time", "Giờ", "Thời gian"]),
    summary: columnIndexAny(header, ["summary", "Mô tả", "Ghi chú"]),
    url: columnIndexAny(header, ["url", "link", "Đường dẫn"]),
    image: columnIndexAny(header, ["image", "Ảnh"]),
    tag: columnIndexAny(header, ["tag", "Nhãn", "Loại"]),
    place: columnIndexAny(header, ["place", "Địa điểm"]),
    featured: columnIndexAny(header, ["featured", "Nổi bật"])
  };

  if (col.title === -1) {
    if (isDev) {
      console.warn(
        `[Events] Thiếu cột bắt buộc title. Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}. ` +
          `Kiểm tra EVENTS_SHEET_CSV_URL có phải link của tab Events (có gid) không.`
      );
    }
    return [];
  }

  const items: EventItem[] = [];
  body.forEach((row, i) => {
    const line = i + 2; // dong that trong sheet (dong 1 la header)
    const title = cellAt(row, col.title);
    const image = cellAt(row, col.image);
    if (!title) {
      if (isDev && image) {
        console.warn(`[Events] Dòng ${line} có ảnh "${image}" nhưng thiếu title nên bị bỏ qua.`);
      }
      return;
    }
    const date = cellAt(row, col.date);
    const summary = cellAt(row, col.summary);
    if (isDev) {
      if (date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        console.warn(`[Events] Dòng ${line}: date "${date}" chưa theo dạng 2026-10-05 (cột nên để định dạng Plain text).`);
      }
      if (summary.length > EVENTS_SUMMARY_MAX) {
        console.warn(`[Events] Dòng ${line}: summary dài ${summary.length} ký tự (nên ≤ ${EVENTS_SUMMARY_MAX}).`);
      }
    }
    items.push({
      title,
      date,
      time: cellAt(row, col.time),
      summary,
      url: cellAt(row, col.url),
      image,
      tag: cellAt(row, col.tag),
      place: cellAt(row, col.place),
      featured: FEATURED_TRUE_VALUES.has(cellAt(row, col.featured).toLowerCase())
    });
  });

  if (isDev) {
    console.log(
      `[Events] ${items.length} sự kiện | cột đọc được: ` +
        Object.entries(col).map(([name, index]) => `${name} ${index === -1 ? "✗" : "✓"}`).join(", ")
    );
    for (const item of items) {
      if (!isLocalImageRef(item.image)) {
        continue;
      }
      try {
        const kb = statSync(path.join(process.cwd(), "public", "images", imageFolderName("events"), item.image)).size / 1024;
        if (kb > EVENTS_IMAGE_MAX_KB) {
          console.warn(`[Events] Ảnh "${item.image}" nặng ${Math.round(kb)}KB (nên < ${EVENTS_IMAGE_MAX_KB}KB, rộng ~1600px).`);
        }
      } catch {
        // thieu file da duoc checkLocalImages bao ben duoi
      }
    }
  }

  checkLocalImages("Events", "events", items.map((item) => item.image));
  return items.map((item) => ({ ...item, image: resolvePhotoUrl(item.image, "events") }));
}

// ---- Tab Research: 1 tab duy nhat cho ca trang /research ----
// Cot: section (bat buoc: focus/project/achievement/publication), order,
// title, content, date, url, image, tag.
// Section nao khong co dong se tu dong an tren giao dien.
type ResearchSectionKey = "focus" | "project" | "achievement" | "publication";

const RESEARCH_SECTION_ALIASES: Record<string, ResearchSectionKey> = {};
function registerResearchSection(key: ResearchSectionKey, names: string[]): void {
  for (const name of names) {
    RESEARCH_SECTION_ALIASES[normalizeHeader(name)] = key;
  }
}
registerResearchSection("focus", ["focus", "Hướng nghiên cứu", "Mảng nghiên cứu", "Lĩnh vực"]);
registerResearchSection("project", ["project", "Dự án", "Dự án nghiên cứu"]);
registerResearchSection("achievement", ["achievement", "Thành tích", "Giải thưởng"]);
registerResearchSection("publication", ["publication", "Ấn phẩm", "Bài báo", "Công bố"]);

export async function getResearchInfo(): Promise<ResearchData> {
  const empty: ResearchData = { focus: [], project: [], achievement: [], publication: [] };
  const rows = await fetchSheetRows(process.env.RESEARCH_SHEET_CSV_URL ?? "", "Research");
  if (rows.length < 2) {
    return empty;
  }

  const [header, ...body] = rows;
  const col = {
    section: columnIndexAny(header, ["section", "Loại", "Loại nội dung", "Nhóm"]),
    order: columnIndexAny(header, ["order", "Thứ tự", "STT"]),
    title: columnIndexAny(header, ["title", "Tiêu đề", "Tên"]),
    content: columnIndexAny(header, ["content", "Nội dung", "Mô tả", "Tóm tắt"]),
    date: columnIndexAny(header, ["date", "Ngày", "Năm"]),
    url: columnIndexAny(header, ["url", "link", "Đường dẫn"]),
    image: columnIndexAny(header, ["image", "Ảnh", "Ảnh minh họa"]),
    // Cột "id" = TÊN FILE ẢNH có đuôi (vd es.png) trong public/images/Research/.
    // Nếu cả "image" và "id" đều có giá trị thì "image" được ưu tiên.
    id: columnIndexAny(header, ["id"]),
    // Cột "caption" = dòng chú thích hiện dưới tiêu đề (cột cũ tên "tag" vẫn đọc được)
    tag: columnIndexAny(header, ["caption", "Chú thích", "tag", "Nhãn", "Trạng thái", "Tác giả"]),
    category: columnIndexAny(header, ["category", "Áp dụng hướng", "Thuộc hướng"])
  };

  if (isDev) {
    const cell = (index: number) => (index === -1 ? "(KHÔNG THẤY)" : `"${header[index].trim()}"`);
    console.log(
      `[Research] ${body.length} dòng | section: ${cell(col.section)} | order: ${cell(col.order)} | ` +
      `title: ${cell(col.title)} | content: ${cell(col.content)} | date: ${cell(col.date)} | ` +
      `url: ${cell(col.url)} | image: ${cell(col.image)} | tag: ${cell(col.tag)} | category: ${cell(col.category)}`
    );
    if (col.section === -1) {
      console.warn(
        `[Research] Thiếu cột bắt buộc "section". Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}. ` +
        `Kiểm tra RESEARCH_SHEET_CSV_URL có phải link của đúng tab Research (có gid) không.`
      );
    }
  }

  if (col.section === -1) {
    return empty;
  }

  const buckets: Record<ResearchSectionKey, ResearchData[ResearchSectionKey]> = {
    focus: [],
    project: [],
    achievement: [],
    publication: []
  };
  const imageRefs: string[] = [];

  body.forEach((row, index) => {
    const rawSection = cellAt(row, col.section);
    const section = RESEARCH_SECTION_ALIASES[normalizeHeader(rawSection)];
    if (!section) {
      if (isDev && rawSection) {
        console.warn(`[Research] Dòng ${index + 2}: section "${rawSection}" không nhận diện được, bỏ qua.`);
      }
      return;
    }

    const orderRaw = cellAt(row, col.order);
    const order = orderRaw !== "" && !Number.isNaN(Number(orderRaw)) ? Number(orderRaw) : null;
    const image = pickImageRef(cellAt(row, col.image), cellAt(row, col.id));
    if (image) imageRefs.push(image);

    buckets[section].push({
      section,
      order,
      index,
      title: cellAt(row, col.title),
      content: cellAt(row, col.content),
      date: cellAt(row, col.date),
      url: cellAt(row, col.url),
      image,
      tag: cellAt(row, col.tag),
      category: cellAt(row, col.category)
    });
  });

  checkLocalImages("Research", "research", imageRefs);

  const sortRows = (items: ResearchData[ResearchSectionKey]) =>
    items.slice().sort((a, b) => {
      if (a.order !== null && b.order !== null && a.order !== b.order) return a.order - b.order;
      if (a.order !== null && b.order === null) return -1;
      if (a.order === null && b.order !== null) return 1;
      return a.index - b.index;
    });

  const withImages = (items: ResearchData[ResearchSectionKey]) =>
    sortRows(items)
      .filter((item) => item.title || item.date)
      .map((item) => ({
        ...item,
        image: item.image ? resolvePhotoUrl(item.image, "research") : ""
      }));

  const researchData: ResearchData = {
    focus: withImages(buckets.focus).filter((item) => item.title),
    project: withImages(buckets.project).filter((item) => item.title),
    achievement: withImages(buckets.achievement),
    publication: withImages(buckets.publication).filter((item) => item.title)
  };

  if (isDev) {
    console.log(
      `[Research] Sau khi lọc: ${researchData.focus.length} hướng | ` +
      `${researchData.project.length} dự án | ${researchData.achievement.length} thành tích | ` +
      `${researchData.publication.length} ấn phẩm.`
    );
  }

  return researchData;
}

// ---- Tab Admissions: 1 tab duy nhat cho ca trang /admissions ----
// Cot: section (bat buoc: status/step/requirement/track/timeline/faq), order
// (tuy chon, so thu tu hien thi trong tung section), title, content, date,
// url, image. Dong nao khong dien het cot cung duoc, cot khong dung cho loai
// section do de trong. Xem huong dan chi tiet trong README.md.
type AdmissionsSectionKey = "status" | "step" | "requirement" | "track" | "timeline" | "faq";

const ADMISSIONS_SECTION_ALIASES: Record<string, AdmissionsSectionKey> = {};
function registerAdmissionsSection(key: AdmissionsSectionKey, names: string[]): void {
  for (const name of names) {
    ADMISSIONS_SECTION_ALIASES[normalizeHeader(name)] = key;
  }
}

// Cho phep nguoi quan ly sheet ghi "step 3", "step 4"... ma van thuoc
// nhom "step". So thu tu van lay tu cot order, khong lay tu ten section.
// Tuong tu cho cac nhom khac neu sau nay vo tinh ghi them so vao section.
function resolveAdmissionsSection(rawSection: string): AdmissionsSectionKey | null {
  const normalized = normalizeHeader(rawSection);
  const exact = ADMISSIONS_SECTION_ALIASES[normalized];
  if (exact) return exact;

  const numberedMatch = normalized.match(/^(status|step|requirement|track|timeline|faq)\d+$/);
  if (numberedMatch) {
    return ADMISSIONS_SECTION_ALIASES[numberedMatch[1]] ?? null;
  }

  return null;
}
registerAdmissionsSection("status", ["status", "Trạng thái"]);
registerAdmissionsSection("step", ["step", "Bước", "Quy trình"]);
registerAdmissionsSection("requirement", ["requirement", "Điều kiện", "Yêu cầu"]);
registerAdmissionsSection("track", ["track", "Mảng", "Lĩnh vực"]);
registerAdmissionsSection("timeline", ["timeline", "Mốc thời gian", "Mốc"]);
registerAdmissionsSection("faq", ["faq", "Hỏi đáp", "Câu hỏi thường gặp"]);

type AdmissionsRow = {
  order: number | null;
  index: number;
  title: string;
  content: string;
  date: string;
  url: string;
  image: string;
};

export async function getAdmissionsInfo(): Promise<AdmissionsData> {
  const empty: AdmissionsData = { status: null, steps: [], requirements: [], tracks: [], timeline: [], faqs: [] };

  const rows = await fetchSheetRows(process.env.ADMISSIONS_SHEET_CSV_URL ?? "", "Admissions");
  if (rows.length < 2) {
    return empty;
  }

  const [header, ...body] = rows;
  const col = {
    section: columnIndexAny(header, ["section", "Loại", "Loại nội dung", "Nhóm"]),
    order: columnIndexAny(header, ["order", "Thứ tự", "STT"]),
    title: columnIndexAny(header, ["title", "Tiêu đề", "Câu hỏi"]),
    content: columnIndexAny(header, ["content", "Nội dung", "Mô tả", "Trả lời"]),
    date: columnIndexAny(header, ["date", "Ngày"]),
    url: columnIndexAny(header, ["url", "link", "Đường dẫn"]),
    image: columnIndexAny(header, ["image", "Ảnh"])
  };

  if (isDev) {
    const cell = (index: number) => (index === -1 ? "(KHÔNG THẤY)" : `"${header[index].trim()}"`);
    console.log(
      `[Admissions] ${body.length} dòng | section: ${cell(col.section)} | title: ${cell(col.title)} | ` +
        `content: ${cell(col.content)} | date: ${cell(col.date)} | url: ${cell(col.url)} | image: ${cell(col.image)}`
    );
    if (col.section === -1) {
      console.warn(
        `[Admissions] Thiếu cột bắt buộc "section". Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}. ` +
          `Kiểm tra ADMISSIONS_SHEET_CSV_URL có phải link của đúng tab Admissions (có gid) không.`
      );
    }
  }

  if (col.section === -1) {
    return empty;
  }

  const buckets: Record<AdmissionsSectionKey, AdmissionsRow[]> = {
    status: [],
    step: [],
    requirement: [],
    track: [],
    timeline: [],
    faq: []
  };
  const imageRefs: string[] = [];

  body.forEach((row, index) => {
    const rawSection = cellAt(row, col.section);
    const key = resolveAdmissionsSection(rawSection);
    if (!key) {
      if (isDev && rawSection) {
        console.warn(`[Admissions] Dòng ${index + 2}: section "${rawSection}" không nhận diện được, bỏ qua.`);
      }
      return;
    }

    const orderRaw = cellAt(row, col.order);
    const orderNum = orderRaw !== "" && !Number.isNaN(Number(orderRaw)) ? Number(orderRaw) : null;
    const image = cellAt(row, col.image);
    if (image) {
      imageRefs.push(image);
    }

    buckets[key].push({
      order: orderNum,
      index,
      title: cellAt(row, col.title),
      content: cellAt(row, col.content),
      date: cellAt(row, col.date),
      url: cellAt(row, col.url),
      image
    });
  });

  checkLocalImages("Admissions", "admissions", imageRefs);

  // Sap xep theo cot order (neu co dien), dong nao khong dien order thi giu
  // nguyen thu tu xuat hien trong sheet, xep sau cac dong co order.
  const sortSection = (key: AdmissionsSectionKey): AdmissionsRow[] =>
    buckets[key].slice().sort((a, b) => {
      if (a.order !== null && b.order !== null && a.order !== b.order) {
        return a.order - b.order;
      }
      if (a.order !== null && b.order === null) {
        return -1;
      }
      if (a.order === null && b.order !== null) {
        return 1;
      }
      return a.index - b.index;
    });

  const statusRow = sortSection("status").find((row) => row.title || row.content || row.url);

  return {
    status: statusRow ? { title: statusRow.title, content: statusRow.content, url: statusRow.url } : null,
    steps: sortSection("step")
      .filter((row) => row.title)
      .map((row) => ({ title: row.title, content: row.content })),
    requirements: sortSection("requirement")
      .filter((row) => row.title)
      .map((row) => ({ title: row.title })),
    tracks: sortSection("track")
      .filter((row) => row.title)
      .map((row) => ({
        title: row.title,
        content: row.content,
        url: row.url,
        image: row.image ? resolvePhotoUrl(row.image, "admissions") : ""
      })),
    timeline: sortSection("timeline")
      .filter((row) => row.title || row.date)
      .map((row) => ({ date: row.date, title: row.title, content: row.content })),
    faqs: sortSection("faq")
      .filter((row) => row.title)
      .map((row) => ({ title: row.title, content: row.content }))
  };
}

// ---- Khoi Course: nam cung tab Resources, tu cot W (cot V la vach phan cach) ----
// Giong Inventory, khoi nay chi tim header TRONG vung cua no, vi Documents va
// Inventory cung co cot title / description / type / url / id.
// Vung Course: bat dau o cot co header "Mon" (hoac "Course"), ket thuc truoc o header trong dau tien.
// Header: Mon | Title | URL | Type | Description | id        (W : AB)
// Moi dong la 1 bai = 1 link. Thu tu bai = thu tu dong trong sheet.
//   - Co Title + URL http(s)      : bai hoc
//   - Co Title, chua co URL       : bai da len ke hoach, hien "Sap co" (dien link sau)
//   - Khong co Title va URL       : Description la mo ta cua mon
//   - id (ten file anh)           : anh bia cua mon, lay o dong dau tien co id. File nam trong
//                                   public/images/Resources/Courses/ (cho phep thu muc con theo mon).
// Cot Track va Group la TUY CHON (them vao khi muon chia nhanh AVR / ARM hoac chia chuong).
// Muon tach thanh tab rieng thi dat COURSES_SHEET_CSV_URL, khong dat thi dung tab Resources.
const COURSE_HEADER_NAMES = ["môn", "course", "Môn học", "Khóa học"];

// Chi nhan link http(s): chan javascript:, data: ... do nguoi sua sheet go nham hoac co y.
function isHttpUrl(value: string): boolean {
  return /^https?:\/\/\S+$/i.test(value);
}

type DraftTrack = { slug: string; name: string; description: string; lessons: CourseLesson[] };
type DraftCourse = { slug: string; title: string; description: string; image: string; tracks: Map<string, DraftTrack> };

export async function getCourses(): Promise<Course[]> {
  const rows = await fetchSheetRows(process.env.COURSES_SHEET_CSV_URL || resourcesSheetUrl, "Courses");
  if (rows.length < 2) {
    return [];
  }

  const [header, ...body] = rows;
  const start = columnIndexAny(header, COURSE_HEADER_NAMES);
  if (start === -1) {
    if (isDev) {
      console.warn(`[Courses] Không thấy cột có header "Môn" (khối Course bắt đầu từ cột W). Header đang đọc được: ${header.map((h) => `"${h.trim()}"`).join(", ")}`);
    }
    return [];
  }

  let end = start + 1;
  while (end < header.length && header[end].trim() !== "") end += 1;

  const blockColumn = (names: string[]): number => {
    const wanted = names.map(normalizeHeader);
    for (let index = start; index < end; index += 1) {
      if (wanted.includes(normalizeHeader(header[index]))) return index;
    }
    return -1;
  };

  const col = {
    course: start,
    title: blockColumn(["title", "Tiêu đề", "Tên bài"]),
    url: blockColumn(["url", "link", "Đường dẫn"]),
    type: blockColumn(["type", "Định dạng", "Hình thức"]),
    description: blockColumn(["description", "Mô tả"]),
    image: blockColumn(["id", "image", "Ảnh"]),
    track: blockColumn(["track", "Nhánh"]), // tuy chon
    group: blockColumn(["group", "Chương", "Nhóm bài", "Phần"]) // tuy chon
  };

  if (isDev) {
    const cell = (index: number) => (index === -1 ? "(không có)" : `"${header[index].trim()}"`);
    console.log(
      `[Courses] ${body.length} dòng | vùng ${start + 1}-${end} | môn: ${cell(col.course)} | title: ${cell(col.title)} | url: ${cell(col.url)} | ` +
        `type: ${cell(col.type)} | description: ${cell(col.description)} | id/ảnh: ${cell(col.image)} | track: ${cell(col.track)} | group: ${cell(col.group)}`
    );
  }

  if (col.title === -1 || col.url === -1) {
    if (isDev) {
      console.warn(`[Courses] Khối Course thiếu header Title hoặc URL. Điền header liền nhau từ cột W: Môn, Title, URL, Type, Description, id.`);
    }
    return [];
  }

  const courses = new Map<string, DraftCourse>();
  const usedCourseSlugs = new Set<string>();
  const imageRefs: string[] = [];
  const skipped: string[] = [];

  const getCourse = (name: string): DraftCourse => {
    const key = normalizeHeader(name);
    let course = courses.get(key);
    if (!course) {
      course = { slug: slugify(name, usedCourseSlugs), title: name, description: "", image: "", tracks: new Map() };
      courses.set(key, course);
    }
    return course;
  };

  const getTrack = (course: DraftCourse, name: string): DraftTrack => {
    const key = normalizeHeader(name);
    let track = course.tracks.get(key);
    if (!track) {
      const used = new Set([...course.tracks.values()].map((t) => t.slug));
      track = { slug: name ? slugify(name, used) : "all", name, description: "", lessons: [] };
      course.tracks.set(key, track);
    }
    return track;
  };

  body.forEach((row, index) => {
    const rowNo = index + 2;
    const courseName = cellAt(row, col.course);
    const trackName = cellAt(row, col.track);
    const group = cellAt(row, col.group);
    const title = cellAt(row, col.title);
    const url = cellAt(row, col.url);
    const rawType = cellAt(row, col.type);
    const description = cellAt(row, col.description);
    const image = cellAt(row, col.image);

    // Phan lon dong chi co du lieu Documents / Inventory, khoi Course de trong: bo qua im lang.
    if (![courseName, trackName, group, title, url, rawType, description, image].some(Boolean)) return;

    if (!courseName) {
      skipped.push(`dòng ${rowNo}: có dữ liệu ở khối Course nhưng ô Môn trống`);
      return;
    }

    const course = getCourse(courseName);
    if (image && !course.image) {
      course.image = image;
      imageRefs.push(image);
    }

    // Khong co Title va URL: dong mo ta (cua nhanh neu co Track, nguoc lai cua mon).
    if (!title && !url) {
      if (description) {
        if (trackName) {
          const track = getTrack(course, trackName);
          if (!track.description) track.description = description;
        } else if (!course.description) {
          course.description = description;
        }
      }
      return;
    }

    if (!title) {
      skipped.push(`dòng ${rowNo}: có URL nhưng thiếu Title`);
      return;
    }
    if (url && !isHttpUrl(url)) {
      skipped.push(`dòng ${rowNo}: URL phải bắt đầu bằng http:// hoặc https://`);
      return;
    }

    getTrack(course, trackName).lessons.push({
      title,
      url,
      type: !url ? "" : rawType ? normalizeResourceType(rawType) : detectTypeFromUrl(url),
      group,
      description
    });
  });

  if (isDev) {
    if (skipped.length > 0) {
      console.warn(`[Courses] Bỏ qua ${skipped.length} dòng: ${skipped.join("; ")}`);
    }
    checkLocalImages("Courses", "courses", imageRefs);
  }

  const result: Course[] = [];
  for (const course of courses.values()) {
    const filled = [...course.tracks.values()].filter((track) => track.lessons.length > 0);
    if (filled.length === 0) continue;

    // Nhanh khong ten (dong chua ghi Track) chi can nhan khi mon co nhieu nhanh.
    const tracks: CourseTrack[] = filled.map((track) => ({
      slug: track.slug,
      name: track.name || (filled.length > 1 ? "Chung" : ""),
      description: track.description,
      lessons: track.lessons
    }));

    result.push({
      slug: course.slug,
      title: course.title,
      description: course.description,
      image: course.image ? resolvePhotoUrl(course.image, "courses") : "",
      tracks,
      lessonCount: tracks.reduce((sum, track) => sum + track.lessons.length, 0)
    });
  }
  return result;
}
