// Quét mã nguồn tìm khóa bí mật bị đưa nhầm vào repo (chạy trong CI và bằng `npm run check:secrets`).
// - Trong repo git: chỉ quét file đang được theo dõi (git ls-files), và báo cả khi file .env thật bị theo dõi.
// - Ngoài git: duyệt thư mục, bỏ qua node_modules, .next, .git.
// Không bao giờ in giá trị bí mật ra màn hình, chỉ in file, dòng và loại. Thêm `secret-scan:allow` vào dòng để bỏ qua dòng đó.
import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { basename, extname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const RULES = [
  { id: "private-key", re: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/ },
  { id: "aws-access-key", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { id: "github-token", re: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{36,}\b|\bgithub_pat_[A-Za-z0-9_]{50,}\b/ },
  { id: "stripe-live-key", re: /\b[sr]k_live_[0-9A-Za-z]{16,}\b/ },
  { id: "supabase-secret-key", re: /\bsb_secret_[A-Za-z0-9_-]{20,}/ },
  { id: "slack-token", re: /\bxox[baprs]-[0-9A-Za-z-]{10,}\b/ },
  { id: "google-api-key", re: /\bAIza[0-9A-Za-z_-]{35}\b/ },
  { id: "discord-webhook", re: /https:\/\/(?:ptb\.|canary\.)?discord(?:app)?\.com\/api\/webhooks\/\d{6,}\/[\w-]{20,}/ },
  { id: "slack-webhook", re: /https:\/\/hooks\.slack\.com\/services\/T\w+\/B\w+\/\w{16,}/ },
  // Link "publish to web" thật của Google Sheet (ai có link là đọc được). Chỗ ví dụ dùng YOUR_ID nên không khớp.
  { id: "google-sheet-publish-link", re: /docs\.google\.com\/spreadsheets\/d\/e\/2PACX-[\w-]{20,}/ }
];

// Gán giá trị dài cho biến có tên "bí mật" (SERVICE_ROLE, SECRET, API_KEY...). Giá trị mẫu (YOUR_..., change-this...) thì bỏ qua.
const ASSIGN = /^\s*(?:export\s+)?[A-Z0-9_]*(?:SERVICE_ROLE|SECRET|PRIVATE_KEY|API_KEY|ACCESS_TOKEN|AUTH_TOKEN)[A-Z0-9_]*\s*=\s*["']?([^\s"'#]{16,})/;
const PLACEHOLDER = /^(?:your[-_]|change|example|x{3,}|<|\$\{|process\.env|placeholder|todo|dummy|test)/i;

const JWT = /\beyJ[\w-]{8,}\.eyJ[\w-]{8,}\.[\w-]{8,}\b/g;
const SKIP_EXT = new Set([".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".woff", ".woff2", ".ttf", ".pdf", ".zip", ".mp4", ".mp3"]);
const SKIP_NAMES = new Set(["package-lock.json"]);
const ENV_OK = new Set([".env.example", ".env.sample", ".env.template"]);
const MAX_BYTES = 1024 * 1024;

function jwtRole(token) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(Buffer.from(payload, "base64").toString("utf8")).role;
  } catch {
    return undefined;
  }
}

/** Trả về danh sách { rule, line } cho một đoạn văn bản. */
export function scanText(text) {
  const findings = [];
  text.split(/\r?\n/).forEach((lineText, index) => {
    if (lineText.includes("secret-scan:allow")) return;
    for (const rule of RULES) if (rule.re.test(lineText)) findings.push({ rule: rule.id, line: index + 1 });
    const assigned = lineText.match(ASSIGN);
    if (assigned && !PLACEHOLDER.test(assigned[1])) findings.push({ rule: "secret-assignment", line: index + 1 });
    for (const token of lineText.match(JWT) ?? []) {
      // Khóa "anon" của Supabase là công khai theo thiết kế; khóa service_role thì có toàn quyền với cơ sở dữ liệu.
      if (jwtRole(token) === "service_role") findings.push({ rule: "supabase-service-role-key", line: index + 1 });
    }
  });
  return findings;
}

/** Danh sách file cần quét (đường dẫn tương đối, dùng dấu /). */
export function listFiles(root) {
  try {
    const out = execFileSync("git", ["ls-files", "-z"], { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
    return { files: out.split("\0").filter(Boolean), mode: "git" };
  } catch {
    const files = [];
    const walk = (dir) => {
      for (const entry of readdirSync(dir)) {
        if (["node_modules", ".next", ".next-fixtures", ".git", "test-results", "playwright-report"].includes(entry)) continue;
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full);
        else files.push(relative(root, full).split("\\").join("/"));
      }
    };
    walk(root);
    // Không có git: file .env thật là chuyện bình thường trên máy làm việc, nên bỏ qua thay vì báo.
    return { files: files.filter((f) => !basename(f).startsWith(".env")), mode: "walk" };
  }
}

export function scanRepo(root) {
  const { files, mode } = listFiles(root);
  const findings = [];
  for (const file of files) {
    const name = basename(file);
    if (mode === "git" && name.startsWith(".env") && !ENV_OK.has(name)) findings.push({ file, line: 0, rule: "env-file-tracked" });
    if (SKIP_NAMES.has(name) || SKIP_EXT.has(extname(name).toLowerCase())) continue;
    let text;
    try {
      const path = join(root, file);
      if (statSync(path).size > MAX_BYTES) continue;
      text = readFileSync(path, "utf8");
    } catch {
      continue;
    }
    for (const finding of scanText(text)) findings.push({ file, ...finding });
  }
  return { findings, scanned: files.length, mode };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const root = fileURLToPath(new URL("..", import.meta.url));
  const { findings, scanned, mode } = scanRepo(root);
  if (findings.length === 0) {
    console.log(`Không thấy khóa bí mật (đã quét ${scanned} file, chế độ ${mode}).`);
  } else {
    console.error(`PHÁT HIỆN ${findings.length} chỗ có thể là khóa bí mật (giá trị không được in ra):`);
    for (const f of findings) console.error(`  ${f.file}${f.line ? `:${f.line}` : ""}  [${f.rule}]`);
    console.error("\nNếu là khóa thật: ĐỔI KHÓA NGAY (xem docs/runbooks/secret-rotation.md), rồi mới gỡ khỏi repo.");
    process.exit(1);
  }
}
