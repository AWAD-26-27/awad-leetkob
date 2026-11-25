# AI-LOG.md

Team log for PA#3 (LeeTKOB). Retain every member's dated entries when merging branches.

Confirmed identities: **23120101 — Nguyễn Minh Tú**, **23120105 — Huỳnh Mạnh Tường**, and **23120111 — Phạm Quốc Nam Anh**.

## 2026-11-10 — Tú — CI chạy checks thật và chuẩn bị required checks

Tool: Codex.

Asked for:

> Sau khi kiểm tra các lệnh local, triển khai GitHub Actions workflow và xác định thứ tự bật gate trong Settings/ruleset.

Kept: Dùng cùng `npm run check` như local; job E2E độc lập chạy `npm run e2e`. Giữ nguyên lỗi lint và các tests/API để lưu bằng chứng ban đầu và đúng phạm vi phân công.

Changed: Workflow cũ chỉ chạy khi push main, dùng Node 20, bỏ qua lỗi lint qua `continue-on-error` và lỗi tests qua `|| true`. Chuyển sang Node 22 phù hợp engines của project, `npm ci`, chạy trên PR vào main, push main và tag pa2; thêm job cài Chromium rồi chạy E2E. Token workflow chỉ có quyền đọc nội dung repo.

Rejected: Chưa có đề xuất AI nào bị Tú bác bỏ được ghi nhận trong lượt này.

Validation: Theo log local Tú cung cấp: lint lỗi `legacyLimit`, unit tests 5/5 pass, contract tests 8/8 được báo pass nhưng pending assertion `200 !== 409` bị catch, E2E 1/1 pass. Codex đã parse YAML bằng `js-yaml`, kiểm tra format workflow bằng Prettier và chạy `git diff --check`, đều thành công. Chạy lại `npm run check` trả exit code 1 đúng tại lint `legacyLimit`; các bước phía sau chưa chạy trong lần gọi đó. Sau đó Tú cung cấp log CI đỏ trên GitHub và hai ảnh của PR #1: ảnh đỏ có `gates` Required thất bại và nút Merge bị vô hiệu hóa; ảnh xanh sau commit `09d9539` có cả `gates`/`e2e` Required đạt và nút Merge được bật. Tú thông báo PR đã merge thành công. Hai run trong bảng dưới thuộc event `pull_request` của PR #1, lần lượt tại commit `eba0b2a` và `09d9539`, theo snapshot và xác minh bổ sung bên dưới.

Evidence:

| Bằng chứng | Link/đường dẫn |
| --- | --- |
| Workflow | `.github/workflows/ci.yml` |
| PR đỏ rồi được sửa xanh | [PR #1](https://github.com/AWAD-26-27/awad-leetkob/pull/1) |
| Commit triển khai workflow | [eba0b2a](https://github.com/AWAD-26-27/awad-leetkob/commit/eba0b2a3578e5e47e8e0fa78c909a7a922970143) |
| Commit sửa lint trong PR #1 | [09d9539](https://github.com/AWAD-26-27/awad-leetkob/commit/09d95396a1a61505030661d2088c9d59181747cd) |
| CI đỏ của PR #1 — event pull_request, commit eba0b2a | [Run 42751983807](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42751983807) |
| CI xanh của PR #1 — event pull_request, commit 09d9539 | [Run 42755020550](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42755020550) |
| PR #1 đỏ, check Required và merge bị chặn | [Ảnh PR đỏ](evidence/ci-workflow-gate-failed.png) |
| PR #1 xanh sau commit sửa lint | [Ảnh PR xanh](evidence/ci-workflow-gate-succeed.png) |
| Ruleset Active, target main, bypass list trống | [Ảnh ruleset](evidence/main-ruleset.png) |
| Bắt buộc PR, required checks gates/e2e và chặn force push | [Ảnh required checks](evidence/ci-gate-e2e-main-ruleset.png) |

Ghi chú kiểm chứng: Theo yêu cầu của Tú, Codex đã copy cả bốn ảnh từ thư mục evidence ngoài repo vào `evidence/` trong repo và cập nhật link tương đối. Đã xem ảnh PR đỏ/xanh và ảnh cấu hình ruleset: Active, target main, bypass list trống, bắt buộc PR, required checks gates/e2e và chặn force push. Ảnh phản ánh cấu hình tại thời điểm chụp, không phải đảm bảo mọi trạng thái tương lai. Ban đầu công cụ web chưa tải được các trang run; sau đó snapshot `evidence/github-state-2026-11-10.json` và mục incident bên dưới bổ sung metadata: cả hai run là event `pull_request` của PR #1, không phải push runs trên các branch evidence. Run đỏ tại `eba0b2a` thất bại, run xanh tại `09d9539` thành công; ảnh PR bổ sung bằng chứng required check chặn merge. Deliberate contract break của PR #5 được ghi riêng ở phần Tường; CI cho tag `pa2` chờ bước nộp cuối.

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

## 2026-11-11 — Tú — Sửa nhãn CI và hoàn thiện danh tính trước nộp

- Tool: Codex, Git và GitHub REST API.
- Task: Tạo branch mới từ main và sửa hai điểm hồ sơ qua PR: phân loại hai run đỏ/xanh của PR #1 và bổ sung MSSV Nguyễn Minh Tú.
- Changed: Tạo `docs/pa2-evidence-labels-and-identity`; sửa bảng evidence và các đoạn giải thích trong entry Tú để ghi đúng event `pull_request`, commit đỏ `eba0b2a` và commit xanh `09d9539`. Giữ nguyên URLs và các incident lịch sử. Sau khi Tú xác nhận MSSV `23120101` trong hội thoại, cập nhật danh tính trong AI-LOG.md, PA2.md và SELF_ASSESSMENT_REPORT.md; tên ZIP dự kiến theo MSSV tăng dần là `23120101-23120105-23120111_100.zip`.
- Validation: GitHub API xác nhận run `42751983807` có event `pull_request`, head `eba0b2a3578e5e47e8e0fa78c909a7a922970143`, conclusion `failure`; run `42755020550` có event `pull_request`, head `09d95396a1a61505030661d2088c9d59181747cd`, conclusion `success`. `git diff --check` đạt. Chỉ sửa tài liệu, không chạy lại application tests.
- Rejected: Không suy đoán MSSV từ Git author/email hoặc tự điền một số chưa được thành viên xác nhận.
- Pending: Danh tính đã được Tú xác nhận; thay đổi chuẩn bị đưa lên PR. Không tự nhận đã tạo tag hoặc ZIP trong lượt sửa tài liệu này.

## 2026-11-23 — PA3 — Chốt contract tích hợp

- Tool: Codex, `pdftotext`, Git, Python 3, C++, npm và Playwright.
- Task: Đối chiếu class brief, rubric PA3, task list và contract Publish, rồi chốt điểm nối để ba luồng triển khai song song.
- Changed: Thêm [contract tích hợp PA3](docs/contract/pa3-integration.md) với schema chung, quy tắc worker nhận lại job, giao diện checker/CLI, payload API, cấu hình Azure và fixture `MODEL_OFF=1`. Chốt một lần ghi kết quả hoàn chỉnh và giữ quyền review theo từng constraint.
- Rejected: Bỏ cách đánh dấu `judged` trước khi ghi verdict vì UI có thể đọc trạng thái cuối khi queue còn thiếu dòng. Giữ demo public ở hàng đợi TA theo rubric, để contract Publish hiện hữu tiếp tục áp dụng cho luồng hiện hữu.
- Validation: GitHub trả `main` tại `56684dc` khớp nền nhánh. Python đọc được JSON mẫu, kiểm evidence khớp chính xác source và xác nhận ví dụ C++ biên dịch, trả mã 0 với output rỗng. `npm run check` đạt 5 unit và 12 contract tests. `npm run e2e` với Chromium cục bộ đạt 1 test. Các check ứng dụng chạy bộ test hiện hữu.

## 2026-11-23 — Tú — Dựng sandbox C++ PA3

- Tool: Codex, Git, Docker 29.9.2, Node.js, npm, Playwright và Gitleaks 8.30.1.
- Changed: Thêm `sandbox/Dockerfile`, entrypoint `sandbox/run.sh` và `src/sandbox.js`. Build bằng `docker build -t leetkob-cpp-sandbox:latest sandbox`. Worker gọi `runSandbox({ code, testCases })` với `testCases` là mảng `{ input, expectedOutput }`. Mỗi test dùng container mới để biên dịch và chạy C++17. Sandbox nhận source và input qua stdin, kiểm output trên host và trả verdict đầu tiên thất bại cùng số thứ tự test. Lỗi Docker reject để worker có thể retry.
- Rejected: Không bind mount mã nguồn hay đưa expected output vào container. Docker client có thể tự thêm proxy từ cấu hình người dùng, nên runner ghi đè các biến proxy bằng giá trị rỗng. Compiler và chương trình dùng môi trường sạch.
- Validation: Build Docker đạt. Smoke test cục bộ đạt `Accepted` với nhiều test, source UTF-8 và stdin lớn, cùng `WA`, `CE`, `RE`, `OLE`, `TLE` theo CPU và wall-clock, và `MLE`. Xác nhận wall timeout xóa container và không còn container test sau khi chạy. Kiểm cấu hình network, UID, host mounts, CPU và cgroup RAM/swap/PID. Container không nhận hai canary Gemini và proxy giả. `npm run check` đạt 5 unit và 12 contract tests. Playwright đạt 1 E2E.
- Secrets: Gitleaks `--redact=100` báo 0 findings trên snapshot làm việc và 22 commit thuộc các ref đã fetch. Smoke test dùng dữ liệu tổng hợp. Bộ chín fixture sandbox trên CI, worker và Azure deploy nằm ở bước tích hợp sau.

## 2026-11-23 — Nam Anh — Checker, guardrails và eval PA3

- Tool: Codex, Git/GitHub CLI, Node.js 22, Tree-sitter WASM, Docker, G++ và Playwright.
- Changed: Export `evaluateSubmission`, bàn giao [fixture C1/C2](test/fixtures/pa3-checker-handoff.json), phân tích ban-list trước, làm sạch input model, kiểm JSON/evidence và xử lý timeout. Thêm CLI, Dockerfile, dev set gốc và năm bài custom có nhãn/tag.
- Rejected: Dò chuỗi đơn thuần có thể phạt nhầm comment, chuỗi và hàm trùng tên. Dùng cây cú pháp và kiểm kết quả trên các ca trap/disguised. Giữ output của lần offline ở các file có nhãn `offline`.
- Validation: `npm run check` và `npm run e2e` đạt trên Node 22. Năm bài custom biên dịch và đạt toàn bộ 15 cặp bài/test. Docker với `--network none` cho 55/55 cặp ban-list dev, 5/5 cặp custom, 0 wrongful deductions và hai call log rỗng. Scorer gốc trả 1 cho cả hai vì còn các constraint semantic `unsure`. [Lệnh và bằng chứng](docs/checker.md#cli-and-docker)
- Model và chi phí: Đề xuất `gemini-3.8-flash` theo thiết lập free tier. 80 bài Accepted × 1 constraint semantic × 1 lần gọi = tối đa 80 request cho lab `sort-merge`. Trong quota free tier, 80 × 0 USD = 0 USD dự kiến. Chờ xác nhận quyền sử dụng trước khi đo tokens, latency và chạy eval thật.

## 2026-11-24 — Nam Anh — Chi phí và cấu hình Gemini 3.8 cho PA3

- Tool: Codex, Gemini API, Node 22, Docker và Playwright.
- Changed: Checker ghi `costUsd: 0` cho lần gọi trên project được cấu hình `GEMINI_BILLING_TIER=free`. Unit tests xác nhận trường chi phí giữ `null` khi chưa khai báo tier, nhận `0` khi dùng free tier và xuống SQLite đúng giá trị. Sửa thứ tự đóng kết nối test worker để Windows xoá được DB tạm.
- Model và budget: `gemini-3.8-flash`, ngân sách model của nhóm 0 USD trên project không liên kết billing. Worker dùng `MAX_MODEL_CALLS_PER_LAB=80`. Lab `sort-merge` có 80 bài Accepted × 1 constraint semantic × 1 lần gọi = 80 lượt, dự kiến 80 × 0 USD = 0 USD trong quota free tier. CLI dev set đặt cap 16 theo bài, đủ cho 47 cặp semantic của bộ công khai.
- Rejected: Flash-Lite đã chạy thử, sau đó Nam Anh chọn Gemini 3.8. Giữ artifacts Flash-Lite ngoài repo để bằng chứng nộp bài khớp model triển khai. Khi Gemini 3.8 trả 503 liên tục, dừng ở synthetic probes và ghi nhận lỗi provider. [Bằng chứng probe](evidence/pa3-checker/gemini-3.8-probes.md)
- Validation: `npm run check` đạt 17 unit và 12 contract tests. `npm run e2e` đạt 1 test. Docker `--network none` tạo predictions giống lần offline đã merge và call log rỗng. SHA-256 của `eval.mjs` và `labels.jsonl` khớp rubric. Ghi lệnh tái hiện và cấu hình handoff trong [checker guide](docs/checker.md#live-evaluation-and-budget). Predictions, báo cáo và call log của Gemini 3.8 sẽ có sau khi inference hoạt động.

## 2026-11-24 — Nam Anh — Chạy dev set thật và chốt budget PA3

- Tool: Codex, Google Cloud Console, AI Studio, Gemini API, Node 22 và Docker.
- Changed: Tạo project thử Gemini 3.8 với key giới hạn vào Gemini API và xác minh project không còn liên kết billing trước khi gọi. Thử lần lượt 3.8, 3.7, 3.6 và 3.5. Thêm khoảng cách 4 giây giữa các lần gửi CLI để giảm burst và ghi latency từ lúc gửi request. [Lịch sử probe](evidence/pa3-checker/gemini-3.8-probes.md)
- Rejected: Gemini 3.8 và 3.7 trả 503 trên cả hai project. Gemini 3.6 chỉ trả lời 5 trong 10 request đầu của dev set, còn alias 3.5 Flash báo model 3.6. Chạy bằng `gemini-3.5-flash-lite` trên project LeeTKOB PA2 đã xác nhận Free Tier. Giữ nguyên kết quả sai của model theo scorer gốc.
- Chi phí: Lượt chạy thật gửi 47 request semantic × 0 USD = 0 USD. Model trả 30 request ID, 26,452 prompt tokens và 3,089 completion tokens. 17 lượt 503 thiếu metadata nên để `null`. Ngân sách model của nhóm là 0 USD với billing không liên kết. Lab `sort-merge`: 80 bài Accepted × 1 constraint semantic × 1 lượt = 80 request. Trong quota Free Tier, 80 × 0 USD = 0 USD dự kiến. Cap worker là 80 lượt theo lab, bao gồm lượt lỗi.
- Validation: Kiểm đủ 102 prediction và 47 cặp semantic, evidence trùng dòng gốc, prompt đã làm sạch và 30 request ID duy nhất. Scorer trả 1 với 1 wrongful deduction, recall 75.7% và unsure 16.7%. Worker cục bộ qua Docker lưu semantic `pass`, request ID và chi phí 0 USD vào SQLite, rồi chặn lượt thứ 81. `npm run check`, Playwright, Docker model-off và bài test restart worker trên Linux đều đạt.
- Evidence: [Lệnh tái hiện và cấu hình worker](docs/checker.md#live-evaluation-and-budget), [predictions](evidence/pa3-checker/live/predictions.jsonl), [eval report](evidence/pa3-checker/live/eval.json) và [call log](evidence/pa3-checker/live/calls.jsonl).

## 2026-11-23 — Tú — Kiểm chứng sandbox trên CI

- Tool: Codex, Node.js test runner, Docker và Git.
- Changed: Thêm chín fixture C++ và chín test Docker. Thêm trigger `pa3` và job `sandbox-tests` trên Ubuntu/Node 22. Phân biệt wall deadline do runner với timeout do tiến trình.
- Rejected: Dùng kiểm chứng giới hạn tiến trình có hiệu lực qua cgroup và canary tổng hợp cho secrets. Fixture mạng chỉ kiểm interface trong namespace của container. Fixture bộ nhớ đọc dữ liệu đã cấp phát bằng phép cộng để giữ hành vi ở mức tối ưu hóa của toolchain.
- Validation: Job local `node --test --test-reporter=spec test/sandbox.test.js` đạt 9/9. CI trên GitHub cần chạy từ PR và tag nộp thực tế.

## 2026-11-23 — Tú — Worker PA3 và kiểm tra restart

- Tool: Codex, Git, Docker, Node.js 26 cục bộ, Node 22 trong container offline, npm và Playwright.
- Changed: Thêm tiến trình `src/worker.js` chạy riêng với `DB_PATH`, claim job SQLite nguyên tử, gia hạn lease và dùng số lần claim để chặn lần chạy cũ ghi kết quả. Worker gọi sandbox, chỉ chạy checker với `Accepted`, rồi lưu toàn bộ kết quả trong một transaction. Lượt gọi model đặt chỗ theo hạn mức của lab. CI chạy kiểm tra restart cùng job sandbox.
- Rejected: Tách thời gian chạy Docker/model ra khỏi transaction SQLite để API có thể tiếp tục ghi. Worker ưu tiên bảo toàn review của TA và chỉ lưu metadata model. Test chạy `MODEL_OFF=1` hoặc fake checker với dữ liệu tổng hợp, nên không cần file `.env`.
- Validation: `npm run check` đạt 17 unit và 12 contract tests, Playwright đạt 1 E2E. Suite Docker đạt 9 kiểm chứng sandbox và 1 test dừng/khởi động worker. Mỗi bài queued hoặc claim hết hạn có đúng một bộ verdict C1/C2. Bốn unit tests worker cũng đạt trong Node 22 với mạng tắt.
- Bàn giao: Chạy `DB_PATH=/path/to/leetkob.db MODEL_OFF=1 node src/worker.js` sau khi API đã khởi tạo schema PA3. Test restart dùng tệp SQLite theo contract với giao dịch tạo job, ghép Docker và checker thật ở chế độ offline. Hành trình HTTP thực tế sẽ được kiểm khi schema/API của Luồng 1 được ghép.

## 2026-11-24 — Frontend Architect — Tái cấu trúc toàn diện src/frontend/

- Tool: Antigravity (Gemini 3.8 Flash), PowerShell, Node.js test runner.
- Task: Tái cấu trúc toàn diện (Refactor) mã nguồn `src/frontend/` tuân thủ nghiêm ngặt 100% `docs/frontend-architecture.md`, `docs/agent-coding-guidelines.md` và `AGENTS.md`. Lấy `src/frontend/src/features/auth/` làm mẫu chuẩn tham chiếu (Canonical Reference).
- Kept:
  - Giữ vững hợp đồng bất biến bảo mật sinh viên (Student FAQ Privacy Invariant: zero leakage trước khi TA Publish).
  - Giữ nguyên các bộ chọn DOM cho kiểm thử tự động Playwright CI (`button[name='Confirm stu1']`, `button[name='Publish grades']`, `#status`, `#who`, `UserSelectorBar`).
  - Giữ nguyên runtime VDOM zero-dependency trong `src/frontend/src/lib/react.js`.
- Changed:
  - Hoàn thiện mô hình cấu trúc 5 phần (`api/`, `components/`, `hooks/`, `types/`, `index.js`) trên toàn bộ 6 domain features (`admin/`, `auth/`, `classes/`, `labs/`, `reviews/`, `submissions/`).
  - Triệt để xóa bỏ các import xuyên tính năng vi phạm (cross-feature internal imports); 100% các import liên module đều đi qua gateway `features/<feature>/index.js`.
  - Phân tách (decompose) toàn bộ các component nguyên khối vượt trần 200 dòng code:
    - `features/admin/components/AdminDashboard.js` (665 dòng) -> Tách thành `AdminDashboard.js` (50 dòng), `AdminHeader.js` (75 dòng), `ClassItemRow.js` (128 dòng), `ClassManagementCard.js` (121 dòng), `UserCreationCard.js` (175 dòng), `UserDirectoryTable.js` (106 dòng).
    - `features/classes/components/ClassStudentRoster.js` (309 dòng) -> Tách thành `ClassStudentRoster.js` (125 dòng), `AssignStudentForm.js` (83 dòng), `ClassStudentTable.js` (76 dòng).
    - `features/labs/components/CreateLabForm.js` (240 dòng) -> Tách thành `CreateLabForm.js` (127 dòng), `TestCaseInputs.js` (63 dòng), `ConstraintInputs.js` (69 dòng).
    - `features/labs/components/LabDetailsCard.js` (294 dòng) -> Tách thành `LabDetailsCard.js` (168 dòng), `LabStatementView.js` (23 dòng), `LabConstraintsView.js` (57 dòng), `LabTestCasesView.js` (40 dòng).
    - `features/submissions/components/CodeEditorWindow.js` (298 dòng) -> Tách thành `CodeEditorWindow.js` (125 dòng), `EditorHeader.js` (140 dòng), `EditorLineGutter.js` (19 dòng).
    - `features/submissions/components/StudentSubmissionsTable.js` (207 dòng) -> Tách thành `StudentSubmissionsTable.js` (93 dòng), `SubmissionRow.js` (116 dòng).
    - `features/reviews/components/ReviewQueueTable.js` (325 dòng) -> Tách thành `ReviewQueueTable.js` (75 dòng), `QueueMetricsHeader.js` (98 dòng), `ReviewQueueItem.js` (163 dòng).
    - `features/auth/components/Navbar.js` (299 dòng) -> Tách thành `Navbar.js` (87 dòng), `NavbarBrand.js` (65 dòng), `UserMenu.js` (131 dòng), `PlaywrightUserSelector.js` (37 dòng).
    - `features/auth/components/AccountProfileModal.js` (364 dòng) -> Tách thành `AccountProfileModal.js` (182 dòng), `ProfileDetailsTab.js` (80 dòng), `ChangePasswordTab.js` (76 dòng), `AdminDirectoryTab.js` (44 dòng).
  - Tạo mới module `src/routes/` gồm `AppRoutes.js` (111 dòng), `AdminModeBar.js` (54 dòng), `GuestLandingCard.js` (56 dòng) và `index.js`, tách toàn bộ inline routing khỏi `App.js` (giảm từ 340 dòng xuống 161 dòng).
  - 100% component UI hiện tại đều dưới 200 dòng code (không có file nào vượt quá 182 dòng).
  - Cập nhật checklist di chuyển kiến trúc trong `docs/frontend-architecture.md` đạt 100% hoàn thành `[x]`.
- Rejected:
  - Bác bỏ mọi đề xuất giữ nguyên các file lớn > 200 dòng với lý do tiện lợi.
  - Bác bỏ việc import sâu vào thư mục con của tính năng khác (`../classes/components/...`).
  - Bác bỏ việc đưa logic gọi network/fetch trực tiếp vào thân component render.
- Validation:
  - Kiểm tra số dòng: 100% component `.js` dưới 200 dòng (file lớn nhất 182 dòng).
  - Unit tests frontend (`test/unit/frontend-core.test.js`, `test/unit/frontend-stage3.test.js`): 100% pass (bao gồm kiểm thử FAQ Privacy Invariant, persistent state, DEMO_USERS, formatTime, cx, apiClient).
  - Contract & E2E tests (`test/contract/frontend-serving.contract.test.js`, `test/contract/playwright-ci-simulation.contract.test.js`, `test/contract/e2e-8step-verification.test.js`, `test/contract/headless-browser-flow.test.js`, `test/contract/publish.contract.test.js`): 46/46 tests pass.

## 2026-11-24 — Full-stack & Security Architect — Chuẩn hóa RBAC, Tách quyền Admin/Giảng viên, Bỏ xóa DB và Thiết kế lại Admin UI SaaS

- Tool: Antigravity (Gemini 3.8 Flash), Node.js 22 built-in test runner, Chrome DevTools Browser Subagent.
- Context & Requirements:
  - Người dùng yêu cầu chuẩn hóa triệt để mô hình phân quyền:
    1. Bỏ hoàn toàn tính năng cho phép admin xóa dữ liệu (xóa DB).
    2. Admin KHÔNG có quyền quản lý các lab; các lab thuộc về từng lớp riêng biệt và chỉ có giảng viên phụ trách lớp có quyền tạo, sửa lab.
    3. Trạng thái khởi tạo: Admin luôn có; Giảng viên và Sinh viên lúc khởi tạo chưa có lớp (`classId = null`), Admin sẽ gán họ vào lớp.
    4. Trang quản lý lớp học và người dùng của Admin cần trực quan, rõ ràng, hiện đầy đủ thông tin (tạo lớp, thêm/xóa thành viên, xem thông tin, xem bài học).
    5. Thiết kế lại giao diện Admin để bớt giống "AI vibe", chuyên nghiệp, tự nhiên và hiện đại.
- Changed:
  - **Xóa bỏ triệt để tính năng xóa database:**
    - Gỡ bỏ hoàn toàn `POST /api/admin/reset-database` khỏi `src/backend/features/auth/auth-controller.js` và `router.js`.
    - Xóa bỏ nút bấm "Reset Database" và modal cảnh báo nguy hiểm trong giao diện Admin.
  - **Tách bạch ranh giới Quản trị viên và Giảng viên:**
    - Trong `src/backend/features/labs/lab-controller.js`: Chặn Admin (`req.user.role === 'admin'`) tạo bài lab (`POST /api/labs` trả về 403 Forbidden). Chỉ cho phép Giảng viên (`role === 'ta'`) đã được gán lớp (`classId != null`) tạo bài lab.
    - Bổ sung hàm `updateLab(labId, { title, statement })` trong `src/backend/features/labs/lab-model.js`.
    - Bổ sung API `PUT /api/labs/:labId` và `PATCH /api/labs/:labId` trong `src/backend/features/labs/router.js` và `lab-controller.js`: Chỉ giảng viên phụ trách lớp của bài lab đó mới có quyền sửa đổi.
    - Mở rộng thư viện router tùy biến `src/backend/lib/router.js` để hỗ trợ method `patch`.
    - Cập nhật giao diện `src/frontend/src/features/labs/components/LabDetailsCard.js`: Giảng viên phụ trách lớp có thể bấm nút "✏️ Sửa bài lab" để cập nhật ngay tiêu đề và đề bài Markdown.
    - Cập nhật `src/frontend/src/routes/AppRoutes.js`: Admin đăng nhập chỉ thấy giao diện Quản trị Lớp học và Người dùng; không hiển thị danh mục bài lab hay hàng đợi review. Nếu giảng viên chưa được phân công lớp, hiển thị banner nhắc nhở liên hệ Admin để được gán lớp.
  - **Thiết kế lại Admin Portal theo phong cách Enterprise SaaS:**
    - Thay thế toàn bộ phong cách emoji gaming (👑, 🏫, 👥, 👨‍🏫, v.v.) và nền tối gradient bằng giao diện SaaS hiện đại, bảng màu trung tính trang nhã (`slate-50` đến `slate-900`, viền `slate-200`, điểm nhấn xanh `blue-600` chuẩn doanh nghiệp).
    - Xây dựng thư viện biểu tượng vector SVG zero-dependency `src/frontend/src/features/admin/components/AdminIcons.js` (`IconSchool`, `IconUsers`, `IconPlus`, `IconCheck`, `IconX`, `IconTrash`, `IconShield`, v.v.).
    - Tối ưu các thẻ quản lý `ClassManagementCard.js`, `ClassItemRow.js`, `UserCreationCard.js`, `UserDirectoryTable.js` và thanh tiêu đề `AdminHeader.js`: hiển thị rõ ràng danh sách bài lab hiện có của từng lớp, số lượng sinh viên, thông tin giảng viên kèm nút gán/gỡ linh hoạt; bảng danh bạ người dùng có lọc theo vai trò, trạng thái gán lớp và tìm kiếm.
  - **Đồng bộ hóa tài liệu kỹ thuật & Đặc tả API:**
    - `docs/role-business-matrix.md`: Cập nhật sơ đồ kiến trúc Mermaid, trách nhiệm vai trò Admin/Teacher, ma trận phân quyền RBAC Matrix (Admin bị 403 khi tạo/sửa lab, cấm xóa DB).
    - `src/backend/features/docs/openapi-spec.js`: Thêm đặc tả `PUT /api/labs/{labId}`, `DELETE /api/classes/{classId}/teachers/{teacherId}`, cập nhật mã lỗi 403 cho `POST /api/labs`.
    - `docs/frontend-architecture.md`: Cập nhật checklist hoàn thành tái cấu trúc và thiết kế SaaS cho Admin.
- Validation:
  - Unit tests: Bổ sung bộ kiểm thử `test/unit/admin-features-and-reset.test.js` kiểm tra toàn bộ các trường hợp: Admin bị 403 khi tạo/sửa lab; Reset Database trả về 404; Giảng viên chưa gán lớp bị 403; Giảng viên đã gán lớp tạo và sửa lab thành công. 59/59 unit tests pass.
  - Contract tests: 58/58 contract tests pass (`node --test test/contract/*.test.js`).
  - Browser verification: Dùng browser subagent kiểm tra trực tiếp giao diện Admin tại `http://localhost:3007` qua 2 tab "Quản lý Lớp học" và "Quản lý Người dùng". Kết quả giao diện hiển thị sắc nét, chuyên nghiệp, không còn emoji hay "AI vibe". Ảnh chụp màn hình: `admin_tab_classes.png` và `admin_tab_users.png`.

## 2026-11-24 — Security & Auth Engineer — Khắc phục lỗi rò rỉ thông tin Quick Login, Tái thiết kế cơ chế Remembered Accounts

- Context:
  - Khắc phục lỗ hổng bảo mật đặc biệt nghiêm trọng: Trước đây giao diện Quick Login và Landing Page hiển thị hardcoded tài khoản kèm mật khẩu `password123`, tự động điền mật khẩu vào form đăng nhập, tiềm ẩn nguy cơ rò rỉ thông tin và vi phạm nguyên tắc bảo mật.
  - Người dùng yêu cầu:
    1. Quick Login chỉ hiển thị các tài khoản đã từng đăng nhập bằng mật khẩu trên trình duyệt này.
    2. Khi ấn vào tài khoản đã lưu, hệ thống đăng nhập thẳng trực tiếp vào phiên làm việc (1-click direct login).
    3. Server và client tuyệt đối không gửi hoặc render username và password ra màn hình.
- Changed:
  - **Bảo mật Backend:**
    - Trong `src/backend/features/auth/auth-controller.js`: Xóa bỏ trường `token` khỏi câu truy vấn `qAllUsers` (`SELECT id, username, name, role, class_id as classId FROM users`). Đảm bảo API `GET /api/users` không làm lộ session token của người dùng khác.
  - **Cơ chế lưu trữ tài khoản an toàn (Client-Side Remembered Accounts):**
    - Tạo module `src/frontend/src/features/auth/utils/savedAccounts.js`: Cung cấp các hàm `getSavedAccounts()`, `saveAccount()`, `removeSavedAccount()` lưu trữ trên `localStorage`.
    - Quy tắc bất biến: Chỉ lưu metadata định danh công khai (`id`, `username`, `name`, `role`, `classId`) và session `token` sau khi xác thực mật khẩu thành công. Tuyệt đối **không bao giờ lưu mật khẩu** hay hash mật khẩu.
    - Cập nhật `src/frontend/src/providers/AuthProvider.js`: Bổ sung `savedAccounts`, `loginWithSavedAccount(account)`, `forgetSavedAccount(username)`. Sau mỗi lần gọi `login(username, password)` thành công, tài khoản tự động được lưu vào danh sách tài khoản đã xác thực trên thiết bị.
  - **Tái thiết kế giao diện Quick Login:**
    - Cập nhật `src/frontend/src/features/auth/components/LoginDemoQuickFill.js`:
      - Khi chưa có tài khoản nào đăng nhập trên thiết bị: Hiển thị thông báo sạch, không còn bất kỳ nút bấm tài khoản demo hay mật khẩu hardcoded nào.
      - Khi đã có tài khoản từng đăng nhập: Hiển thị danh sách tài khoản kèm avatar, tên, username, vai trò, nút "Đăng nhập →" trực tiếp và nút `✕` để xóa tài khoản khỏi thiết bị.
    - Cập nhật `src/frontend/src/features/auth/components/LoginModal.js`:
      - Xóa bỏ placeholder lộ mật khẩu (`placeholder: 'Nhập mật khẩu...'`).
      - Xóa bỏ hàm điền mật khẩu tự động `handleQuickFill`.
      - Khi ấn vào tài khoản đã lưu, gọi ngay `loginWithSavedAccount(account)` để đăng nhập thẳng vào hệ thống mà không cần điền hay submit form.
    - Cập nhật `src/frontend/src/routes/LandingDemoAccounts.js` và `LandingPage.js`:
      - Nếu đã có tài khoản lưu: Hiển thị danh sách "Tài khoản đã đăng nhập gần đây" kèm nút đăng nhập tức thì.
      - Nếu chưa có tài khoản: Hiển thị giới thiệu 3 vai trò hệ thống kèm nút "Đăng nhập tài khoản" mở modal đăng nhập chuẩn.
- Validation:
  - Bổ sung bộ kiểm thử `test/unit/saved-accounts-security.test.js`: Kiểm tra việc lưu trữ không bao giờ chứa mật khẩu, kiểm tra render UI không chứa `password123`, và kiểm tra `GET /api/users` không lộ token.
  - Chạy toàn bộ test suites: **63 unit tests pass**, **58 contract tests pass** (**121 automated tests passing 100%**).
  - Kiểm thử trực tiếp trên trình duyệt bằng browser subagent tại `http://localhost:3007`:
    - Form đăng nhập ban đầu hoàn toàn sạch credentials: `quick_login_empty.png`.
    - Sau khi đăng nhập bằng mật khẩu và đăng xuất, tài khoản Admin xuất hiện trong danh sách "Tài khoản đã đăng nhập trên thiết bị này": `quick_login_saved.png`.
    - Nhấn "Đăng nhập →" giúp đăng nhập thẳng vào hệ thống tức thì: Video ghi hình kiểm chứng tại `quick_login_verification.mp4`.




## 2026-11-24 — Full-Stack Engineer — Tái thiết kế Cổng Giảng Viên: Quản lý Đa Lớp, Không Gian Lớp Học 4 Thẻ & Trang Chi Tiết Bảng Điểm Từng Bài Lab

- Context:
  - Cập nhật trải nghiệm và nghiệp vụ Giảng viên theo yêu cầu:
    1. Một giảng viên có thể phụ trách và quản lý nhiều lớp học đồng thời.
    2. Giảng viên ấn vào một lớp học để truy cập không gian làm việc chuyên sâu với 4 thẻ:
       - **Thông tin chung (Overview):** Tên lớp, mã lớp, danh sách giảng viên, thống kê sĩ số, số labs, số thông báo.
       - **Thông báo (Announcements):** Giảng viên có quyền đăng thông báo cho lớp; sinh viên và giảng viên có thể đọc bảng tin này.
       - **Danh sách lớp (Class Roster):** Giảng viên được xem danh sách sinh viên lớp mình (họ tên, username, mã SV, tìm kiếm, sĩ số), **tuyệt đối không được thêm/xóa sinh viên** khỏi lớp (việc phân công sinh viên do Admin quản trị tập trung).
       - **Danh sách bài thực hành (Labs):** Tạo mới bài lab cho lớp, quản lý các bài lab và ấn vào từng bài lab để mở trang chi tiết riêng.
    3. Mỗi bài lab có trang riêng biệt (Dedicated Lab Detail Page):
       - Hiển thị đề bài Markdown, bộ test cases, các ràng buộc kỹ thuật AST kèm mức điểm trừ.
       - Hỗ trợ chỉnh sửa đề bài và công bố điểm (Publish grades gate).
       - **Bảng điểm và danh sách nộp bài toàn lớp (Class Grade Roster):** Liệt kê toàn bộ sinh viên trong lớp, số lần nộp bài (`số lần submit`), trạng thái mới nhất (`Accepted`, `WA`, `Chưa nộp`...), điểm số tương ứng (thang 10 trừ điểm khấu trừ AST), chi tiết vi phạm AST và trạng thái duyệt.
       - Hàng đợi xét duyệt AST (Review Queue) để đối soát vi phạm, Confirm hoặc Overturn.
- Changed:
  - **Cơ sở dữ liệu & Backend:**
    - `src/backend/db.js`: Bổ sung bảng `class_announcements (id, class_id, author_id, title, content, created_at)`.
    - `src/backend/features/classes/classes-model.js`:
      - Cập nhật `assignTeacher`: Không xóa các phân công lớp khác trong `class_staff`, cho phép 1 giảng viên phụ trách nhiều lớp.
      - Cập nhật `removeTeacher`: Chỉ xóa quan hệ `(class_id, user_id)` cụ thể trong `class_staff`.
      - Bổ sung `getTeacherClasses(teacherId)`: Lấy toàn bộ lớp học của giảng viên kèm sĩ số sinh viên, số lượng lab và số lượng thông báo.
      - Bổ sung `listAnnouncements(classId)` và `createAnnouncement(classId, authorId, title, content)`.
    - `src/backend/features/classes/classes-controller.js` & `router.js`:
      - Thêm route `GET /api/my-classes`: Trả về danh sách lớp học của giảng viên.
      - Thêm route `GET /api/classes/:classId/announcements` & `POST /api/classes/:classId/announcements`.
      - Cập nhật kiểm tra phân quyền `isStaff` cho `getClassLabs`, `listStudents`, `getById`.
    - `src/backend/features/labs/lab-controller.js` & `router.js`:
      - Thêm route `GET /api/labs/:labId/grades`: Tính toán và trả về toàn bộ sinh viên trong lớp, số lần submit, trạng thái mới nhất, điểm số tự động, các khoản trừ điểm AST và trạng thái duyệt.
      - Cập nhật `createLab`: Hỗ trợ truyền `classId` trong body để giảng viên tạo bài lab vào đúng lớp được chọn.
    - `src/backend/middleware/auth.js` & `isolation.js`:
      - Cập nhật `createAuthMiddleware`: Gán mảng `user.classIds` cho giảng viên chứa tất cả các lớp được phân công.
      - Cập nhật `isStaff(user, classId)`: Xác nhận quyền hợp lệ nếu `classId` nằm trong `user.classIds`.
  - **Giao diện Frontend (`src/frontend/src/features/teacher/`):**
    - Module hóa hoàn toàn, tuân thủ nghiêm ngặt giới hạn dưới 200 dòng/file:
      - `api/teacherApi.js` (22 lines): API client cho Teacher.
      - `components/TeacherDashboard.js` (163 lines): Cổng danh mục lớp học của giảng viên.
      - `components/TeacherClassWorkspace.js` (160 lines): Khung không gian lớp học với 4 thẻ.
      - `components/ClassOverviewTab.js` (118 lines): Thẻ thông tin chung & thống kê.
      - `components/ClassAnnouncementsTab.js` (113 lines): Thẻ bảng tin thông báo & form đăng thông báo.
      - `components/TeacherClassRosterTab.js` (152 lines): Thẻ danh sách sinh viên chỉ xem (read-only), không có nút thêm/xóa.
      - `components/TeacherClassLabsTab.js` (134 lines): Thẻ danh sách bài lab kèm nút tạo lab và điều hướng vào trang riêng.
      - `components/TeacherLabDetailPage.js` (192 lines): Trang riêng của bài lab gồm Bảng điểm, Đề bài & Hàng đợi review AST.
      - `components/LabClassGradesTable.js` (152 lines): Bảng điểm toàn bộ sinh viên trong lớp kèm số lần submit.
      - `components/LabStatementAndRules.js` (120 lines): Trình bày đề bài, test cases và ràng buộc kỹ thuật AST.
      - `components/TeacherPortal.js` (61 lines): Điều phối trạng thái chuyển view giữa Dashboard -> Workspace -> Lab Detail.
    - `src/frontend/src/routes/AppRoutes.js` (122 lines): Định tuyến tự động `isTeacher` vào `TeacherPortal`.
    - `src/frontend/src/features/classes/components/StudentClassroomBanner.js` (176 lines): Bổ sung hiển thị thông báo cho sinh viên trong lớp học.
- Validation:
  - Bổ sung bộ kiểm thử `test/unit/teacher-portal-multiclass.test.js`: Kiểm tra giảng viên đa lớp, đăng và đọc thông báo, tính điểm và thống kê số lần nộp bài của sinh viên trong lab.
  - Chạy toàn bộ automated test suite: **64 unit tests** + **58 contract tests** (**122 tests total passing 100%**).

## 2026-11-24 — Nam Anh — Nâng cấp Loading Spinner và Hoàn thiện Giao diện Sinh viên

- Tool/model: Codex / Gemini assistant.
- Task:
  - Bổ sung hệ thống `Spinner` với hiệu ứng animation xoay mượt mà, hỗ trợ đa dạng kích thước (`size`), nhãn chú thích (`label`), chế độ căn giữa (`center`) hoặc hiển thị trong dòng (`inline`).
  - Thay thế toàn bộ các trạng thái tải dạng text thô (`'Đang tải danh sách...'`, `'Đang tải bảng điểm...'`) trên toàn bộ website bằng component `Spinner`.
  - Tích hợp Spinner vào `StudentClassroomBanner`, `ClassItemRow`, `AdminDirectoryTab`, `TeacherDashboard`, `TeacherClassWorkspace`, `TeacherClassRosterTab`, `TeacherClassLabsTab`, `LabClassGradesTable`.
  - Khắc phục hiển thị nhãn bài lab trong `LabSelector` tránh lặp tiền tố (`Lab X: Lab Y`).
  - Đồng bộ hoá logic phân giải `classId` trong `auth-controller.js` với `auth.js` (`COALESCE` với `enrollments` và `class_staff`).
- Validation:
  - Kiểm thử giao diện bằng Browser Subagent trên `http://localhost:3007`:
    - Đăng nhập `student_1`: Banner lớp hiển thị chính xác `Class A`, Giảng viên `ta_a (@ta_a)`, Sĩ số `1 Sinh viên`, danh sách bạn học và thông báo từ giảng viên.
    - Tiêu đề Lab hiển thị chuẩn xác `Lab 1: Merge sort`.
  - Toàn bộ automated test suite: 122/122 tests passed (64 unit tests + 58 contract tests).

## 2026-11-24 — Nam Anh — Sửa lỗi nhấp nháy (Flickering) khi nhập liệu trong Login Modal Dialog

- Tool/model: Codex / Gemini assistant.
- Task:
  - Khắc phục triệt để lỗi rung nháy (flickering), nhảy giao diện (layout shift) và mất focus khi gõ phím vào ô nhập liệu trong hộp thoại đăng nhập (`LoginModal`).
- Nguyên nhân gốc rễ (Root Cause):
  - Trước đây, `LoginModal` sử dụng `useState` cho `username` và `password`. Mỗi ký tự gõ vào gọi `setState`, kích hoạt `scheduleUpdate()` và `updateDOM()`.
  - Bộ render VDOM tự chế (`lib/react.js`) xoá trắng `container.innerHTML = ''` và dựng lại toàn bộ DOM trên mỗi render.
  - Hộp thoại đăng nhập mang class `.animate-fade-in` (`keyframes fadeIn: opacity 0 -> 1; translateY(6px -> 0)`). Khi DOM bị dựng lại trên mỗi phím bấm, hiệu ứng fade-in & dịch chuyển 6px liên tục bị kích hoạt lại từ đầu, gây hiện tượng nhấp nháy, giật rung mạnh.
  - Ngoài ra, `Input.js` trước đây luôn ép cứng `value: value ?? ''`, khiến các input không truyền `value` (uncontrolled) bị gán đè chuỗi rỗng trên mỗi lần render; và `updateDOM` chỉ phục hồi focus khi input có `id`.
- Giải pháp triển khai:
  - `src/frontend/src/features/auth/components/LoginModal.js`:
    - Chuyển `usernameRef` và `passwordRef` sang sử dụng `useRef` và cơ chế input không kiểm soát (uncontrolled inputs). Khi gõ phím, giá trị được lưu trực tiếp vào ref/DOM mà không gọi `setState` hay kích hoạt re-render DOM toàn trang.
    - Loại bỏ class `.animate-fade-in` trên khung modal để tránh re-trigger animation.
    - Bổ sung `id` và `name` tường minh (`login-username`, `login-password`) cho các input.
    - `handleSubmit` đọc giá trị an toàn từ ref, form event hoặc DOM fallback.
  - `src/frontend/src/components/ui/Input.js`:
    - Chỉ gán thuộc tính `value` cho thẻ `<input>` khi `value !== undefined`, cho phép hỗ trợ hoàn hảo cả 2 chế độ controlled và uncontrolled input (sử dụng `defaultValue`).
  - `src/frontend/src/lib/react.js`:
    - Nâng cấp `updateDOM`: Khi active element là `INPUT`/`TEXTAREA` chưa có `id`, tự động truy vấn tìm lại phần tử dựa trên thuộc tính `name` hoặc `placeholder` để bảo toàn vị trí con trỏ (selection range) và focus.
- Validation:
  - Chạy toàn bộ 122 automated tests: 64 unit tests + 58 contract tests đều PASS 100%.
  - Kiểm thử trực quan trên Browser: Gõ ký tự mượt mà, không giật rung, không mất focus, đăng nhập thành công.

## 2026-11-24 — Nam Anh — Nâng cấp Giao diện Sinh viên (Student Portal): Đa Lớp Học, Không Gian Lớp 3 Tab và Lịch Sử Nộp Bài Không Lưu Code

- Tool/model: Codex / Gemini assistant.
- Task:
  - Tái cấu trúc toàn diện giao diện sinh viên:
    - Mỗi sinh viên có danh sách các lớp đã tham gia (`StudentDashboard`).
    - Khi sinh viên chọn một lớp, đi vào Không gian lớp học (`StudentClassWorkspace`) với 3 tabs:
      1. `🏫 Thông Tin & Thông Báo`: Xem thông tin lớp, giảng viên phụ trách, sĩ số, danh sách bạn cùng lớp (read-only) và bảng tin thông báo.
      2. `🧪 Bài Lab & Làm Bài`: Danh sách bài lab đã phát hành, xem đề bài, ràng buộc, làm bài trong trình soạn thảo code C++20 và nộp bài trực tiếp.
      3. `📊 Lịch Sử Nộp Bài`: Tra cứu lịch sử nộp bài của sinh viên trong lớp học này. Tuyệt đối **không lưu hoặc hiển thị lại source code**, chỉ lưu và hiển thị kết quả biên dịch/judge (`judgeVerdict`), trạng thái (`status`), điểm số (`grade`) và thời gian nộp (`createdAt`).
- Backend:
  - `src/backend/features/classes/classes-model.js`:
    - Bổ sung `getStudentClasses(studentId)`: Trả về toàn bộ lớp sinh viên tham gia kèm giảng viên, sĩ số, số bài lab và số thông báo.
    - Bổ sung `isStudentEnrolled(classId, studentId)`: Kiểm tra quyền tham gia lớp của sinh viên.
    - Bổ sung `getStudentSubmissionsByClass(classId, studentId)`: Truy vấn toàn bộ bài nộp của sinh viên trong lớp, tính điểm tự động trừ điểm vi phạm khi lab đã công bố, và tuyệt đối **không chọn `source_code`**.
  - `src/backend/features/classes/classes-controller.js`:
    - Cập nhật `myClasses`: Sinh viên gọi `GET /api/my-classes` nhận danh sách lớp đã tham gia.
    - Bổ sung route `GET /api/classes/:classId/my-submissions`.
    - Cập nhật `getById`, `getClassLabs`, `getAnnouncements`, `listStudents`: Cho phép sinh viên đã tham gia lớp truy cập thông tin của lớp mình.
  - `src/backend/features/submissions/`:
    - Cho phép sinh viên nộp bài và tra cứu bài nộp vào bất kỳ lớp nào mà sinh viên đã ghi danh.
- Frontend:
  - Tổ chức module `src/frontend/src/features/student/` tuân thủ nghiêm ngặt giới hạn dưới 200 dòng/file:
    - `api/studentApi.js` (21 lines)
    - `components/StudentDashboard.js` (151 lines)
    - `components/StudentClassOverviewTab.js` (110 lines)
    - `components/StudentClassLabsTab.js` (86 lines)
    - `components/StudentClassSubmissionsTab.js` (129 lines)
    - `components/StudentClassWorkspace.js` (150 lines)
    - `components/StudentPortal.js` (45 lines)
  - Cập nhật `src/frontend/src/routes/AppRoutes.js` (142 lines) điều hướng tự động sang `StudentPortal`.
- Validation:
  - Bổ sung bộ kiểm thử `test/unit/student-portal.test.js` kiểm tra toàn bộ luồng nghiệp vụ Backend.
  - Chạy toàn bộ automated test suite: **65 unit tests** + **58 contract tests** (**123 tests total passing 100%**).
  - Kiểm thử trực quan và chụp ảnh màn hình xác nhận toàn bộ 3 tabs và luồng nộp bài qua Browser subagent.

## 2026-11-24 — Tường Huỳnh — Nâng cấp Header Dropdown Menu & Profile/Settings Modal

- Tool/model: Antigravity / Gemini assistant.
- Task:
  - Nâng cấp menu dropdown ở header người dùng bao gồm 4 mục chuẩn hóa:
    1. `👤 Hồ sơ cá nhân (Profile)`: Mở hộp thoại xem thông tin định danh người dùng.
    2. `⚙️ Cài đặt tài khoản (Setting)`: Chỉnh sửa ảnh đại diện (avatar), họ và tên, số điện thoại và đổi mật khẩu.
    3. `📖 Tài liệu API (Docs)`: Mở giao diện tài liệu tương tác Scalar API Reference (`/api/docs`).
    4. `🚪 Đăng xuất (Logout)`: Đăng xuất an toàn khỏi phiên làm việc.
- Backend:
  - `src/backend/features/auth/auth-controller.js`: Cập nhật `updateProfile` hỗ trợ cập nhật linh hoạt `name`, `avatar`, `phone`, và đổi mật khẩu xác thực hash.
- Frontend:
  - Tách và tối ưu `src/frontend/src/features/auth/components/UserDropdownMenu.js` rút gọn từ 207 dòng xuống còn **125 dòng**, tuân thủ 100% giới hạn `< 200 dòng`.
  - Bổ sung tab `UserSettingsTab.js` và form `UserSettingsPasswordForm.js`.
- Validation:
  - Bổ sung `test/unit/profile-and-settings.test.js` đạt 100% pass.

## 2026-11-24 — Tường Huỳnh — Loại bỏ các yếu tố AI phô trương, Tái cấu trúc Cổng Sinh viên & Giảng viên chuẩn Academic

- Tool/model: Antigravity / Gemini assistant.
- Task:
  - Loại bỏ hoàn toàn các yếu tố "AI vibe" phô trương, gaming hoặc phi học thuật trên toàn bộ trang sinh viên và giảng viên:
    - Loại bỏ template code mẫu cheat `dynamicArray` hardcoded trong `CodeEditorWindow.js`, thay bằng starter code C++20 chuẩn mực.
    - Gỡ bỏ traffic light dots (`🔴 🟡 🟢`), biểu tượng sấm chớp (`⚡`), nút "Nạp code mẫu" (`💡`) và tên lửa (`🚀`) khỏi `EditorHeader.js`.
    - Đơn giản hóa `SubmissionStepper.js`: thay dải màu cầu vồng (rainbow gradient) và icon gaming bằng thanh tiến trình xanh học thuật chuyên nghiệp.
    - Làm sạch `StudentDashboard.js`, `StudentClassCard.js`, `StudentClassWorkspace.js`, `StudentClassOverviewTab.js`, `StudentClassSubmissionsTab.js`, `StudentClassroomBanner.js`. Toàn bộ 100% component tuân thủ nghiêm ngặt trần 200 dòng code.
- Validation:
  - `npm run check`: 81 unit tests + 58 contract tests pass 100%.

## 2026-11-24 — Tường Huỳnh — Bảng Quản trị Người dùng: Cột "Lớp học đã tham gia" chuyển ra cuối cùng kèm Modal "Xem thêm"

- Tool/model: Antigravity / Gemini assistant.
- Task:
  - Vì người dùng (sinh viên, giảng viên) có thể tham gia nhiều lớp học, hiển thị toàn bộ danh sách lớp trực tiếp trên bảng chính gây vỡ layout và khó đọc.
  - Chuyển cột "Lớp học đã tham gia" ra vị trí cột cuối cùng của bảng quản lý người dùng.
  - Thay thế giá trị văn bản thô bằng nút bấm **"Xem thêm"**.
  - Khi click "Xem thêm", mở hộp thoại Modal (`UserClassesModal.js`) hiển thị bảng chi tiết các lớp học người dùng đã tham gia bao gồm: Tên lớp, Vai trò, Ngày tham gia, và Trạng thái.
- Implementation:
  - Backend `src/backend/features/auth/auth-controller.js`: Bổ sung `qAdminClasses`, `qTeacherClasses`, `qStudentClasses` vào API `GET /api/users` để trả về danh sách `classes: [...]` kèm thông tin lớp đã tham gia mà không làm lộ session token hay hash mật khẩu.
  - Frontend:
    - `userClassesHelper.js` (41 dòng): Xử lý trích xuất danh sách lớp an toàn.
    - `UserClassesTable.js` (136 dòng): Bảng hiển thị danh sách lớp trong modal.
    - `UserClassesModal.js` (144 dòng): Dialog modal hiển thị khi bấm "Xem thêm".
    - `UserDirectoryTable.js` (187 dòng): Đưa cột "Lớp học đã tham gia" về cột cuối cùng.
    - `UserTableRow.js` (122 dòng) & `UserDirectoryFilterBar.js` (122 dòng).
- Validation:
  - Bổ sung `test/unit/admin-user-classes-modal.test.js` kiểm tra helper, rendering modal, empty state và cấu trúc cột cuối cùng.

## 2026-11-24 — Tường Huỳnh — Kiểm thử Vòng đời Toàn diện (Full Class Lifecycle) & Khắc phục Lỗi Chấm điểm

- Tool/model: Antigravity / Gemini assistant.
- Task:
  - Tự động hóa và kiểm chứng toàn bộ vòng đời lớp học:
    1. Admin tạo lớp mới, tạo 1 giảng viên (`gv_nguyen`) và 3 sinh viên (`sv_an`, `sv_binh`, `sv_cuong`), gán vào lớp.
    2. Giảng viên tạo 3 bài lab kèm bộ test case và ràng buộc AST cấm hàm.
    3. 3 sinh viên nộp 9 bài giải thuật C++20 (trong đó `sv_binh` nộp code vi phạm `std::min` ở Lab 1).
    4. Worker offline phân tích cú pháp AST Tree-sitter và phát hiện đúng vi phạm.
    5. Giảng viên kiểm tra Review Queue, duyệt vi phạm của `sv_binh`, kiểm tra bảng điểm (sv_an: 10, sv_binh: 8, sv_cuong: 10), công bố điểm và sinh viên xem kết quả.
- Lỗi phát hiện & Khắc phục:
  - **Lỗi 1 (classes-model.js):** Hàm `getStudentSubmissionsByClass` truy vấn bảng `constraint_results` cũ (bảng không tồn tại) và tính thang 100. Đã sửa sang truy vấn `constraint_verdicts cv` và chuẩn hóa thang điểm 10 (`Math.max(0, 10 - deductionTotal)`) đồng bộ với `src/grades.js`.
  - **Lỗi 2 (AST Ban List):** Regex trong `src/checker/index.js` yêu cầu tên hàm cấm phải bọc trong dấu backtick (ví dụ: `` `std::min` ``) để đưa vào AST ban list chính xác. Đã chuẩn hóa mô tả ràng buộc có backtick.
- Validation:
  - Tạo mới `test/unit/comprehensive-class-lifecycle.test.js` kiểm tra 100% thành công.
  - Tổng số test: **82 unit tests + 58 contract tests = 140 tests passed 100%**.

## 2026-11-24 — Browser Subagent — Kiểm chứng Trực quan Toàn diện trên Trình duyệt Thực tế (Chrome Live UI)

- Tool/model: Chrome DevTools Protocol / Browser Subagent qua Antigravity.
- Task:
  - Chạy kịch bản người dùng thực tế trên trình duyệt Chrome tại `http://localhost:3007`:
    1. Đăng nhập Admin $\rightarrow$ Tạo lớp "Lớp C++ Nâng Cao K23" (ID #3) $\rightarrow$ Tạo 1 GV (`gv_nguyen`), 3 SV (`sv_an`, `sv_binh`, `sv_cuong`) $\rightarrow$ Kiểm tra modal "Xem thêm" lớp học.
    2. Đăng nhập `gv_nguyen` $\rightarrow$ Tạo 3 bài lab: Lab 1 (Basic Two Sum, cấm `std::min`), Lab 2 (Dynamic Vector, cấm `std::sort`), Lab 3 (Binary Tree, cấm `std::reverse`).
    3. Đăng nhập lần lượt `sv_an`, `sv_binh`, `sv_cuong` $\rightarrow$ Nộp bài C++ vào cả 3 lab (`sv_binh` nộp code gọi `std::min` ở Lab 1).
    4. Đăng nhập lại `gv_nguyen` $\rightarrow$ Kiểm tra Hàng đợi duyệt vi phạm, kiểm tra Bảng điểm lớp $\rightarrow$ Bấm nút "Publish grades" thành công.
    5. Đăng nhập lại `sv_binh` $\rightarrow$ Xác nhận trạng thái "Đã công bố điểm".
- Bằng chứng nghiệm thu (Artifacts):
  - Ảnh chụp Admin Portal: `e2e_browser_admin_portal.png`
  - Ảnh chụp 3 bài Lab Giảng viên: `e2e_browser_teacher_labs.png`
  - Ảnh chụp Sinh viên nộp bài: `e2e_browser_student_view.png`
  - Ảnh chụp Hàng đợi duyệt Review Queue: `e2e_browser_review_queue.png`
  - Ảnh chụp Bảng điểm Grade Roster: `e2e_browser_grade_roster.png`
  - Ảnh chụp Trạng thái Công bố điểm: `e2e_browser_published.png`
  - Ảnh chụp Điểm sinh viên sau công bố: `e2e_browser_student_published.png`
  - Video quay màn hình toàn bộ phiên kiểm thử: `e2e_full_workflow_walkthrough.mp4`

## 2026-11-24 — Copilot — Merge main vào feat/e2e-app

- Tool/model: Copilot coding agent; Git and npm.
- Task: Merge the repository default branch `main` and resolve README and permissions conflicts.
- Changed: Kept the PA3 application and project context in `README.md`, incorporating the relevant PA3 checker evidence. Kept the PA3 Free-tier project in `docs/permissions.md` and the existing boundary against sending student code. Explicitly retained the authorization for synthetic checks and public dev-set runs; unit, contract and CI tests remain offline.
- Rejected: Did not retain the stale PA2 project and setup content from the conflicting README/permissions sections. Did not reformat unrelated frontend files.
- Validation: `npm ci` succeeded with zero reported vulnerabilities. `npm run check` passed ESLint but stopped at Prettier warnings in five unmodified student component files. `npm test` passed 82/82 and `npm run contract` passed 58/58. `git diff --cached --check` passed; `README.md` and `docs/permissions.md` contain no conflict markers.

## 2026-11-25 — Tú — Azure deployment and PA3 rehearsal

- Tool/model: Codex with SSH, Node.js, Docker, PM2, systemd, Caddy, tcpdump, nftables, curl and Python.
- Task: Deploy the integrated PA3 worker and verify the public path from a queued C++ submission to the TA review queue.
- Changed: Built the sandbox image on Azure at `1ce5953`. Started the worker with PM2 executing Node directly and set both processes to use `/home/azureuser/app/data/leetkob.db`. Saved the offline process list and enabled the PM2 systemd startup unit. A PM2 fork start appeared online but had skipped the worker entrypoint. Direct Node execution logged `PA3 worker ready` and drained the queued jobs.
- Changed: Captured the probe's TCP 443 traffic, observed larger TLS segments missing in transit, and verified a temporary two-way MSS limit. Persisted the working limit for IPv4 TCP 443 in `leetkob-https-mss.service`. HTTPS over new TCP connections and HTTP/3 returned 200. Applied the PA3 public Publish gate at Caddy and checked its 403 response.
- Rejected: Kept the worker offline for the rehearsal and kept the public grading flow at the review queue. Kept HTTP/3 available after restoring TCP HTTPS. A host-wide MTU change was unnecessary.
- Changed: Restored `eval/dev/README.md` from the published dev-set revision `552c811` after the integration merge altered its first paragraph. Compared the replacement byte for byte with the lecturer's file and checked that the dev set matched the pre-merge snapshot.
- Validation: On the VM the Docker sandbox and worker restart tests passed 10/10 with zero skips. A separate public rehearsal created lab #4 and queued submissions #7–9 via HTTPS. All became `Accepted` with six queue entries and cross-class queue access returned 404. The five demo logins succeeded. A new Chromium context with QUIC disabled loaded the public home and health endpoints. Local `npm run check` passed. [Docker log](evidence/pa3-deployment/vm-sandbox.txt) · [Public rehearsal](evidence/pa3-deployment/public-offline.json)

## 2026-11-25 — Tú — Isolated Gemini verification on Azure

- Tool/model: Codex, SSH, Node.js, Docker and Gemini `gemini-3.5-flash-lite`.
- Task: Run the three public `sort-merge` fixtures through the Azure worker with the approved Free tier credentials and a three-request cap.
- Changed: Recovered from an SSH interruption by storing the next authorized run's report on Azure before retrieving it. Used a separate SQLite database and normalized the private deploy setting to the confirmed cap of 80. The temporary worker reserved exactly 3 requests.
- Rejected: Deferred enabling Gemini in the public worker while the isolated requests returned HTTP 400.
- Validation: All three submissions reached `Accepted`; all three C1 hard-rule verdicts matched the dev labels. All three C2 calls returned HTTP 400 with no provider request ID, and the worker recorded `unsure` from the guardrail. [Azure smoke report](evidence/pa3-deployment/azure-gemini-smoke.json)

## 2026-11-25 — Tú — Azure Gemini key retest

- Tool/model: Codex, SSH, Node.js and Gemini `gemini-3.5-flash-lite`.
- Task: Retest the updated key from Azure with the public `sort-merge/s01` fixture.
- Changed: Captured the provider error code and a message category in an isolated one-request checker run. The persisted report excludes the key, prompt and raw provider error body.
- Rejected: Deferred starting the public worker in live mode after the provider rejected the Azure request.
- Validation: The single request returned HTTP 400 and Google status `FAILED_PRECONDITION`. The error message referred to region support. C1 passed and C2 was `unsure`. [Azure key retest](evidence/pa3-deployment/azure-gemini-key-retest.json)

- Follow-up: A separately authorized one-request retest with the previous key restored on the same VM returned HTTP 400 and `FAILED_PRECONDITION` with the same region-related error category. The checker recorded C2 as `unsure`. [Previous key retest](evidence/pa3-deployment/azure-gemini-old-key-retest.json)

## 2026-11-25 — Tú — PA3 deployment in Korea Central

- Tool/model: Codex, SSH, Git, Node.js, npm, Docker, Caddy, PM2, systemd, Chromium and Python.
- Task: Deploy the integrated PA3 application to the new Korea Central VM and repeat the East Asia infrastructure checks.
- Changed: Connected to the pinned Korea host on SSH port 22. Bypassed a local system SSH include with invalid permissions by selecting the user config with `ssh -F`. Cloned the verified `main` commit `1ce5953` and ran `npm ci` beside its lockfile.
- Changed: Built the C++ sandbox, started the web on `127.0.0.1:3007` and the worker through PM2's direct Node invocation. Used a new shared SQLite WAL database and enabled systemd startup. Added the PA3 Publish gate to the existing Caddy HTTPS proxy.
- Decision: Kept the public worker offline pending the private Gemini configuration. The Korea connection passed TLS on a new TCP session, so the East Asia MSS adjustment was unnecessary here.
- Validation: All 10 Docker and restart checks passed on the VM with no skips. Public HTTPS and a fresh Chromium context without QUIC loaded the service. A new `sort-merge` lab accepted all three submitted fixtures, exposed six verdicts only to the authorized TA, rejected the cross-class queue request with 404, and refused Publish with 403. [Korea sandbox log](evidence/pa3-deployment/korea-vm-sandbox.txt) · [Korea public rehearsal](evidence/pa3-deployment/korea-public-offline.json)

## 2026-11-25 — Tú — Live Gemini smoke in Korea Central

- Tool/model: Codex, SSH, Node.js, Docker and Gemini `gemini-3.5-flash-lite`.
- Task: Verify the provided Free tier configuration with one authorized request using an isolated database and the public `sort-merge/s01` fixture.
- Changed: Started a separate worker with a one-request cap. Parsed the mode-600 configuration without disclosing the key and verified the configured deployment cap of 80.
- Decision: Ran the model smoke separately from the public worker.
- Validation: Docker judged the fixture `Accepted`. The checker recorded C1 `pass` from the hard rule and C2 `pass` from the model. The one C2 request returned HTTP 200 with a provider request ID, 1,211 prompt tokens, 241 completion tokens, and 2,104 ms recorded latency. The verdict matched the pass label and included original source lines while that dev label leaves its evidence list empty. [Korea Gemini smoke](evidence/pa3-deployment/korea-gemini-smoke.json)

## 2026-11-25 — Tú — PA3 public model and hand-in evidence

- Tool/model: Codex, SSH, PM2, SQLite, Docker, Playwright, Chromium, FFmpeg and Gemini `gemini-3.5-flash-lite`.
- Task: Enable the demo worker's model and verify PA3 through public HTTPS.
- Changed: Verified the public database contained only seeded demo accounts and no pending jobs before the worker switch. Used Node's runtime env file with the verified Free tier settings and cap of 80. Saved the PM2 startup state after checking its environment metadata for provider credentials.
- Validation: Three public `sort-merge` submissions were judged `Accepted` in one attempt each. All three C1 outcomes matched the labels. The three model reservations yielded one successful C2 verdict and two logged errors, which became `unsure`. The cross-class queue response was 404. [Live API report](evidence/pa3-deployment/korea-public-live.json) · [Recording](evidence/pa3-deployment/korea-public-demo.mp4)
- Validation: All nine public sandbox probes matched their expected outcomes. The probes used repository fixtures with the deployed wall-clock and output thresholds, a synthetic host canary, and a hard-rule constraint. Docker showed zero remaining sandbox containers and the probes made zero model calls. [Public sandbox evidence](evidence/pa3-deployment/korea-public-sandbox.json)
- Release evidence: Merged PR #20 after its three CI jobs passed and created `pa3` at `ec6ef8d9b616fed709478d854edc52bf968f75b5`. Verified that the tag push triggered CI and that the submitted video can be downloaded from the tag. [Tagged CI run](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/45621675509)

## 2026-11-25 — Tú — Show cross-class access errors in the PA3 browser UI

- Tool/model: Codex, Playwright and Chromium.
- Task: Show the lab endpoint's access error to a TA who opens another class's lab via its URL.
- Changed: Retain the requested lab until its details response is resolved. Ignore superseded detail requests. Render the backend's 403 or 404 on the actual lab screen and provide a way back to the class list.
- Decision: Kept the existing backend class-isolation contract and used its response status in the frontend.
- Validation: `npm run check` passed. Both Chromium tests passed, including the new cross-class test that checks the actual 404 response, visible UI message and absence of the Publish action.
- Changed: The browser form rehearsals exposed that single-line test fields discarded line breaks. Switched the test input and output fields to textareas and handled input events while typing so the custom renderer no longer replaces action buttons during blur. Added stable input IDs for focus restoration.
- Validation: The browser regression creates a lab with multiline test cases and two constraints, checks the real submission body, and then checks that the other TA sees HTTP 404 on the lab screen. This regression, the existing Publish browser test and `npm run check` passed.
