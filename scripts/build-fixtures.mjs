// Build bản dùng dữ liệu mẫu vào thư mục riêng .next-fixtures (không đụng bản build thường ở .next).
// Dùng cho kiểm thử E2E có dữ liệu:  npm run build:fixtures
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fixtureEnv } from "./fixture-env.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "build"], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, ...fixtureEnv({ NEXT_DIST_DIR: ".next-fixtures" }) }
});
child.on("exit", (code) => process.exit(code ?? 0));
