import { readdir } from "node:fs/promises";
import path from "node:path";

/** Imagery là tài nguyên trong repo, không dùng Google Sheets và không nhận upload qua HTTP. */
export type ImageryPhoto = {
  filename: string;
  title: string;
  url: string;
};

export type ImageryCategory = {
  name: string;
  slug: string;
  href: string;
  photos: ImageryPhoto[];
  cover: string | null;
};

const ROOT = path.join(process.cwd(), "public", "images", "Imagery");
const EXTENSIONS = /\.(?:jpe?g|png|webp|avif|gif)$/i;

/** Tên folder/file hiển thị đúng trên máy, bỏ qua tên ẩn và ký tự không an toàn. */
function isSafeName(name: string): boolean {
  return name.length > 0 && !name.startsWith(".") && !/[\\/\u0000-\u001f\u007f]/.test(name);
}

export function isImageryFile(name: string): boolean {
  return isSafeName(name) && EXTENSIONS.test(name);
}

function titleFromFilename(filename: string) {
  return filename.replace(EXTENSIONS, "").replace(/[_-]+/g, " ").trim() || filename;
}

/** URL-encode từng phần đường dẫn để hỗ trợ tên ảnh có dấu, dấu cách và dấu #. */
export function imageryPhotoUrl(category: string, filename: string): string {
  return `/images/Imagery/${encodeURIComponent(category)}/${encodeURIComponent(filename)}`;
}

/**
 * Quét duy nhất các subfolder cấp 1 của public/images/Imagery.
 * Không theo symlink, không đọc file bên ngoài thư mục, không trả về đường dẫn ổ đĩa.
 * Khi npm run build chạy, Next.js prerender trang từ ảnh có trong repository.
 */
export async function getImageryCategories(root: string = ROOT): Promise<ImageryCategory[]> {
  let entries;
  try {
    entries = await readdir(root, { withFileTypes: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }

  const categories = await Promise.all(
    entries
      .filter((entry) => entry.isDirectory() && isSafeName(entry.name))
      .map(async (entry): Promise<ImageryCategory> => {
        const children = await readdir(path.join(root, entry.name), { withFileTypes: true });
        const photos = children
          .filter((child) => child.isFile() && isImageryFile(child.name))
          .sort((a, b) => a.name.localeCompare(b.name, "vi", { numeric: true }))
          .map((child) => ({
            filename: child.name,
            title: titleFromFilename(child.name),
            url: imageryPhotoUrl(entry.name, child.name)
          }));

        return {
          name: entry.name,
          slug: entry.name,
          href: `/imagery/${encodeURIComponent(entry.name)}`,
          photos,
          cover: photos[0]?.url ?? null
        };
      })
  );

  return categories.sort((a, b) => a.name.localeCompare(b.name, "vi", { numeric: true }));
}

/** Không mở thẳng folder từ route param, chỉ chọn trong danh sách đã quét hợp lệ. */
export async function getImageryCategory(name: string, root: string = ROOT) {
  return (await getImageryCategories(root)).find((category) => category.name === name) ?? null;
}
