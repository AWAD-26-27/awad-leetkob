# AI-LOG.md

Student: **[MSSV — Họ và tên]**

Tool used: **[Tên công cụ AI]**

## [YYYY-MM-DD] — Prompt [số thứ tự]: [Tiêu đề]

Tool: [Tên công cụ AI].

Asked for:

> [Nội dung prompt]

Kept: [Nội dung hoặc đề xuất của AI được giữ lại.]

Changed: [Nội dung đã chỉnh sửa và lý do.]

Rejected: [Đề xuất bị bác bỏ và lý do; nếu chưa có thì ghi đúng thực tế.]

By hand: [Phần tự thực hiện, kiểm tra và bằng chứng liên quan.]

## 2026-11-10 — Tú — CI chạy checks thật và chuẩn bị required checks

Tool: Codex.

Asked for:

> Sau khi kiểm tra các lệnh local, triển khai GitHub Actions workflow và xác định thứ tự bật gate trong Settings/ruleset.

Kept: Dùng cùng `npm run check` như local; job E2E độc lập chạy `npm run e2e`. Giữ nguyên lỗi lint và các tests/API để lưu bằng chứng ban đầu và đúng phạm vi phân công.

Changed: Workflow cũ chỉ chạy khi push main, dùng Node 20, bỏ qua lỗi lint qua `continue-on-error` và lỗi tests qua `|| true`. Chuyển sang Node 22 phù hợp engines của project, `npm ci`, chạy trên PR vào main, push main và tag pa2; thêm job cài Chromium rồi chạy E2E. Token workflow chỉ có quyền đọc nội dung repo.

Rejected: Chưa có đề xuất AI nào bị Tú bác bỏ được ghi nhận trong lượt này. Không tự nhận đã cấu hình ruleset, đã có PR bị chặn hoặc đã chạy CI trên GitHub.

Validation: Theo log local Tú cung cấp: lint lỗi `legacyLimit`, unit tests 5/5 pass, contract tests 8/8 được báo pass nhưng pending assertion `200 !== 409` bị catch, E2E 1/1 pass. Codex đã parse YAML bằng `js-yaml`, kiểm tra format workflow bằng Prettier và chạy `git diff --check`, đều thành công. Chạy lại `npm run check` trả exit code 1 đúng tại lint `legacyLimit`; các bước phía sau chưa chạy trong lần gọi đó. Chưa chạy workflow trên GitHub hoặc xác nhận các jobs xanh trên runner.

Evidence: `.github/workflows/ci.yml`. Chưa có SHA commit, PR hoặc GitHub CI run; Tú bổ sung link sau khi push branch và mở PR.
