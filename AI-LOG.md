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

Rejected: Chưa có đề xuất AI nào bị Tú bác bỏ được ghi nhận trong lượt này.

Validation: Theo log local Tú cung cấp: lint lỗi `legacyLimit`, unit tests 5/5 pass, contract tests 8/8 được báo pass nhưng pending assertion `200 !== 409` bị catch, E2E 1/1 pass. Codex đã parse YAML bằng `js-yaml`, kiểm tra format workflow bằng Prettier và chạy `git diff --check`, đều thành công. Chạy lại `npm run check` trả exit code 1 đúng tại lint `legacyLimit`; các bước phía sau chưa chạy trong lần gọi đó. Sau đó Tú cung cấp log CI đỏ trên GitHub và hai ảnh của PR #1: ảnh đỏ có `gates` Required thất bại và nút Merge bị vô hiệu hóa; ảnh xanh sau commit `09d9539` có cả `gates`/`e2e` Required đạt và nút Merge được bật. Tú thông báo PR đã merge thành công. Các run chạy lại trên branch evidence được dẫn ở bảng bên dưới.

Evidence:

| Bằng chứng | Link/đường dẫn |
| --- | --- |
| Workflow | `.github/workflows/ci.yml` |
| PR đỏ rồi được sửa xanh | [PR #1](https://github.com/AWAD-26-27/awad-leetkob/pull/1) |
| Commit triển khai workflow | [eba0b2a](https://github.com/AWAD-26-27/awad-leetkob/commit/eba0b2a3578e5e47e8e0fa78c909a7a922970143) |
| Commit sửa lint trong PR #1 | [09d9539](https://github.com/AWAD-26-27/awad-leetkob/commit/09d95396a1a61505030661d2088c9d59181747cd) |
| CI đỏ — lần chạy lại, Tú cung cấp | [Run 42751983807](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42751983807) |
| CI xanh — lần chạy lại, Tú cung cấp | [Run 42755020550](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42755020550) |
| PR #1 đỏ, check Required và merge bị chặn | [Ảnh PR đỏ](evidence/ci-workflow-gate-failed.png) |
| PR #1 xanh sau commit sửa lint | [Ảnh PR xanh](evidence/ci-workflow-gate-succeed.png) |
| Ruleset Active, target main, bypass list trống | [Ảnh ruleset](evidence/main-ruleset.png) |
| Bắt buộc PR, required checks gates/e2e và chặn force push | [Ảnh required checks](evidence/ci-gate-e2e-main-ruleset.png) |

Ghi chú kiểm chứng: Theo yêu cầu của Tú, Codex đã copy cả bốn ảnh từ thư mục evidence ngoài repo vào `evidence/` trong repo và cập nhật link tương đối. Đã xem ảnh PR đỏ/xanh và ảnh cấu hình ruleset: Active, target main, bypass list trống, bắt buộc PR, required checks gates/e2e và chặn force push. Ảnh phản ánh cấu hình tại thời điểm chụp, không phải kiểm tra trực tiếp settings hiện tại qua API. Trạng thái đỏ/xanh của hai run mới dựa trên xác nhận và link Tú cung cấp; công cụ web chưa tải được các trang run nên chưa xác minh độc lập metadata, branch hay toàn bộ log. Không dùng hai run trên push để thay thế bằng chứng PR bị chặn merge. Deliberate contract break và CI cho tag `pa2` là các bằng chứng riêng còn cần tổng hợp.
