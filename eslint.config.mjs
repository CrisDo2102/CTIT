import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // Nhiều component đọc link / localStorage SAU khi trang hiện ra (useEffect rồi setState) để HTML trên server và
      // trên trình duyệt khớp nhau, tránh lỗi hydration. Quy tắc này khuyên tránh mẫu đó, nhưng ở đây là cố ý,
      // nên để mức cảnh báo thay vì lỗi để không chặn CI. Chuyển sang useSyncExternalStore nếu muốn gỡ dần.
      "react-hooks/set-state-in-effect": "warn",
      // Ảnh lấy từ Google Drive và nhiều nguồn theo link trong Sheet, chưa dùng được next/image (cần khai báo từng tên miền).
      "@next/next/no-img-element": "warn"
    }
  },
  globalIgnores([".next/**", ".next-fixtures/**", "node_modules/**", "out/**", "build/**", "next-env.d.ts", "playwright-report/**", "test-results/**"])
]);
