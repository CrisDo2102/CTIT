// Biến môi trường để chạy site bằng dữ liệu mẫu (dùng chung cho dev:fixtures, build:fixtures và Playwright).
import { readFileSync } from "node:fs";

const sheets = JSON.parse(readFileSync(new URL("../tests/fixtures/env.json", import.meta.url), "utf8"));

export function fixtureEnv(extra = {}) {
  // COURSES_SHEET_CSV_URL trống: Khóa học lấy từ tab Resources (đúng như khi chạy thật).
  return { ...sheets, COURSES_SHEET_CSV_URL: "", SHEET_FIXTURES_DIR: "tests/fixtures", VERCEL: "", ...extra };
}
