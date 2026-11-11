# AI-LOG.md

Team log for PA#2. Retain every member's dated entries when merging branches.

Confirmed identities: **23120105 — Huỳnh Mạnh Tường**, **23120111 — Phạm Quốc Nam Anh**, and **Nguyễn Minh Tú**.

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
  - `docs/contract/publish.md`: Bổ sung bảng Conventions (định dạng timestamp `YYYY-MM-DD HH:mm:ss`, positive integer IDs, Bearer token); bổ sung bảng RFC 9457 Problem Details members (`type`, `title`, `status`, `pending` — lưu ý: trường `detail` trong RFC 9457 là tùy chọn và không có trong response thực tế của server, do đó không liệt kê trong contract); bảng Error Slugs (401, 403, 404, 409, 500); bảng fields Resource cho response 200; sơ đồ thứ tự quyết định của server (Evaluation Order); và chính sách thay đổi contract (Versions & Evolution Policy).
  - `test/helpers.js`: Cho phép `startApp(customDb)` nhận instance database tùy biến (hoặc fallback về `open()`), hỗ trợ inject mock DB để kiểm thử lỗi 500 mà không cần sửa code production.
  - `test/contract/publish.contract.test.js`: Nâng số test từ 9 lên 12 tests: thêm kiểm tra `assertProblem` xác thực `title` là chuỗi không rỗng; test so sánh deepEqual body 404 chống rò rỉ thông tin; test response 200 kiểm tra chi tiết regex timestamp và type; test 404 cho ID không hợp lệ (`non-numeric-id`); test bỏ qua request body thừa; và test lỗi nội bộ 500 trả về Problem Details chuẩn.
- Rejected: Từ chối thêm endpoint public hoặc sửa schema database để giả lập lỗi 500; thay vào đó sử dụng `faultyDb` mock ngay trong test case để cô lập hoàn toàn lỗi.
- Validation:
  - Contract tests: `node --test "test/contract/publish.contract.test.js"` đạt 12/12 pass (100%), không có test nào bị skip hay lỗi.
  - Unit tests: `node --test "test/unit/**/*.test.js"` đạt 5/5 pass (100%).
  - Tổng số automated tests: 17/17 tests pass.
- Bảng bàn giao Contract Hardening & Deliberate Break (T3-BS03):
  - PR tính năng & sửa contract (đã merge): [PR #4](https://github.com/AWAD-26-27/awad-leetkob/pull/4), commit tests đỏ `fc92efe`, commit sửa xanh `f274493`.
  - PR hợp đồng chuẩn IA#3 và siết 12 tests (đã merge): [PR #7](https://github.com/AWAD-26-27/awad-leetkob/pull/7), commit [2c8f3f9](https://github.com/AWAD-26-27/awad-leetkob/commit/2c8f3f9c27af735dfb9de91142f047306ac0fd1f), [CI xanh PR #7 (run 42854963287)](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42854963287).
  - PR deliberate contract break: [PR #5](https://github.com/AWAD-26-27/awad-leetkob/pull/5), commit phá hợp đồng [cc6df3a](https://github.com/AWAD-26-27/awad-leetkob/commit/cc6df3a10fdfb5079162fdac2e5274c0ad212159).
  - CI đỏ của PR #5: [Run đỏ 42822866948](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42822866948), [Job gates thất bại (129852521896)](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42822866948/job/129852521896) do `200 !== 409`.
  - Kết quả kiểm chứng PR #5: Check Required `gates` thất bại; nút Merge bị branch protection vô hiệu hóa; PR đã đóng mà không merge.
  - Ảnh minh chứng nút Merge bị chặn: [Ảnh PR #5 bị chặn](evidence/deliberate-contract-break-blocked.png).

## 2026-11-11 — Tú — Xác minh mới từ clean clone và bổ sung bằng chứng

- Tool: Codex, Docker, Git, Gitleaks 8.30.1.
- Task: Theo yêu cầu bổ sung, tạo branch `docs/pa2-verification-evidence`, xác minh SHA chính xác, clean clone/npm ci, đầy đủ npm run check/E2E và secrets scan mới.
- Changed: Thêm [báo cáo ngày 11/11](evidence/final-verification-2026-11-11.md) và logs/results JSON tại `evidence/verification-2026-11-11/`. Main và contract/tests/code không thay đổi.
- Validation: GitHub API và clone cùng xác nhận SHA `5070b6c963ee953481545a14c0cce2f77abdff8c`. Clone độc lập bằng `git clone --no-local --branch main` từ repo local; không có .env/node_modules lúc bắt đầu, working tree sạch sau tests. Trong container Node 22.23.4/npm 10.9.9: npm ci exit 0 (90 packages); npm run check exit 0 (lint/format đạt, unit 5/5, contract 12/12); npm run e2e exit 0 (1/1), dùng CHROME_PATH Chromium 155.0.8059.79. Tests chạy với network none, không dùng key thật.
- Secrets: Gitleaks 8.30.1 được kiểm tra checksum release; all-ref/full-history scan exit 0, 17 commits có diff, 0 findings; tracked snapshot đúng SHA gồm 38 files scan exit 0, 0 findings. Đối chiếu 8 remote branch tips từ GitHub API đều reachable trong refs đã scan. Snapshot bổ sung 48 files gồm các tài liệu/logs mới chưa commit cũng scan exit 0, 0 findings. Xem báo cáo để biết lệnh, checksum, phạm vi và logs redacted.
- Rejected: Không thay lệnh gate bằng test rời hoặc ghi pass từ log baseline; không sửa tests/backend để vượt giới hạn HTTP listen của host. Chuyển lượt chạy HTTP/browser sang container và ghi rõ môi trường thực tế. Chưa có đề xuất nào được người dùng bác bỏ trong lượt này.
- Limits: Chưa merge `docs/pa2-final-sync` vào main, chưa tạo tag pa2, chưa xác minh tag run hoặc đóng ZIP. Đây là kiểm chứng SHA đã ghi, không phải tuyên bố mọi commit tương lai đều đạt. Lượt E2E dùng browser có sẵn trong container, khác cách GitHub job cài browser.
## 2026-11-10 — Tú — Lập checklist bổ sung cho Tường và Nam Anh

- Tool: Codex.
- Task: Đối chiếu rubric và bản main `5aea2cb`, viết một file giao việc bổ sung có đầu ra và điều kiện chấp nhận cụ thể cho hai thành viên.
- Changed: Thêm [TASK_BO_SUNG_PA2.md](TASK_BO_SUNG_PA2.md), tách phần contract/tests/evidence của Tường và phần đồng bộ hồ sơ/verification/ZIP của Nam Anh; chỉ rõ phần chờ tag và CI của Tú. Không thay contract, tests, code, điểm tự chấm hay trạng thái hoàn thành của thành viên.
- Rejected: Chưa có đề xuất bị bác bỏ trong lượt này; không suy diễn việc tạo checklist thành các task đã hoàn thành.
- Validation: Đọc rules/permissions, contract, tests, README, tự chấm và workflow hiện tại; đây là thay đổi tài liệu, không chạy lại test ứng dụng. Kiểm tra diff/đường dẫn sau khi tạo file.
- Evidence: Branch `docs/pa2-followup-tasks`, [checklist bổ sung](TASK_BO_SUNG_PA2.md).

<a id="nam-anh-final-integration"></a>

## 2026-11-10 — Nam Anh — Đồng bộ hồ sơ, xác minh tích hợp và chuẩn bị đóng gói nộp bài

- Tool/model: Antigravity Assistant (Gemini 3.8 Flash).
- Task: Thực hiện các task bổ sung T1-BS01 đến T1-BS04:
  1. Đồng bộ `README.md`: Cập nhật trạng thái sau khi PR #4 và PR #7 đã merge; nêu rõ 17 tests tự động (12 contract + 5 unit), giải quyết dứt điểm các lỗi baseline starter; hướng dẫn clone và chạy theo quy trình chuẩn.
  2. Cập nhật `PA2.md`: Bổ sung PR #7 vào bảng bằng chứng và chuỗi handoff; cập nhật danh tính 3 thành viên; kiểm tra các liên kết evidence tương đối.
  3. Hoàn thiện `SELF_ASSESSMENT_REPORT.md`: Rà soát 7 tiêu chí theo rubric, gán bằng chứng cụ thể tới từng commit/PR/run; điều chỉnh nội dung tự chấm phù hợp, phân định rõ phạm vi PA#2 với các giai đoạn tương lai (PA#3/4).
  4. Xác minh tích hợp cuối & secrets: Chạy lại toàn bộ test suite, kiểm tra ignore rules cho `.env`, xác nhận không có secrets rò rỉ trong lịch sử git, và tạo tài liệu `evidence/final-verification.md`.
- Kept: Toàn bộ cấu trúc rules, permissions, budget USD 0 và các bằng chứng đã tích hợp trên `main`.
- Changed: Cập nhật `README.md`, `PA2.md`, `SELF_ASSESSMENT_REPORT.md`, `PHAN_CONG_PA2.md`, `AI-LOG.md` và tạo mới `evidence/final-verification.md`.
- Rejected:
  - Không tạo script rỗng để giả lập type check (nêu rõ đặc thù JavaScript thuần trong báo cáo).
  - Không tự tiện tạo hay di chuyển git tag `pa2` (đây là trách nhiệm của Tú sau khi review PR hồ sơ cuối).
  - Không đưa file `.env` local hay node_modules vào gói nộp bài.
- Validation:
  - Contract tests: 12/12 pass (`node --test "test/contract/publish.contract.test.js"`).
  - Unit tests: 5/5 pass (`node --test "test/unit/**/*.test.js"`).
  - Tổng số automated tests: 17/17 pass (thời gian chạy ~1.5 giây).
  - Kiểm tra ignore: `git check-ignore -v .env` xác nhận `.env` được ignore bởi `.gitignore:2:.env`.
  - Kiểm tra Git tracking: `git ls-files --stage .env` không có output (không bị track). Lịch sử commit `git log --all --full-history -- .env` không có commit nào chứa `.env`.
  - Kiểm tra clean working tree: chuẩn bị sẵn sàng cho PR cuối `docs/pa2-final-sync`.
- Bàn giao: Đã hoàn thiện toàn bộ hồ sơ, sẵn sàng mở PR cuối hợp nhất vào `main` để Tú gắn tag `pa2` và đóng gói ZIP nộp bài.
