import { defineConfig, devices } from "@playwright/test";
import { readFileSync } from "node:fs";

const port = Number(process.env.E2E_PORT ?? 3100);
const dataPort = Number(process.env.E2E_DATA_PORT ?? 3101);
const SHEET_VARS = ["OVERVIEW", "ABOUT", "STUDENTS", "RESOURCES", "NEWS", "CAMPUS", "EVENTS", "RESEARCH", "ADMISSIONS", "COURSES"].map((name) => `${name}_SHEET_CSV_URL`);
// Biến môi trường dữ liệu mẫu (cùng nội dung với scripts/fixture-env.mjs; Playwright biên dịch file này sang CommonJS nên không nạp trực tiếp file .mjs).
const fixtureEnv = (extra: Record<string, string>): Record<string, string> => ({
  ...(JSON.parse(readFileSync("tests/fixtures/env.json", "utf8")) as Record<string, string>),
  COURSES_SHEET_CSV_URL: "",
  SHEET_FIXTURES_DIR: "tests/fixtures",
  VERCEL: "",
  ...extra
});
// Máy không tải được trình duyệt của Playwright (mạng hạn chế) thì trỏ PW_CHROMIUM_PATH tới một Chromium có sẵn.
const executablePath = process.env.PW_CHROMIUM_PATH;
const launchOptions = executablePath
  ? { executablePath, args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", ...(process.env.PW_CHROMIUM_ARGS?.split(" ").filter(Boolean) ?? [])] }
  : {};

// Hai bộ kiểm thử:
//  - tests/e2e      : chạy KHÔNG có Google Sheet nào (kiểm khung trang, bảo mật, trạng thái trống) trên `.next`;
//  - tests/e2e-data : chạy với DỮ LIỆU MẪU (tests/fixtures) trên `.next-fixtures` (bộ lọc, ★, khóa học, lịch, ảnh...).
// Cần build cả hai trước: `npm run build && npm run build:fixtures` (hoặc `npm run e2e:all`).
export default defineConfig({
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  // Chạy song song nhiều trình duyệt trên một máy thì trang có thể chậm hơn 5 giây mặc định.
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: { trace: "retain-on-failure", launchOptions },
  projects: [
    { name: "desktop", testDir: "tests/e2e", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, baseURL: `http://localhost:${port}` } },
    { name: "mobile", testDir: "tests/e2e", use: { ...devices["Pixel 7"], baseURL: `http://localhost:${port}` } },
    { name: "data-desktop", testDir: "tests/e2e-data", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 }, baseURL: `http://localhost:${dataPort}` } },
    { name: "data-mobile", testDir: "tests/e2e-data", use: { ...devices["Pixel 7"], baseURL: `http://localhost:${dataPort}` } }
  ],
  webServer: [
    {
      command: `npx next start -p ${port}`,
      url: `http://localhost:${port}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      // Tắt mọi link Google Sheet (kể cả khi máy có .env.local) để bài kiểm thử không phụ thuộc mạng hay dữ liệu thật.
      env: { ADMIN_PASSWORD: "e2e-password-1234567", ...Object.fromEntries(SHEET_VARS.map((name) => [name, ""])) }
    },
    {
      command: `npx next start -p ${dataPort}`,
      url: `http://localhost:${dataPort}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: { ADMIN_PASSWORD: "e2e-password-1234567", ...fixtureEnv({ NEXT_DIST_DIR: ".next-fixtures" }) }
    }
  ]
});
