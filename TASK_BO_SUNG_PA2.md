# Task bổ sung PA#2 — Tường và Nam Anh

Đối chiếu ngày 10/11/2026, trên `main` tại `5aea2cb`. File này mô tả công việc cần bổ sung và điều kiện chấp nhận; checkbox chưa đánh dấu là việc chưa được nghiệm thu, không phải kết luận người phụ trách chưa thực hiện bất kỳ phần nào.

Nguồn yêu cầu: rubric PA#2 trong thư mục tài liệu của nhóm. Rubric là căn cứ chấm; các đề xuất triển khai dưới đây giúp đáp ứng rubric, không phải tiêu chí chấm mới. Không có cam kết đạt 100/100 trước khi giảng viên chấm.

## 1. Phạm vi và phần đã hoàn thành

| Người | Phần đã có, cần giữ lại | Phần cần bổ sung |
| --- | --- | --- |
| Tường | Tests nghiêm ngặt `fc92efe`, API sửa `f274493`, PR #4 đã tích hợp, PR #5 cố tình phá pending guard và ảnh check Required đỏ | Contract đủ field rules/change policy/error model; tests khớp contract bổ sung; link CI cụ thể và AI log bàn giao |
| Nam Anh | AGENTS.md, permissions, env example/ignore, tài liệu budget và scan, README, AI log, PA2.md và tự chấm | Đồng bộ trạng thái mới; xác minh bản tích hợp cuối; tự chấm có căn cứ; hoàn thiện danh tính và ZIP sau tag của Tú |

Các đường dẫn tính từ root repo. Không làm lại tính năng đã đúng chỉ để tạo thêm commit. Không triển khai toàn bộ sandbox/LLM pipeline của PA#3 trong đợt bổ sung này.

## 2. Thứ tự và phân chia file

1. Tường tạo branch từ main mới nhất, chốt contract và gửi Nam Anh các thay đổi về field/error/hành vi. Nam Anh đồng thời sửa phần tài liệu hiện đã lỗi thời và chuẩn bị hồ sơ.
2. Tường hoàn thiện tests/code nếu cần, đưa PR qua review và CI. Contract/test hardening và implementation fix nằm ở các commit riêng.
3. Sau khi phần Tường merge, Nam Anh cập nhật số tests, link bằng chứng, chạy xác minh và scan trên bản tích hợp cuối rồi hoàn thiện PR hồ sơ.
4. Tú xác nhận commit nộp, tạo/push tag pa2 và kiểm tra CI. Nam Anh đóng ZIP sau khi tag đúng và checks đạt.

| Người chính | File/thư mục được sửa trong đợt này |
| --- | --- |
| Tường | `docs/contract/publish.md`, `test/contract/publish.contract.test.js`, `test/helpers.js`; `src/app.js`/backend liên quan nếu phát hiện lệch contract; evidence của contract |
| Nam Anh | `README.md`, `PA2.md`, `SELF_ASSESSMENT_REPORT.md`, `PHAN_CONG_PA2.md`, `evidence/secrets-scan-*.md`; tài liệu harness/budget nếu cần sửa thông tin |
| Cả hai ghi, Nam Anh tổng hợp | `AI-LOG.md` |
| Tú | Workflow/required checks, xác nhận bằng chứng gate, tag nộp và CI cho tag |

Mỗi người dùng branch/working directory riêng. Nếu cùng sửa AI log, giữ đủ entry của nhau khi giải quyết conflict. Không push trực tiếp vào main, không force-push lịch sử bằng chứng, không merge PR cố tình phá contract.

## 3. Tường — contract, tests và evidence

### T3-BS01 — Hoàn thiện hợp đồng Publish

**Căn cứ rubric:** tiêu chí 5, 25 điểm: role/ownership; request/response shape kèm field rules; mọi lỗi là Problem Details và có type/status; idempotency khi Publish; cách xử lý khi contract thay đổi; cùng các section như CONTRACT.md IA#3. Người ngoài phải viết client từ tài liệu này được.

**File:** `docs/contract/publish.md`.

**Việc cần làm:**

- [ ] Lấy template CONTRACT.md IA#3 từ tài liệu môn học; đối chiếu các section. Nếu chưa lấy được, ghi đúng là chưa đối chiếu, không tự nhận đã đủ section.
- [ ] Giữ đúng caller matrix: TA đúng lớp/admin được xét Publish; sinh viên cùng lớp 403; người ngoài lớp 404 giống lab không tồn tại; token thiếu/sai 401.
- [ ] Mô tả xác thực qua `Authorization: Bearer <token>`; token demo không phải cơ chế production.
- [ ] Ghi quy tắc `labId`: kiểu/biểu diễn được hỗ trợ, giới hạn nếu có, kết quả khi ID không hợp lệ hoặc không tồn tại. Đối chiếu code trước khi ghi; không tự tuyên bố trả 400 khi implementation chưa có nhánh đó.
- [ ] Ghi request không có body; nêu hành vi nếu client gửi body theo quyết định và implementation thực tế.
- [ ] Đặc tả response 200 bằng bảng field: tên, kiểu, required, ý nghĩa và ràng buộc. `lab` phải liên hệ rõ với lab được Publish; `publishedAt` phải có định dạng, múi giờ và quy tắc nullability rõ ràng.
- [ ] Mô tả thứ tự quyết định: xác thực/ownership trước ghi dữ liệu; hành vi khi lab đã Publish; pending guard trước lần Publish đầu; response thành công.
- [ ] Giữ invariant: 4xx không thay đổi trạng thái; Publish lặp lại giữ thời gian ban đầu. Làm rõ quan hệ giữa retry của lab đã Publish và kiểm tra pending, khớp code.
- [ ] Bổ sung bảng field lỗi: `type`, `title`, `status`, tính bắt buộc/kiểu và quy tắc tương ứng HTTP status; `pending` là số lượng gì, có ở lỗi nào, giá trị hợp lệ nào.
- [ ] Liệt kê đầy đủ lỗi hiện được implementation trả: 401/403/404/409 và 500 `https://leetkob.example/problems/internal`. Phân biệt lỗi server ngoài dự kiến với lỗi điều kiện nghiệp vụ; không khẳng định 500 luôn rollback nếu chưa có đảm bảo đó.
- [ ] Thêm chính sách thay đổi contract: thay đổi tương thích, thay đổi phá tương thích, thông báo/version hoặc cách chuyển đổi nhóm chọn, và việc cập nhật docs/tests/implementation cùng nhau.

**Đầu ra phải bàn giao:**

1. Contract hoàn chỉnh tại đúng đường dẫn, có bảng field và bảng error type/status; giữ nguyên các ràng buộc sản phẩm đã được brief xác định.
2. Ghi chú ngắn trong PR hoặc AI log: nguồn template IA#3 và kết quả đối chiếu section.
3. Danh sách những chỗ cần bổ sung tests/code do contract được làm rõ.

**Điều kiện chấp nhận:**

- [ ] Người review chỉ đọc contract có thể dựng request, xử lý response/error, kiểm tra quyền và retry đúng mà không mở src/app.js.
- [ ] Các field/rule mô tả được đối chiếu với code; không có yêu cầu mới chỉ tồn tại trên giấy.
- [ ] Có section xử lý thay đổi; có bằng chứng đối chiếu IA#3 hoặc ghi rõ phần còn chưa hoàn thành.
- [ ] Không thêm pagination cho endpoint Publish vì đây không phải endpoint danh sách.

### T3-BS02 — Đồng bộ contract tests với phần đặc tả bổ sung

**Căn cứ rubric:** tiêu chí 6, 15 điểm: kiểm tra từng error type, ownership, idempotency; chạy trong required CI và chứng minh bắt được contract break. Các case tăng độ chặt dưới đây kiểm chứng cam kết hiện có, không phải yêu cầu viết lại mọi tests.

**File:** `test/contract/publish.contract.test.js`, helpers/fixtures nếu cần; sửa backend chỉ khi test phát hiện sai contract.

**Việc cần làm:**

- [ ] Giữ các test đang có cho token thiếu/sai, lab không tồn tại, sinh viên 403, TA khác lớp 404, pending 409, TA/admin thành công và idempotency.
- [ ] assertProblem kiểm tra các field bắt buộc mà contract cam kết, gồm `title` là chuỗi có nội dung; không chỉ status/type. Chỉ khóa nguyên văn title nếu contract thực sự coi nội dung đó là cam kết ổn định.
- [ ] So sánh body 404 của TA ngoài lớp với body 404 lab không tồn tại, đúng cam kết không tiết lộ dữ liệu.
- [ ] Kiểm tra response thành công theo field rules vừa bổ sung, gồm lab, timestamp và giá trị database; không chỉ `assert.ok(timestamp)`.
- [ ] Có kiểm tra cho error type bổ sung, gồm 500 nếu được liệt kê trong contract. Dùng lỗi giả lập/fixture được kiểm soát trong test; không thêm endpoint public gây lỗi hoặc reset dữ liệu chỉ để phục vụ test.
- [ ] Kiểm tra các nhánh quan trọng vừa làm rõ trong contract như ID không hợp lệ hoặc retry nếu chúng có cam kết hành vi cụ thể.
- [ ] Không nuốt assertion, không bỏ/giảm assertion cũ để xanh. Test hardening và implementation fix phải tách commit khi có sửa code.
- [ ] Chạy `npm run check` và E2E; kiểm tra required jobs trên PR. Nếu công cụ bị chặn mở cổng, ghi giới hạn và đối chiếu CI thực tế, không tự ghi local pass.

**Đầu ra phải bàn giao:** tests/fixtures đã cập nhật, commit tests riêng, commit code sửa riêng nếu có, link PR và CI xanh trên đúng head commit.

**Điều kiện chấp nhận:**

- [ ] Các error type và field cam kết được test có ý nghĩa; ownership kiểm tra cả response và trạng thái dữ liệu.
- [ ] Tests không gọi model thật và không phụ thuộc credential local.
- [ ] Required gates và E2E đạt trên phiên bản cuối; số tests trong hồ sơ khớp log thực tế, không cố định 9 nếu đã thêm case.
- [ ] Trường hợp test đỏ do lỗi implementation được lưu bằng chứng và sửa code, không làm yếu test.

### T3-BS03 — Bàn giao đầy đủ deliberate-break evidence

**Căn cứ rubric:** một commit/PR cố tình vi phạm contract và bị CI bắt. Hiện đã có PR #5, commit cc6df3a và ảnh; không bắt buộc tạo PR phá lần nữa nếu bằng chứng hiện có kiểm chứng được.

**Việc cần làm:**

- [ ] Lấy URL run và URL job gates thất bại của PR #5 từ GitHub.
- [ ] Đọc log để xác nhận lỗi là pending guard trả 200 thay vì 409, không phải lint/setup hoặc lỗi khác.
- [ ] Đối chiếu ảnh `evidence/deliberate-contract-break-blocked.png` với commit/run: required check đỏ, merge bị chặn.
- [ ] Xác nhận commit phá chỉ sửa implementation, giữ tests/contract; không nằm trong nhánh main hoặc commit nộp.
- [ ] Xác nhận PR #5 đã đóng mà không merge; ghi trạng thái cùng thời điểm kiểm tra. Nếu chưa truy cập được GitHub thì ghi chưa xác minh live.

**Đầu ra phải bàn giao:** một bảng evidence trong AI log gồm PR #4, commit tests đỏ, commit sửa code xanh, run xanh, PR #5, commit phá, run/job đỏ và ảnh bị chặn.

**Điều kiện chấp nhận:** reviewer mở các link xác định được nguyên nhân đỏ và thấy code phá không được nộp; log không gán run PR #1 cho PR #5. Xem lại toàn bộ pipeline LLM không thuộc điều kiện nghiệm thu task này.

### T3-BS04 — AI log và thông báo bàn giao

- [ ] Thêm entry cho đợt bổ sung: tool/model thực tế, task, Changed, Rejected thực tế, commands/kết quả, giới hạn và link commit/PR/CI.
- [ ] Giữ entry cũ làm lịch sử; bổ sung trạng thái mới thay vì sửa lịch sử thành đã làm từ trước.
- [ ] Gửi Nam Anh: đường dẫn contract, số tests thực tế, run xanh mới nhất và bảng evidence T3-BS03.

**Điều kiện chấp nhận:** Nam Anh có thể cập nhật hồ sơ từ thông tin bàn giao mà không phải đoán trạng thái tests hoặc tìm lại CI của Tường. Không cần ghi đề xuất bị người dùng bác bỏ nếu điều đó không xảy ra; phân biệt quyết định của assistant với quyết định của thành viên.

## 4. Nam Anh — đồng bộ hồ sơ và xác minh trước nộp

### T1-BS01 — README và checklist phản ánh bản hiện tại

**Căn cứ rubric:** tiêu chí 3 yêu cầu clone mới làm theo README chạy được; tiêu chí 7 yêu cầu log thực tế. Đồng bộ checklist là việc hỗ trợ review, không phải tiêu chí điểm riêng.

**File:** `README.md`, `PHAN_CONG_PA2.md`; kiểm tra liên kết tới contract và hồ sơ.

**Việc cần làm:**

- [ ] Sửa đoạn Known baseline limitation hiện mô tả code lỗi ở main 55a5c30: ghi rõ là sự cố lịch sử đã sửa trong PR #4, hoặc chuyển phần lịch sử sang AI log.
- [ ] README mô tả code hiện tại: kiểm tra quyền trước ghi, chặn pending và idempotency. Không nói còn chờ Tường khi PR đã merge.
- [ ] Cập nhật phần Submission: phản ánh các task còn chờ thực tế; không gọi bản đã tích hợp là unfinished baseline nếu không còn đúng.
- [ ] Giữ lệnh local/CI khớp package.json/workflow; giữ thông tin JavaScript chưa có type checker, không gọi ESLint là type check.
- [ ] Cập nhật checklist phân công và bảng bàn giao theo bằng chứng. Task không áp dụng như rotate key khi chưa có leak phải ghi N/A kèm lý do, không bịa một sự cố để đánh dấu xong.
- [ ] Số tests và link trạng thái phải lấy sau bàn giao cuối của Tường.

**Đầu ra:** README hướng dẫn được bản hiện tại; checklist có trạng thái done/pending/N/A rõ; mọi link file tồn tại và dùng đường dẫn trong repo.

**Điều kiện chấp nhận:** không còn câu hiện tại mâu thuẫn giữa README, contract, code, PA2.md và checklist; lịch sử được phân biệt với trạng thái hiện tại.

### T1-BS02 — Tổng hợp AI log và PA2.md

**Căn cứ rubric:** tiêu chí 7, 5 điểm, và danh mục link bắt buộc trong PA2.md.

**Việc cần làm:**

- [ ] Giữ đủ entry của Tú, Nam Anh và Tường; bổ sung mục tổng kết integration, không xóa incident cũ có vai trò làm nguồn rules.
- [ ] Sửa nhãn hai run 42751983807/42755020550 theo metadata evidence hiện có: event pull_request, head eba0b2a/09d9539 của PR #1. Mục Tú trước đây ghi “lần chạy lại” cần được chú thích/cập nhật theo snapshot, không tiếp tục mô tả là push run nếu không có bằng chứng.
- [ ] PA2.md có repo public; protection/settings và ảnh; PR đỏ bị chặn; PR xanh và commit sửa; deliberate-break PR/run/ảnh; đường dẫn tag/CI cho tag.
- [ ] Bổ sung URL run/job PR #5 do Tường bàn giao. Kiểm tra các link run đúng commit và đúng PR; nếu không truy cập được thì ghi chưa xác minh.
- [ ] Thêm commit/run mới của phần bổ sung nếu cần; không dùng ảnh cũ để khẳng định phiên bản mới đã qua checks.
- [ ] Chuẩn bị link Actions theo tag pa2 trước khi tag được tạo; sau khi Tú push, xác nhận URL trỏ đúng run/SHA. Tránh sửa rồi di chuyển tag chỉ để chèn run URL.
- [ ] Các ảnh evidence nằm trong repo, link tương đối hoạt động; snapshot ruleset là bằng chứng tại thời điểm ghi, không phải đảm bảo mọi trạng thái tương lai.

**Đầu ra:** AI log đủ ba thành viên và cập nhật trạng thái cuối; PA2.md là trang chỉ dẫn đủ bằng chứng nộp bài.

**Điều kiện chấp nhận:** reviewer tìm được mọi mục bắt buộc từ PA2.md; không có nhãn “đã verify” cho điều chưa quan sát; Changed/Rejected có nội dung cụ thể, ghi đúng người/công cụ thực hiện.

### T1-BS03 — Rà lại tự chấm và danh tính nộp bài

**Căn cứ rubric:** đủ bảy dòng tiêu chí, điểm tự nhận, bằng chứng và phần chưa làm được; tổng khớp tên ZIP. Rubric có honesty adjustment, không ai biết trước điểm giảng viên.

**File:** `SELF_ASSESSMENT_REPORT.md`, danh tính trong `PA2.md` nếu cần.

**Việc cần làm:**

- [ ] Đối chiếu template tự chấm trên Classroom và giữ đủ các mục cần thiết.
- [ ] Mỗi tiêu chí có điểm tự nhận không vượt mức tối đa và bằng chứng truy được tới file/commit/PR/run.
- [ ] Rà lại tiêu chí contract sau khi Tường hoàn thiện; không tự nhận 25/25 chỉ vì code/tests đã sửa.
- [ ] Bỏ “calibrated ±0 honesty gap” và các câu khẳng định biết điểm thực tế trước khi giảng viên chấm.
- [ ] Sửa “All requirements of PA#2 rubric and project brief are met” nếu chưa có đủ căn cứ. Project brief còn các checkpoint sau PA#2; không tự nhận hoàn thành cả sản phẩm cuối kỳ.
- [ ] Phần chưa làm được nêu giới hạn thực tế, phân biệt việc bắt buộc còn chờ với phạm vi PA#3 trở đi. Nếu giữ 100 là điểm tự nhận, phải có lý do/bằng chứng cho từng dòng, không mô tả là điểm được đảm bảo.
- [ ] Xác nhận đầy đủ MSSV/họ tên ba người từ thành viên, không suy đoán danh tính nộp bài chỉ từ Git author/email. Sắp MSSV tăng dần để đặt tên ZIP.
- [ ] Tổng số học trong bảng khớp điểm trong tên ZIP, README/PA2 nếu các file có ghi tổng.

**Đầu ra:** báo cáo tự chấm đã rà soát đủ bảy tiêu chí; danh tính ba người; tên ZIP dự kiến từ tổng thực tế.

**Điều kiện chấp nhận:** không có lời khẳng định hoàn thành thiếu bằng chứng; điểm là tự chấm của nhóm, không phải dự báo chắc chắn điểm giảng viên; không còn placeholder trong danh tính/tên ZIP lúc nộp.

### T1-BS04 — Xác minh bản tích hợp cuối và secrets

**Căn cứ rubric:** clone mới chạy được checks và không có secrets trong lịch sử Git. Lần scan/clone trước tích hợp Tường cần được lặp lại trên bản nộp.

**File đầu ra đề xuất:** `evidence/final-verification.md`, cập nhật báo cáo secrets scan và AI log.

**Việc cần làm:**

- [ ] Sau PR bổ sung của Tường merge, dùng clean clone ở commit main cần nộp; ghi SHA, phiên bản Node/npm và môi trường.
- [ ] Làm theo README: `npm ci`, `npm run check`, cài Chromium rồi `npm run e2e`. Ghi exit code và số tests thực tế.
- [ ] Xác nhận không cần model key/.env để chạy demo/tests/CI; không chạy manual model-smoke trong quy trình xác minh này.
- [ ] Fetch các refs cần quét rồi scan history bằng Gitleaks với redaction. Ghi phạm vi, SHA, version, lệnh, exit code và kết quả; không in giá trị secrets.
- [ ] Scan đúng nội dung sẽ nộp. Nếu máy có .env local, tách snapshot nội dung Git khỏi credential bị ignore; không thêm allowlist chỉ để che finding.
- [ ] Xác nhận env example không có giá trị thật, .env không tracked và không lọt vào ZIP; kiểm tra cả tên file lẫn nội dung báo cáo.
- [ ] Nếu có credential thật trong lịch sử, ghi vị trí đã redacted và xử lý rotation theo quyền được cấp; không tự sửa lịch sử public hoặc khẳng định xóa file hiện tại là đủ.
- [ ] Ghi giới hạn nếu môi trường không chạy được test/scan. Dùng kết quả CI thực tế để bổ sung phần kiểm chứng, không đổi code/tests để giả xanh.

**Đầu ra:** báo cáo verification và scan redacted gắn với SHA gần bản nộp nhất; URL CI cùng SHA khi có.

**Điều kiện chấp nhận:** người review thấy rõ đã kiểm tra phiên bản nào và kiểm tra được gì. Không dùng báo cáo scan baseline 431f57f làm bằng chứng duy nhất cho mọi commit tích hợp sau đó.

### T1-BS05 — Chốt hồ sơ và ZIP sau khi Tú tạo tag

**Căn cứ rubric:** tag pa2 được push; repo public; ZIP chứa .git, SELF_ASSESSMENT_REPORT.md và tên đúng MSSV/tổng điểm; một thành viên nộp bằng tài khoản sinh viên.

**Phụ thuộc:** Tú xác nhận commit nộp, tạo/push pa2 và gửi CI run có gates/e2e xanh trên đúng tag. Nam Anh không tự tạo/move tag thay Tú trong phạm vi task này.

- [ ] Mọi thay đổi cần nằm trong bản nộp đã được review/merge trước khi Tú tạo tag.
- [ ] Nhận SHA tag và CI run từ Tú; xác nhận khớp bản được chọn, đúng event/ref và hai required jobs đạt.
- [ ] Đóng ZIP từ bản tag, gồm .git và các file tracked cần thiết. `git archive` đơn thuần không đáp ứng yêu cầu có .git.
- [ ] Loại .env/credential local, node_modules, test outputs và dữ liệu riêng tư khỏi ZIP; giữ evidence, contract, tests, AI log và tự chấm.
- [ ] Đặt tên `<MSSV1>-<MSSV2>-<MSSV3>_<total>.zip`, MSSV tăng dần, total khớp báo cáo thực tế.
- [ ] Giải nén thử ở thư mục sạch; xác nhận .git có tag pa2, checkout đúng SHA và các tài liệu bắt buộc tồn tại. Giữ .git đủ để checkout, không chỉ copy một thư mục .git rỗng.
- [ ] Gửi Tú ZIP, tên file, SHA tag, CI run và kết quả kiểm tra giải nén. Tú đại diện nộp theo phân công và xác nhận nộp thành công trước hạn.

**Điều kiện chấp nhận:** ZIP chứa chính xác phiên bản được tag, không có secrets/dependencies, có .git sử dụng được, đủ hồ sơ; không ghi đã nộp khi chỉ mới tạo ZIP.

## 5. Mẫu bàn giao cuối của từng người

Mỗi người thêm một entry AI log và gửi bản bàn giao theo mẫu:

```markdown
Người phụ trách:
Tasks hoàn thành:
Tasks chưa hoàn thành / N/A và lý do:
Branch / PR:
Commit cuối:
File thay đổi:
Kiểm tra local: lệnh, exit code, số tests, môi trường:
CI run / job URL và SHA được kiểm tra:
Evidence trong repo:
Changed / Rejected thực tế:
Giới hạn hoặc điều chưa xác minh:
Phần chờ người khác:
```

## 6. Điều kiện sẵn sàng để Tú tag

- [ ] Tường bàn giao contract đầy đủ, tests/code khớp và bằng chứng PR #5 truy được.
- [ ] Nam Anh đồng bộ README, AI log, PA2, tự chấm và danh tính cả nhóm.
- [ ] Required checks trên PR cuối/main đạt; bản kiểm tra sạch và scan mới được ghi nhận.
- [ ] Những việc chưa hoàn thành được ghi đúng trong tự chấm, không tự nhận toàn bộ đạt chỉ vì CI xanh.
- [ ] Cả nhóm chốt SHA nộp. Sau đó Tú tạo tag/verify CI, Nam Anh đóng ZIP và Tú nộp.

File này chỉ giao việc bổ sung; không đánh dấu các task đã hoàn thành khi chưa có đầu ra và bằng chứng tương ứng.
