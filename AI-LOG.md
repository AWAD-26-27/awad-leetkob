# AI-LOG.md

Team log for PA#2. Retain every member's dated entries when merging branches.

Confirmed identity: **23120111 — Phạm Quốc Nam Anh**. The other members' submission identities still need confirmation.

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

<a id="nam-anh-harness"></a>

## 2026-11-10 — Nam Anh — Harness, permissions và hồ sơ bàn giao

- Tool/model: Codex (GPT-6 assistant session); PowerShell, Git/GitHub CLI, pypdf, Gitleaks 8.30.1. Đây là công cụ hỗ trợ, không phải model của sản phẩm. Người dùng xác nhận MSSV/họ tên ở trên; không tuyên bố người dùng đã tự sửa tay đầu ra AI.
- Task: Đọc class brief trước rubric, phân công và template tự chấm trong Downloads; kiểm tra knowledge base. Clone repo public từ main `55a5c3045a8f5396eda3b99862391ca79f90a052`, tạo `docs/pa2-harness`; làm file Nam Anh quản lý.
- Kept: Rules bốn mục, permissions ba mức, commands khớp package/workflow, hai biến môi trường thực tế và bằng chứng đã kiểm tra.
- Changed: Thay README thực hành Session 7 bằng hướng dẫn PA#2; bỏ mẫu AI log chưa điền, giữ nguyên entry/ảnh Tú. Ghi rõ E2E required, JavaScript chưa cấu hình type checker, SQLite reset khi restart và model/cap chưa được xác minh. Sửa format local bằng cấu hình LF cho clone mới, không reformat source hàng loạt.
- Rejected (quyết định review của assistant): Bỏ câu starter “Nothing to hand in, not graded” vì repo phục vụ PA#2; không coi 8/8 tests xanh là pending guard đúng khi assertion bị nuốt; không suy diễn chi phí 0 thành spending cap đã cấu hình. Chưa có đề xuất nào được người dùng bác bỏ trong phiên này.
- Validation: `npm ci` thành công (90 packages, audit 0 vulnerabilities), local Node 26.5.0/npm 11.17.0 đáp ứng engines; CI được xác minh dùng Node 22.23.4. `npm run check` exit 0: lint/format đạt, unit 5/5, contract báo 8/8 nhưng vẫn log assertion pending bị nuốt (`200 !== 409`). `npm run e2e` đạt 1/1 sau cài Chromium. Lần check đầu lỗi CRLF: đặt local `core.autocrlf=false`, khôi phục chính xác LF của Git blob cho file chưa sửa (checkout-index đơn thuần chưa thay bytes), không thay nội dung source. Sau setup model, kiểm tra 81 link local không hỏng, bốn biến env khớp nơi dùng, git diff --check đạt; entry Tú được giữ nguyên văn. Gate được chạy lại thành công bằng Node 22.23.4/npm 10.9.9 đúng phiên bản CI, dùng bản Node chính thức đã đối chiếu SHA-256; không đổi Node global.
- Secrets: [Báo cáo scan](evidence/secrets-scan-2026-11-10.md). Gitleaks 8.30.1 từ GitHub release, SHA-256 khớp checksums của release; `gitleaks git . --log-opts="--all --full-history" --redact=100` không phát hiện secret trong mọi refs đã fetch. Scanner báo 4 commits có diff (lịch sử có 6 commits kể cả merge). Không phát hiện credential thật cần rotate. `tok-*` là fixture public, không phải key model. Scan working tree bằng `gitleaks dir . --redact=100` cũng không phát hiện secret. Kiểm tra ignore: `.env`, `.env.*`, secrets và private-key files bị ignore; `.env.example` không bị ignore. Scanner có giới hạn nhận diện; cần scan lại sau tích hợp branch khác.
- Model sản phẩm: không có SDK/provider/key trong repo, không gọi model, chi phí API mỗi demo lab là 0. Chưa xác minh lựa chọn model/cap của nhóm; không nhận hoàn tất capped key.
- Evidence: [rules](AGENTS.md), [permissions](docs/permissions.md), [.env.example](.env.example), [README](README.md), [PA2](PA2.md), [tự chấm tạm](SELF_ASSESSMENT_REPORT.md). Chưa có bàn giao Tường, tag cuối hay ZIP; không bịa entry người khác.

<a id="incident-ci-hidden-failures"></a>

### Incident: CI hidden failures — nguồn quy tắc không che exit code

Workflow ở [c48a77c](https://github.com/AWAD-26-27/awad-leetkob/commit/c48a77c041392270695e22a4951711e1373606c5) dùng Node 20, `continue-on-error` và `|| true`. [eba0b2a](https://github.com/AWAD-26-27/awad-leetkob/commit/eba0b2a3578e5e47e8e0fa78c909a7a922970143) bỏ che lỗi và gọi gate thật. Nam Anh/Codex đã đọc metadata/log [run đỏ 42751983807](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42751983807): event `pull_request`, head `eba0b2a`, ESLint `no-unused-vars` tại `src/http.js:17`, exit 1. [09d9539](https://github.com/AWAD-26-27/awad-leetkob/commit/09d95396a1a61505030661d2088c9d59181747cd) bỏ biến thừa; [run 42755020550](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42755020550) success, event `pull_request`, Node 22.23.4. Đây là xác minh độc lập bổ sung cho entry Tú, không thay ghi nhận cũ.

Đã xem ảnh [đỏ](evidence/ci-workflow-gate-failed.png) có gates Required fail/Merge disabled và ảnh [xanh](evidence/ci-workflow-gate-succeed.png) có hai Required pass. API ngày 2026-11-10 xác nhận [ruleset 26915632](https://github.com/AWAD-26-27/awad-leetkob/rules/26915632) active, target `refs/heads/main`, bypass trống, bắt buộc PR, `gates`/`e2e`, chặn force push. Classic API `/branches/main/protection` trả 404 vì repo dùng ruleset. Sau lúc bật ruleset, lịch sử main hiện chỉ có merge PR #1/#2; không push trực tiếp vào main để thử.

<a id="incident-swallowed-assertion"></a>

### Incident: swallowed assertion — nguồn quy tắc không nuốt assertion

Tại baseline `55a5c30`, test `it refuses while reviews are pending` trong [publish.contract.test.js](test/contract/publish.contract.test.js) có `try/catch` chỉ log lỗi. Log run xanh 42755020550 có `skipping pending check: Expected values to be strictly equal` rồi báo 8 tests pass: HTTP 200 thay vì 409 không làm gate đỏ. `src/app.js` ghi `published_at` trước kiểm tra quyền và chưa chặn pending. Nam Anh chỉ ghi nhận để tạo rules/đánh giá evidence; sửa tests/backend thuộc Tường. Không nhận đây là deliberate break: rubric cần PR/commit phá có chủ đích và CI thực sự đỏ, sẽ bổ sung sau.

<a id="nam-anh-model-setup"></a>

## 2026-11-10 — Nam Anh — Thiết lập model, key local và giới hạn trả phí 0 USD

- Tool/model: Codex + browser computer-use, Google AI Studio; product model chọn `gemini-3.8-flash` sau khi đọc trang pricing/billing chính thức hiện tại.
- Task: Người dùng yêu cầu “Cố làm tới 100, làm tốt nhất phần được giao”, sau đó “Gợi ý và cài đặt”. Đề xuất Gemini free tier, không bật billing; người dùng xác nhận “Tạo key và lưu local” tại bước tạo credential.
- Changed: Tạo project riêng LeeTKOB PA2, một key `leetkob-pa2-server`; xác minh Free tier và `Set up billing` (chưa liên kết billing). Lưu key duy nhất vào `.env` local bị ignore; cập nhật env example, README và docs/model-budget.md. Thêm scripts/model-smoke.js theo yêu cầu setup để kiểm tra tổng hợp thủ công, không đưa vào test/CI hoặc sửa files Tú/Tường.
- Rejected: Không dùng project Android Studio sẵn có vì nó là Tier 1; không bật billing/nạp tiền/auto-reload; không chọn Gemini 2.5 Flash vì docs cho biết đang deprecated; không gọi budget alert là hard cap. Không nhận model inference hoạt động chỉ vì key đã tạo. Đây là quyết định của assistant; không bịa đề xuất người dùng bác bỏ.
- Validation: UI chứng minh project riêng có 1 key, Free tier và chưa setup billing. `.env` ignored/untracked; giá trị key được xử lý trong runtime, không in vào tool output/history, không chụp ảnh key, clipboard được xóa. Sao chép clipboard ban đầu không cho một credential đơn, nên lấy đúng giá trị đang hiển thị vào file local mà không xuất giá trị. Lưu file thành công trước một lỗi dọn biến runtime; đóng dialog và xác minh lại project, không tạo key thứ hai.
- Provider checks: Request synthetic đầu trả HTTP 503; retry bị timeout sau 30 giây. Không chỉnh code/tests để giả xanh và không dùng dữ liệu sinh viên. Kiểm tra read-only `GET /v1beta/models` sau đó trả **HTTP 200**, xác nhận credential hợp lệ và có `models/gemini-3.8-flash`. Không đồng nhất model listing thành inference thành công.
- Spending/cost: Key kế thừa Free tier không billing, giới hạn chi trả hiệu dụng **USD 0**; không phải cap số trên paid tier. App hiện không gọi model, chi phí mỗi demo lab 0; chưa benchmark lab 80 bài hay triển khai application per-lab token cap. Free tier có quota và điều kiện sử dụng dữ liệu riêng.
- Secrets cuối: `gitleaks dir .` sau tạo key báo 1 finding tại `.env:2` — đúng key local đã được ủy quyền, ignored/untracked, không phải lộ vào Git. Không thêm allowlist che finding. Tạo snapshot bằng `git ls-files --cached --others --exclude-standard`, xác minh không có `.env`, chạy Gitleaks cùng default rules/redaction trên snapshot: exit 0, no leaks (~96.9 KB). Báo cáo redacted để ngoài repo; scan history cũng không có secret. Chỉ snapshot nội dung Git không ignore mới được dùng cho PR/ZIP.
- Evidence: [setup/budget](docs/model-budget.md), [ảnh project](evidence/gemini-free-tier-2026-11-10.jpg), [pricing](evidence/gemini-pricing-2026-11-10.jpg), [manual check](scripts/model-smoke.js). Key thật chỉ nằm trong `.env` local, không được đóng ZIP.

### Nam Anh — publication and fresh-clone verification

- Signed implementation/documentation commit: [431f57f](https://github.com/AWAD-26-27/awad-leetkob/commit/431f57fa0f82230fa0d3cf00a4641fc1eb48c482); GitHub verification is `valid`. The signing passphrase cache was cleared after the operation.
- Review PR: [#3](https://github.com/AWAD-26-27/awad-leetkob/pull/3), branch `docs/pa2-harness`; main was not changed. [Initial PR CI run](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42803926626); use the PR Checks tab for the latest head's result.
- Fresh clone of that committed branch, with LF and **Node 22.23.4/npm 10.9.9**: `npm ci`, `npm run check`, `npm run e2e` all exit 0, E2E 1/1. `.env` is absent from the clean clone. Contract still reports 8/8 while swallowing the known pending assertion; the limitation remains assigned to Tường, not accepted as correct behavior.
- Post-commit Gitleaks history scan: **5 commits with diffs, about 148.65 KB, no leaks**, all fetched refs/full history, redaction enabled. The actual local credential was also checked against all staged files without printing it; no match. All 15 changed paths are the assigned harness/docs/evidence plus the explicitly requested manual model setup script; no backend, test, workflow or package files changed.
- Provisional team score is now **83/100**, including verified no-paid-billing key setup; the missing 17 points relate to the final contract/tests and deliberate-break evidence. The aim remains 100 with verified team handoffs, not a fabricated final score. No final tag, ZIP or Classroom submission is claimed by this PR.

<a id="tuong-publish-contract"></a>

## 2026-11-10 — Tường — Siết chặt contract tests và hoàn thiện backend Publish

- Tool/model: Antigravity Assistant (Gemini 3.8 Flash).
- Task: Siết chặt kiểm thử hợp đồng theo `docs/contract/publish.md`, loại bỏ assertion bị nuốt trong `test/contract/publish.contract.test.js`, và sửa lỗi backend trong `src/app.js` cho endpoint `POST /api/labs/{labId}/publish`.
- Kept: Cấu trúc RFC 9457 Problem Details (`application/problem+json`), các bảng fixture trong `src/db.js` và logic kiểm tra review trong `src/grades.js`.
- Changed:
  - Trong `test/contract/publish.contract.test.js`: Xóa hoàn toàn khối `try/catch` đang nuốt assertion `200 !== 409`; bổ sung kiểm tra bất biến dữ liệu `assert.equal(app.publishedAt(2), null)` sau mọi mã lỗi 4xx (401 unauthenticated, 403 forbidden, 404 not-found); bổ sung test case token không hợp lệ `unknown_user`.
  - Trong `src/app.js`: Di chuyển logic phân quyền `isStaff(me, lab.class_id)` lên trước khi cập nhật dữ liệu (trước đó `q.publish.run(lab.id)` chạy trước khi kiểm tra quyền dẫn đến việc sinh viên hoặc TA khác gọi API vẫn làm thay đổi `published_at`); bổ sung kiểm tra tính lũy kế (idempotency) khi lab đã publish; bổ sung kiểm tra các bài nộp còn pending review (`needsReview(s.verdict) && s.decision === null`), trả về 409 `reviews-pending` với trường `pending` và giữ nguyên trạng thái database.
- Rejected: Tránh đề xuất ban đầu của AI về việc tạo một endpoint riêng để reset lab hoặc can thiệp trực tiếp vào database trong test; tuân thủ nguyên tắc không thay đổi schema hay sửa fixture để né lỗi.
- Validation:
  - Commit 1 (tests đỏ - `fc92efe`): Chạy `node --test "test/contract/publish.contract.test.js"` báo 3/9 tests thất bại: (1) sinh viên 403 nhưng làm thay đổi DB, (2) TA lớp khác 404 nhưng làm thay đổi DB, (3) pending review trả về 200 thay vì 409. Đây là bằng chứng test nghiêm ngặt phát hiện chính xác lỗ hổng của starter.
  - Commit 2 (backend xanh - `f274493`): Chạy lại `node --test "test/contract/publish.contract.test.js"` đạt 9/9 tests pass (0 fail, 0 skipped, 0 cancelled).
  - Unit tests: `node --test "test/unit/**/*.test.js"` đạt 5/5 tests pass.
- Evidence:
  - Commit tests đỏ: [fc92efe](https://github.com/AWAD-26-27/awad-leetkob/commit/fc92efe5dcfcd203541581a3ac9aa08b247f6f37)
  - Commit backend xanh: [f274493](https://github.com/AWAD-26-27/awad-leetkob/commit/f27449353d33510b8d32f156f73141764ae610db)
  - PR hoàn thiện contract & API (đã merge): [PR #4](https://github.com/AWAD-26-27/awad-leetkob/pull/4)
  - Deliberate contract break PR (bị chặn merge): [PR #5](https://github.com/AWAD-26-27/awad-leetkob/pull/5), commit [cc6df3a](https://github.com/AWAD-26-27/awad-leetkob/commit/cc6df3a10fdfb5079162fdac2e5274c0ad212159)
  - Ảnh minh chứng nút Merge bị chặn: [Ảnh PR #5 bị chặn](evidence/deliberate-contract-break-blocked.png)
  - Contract specification: `docs/contract/publish.md`
  - Contract test suite: `test/contract/publish.contract.test.js`
  - Route handler implementation: `src/app.js`

<a id="tuong-contract-hardening-supplement"></a>

## 2026-11-10 — Tường — Hoàn thiện hợp đồng theo mẫu IA#3 và siết chặt toàn diện contract tests

- Tool/model: Antigravity Assistant (Gemini 3.8 Flash).
- Task: Triển khai các task bổ sung T3-BS01 đến T3-BS04:
  1. Mở rộng `docs/contract/publish.md` theo cấu trúc 5 phần của template `CONTRACT.md` IA#3: Conventions, Errors, Resources, Endpoints, Versions & Evolution Policy.
  2. Đồng bộ bộ test trong `test/contract/publish.contract.test.js` và `test/helpers.js` để kiểm thử toàn diện các cam kết hợp đồng: kiểm tra trường `title` trong problem details, so sánh nguyên văn body 404 giữa TA ngoài lớp và lab không tồn tại, kiểm tra field rules của response 200, kiểm tra ID không hợp lệ, request body thừa bị bỏ qua, và giả lập lỗi server 500 (`faultyDb`).
  3. Bàn giao đầy đủ bảng bằng chứng Deliberate Break (PR #5) và đối chiếu ảnh minh chứng.
- Kept: Route handler hiện tại trong `src/app.js` (không cần sửa code backend vì implementation đã tuân thủ đúng hợp đồng).
- Changed:
  - `docs/contract/publish.md`: Bổ sung bảng Conventions (định dạng timestamp `YYYY-MM-DD HH:mm:ss`, positive integer IDs, Bearer token); bổ sung bảng RFC 9457 Problem Details members (`type`, `title`, `status`, `detail`, `pending`); bảng Error Slugs (401, 403, 404, 409, 500); bảng fields Resource cho response 200; sơ đồ thứ tự quyết định của server (Evaluation Order); và chính sách thay đổi contract (Versions & Evolution Policy).
  - `test/helpers.js`: Cho phép `startApp(customDb)` nhận instance database tùy biến (hoặc fallback về `open()`), hỗ trợ inject mock DB để kiểm thử lỗi 500 mà không cần sửa code production.
  - `test/contract/publish.contract.test.js`: Nâng số test từ 9 lên 12 tests: thêm kiểm tra `assertProblem` xác thực `title` là chuỗi không rỗng; test so sánh deepEqual body 404 chống rò rỉ thông tin; test response 200 kiểm tra chi tiết regex timestamp và type; test 404 cho ID không hợp lệ (`non-numeric-id`); test bỏ qua request body thừa; và test lỗi nội bộ 500 trả về Problem Details chuẩn.
- Rejected: Từ chối thêm endpoint public hoặc sửa schema database để giả lập lỗi 500; thay vào đó sử dụng `faultyDb` mock ngay trong test case để cô lập hoàn toàn lỗi.
- Validation:
  - Contract tests: `node --test "test/contract/publish.contract.test.js"` đạt 12/12 pass (100%), không có test nào bị skip hay lỗi.
  - Unit tests: `node --test "test/unit/**/*.test.js"` đạt 5/5 pass (100%).
  - Tổng số automated tests: 17/17 tests pass.
- Bảng bàn giao Deliberate Break (T3-BS03):
  - PR tính năng & sửa contract (đã merge): [PR #4](https://github.com/AWAD-26-27/awad-leetkob/pull/4), commit tests đỏ `fc92efe`, commit sửa xanh `f274493`.
  - PR deliberate contract break: [PR #5](https://github.com/AWAD-26-27/awad-leetkob/pull/5), commit phá hợp đồng [cc6df3a](https://github.com/AWAD-26-27/awad-leetkob/commit/cc6df3a10fdfb5079162fdac2e5274c0ad212159).
  - Kết quả kiểm chứng PR #5: Check Required `gates` thất bại do `200 !== 409` (pending guard bị bypass); nút Merge bị branch protection vô hiệu hóa; PR đã đóng mà không merge.
  - Ảnh minh chứng nút Merge bị chặn: [Ảnh PR #5 bị chặn](evidence/deliberate-contract-break-blocked.png).
