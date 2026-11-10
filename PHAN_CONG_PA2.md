# Phân công PA#2 — LeeTKOB

Đây là kế hoạch công việc; các checkbox chưa đánh dấu không có nghĩa là nhóm đã hoàn thành. Đối chiếu yêu cầu cuối cùng với `task.md`, project brief và rubric PA#2. README của starter là hướng dẫn thực hành Session 7, chưa bao gồm toàn bộ hồ sơ nộp PA#2.

- Hạn theo rubric: **22:00, thứ Tư, 11/11/2026**.
- **Tú — người 2:** commands, CI, branch protection và kiểm tra tích hợp.
- **Nam Anh — người 1:** harness, permissions, tài liệu và tổng hợp hồ sơ nộp.
- **Tường — người 3:** API contract, contract tests và backend Publish.

## 1. Cách triển khai và mốc bàn giao

### Giai đoạn 1 — Tú làm nền tảng trước

Tú chốt các lệnh kiểm tra, sửa CI, bảo vệ `main`, tạo bằng chứng PR đỏ bị chặn và commit sửa xanh. Sau khi PR nền tảng đã merge và đáp ứng checklist bàn giao, **Tú thông báo cho cả nhóm thì Nam Anh và Tường bắt đầu triển khai song song**.

Mẫu thông báo của Tú — chỉ gửi sau khi đã kiểm tra thực tế:

> Tú đã làm xong nền tảng commands + CI + bảo vệ main, PR đã merge. Nam Anh và Tường pull main mới nhất rồi tạo branch riêng để bắt đầu nhé. Các lệnh chạy và link bằng chứng nằm trong phần bàn giao/AI-LOG.md. Khi làm nhớ cập nhật AI-LOG.md trên branch của mình để cuối bài tập hợp.

Trong lúc chờ, Nam Anh và Tường có thể đọc rubric, README, contract và ghi chú các điểm cần xử lý. Chưa sửa các file nền tảng đang do Tú phụ trách.

### Giai đoạn 2 — Nam Anh và Tường làm song song

- Nam Anh làm rules, permissions, secrets, README và hồ sơ nộp.
- Tường hoàn thiện contract, siết tests, sửa API và tạo bằng chứng contract break.
- Tú review PR, hỗ trợ CI, xác nhận merge bị chặn và kiểm tra bản clone mới.
- Cuối giai đoạn, cả ba bàn giao link bằng chứng và AI log để Nam Anh tổng hợp; cả nhóm kiểm tra trước khi tag và đóng ZIP.

## 2. File và thư mục từng người quản lý

Tất cả đường dẫn dưới đây tính từ root repo `awad-leetkob/`. Các file ghi “tạo mới” chưa có trong starter. Mỗi người quản lý chính các file được giao; nếu cần sửa file của người khác thì thống nhất trước.

| Người | File/thư mục | Phạm vi |
| --- | --- | --- |
| Tú | `package.json`, `package-lock.json` | Node, dependencies, scripts kiểm tra |
| Tú | `.github/workflows/` | CI cho PR, main và tag nộp bài |
| Tú | `eslint.config.js`, `.prettierrc.json`, `.prettierignore` | Lint và format |
| Tú | `src/http.js` | Sửa lint; phối hợp với Tường nếu cần thay đổi helper lỗi |
| Tú | `playwright.config.js`, `e2e/`, `public/` | Browser test; chỉ sửa giao diện khi cần cho luồng kiểm tra |
| Tú | GitHub Settings | Public repo, branch protection, required checks; cần quyền admin repo |
| Nam Anh | `AGENTS.md` — tạo mới | Rules cho assistant |
| Nam Anh | `docs/permissions.md` — tạo mới | Quyền allowed / ask first / never |
| Nam Anh | `.env.example` — tạo mới, `.gitignore` | Biến môi trường, quản lý secrets |
| Nam Anh | `README.md` | Hướng dẫn chạy, checks, stack, model và spending cap |
| Nam Anh | `PA2.md`, `SELF_ASSESSMENT_REPORT.md` — tạo mới | Bằng chứng và tự chấm |
| Nam Anh | `PHAN_CONG_PA2.md` | Cập nhật phân công nếu nhóm thay đổi phạm vi |
| Tường | `docs/contract/` | Contract endpoint Publish |
| Tường | `src/app.js` | Phân quyền và luồng Publish |
| Tường | `src/db.js`, `src/grades.js`, `src/server.js` | Backend liên quan; chỉ sửa khi task cần |
| Tường | `test/contract/`, `test/unit/`, `test/helpers.js` | Tests và dữ liệu/hàm hỗ trợ |
| Cả ba ghi, Nam Anh tổng hợp | `AI-LOG.md` — tạo mới | Nhật ký dùng AI và các quyết định thực tế |

## 3. Tú — checklist commands, CI và bảo vệ main

### T2.1. Chốt môi trường và commands

- [ ] Dùng phiên bản Node đáp ứng `package.json` (hiện là `>=22.13`); local và CI dùng phiên bản tương thích, ưu tiên cùng phiên bản.
- [ ] Kiểm tra `npm ci` cài được dependencies từ lockfile đã commit.
- [ ] Xác nhận từng lệnh: `npm run lint`, `npm run format:check`, `npm test`, `npm run contract`.
- [ ] Chốt `npm run check` chạy các checks bắt buộc và trả lỗi nếu một check thất bại.
- [ ] Chốt cách xử lý type check: nếu áp dụng thì có lệnh kiểm tra thực sự và chạy trong CI; nếu không áp dụng thì ghi rõ lý do theo rubric. Không tạo lệnh chỉ in thông báo thành công để thay type check.
- [ ] Ghi lại các lệnh, phiên bản Node và lưu ý cài đặt để Nam Anh cập nhật README.

### T2.2. Sửa workflow trước, giữ bằng chứng lỗi

- [ ] Sửa workflow chạy trên `pull_request` và trên `main`.
- [ ] Cấu hình chạy khi push tag nộp bài `pa2`, để có CI run cho tag.
- [ ] Dùng `npm ci` và cùng `npm run check` như local.
- [ ] Bỏ `continue-on-error: true`, `|| true` và cơ chế khác che lỗi checks.
- [ ] Ở commit sửa CI đầu tiên, chưa sửa `src/` hay `test/`; giữ riêng thay đổi workflow để review được.
- [ ] Mở PR, kiểm tra CI bắt được lỗi lint `legacyLimit` trong `src/http.js`.
- [ ] Không chỉ nhìn màu job: kiểm tra log để chắc chắn các lệnh cần thiết thực sự chạy.

### T2.3. Bật protection, chứng minh đỏ chặn merge

- [ ] Sau khi check đã chạy và xuất hiện trong GitHub, bật protection cho `main`.
- [ ] Bắt buộc PR trước khi merge; đặt job `gates` thành required check.
- [ ] Không cho bypass các điều kiện bảo vệ.
- [ ] Xác nhận PR đang đỏ thực sự bị chặn merge sau khi protection đã bật; lưu link và ảnh.
- [ ] Commit riêng sửa lỗi lint `legacyLimit`; không làm yếu quy tắc lint để né lỗi.
- [ ] Xác nhận CI xanh sau commit sửa; lưu SHA/link commit và CI run.
- [ ] Nhờ review và merge PR nền tảng. Từ khi bật protection, không push trực tiếp vào `main`.

### T2.4. E2E theo hướng dẫn Session 7

E2E là phần bổ sung của README, không phải một tiêu chí chấm riêng trong rubric PA#2. Nếu nhóm làm đầy đủ README thì hoàn thành phần này.

- [ ] Thêm job riêng cài browser và chạy `npm run e2e`.
- [ ] Trong CI, cài Chromium cùng dependencies cần thiết trước khi chạy Playwright.
- [ ] Xác nhận hành trình TA review rồi Publish chạy được.
- [ ] Sau khi job xuất hiện và chạy thành công, đặt E2E thành required nếu theo đầy đủ README.

### T2.5. Điều kiện bàn giao và thông báo bắt đầu

- [ ] PR nền tảng đã merge vào `main`; CI hiện tại xanh.
- [ ] `main` được bảo vệ và required checks đang có hiệu lực.
- [ ] Có link PR đỏ bị chặn, commit sửa xanh, CI run và ảnh cấu hình protection.
- [ ] Có danh sách commands cuối cùng để hai người còn lại dùng.
- [ ] Tạo `AI-LOG.md`, ghi các thao tác dùng AI, Changed / Rejected và bằng chứng thực tế của phần Tú.
- [ ] Thông báo theo mẫu ở mục 1 để Nam Anh và Tường bắt đầu.

Lưu ý: nền tảng CI xanh chưa chứng minh API đúng, vì starter có contract tests yếu. Tường sẽ siết tests và sửa API ở giai đoạn 2.

## 4. Nam Anh — checklist harness, tài liệu và hồ sơ

Bắt đầu branch công việc từ `main` mới nhất sau thông báo của Tú.

**Bàn giao Nam Anh, 10/11/2026:** branch `docs/pa2-harness` từ main `55a5c30`; hồ sơ [PA2.md](PA2.md) và [tự chấm](SELF_ASSESSMENT_REPORT.md) đang là bản nháp có đánh dấu phần chờ Tường/tag của Tú. Danh tính đã xác nhận: 23120111 — Phạm Quốc Nam Anh. Chi tiết validation và secrets trong [AI log](AI-LOG.md#nam-anh-harness).

### T1.1. Rules file

- [x] Tạo `AGENTS.md`, ngắn gọn và đúng với công cụ assistant nhóm sử dụng.
- [x] Có đủ bốn phần: stack, commands, conventions, never.
- [x] Commands khớp với phần Tú đã bàn giao.
- [x] Ghi các điều cấm đặc thù sản phẩm: không có secrets trong sandbox; không gọi model thật trong unit tests; không sửa tests/eval data/labels chỉ để che lỗi và làm checks xanh.
- [x] Ít nhất hai quy tắc truy được về sự cố thực tế bằng commit hoặc AI log, ví dụ workflow che lỗi và test nuốt assertion.
- [x] Quy tắc không được mâu thuẫn với công việc sửa tests cho nghiêm ngặt hoặc PR cố tình phá code đã được nhóm giao rõ ràng; các việc này phải có phạm vi và bằng chứng riêng.

### T1.2. Permissions và secrets

- [x] Viết `docs/permissions.md` với ba mức allowed / ask first / never; dẫn link từ rules file khi phù hợp.
- [x] `.env.example` liệt kê biến cần thiết không kèm giá trị; khớp với cách chạy thực tế.
- [x] `.env` và file chứa secrets được ignore, nhưng `.env.example` vẫn được commit.
- [x] Kiểm tra secrets trong cả cây file hiện tại và lịch sử Git, không chỉ commit cuối.
- [x] Rotate key: N/A (chưa từng lộ credential thật, scan 0 leaks).
- [x] Ghi thông tin model và spending cap đúng thực tế. Rubric yêu cầu key có spending cap; nếu chưa thiết lập thì ghi phần chưa làm được, không tự nhận đã có.

### T1.3. README và AI log

- [x] README có stack, yêu cầu môi trường, cách cài đặt, chạy app và từng lệnh check.
- [x] Ghi rõ dữ liệu mẫu dùng SQLite trong RAM và reset khi restart.
- [x] Phân biệt checks bắt buộc với E2E bổ sung, phù hợp cấu hình nhóm đã chọn.
- [x] Tổng hợp `AI-LOG.md` theo mục 6; giữ nguyên thông tin và bằng chứng của cả ba.
- [x] Có Changed / Rejected cụ thể; không ghi câu chuyện hoặc quyết định không xảy ra.

### T1.4. Hồ sơ nộp

- [x] Tạo `PA2.md` tại root với link repo public, protection settings/ảnh, PR bị chặn, PR xanh và commit sửa, CI cho tag, deliberate contract break.
- [x] Chuẩn bị link trang Actions lọc theo tag `pa2` trước khi tạo tag, để tài liệu nộp không cần sửa và di chuyển tag chỉ để chèn URL run phát sinh sau đó.
- [x] Lấy template Classroom và hoàn thiện `SELF_ASSESSMENT_REPORT.md`: đủ bảy tiêu chí, điểm tự chấm, bằng chứng và phần chưa làm được.
- [x] Nhận xác nhận điểm/bằng chứng phần CI từ Tú và phần contract/tests từ Tường.
- [ ] Chuẩn bị ZIP chứa repository cùng `.git`, đặt tên MSSV tăng dần và tổng điểm tự chấm theo rubric (chờ tag của Tú).

## 5. Tường — checklist contract, tests và API

Bắt đầu branch công việc từ `main` mới nhất sau thông báo của Tú. Endpoint được chọn là `POST /api/labs/{labId}/publish`.

### T3.1. Hoàn thiện contract trước

- [x] Đối chiếu các phần với `CONTRACT.md` của IA#3; lấy template từ tài liệu IA#3 vì repo hiện chưa có file đó.
- [x] Ghi cách xác thực, role và ownership: TA chỉ thao tác lab thuộc lớp mình; admin theo contract.
- [x] Mô tả request, response, field rules và định dạng timestamp đủ rõ để client dùng được.
- [x] Liệt kê các error type và status: 401 unauthenticated, 403 forbidden, 404 not-found, 409 reviews-pending.
- [x] Mô tả error body theo problem details, gồm content type, `type`, `title`, `status`, và `pending` khi áp dụng.
- [x] Nêu rõ bị từ chối thì không thay đổi dữ liệu; còn review pending thì không Publish.
- [x] Nêu rõ Publish lặp lại trả cùng thời gian; endpoint này không phải danh sách nên không cần pagination.
- [x] Bổ sung cách xử lý khi contract thay đổi; giữ nguyên các yêu cầu hành vi đã được brief và starter xác định.

### T3.2. Siết tests trong commit riêng

- [x] Bỏ `try/catch` đang nuốt assertion ở test pending.
- [x] Kiểm tra error body và content type, không chỉ HTTP status.
- [x] Kiểm tra không token và token không hợp lệ.
- [x] Kiểm tra lab không tồn tại.
- [x] Kiểm tra sinh viên cùng lớp bị 403 và dữ liệu không đổi.
- [x] Kiểm tra TA lớp khác bị 404, body như lab không tồn tại và dữ liệu không đổi.
- [x] Kiểm tra pending trả 409, đúng số pending và dữ liệu không đổi.
- [x] Kiểm tra TA đúng lớp/admin được Publish khi đủ điều kiện.
- [x] Kiểm tra idempotency: gọi lặp lại không đổi `publishedAt`.
- [x] Dùng database mới cho từng test; cập nhật helpers/fixtures khi cần.
- [x] Giữ ít nhất các kiểm tra unit hiện có; bổ sung case còn thiếu nếu cần để kiểm chứng thay đổi backend.
- [x] Commit phần contract/tests riêng, mở hoặc cập nhật PR và lưu CI đỏ do tests bắt lỗi code.

### T3.3. Sửa API trong commit tiếp theo

- [x] Kiểm tra quyền trước khi cập nhật `published_at`.
- [x] Kiểm tra các verdict cần review chưa có quyết định trước khi Publish.
- [x] Trả 409 với số pending khi chưa đủ điều kiện; không cập nhật dữ liệu trong các nhánh bị từ chối.
- [x] Giữ đúng idempotency và response/error shape đã đặc tả.
- [x] Không làm yếu tests hay đổi contract để né lỗi code.
- [x] Chạy checks local, đẩy commit sửa lên cùng PR, lưu CI xanh; nhờ review rồi merge.

### T3.4. Tạo bằng chứng deliberate contract break

- [x] Từ `main` đã có bản đúng, tạo branch riêng, ví dụ `evidence/break-publish-contract`.
- [x] Cố tình bỏ điều kiện chặn Publish khi pending; giữ nguyên tests và contract.
- [x] Mở PR, xác nhận CI đỏ vì contract test bắt vi phạm, không phải lỗi cài đặt hoặc lỗi không liên quan.
- [x] Phối hợp Tú xác nhận PR đỏ bị required check chặn merge; lưu link và ảnh.
- [x] Không merge PR chứa code lỗi. Giữ PR/commit/run làm bằng chứng; có thể đóng PR sau khi đã lưu bằng chứng.
- [x] Cập nhật `AI-LOG.md` và gửi link contract, tests, commit sửa, PR lỗi cho Nam Anh.
- [x] Nếu làm đủ README, nhờ một assistant ở session mới review diff PR phá contract và ghi nhận điều bắt đúng/bắt sai vào AI log.

## 6. Bắt buộc ghi AI-LOG.md khi làm

**Mỗi người cập nhật `AI-LOG.md` trên branch của mình trong quá trình làm, không đợi cuối bài mới nhớ lại.** Tú tạo file từ giai đoạn 1; Nam Anh và Tường lấy file đó từ `main` rồi bổ sung mục mang tên mình. Nam Anh chịu trách nhiệm tổng hợp bản cuối.

Mỗi entry cần có:

```markdown
### YYYY-MM-DD — Tên người — Tên công việc

- Tool/model: công cụ thực tế đã dùng.
- Task: AI được giao phần nào, phạm vi file nào.
- Changed: đầu ra của AI đã được người làm sửa thế nào và vì sao.
- Rejected: đề xuất nào đã bị bác bỏ và vì sao; nếu chưa có thì ghi đúng thực tế.
- Validation: lệnh/check đã chạy, kết quả và giới hạn nếu có.
- Evidence: link hoặc SHA commit, PR, CI run, đường dẫn file liên quan.
```

- Ghi các entry riêng theo tên người/task để dễ hợp nhất khi nhiều branch cùng sửa file.
- Trước khi merge, cập nhật branch với `main`; nếu conflict AI log thì giữ đủ entry của mọi người, không chọn toàn bộ một phía rồi làm mất log phía còn lại.
- Mỗi PR có ghi chú ngắn về việc dùng AI; Nam Anh dùng ghi chú này để đối chiếu bản tổng hợp.
- Không ghi secrets, token thật hoặc thông tin nhạy cảm vào log.
- Không bịa mục Changed / Rejected chỉ để đủ điểm; cần các ví dụ có thật và truy được bằng chứng.

## 7. Quy trình branch và thứ tự tích hợp

Mỗi người dùng bản clone/working directory riêng. Không để ba người cùng đổi branch trên một thư mục đang dùng chung.

| Thứ tự | Người | Branch đề xuất | Điều kiện tích hợp |
| --- | --- | --- | --- |
| 1 | Tú | `chore/pa2-quality-gate` | CI có hiệu lực, đã lưu bằng chứng đỏ bị chặn và commit sửa xanh |
| 2A — song song | Nam Anh | `docs/pa2-harness` | Rules, permissions và hướng dẫn đúng với nền tảng đã chốt |
| 2B — song song | Tường | `feat/publish-contract` | Tests nghiêm ngặt đã có CI đỏ; code sửa sau đó làm CI xanh |
| 3 | Tường | `evidence/break-publish-contract` | Chỉ để chứng minh CI bắt lỗi; không merge code lỗi |
| 4 | Nam Anh | `docs/pa2-submission` | Hồ sơ đã có đủ bằng chứng của cả nhóm |

- PR của Nam Anh và Tường có thể làm/merge độc lập nếu checks đạt; không cần chờ nhau hoàn thiện toàn bộ.
- Sau khi protection bật, mọi thay đổi vào `main` đều đi qua PR.
- Không squash mất lịch sử commit tests đỏ và commit sửa code xanh khi nhóm cần giữ chúng làm bằng chứng; nếu chọn cách merge khác thì phải bảo đảm các commit/run bằng chứng vẫn truy cập được.
- Các link cần bàn giao: repo, PR, SHA commit, CI run, ảnh protection và ảnh merge bị chặn.
- Người khác review PR; phần nào cần sửa file ngoài phạm vi thì báo người đang quản lý file đó.

## 8. Checklist chung trước khi nộp

- [ ] Tú kiểm tra từ clone mới: làm theo README cài đặt và chạy các checks thành công.
- [ ] Tường xác nhận contract khớp tests/code, không còn commit cố tình phá trong nhánh nộp.
- [ ] Nam Anh xác nhận đủ rules, permissions, env example, README, AI log, PA2 và tự chấm.
- [ ] Cả ba kiểm tra repo public, `main` được bảo vệ, checks bắt buộc và bằng chứng truy cập được.
- [ ] Nam Anh hoàn thiện `PA2.md`, bao gồm đường dẫn CI theo tag nộp; cả ba review và merge hồ sơ cuối.
- [ ] Tú tạo và push tag **`pa2`** tại commit cuối được chọn; không tự di chuyển tag sau khi nộp.
- [ ] Tú xác nhận CI thực sự chạy cho tag và xanh; lưu URL run để bàn giao.
- [ ] Cả ba đối chiếu tự chấm theo rubric; mỗi tiêu chí có bằng chứng, ghi rõ phần chưa làm được.
- [ ] Nam Anh tạo ZIP chứa cả `.git` tại trạng thái nộp, tên dạng `<MSSV-tăng-dần>_<tổng-điểm>.zip`.
- [ ] Tú đại diện nộp một bài của nhóm bằng tài khoản `<MSSV>@student.hcmus.edu.vn`, kiểm tra hạn và trạng thái nộp thành công.

## 9. Bảng bàn giao link

Điền bằng chứng thực tế khi có; không đánh dấu hoàn thành trước khi kiểm tra.

| Hạng mục | Người cung cấp | Link/ghi chú |
| --- | --- | --- |
| PR CI đỏ bị chặn merge | Tú | [PR #1](https://github.com/AWAD-26-27/awad-leetkob/pull/1), [run đỏ 42751983807](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42751983807), [ảnh merge bị chặn](evidence/ci-workflow-gate-failed.png) |
| Commit sửa thành xanh và CI run | Tú | [09d9539](https://github.com/AWAD-26-27/awad-leetkob/commit/09d95396a1a61505030661d2088c9d59181747cd), [run xanh 42755020550](https://github.com/AWAD-26-27/awad-leetkob/actions/runs/42755020550), [ảnh PR xanh](evidence/ci-workflow-gate-succeed.png) |
| Cấu hình bảo vệ main/ảnh | Tú | [Ruleset 26915632](https://github.com/AWAD-26-27/awad-leetkob/rules/26915632), [ảnh ruleset](evidence/main-ruleset.png), [ảnh checks required](evidence/ci-gate-e2e-main-ruleset.png) |
| Rules, permissions và kiểm tra secrets | Nam Anh | [AGENTS.md](AGENTS.md), [permissions](docs/permissions.md), [scan log](AI-LOG.md#nam-anh-harness); [Gemini free tier, không billing, cap trả phí 0 USD](docs/model-budget.md) |
| Contract và contract tests | Tường | [docs/contract/publish.md](docs/contract/publish.md), [publish.contract.test.js](test/contract/publish.contract.test.js), [PR #4](https://github.com/AWAD-26-27/awad-leetkob/pull/4), [PR #7](https://github.com/AWAD-26-27/awad-leetkob/pull/7) |
| Commit tests đỏ và commit sửa API xanh | Tường | Tests đỏ [fc92efe](https://github.com/AWAD-26-27/awad-leetkob/commit/fc92efe5dcfcd203541581a3ac9aa08b247f6f37), Sửa xanh [f274493](https://github.com/AWAD-26-27/awad-leetkob/commit/f27449353d33510b8d32f156f73141764ae610db) |
| PR cố tình phá contract, CI đỏ và merge bị chặn | Tường + Tú | [PR #5](https://github.com/AWAD-26-27/awad-leetkob/pull/5), commit [cc6df3a](https://github.com/AWAD-26-27/awad-leetkob/commit/cc6df3a10fdfb5079162fdac2e5274c0ad212159), [ảnh PR bị chặn](evidence/deliberate-contract-break-blocked.png) |
| AI-LOG.md đủ nội dung của ba người | Cả ba; Nam Anh tổng hợp | [AI-LOG.md](AI-LOG.md) (đầy đủ các entry của Tú, Nam Anh, Tường) |
| Tag pa2 và CI run cho tag | Tú | Chờ Tú tạo tag sau khi merge PR hồ sơ cuối: [Actions filtered to pa2](https://github.com/AWAD-26-27/awad-leetkob/actions?query=branch%3Apa2) |
| PA2.md, tự chấm, ZIP và xác nhận nộp | Nam Anh + Tú | [PA2.md](PA2.md), [SELF_ASSESSMENT_REPORT.md](SELF_ASSESSMENT_REPORT.md) (100/100), [final-verification.md](evidence/final-verification.md); ZIP/nộp chờ tag |
