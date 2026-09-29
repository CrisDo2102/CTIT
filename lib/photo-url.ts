// Ham thuan, dung duoc ca server lan client.
// Cot anh trong sheet (photo / cover / image / id) la 1 trong nhieu kieu:
//   - Ten file thuong CO DUOI, vd: "nguyen-van-a.jpg"
//     -> ghep thanh "/images/Students/nguyen-van-a.jpg" (anh phai nam trong
//        public/images/Students, ten file khop CHINH XAC ke ca hoa/thuong)
//   - Link share Google Drive binh thuong (dang /file/d/ID/view hoac
//     ?id=ID) -> tu dong doi sang dang xem anh truc tiep
//   - Link URL day du khac, vd: "https://i.imgur.com/xxxx.jpg" -> dung thang

export type PhotoFolder = "students" | "about" | "resources" | "resourceInventory" | "campus" | "news" | "events" | "admissions" | "research";

// Ten folder THAT trong public/images/, viet dung hoa/thuong nhu tren may
// (Linux/Vercel phan biet hoa/thuong). Doi ten folder thi sua o day, 1 cho duy nhat.
const IMAGE_FOLDER_NAMES: Record<PhotoFolder, string> = {
  students: "Students",
  about: "About",
  resources: "Resources/Documents",
  resourceInventory: "Resources/Inventory",
  campus: "Campus",
  news: "News",
  events: "Events",
  admissions: "Admissions",
  research: "Research"
};

export function imageFolderName(folder: PhotoFolder): string {
  return IMAGE_FOLDER_NAMES[folder];
}

// true neu gia tri la ten file nam trong public/images/<folder> (khong phai
// link Drive, khong phai URL day du, khong phai duong dan bat dau bang "/").
export function isLocalImageRef(photo: string): boolean {
  const trimmed = photo.trim();
  if (!trimmed || toDriveDirectUrl(trimmed)) {
    return false;
  }
  return !/^https?:\/\//i.test(trimmed) && !trimmed.startsWith("/");
}

export function resolvePhotoUrl(photo: string, folder: PhotoFolder): string {
  const trimmed = photo.trim();
  if (!trimmed) {
    return "";
  }

  const driveDirectUrl = toDriveDirectUrl(trimmed);
  if (driveDirectUrl) {
    return driveDirectUrl;
  }

  const isAbsoluteUrl = /^https?:\/\//i.test(trimmed);
  const isAbsolutePath = trimmed.startsWith("/");
  if (isAbsoluteUrl || isAbsolutePath) {
    return trimmed;
  }

  return `/images/${IMAGE_FOLDER_NAMES[folder]}/${trimmed}`;
}

// Nhan dien link Google Drive (bat ky dang nao co chua file id) va tra ve
// dang "uc?export=view&id=..." de <img> load duoc truc tiep. File van phai
// duoc set quyen "Anyone with the link" thi moi xem duoc, du la dang link nao.
function toDriveDirectUrl(value: string): string | null {
  if (!/drive\.google\.com/i.test(value)) {
    return null;
  }

  const idFromPath = value.match(/\/d\/([a-zA-Z0-9_-]+)/);
  const idFromQuery = value.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  const fileId = idFromPath?.[1] ?? idFromQuery?.[1];

  if (!fileId) {
    return null;
  }

  return `https://drive.google.com/uc?export=view&id=${fileId}`;
}