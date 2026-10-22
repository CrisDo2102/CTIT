// Chạy site với dữ liệu mẫu (không cần Google Sheet, không cần mạng):  npm run dev:fixtures
// Mở http://localhost:3000. Chỉ dùng để xem và phát triển giao diện, KHÔNG dùng để chạy thật.
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import { fixtureEnv } from "./fixture-env.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const port = process.env.PORT ?? "3000";

console.log(`Chạy với DỮ LIỆU MẪU tại http://localhost:${port} (ghi đè các link Sheet trong .env.local).`);
const child = spawn(process.platform === "win32" ? "npx.cmd" : "npx", ["next", "dev", "--webpack", "-p", port], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
  env: { ...process.env, ...fixtureEnv() }
});
child.on("exit", (code) => process.exit(code ?? 0));
