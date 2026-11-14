# CTIT – Triển khai an toàn với GitHub Public + Vercel (22/10/2026)

> Mục tiêu: giữ nguyên UI/UX của CTIT và Google Sheets (CSV public); nâng cấp kiểm soát truy cập, bí mật, chuỗi cung ứng phần mềm, API và vận hành. Không có tuyên bố "bất khả xâm phạm".

## 1. ĐIỀU PHẢI LÀM NGAY (chủ sở hữu thực hiện trên tài khoản)

1. **Không đẩy `.env.local` lên GitHub.** ZIP mã nguồn mới không chứa file đó. `.gitignore` và `.vercelignore` chặn env địa phương. Chạy `git ls-files .env.local .env .env.production` trên máy: phải không có đầu ra; nếu có, `git rm --cached -- .env.local` (hoặc các file tương ứng) rồi commit. Kiểm tra *cả lịch sử và GitHub forks*, vì xoá ở commit mới không xoá được dữ liệu đã lộ.
2. **Đổi `ADMIN_PASSWORD` nếu từng dùng giá trị mẫu, đăng công khai hoặc nghi bị lộ.** Mật khẩu ngẫu nhiên **>=20 ký tự** từ password manager. Đặt trên Vercel > Project > Settings > Environment Variables (Production, Preview riêng biệt). Không đưa mật khẩu vào `NEXT_PUBLIC_*`. Đặt `ADMIN_USERNAME` khác `admin` (nếu muốn), rồi redeploy. `.env.example` chỉ chứa tên và mẫu, không chứa bí mật.
3. **GitHub:** bật 2FA/passkey cho tài khoản; trong repo > Settings > Advanced Security bật Secret scanning, Push protection, Dependabot alerts, Dependabot security updates và Code scanning. Thiết lập branch protection/ruleset cho `main` (require PR, required CI checks, block force pushes). Xem thêm file `.github/workflows/codeql.yml` chạy CodeQL security-extended và `.github/workflows/ci.yml`.
4. **Vercel:** Project > Settings > Deployment Protection > Standard Protection + Vercel Authentication cho Preview & deployment URLs (giữ production domain public). Project > Firewall > thêm rate limiting cho `/admin` và `/admin/:path*`, `/api/report`. Thử với action **Log/Challenge** trước khi Block để tránh chặn người dùng thật. Bật bot protections, cảnh báo/giám sát chi phí và quan sát logs tùy gói. Đảm bảo Git Fork Protection bật và Build Logs & Source Protection không bị tắt.
5. **Nội dung Google Sheet Publish to web vốn công khai** với người có URL và nội dung có thể xuất hiện trên website. Không đưa dữ liệu cá nhân, token, API key hoặc thông tin chỉ dành cho nội bộ vào các tab xuất bản. Việc để URL Sheet trong environment variables không biến dữ liệu đã publish thành bí mật. Nếu muốn nội dung riêng tư, cần thay kiến trúc (Google API server-side có quyền truy cập), không chỉ thay `.env`.

## 2. Công cụ giám sát sau khi nâng cấp

- `/api/health`: public, chỉ trả `{status, version}`, HTTP 200 hoặc 503. Dùng với UptimeRobot/Better Stack.
- `/admin/health`: có mật khẩu, hiển thị từng nguồn Sheet, trạng thái, số dòng và cấu hình cảnh báo, `Cache-Control: no-store`. Không cấu hình đường dẫn này cho uptime checker công khai nếu checker không hỗ trợ HTTP Basic.
- `/admin/test-alert`: chỉ POST và có cả Basic Auth và đối chiếu Origin thực; không cho cross-site gửi thử.
- `/api/report`: kiểm tra Origin, Fetch Metadata, content-type, kích thước thực của body; giới hạn best effort theo IP. Cần WAF rate-limit toàn cục vì Vercel Functions có thể chạy nhiều instance.

## 3. Các tầng kiểm soát trong source

- `proxy.ts`: xác thực `/admin` theo cả `ADMIN_USERNAME` và `ADMIN_PASSWORD`, so sánh hash để tránh so khớp theo tiền tố; khoá khi sai 5 lần mỗi IP trong 15 phút; chạy thật fail closed nếu password thiếu, mẫu hoặc dưới 20 ký tự; dev không mật khẩu chỉ cho localhost. **HTTP Basic Auth không thay thế được MFA**, nên tài khoản Vercel/GitHub bắt buộc bật MFA và thêm kiểm soát WAF cho admin.
- `next.config.ts`: CSP hạn chế nguồn tải, chặn inline event handlers, cấm object, khóa base-uri và form-action, chống clickjacking, nosniff, HSTS khi production, Referrer-Policy, Permissions-Policy. `script-src 'unsafe-inline'` vẫn được giữ để tương thích Next.js static/SSG đang chạy; muốn bỏ hẳn cần thiết kế nonce và kiểm thử ảnh hưởng dynamic rendering/cache trước khi triển khai.
- `lib/sheet-source.ts`: chỉ cho HTTPS tới hostname Google hợp lệ; redirect được xử lý thủ công và từ chối rời miền Google; giới hạn 5 MB ngay khi đọc stream, timeout 10 giây và số redirect. Không thay đổi dữ liệu CSV đã xử lý hay cấu trúc Sheet.
- `lib/alert.ts`: webhook chỉ HTTPS, không chuyển hướng (chống lạm dụng redirect/SSRF); `lib/log.ts` hạn chế token, bearer và query URL rò rỉ qua nhật ký.
- **Đã nâng `next` lên 16.4.1 và `react`/`react-dom` lên 19.2.9** theo các bản vá bảo mật công bố 14/10/2026. Script `npm run check:dependencies` ngăn quay lại phiên bản có lỗ hổng. Vì môi trường tạo bản vá này không kết nối tới registry npm, `package-lock.json` đã pin phiên bản mới nhưng bỏ checksum SHA512 cũ (không giả mạo checksum). **Trước khi đưa lên production**, chạy trên máy có Internet: `npm install next@16.4.1 react@19.2.9 react-dom@19.2.9 --save-exact` để npm tải metadata thật và tạo lại lockfile có checksum chính xác; sau đó `npm ci` và chạy toàn bộ kiểm thử.
- `.github/dependabot.yml`, `.github/workflows/codeql.yml` và CI: Dependabot cập nhật thư viện, CodeQL phân tích Code Scanning, TypeScript/lint/Vitest/Playwright/secret-scan/npm-audit trong pipeline.
- Bản source xuất bản không chứa `node_modules`, `.next`, `.env.local`, log hay build cache — build lại bằng `npm ci && npm run build`.

## 4. Đưa bản này lên GitHub đang tồn tại

1. Sao lưu bản CTIT cũ trên máy (bao gồm `.env.local` riêng ở nơi an toàn). Giải nén bản CTIT secure vào thư mục tạm; copy **mã nguồn** vào repo Git đã clone, tránh mang file `.env.local` và `.git` lạ vào.
2. Chạy trong PowerShell ở root repo có `.git`:

   ```powershell
   # Bước bắt buộc, có Internet: tái tạo lockfile và checksum chính xác.
   npm install next@16.4.1 react@19.2.9 react-dom@19.2.9 --save-exact
   npm ci
   npm run check:dependencies
   npm run typecheck
   npm run lint
   npm test
   npm run check:secrets
   npm run build
   git status
   git ls-files .env.local .env .env.production
   git add -A
   git diff --cached --stat
   git diff --cached --name-only
   git commit -m "security: harden CTIT for public GitHub and Vercel"
   git push origin main
   ```

   Kiểm tra kỹ staging trước commit; không chạy `git push --force` nếu không có nhu cầu quản trị lịch sử. Nếu thư mục không phải repository, clone GitHub repo vào một thư mục khác và copy source sang đó trước.
3. Sau push: kiểm tra GitHub Actions đều xanh, Vercel redeploy production, thử trang công khai, đăng nhập `/admin`, thử `/api/health` và `/admin/health`, tìm kiếm, điều hướng, đọc Sheet; xác nhận bảng dữ liệu vẫn cập nhật.
4. Nếu nghi khóa từng bị commit: **rotate hoặc thu hồi khóa trước**, rồi mới dọn lịch sử Git bằng quy trình GitHub. Xoá file ở bản hiện tại không thu hồi được khóa cũ và không xoá được bản sao trong forks/clones.

## 5. Các mục không thể thực hiện chỉ bằng sửa mã nguồn

- Không thể tự bật 2FA, Push protection, branch rulesets, Vercel WAF, deployment protection và thay environment variables trong tài khoản người dùng nếu không có quyền truy cập vào các bảng điều khiển.
- Không thể khẳng định mọi lỗ hổng đã được loại bỏ nếu chưa chạy kiểm thử E2E, vulnerability scanning và penetration test trên deployment thực tế.
- Content Security Policy vẫn cho phép một số inline script/style do cấu trúc Next.js hiện tại, nên không đạt strict nonce CSP; đây là quyết định tương thích chủ động để giữ nguyên UX và cache.

Nguồn chính thức: https://vercel.com/docs/production-checklist ; https://vercel.com/docs/deployment-protection ; https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting ; https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/enabling-features-for-your-repository/managing-security-and-analysis-settings-for-your-repository ; https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
