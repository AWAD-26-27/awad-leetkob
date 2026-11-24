# Điểm nối tích hợp LeeTKOB PA3

Contract v1 này áp dụng cho luồng PA3 từ lúc TA tạo lab đến khi verdict xuất hiện trong hàng đợi review. Luồng 1 phụ trách API, auth và UI. Luồng 2 phụ trách Azure VM, worker, sandbox và CI Docker. Luồng 3 phụ trách checker và eval. Luồng 2 có thể dựng VM và HTTPS song song với phần ứng dụng.

## 1. API và worker dùng chung SQLite

Luồng 1 sở hữu schema và khởi tạo DB. Luồng 2 dùng chung bộ mở DB với API. Mỗi kết nối bật `foreign_keys=ON`, `busy_timeout=5000` và dùng DB ở chế độ WAL. IDs nội bộ là số nguyên dương. Timestamps lưu theo UTC. `users.class_id` bắt buộc cho TA và student, còn admin dùng `NULL`. Tạo mới DB PA3 bằng schema này.

| Bảng | Cột dùng tại điểm nối |
| --- | --- |
| `classes` | `id, name` |
| `users` | `id, username, password_hash, role, class_id` |
| `labs` | `id, class_id, title, statement_md, created_by, published_at, model_calls_reserved`. Counter mặc định `0`. |
| `test_cases` | `id, lab_id, ordinal, input_text, expected_output`. `UNIQUE(lab_id, ordinal)`. |
| `constraints` | `id, lab_id, code, text, deduction`. `UNIQUE(lab_id, code)`. `code` có dạng `C1`, `C2`. |
| `submissions` | `id, lab_id, student_id, source_code, status, judge_verdict, judge_detail, created_at, judged_at` |
| `jobs` | `id, submission_id, status, attempts, locked_at, finished_at, error`. `UNIQUE(submission_id)`. |
| `constraint_verdicts` | `id, submission_id, constraint_id, verdict, evidence_json, source, review_status, reviewed_by, reviewed_at`. `UNIQUE(submission_id, constraint_id)`. |
| `llm_call_logs` | `id, submission_id, constraint_id, attempt, provider_request_id, model, status, prompt_tokens, completion_tokens, latency_ms, cost_usd, created_at` |

- **Tạo bài nộp.** API ghi một `submission` và một `job` trong cùng transaction. Cả hai ở trạng thái `queued` khi API trả `202`. Worker đọc test theo `ordinal`. Nội dung đề, tests và constraints của lab đã nhận submission được cố định trong PA3.
- **Nhận việc.** Worker claim job `queued` hoặc `processing` đã hết hạn trong transaction SQLite ngắn, tăng `attempts`, đặt `locked_at` và chuyển submission sang `judging`. Dùng `locked_at` như thời điểm gia hạn gần nhất. Mặc định gia hạn mỗi 15 giây, hết hạn sau 60 giây. Commit claim trước khi chạy sandbox hoặc gọi model.
- **Công bố kết quả chấm.** Worker compile và chạy test trong sandbox. `judge_verdict` là `Accepted | WA | TLE | MLE | CE | RE | OLE | SystemError`. Bài `Accepted` có đúng một verdict cho mỗi constraint. Bài có kết quả khác có 0 verdict. Trong transaction cuối, worker kiểm tra job vẫn là `processing` và `attempts` vẫn bằng lần claim của mình, rồi ghi toàn bộ kết quả, chuyển job sang `done` và submission sang `judged`. Kết quả TA đã review được bảo toàn. Worker cũ mất quyền ghi sau khi job được claim lại.
- **Lỗi.** Worker thử lại lỗi hạ tầng của job, tối đa 3 lần claim. Nếu lần cuối lỗi hoặc hết hạn, chốt job `failed` và submission `judged` với `SystemError`, 0 verdict, trong cùng transaction. `judge_verdict` và `judged_at` là `NULL` trước trạng thái cuối. Timeout hoặc output lỗi của model là verdict `unsure` cho constraint tương ứng, nên worker vẫn có thể hoàn tất job.

## 2. Worker và CLI gọi chung checker

Luồng 3 export `async evaluateSubmission({ statement, constraints, code, options })` từ `src/checker/index.js`. `constraints` là mảng `{ id, text }` với `id` là mã theo lab như `C1`. Worker đổi mã này sang khóa DB `constraints.id` khi ghi kết quả. `code` là source gốc để kiểm chứng evidence. Worker và CLI nhận `{ verdicts, callLogs }`.

| Trường | Quy ước |
| --- | --- |
| `verdicts[]` | `{ constraint, verdict, evidence, source }`. Mỗi mã đầu vào xuất hiện đúng một lần theo thứ tự đầu vào. |
| `verdict` | `pass`, `violation` hoặc `unsure`. |
| `evidence[]` | `{ line, text }`. `line` bắt đầu từ 1. `text` khớp nguyên văn dòng gốc, giữ khoảng trắng và bỏ ký tự xuống dòng. `violation` cần ít nhất một dòng evidence. Khi fallback, trả `evidence: []`. |
| `source` | `hard_rule`, `model`, `model_off` hoặc `guardrail_fallback`. |
| `callLogs[]` | `{ constraint, providerRequestId, model, status, prompt, promptTokens, completionTokens, latencyMs, costUsd }` cho mỗi lần gửi request. `status` là `ok`, `timeout` hoặc `error`. Metadata provider thiếu được ghi `null`. |

- Xử lý constraint ban-list bằng phân tích cú pháp trước. Model chỉ nhận đề bài, nội dung constraint semantic cần xử lý và code đã bỏ comment và định danh sinh viên, giữ số dòng gốc. Kiểm schema và đối chiếu từng dòng evidence với source gốc. Timeout, lỗi provider, hết hạn mức gọi, JSON sai schema hoặc evidence sai đều trả `unsure` với nguồn `guardrail_fallback`. Mức trừ điểm nằm ở bảng `constraints` và được API đọc trực tiếp cho TA.
- Options hỗ trợ `timeoutMs` mặc định `20000`, `modelClient` cho fake offline, `modelOff`, `reserveModelCall({ constraintId })` và `capturePrompt` mặc định `false`. Khi `MODEL_OFF=1` hoặc `modelOff: true`, trả `unsure` với nguồn `model_off` cho semantic, `callLogs: []`, và bỏ qua khởi tạo client, đặt chỗ quota và mọi kết nối provider.
- Worker truyền `reserveModelCall` để tăng `labs.model_calls_reserved` có điều kiện trong transaction trước mỗi lần gửi. Chỉ gửi khi lần claim còn hiệu lực và còn hạn mức. Lượt đã đặt chỗ được tính vào ngân sách kể cả khi timeout hay worker bị dừng. Deployment chỉ lưu metadata vận hành. CLI có thể bật `capturePrompt` cho dev set công khai đã được phép dùng để ghi prompt đã được làm sạch vào bằng chứng. Bản chạy thật ghi request ID do provider trả và giữ giá trị thiếu ở dạng `null`.
- Lệnh CLI là `node src/checker/cli.js <dataset_dir> <predictions.jsonl>`. CLI đọc layout của dev set, dùng statement, constraints và các file C++ làm đầu vào. Mỗi dòng JSONL chỉ gồm `{ solution, constraint, verdict, evidence }`. CLI và `checker.Dockerfile` hỗ trợ `MODEL_OFF=1` khi chạy container với mạng bị tắt.

## 3. Cấu hình Azure VM và ranh giới secrets

| Biến | Bên đọc | Giá trị triển khai |
| --- | --- | --- |
| `HOST`, `PORT` | Web | `127.0.0.1`, `3007`. Caddy chuyển tiếp HTTPS đến địa chỉ này. |
| `DB_PATH` | Web và worker | Cùng đường dẫn tuyệt đối trên VM, ví dụ `/var/lib/leetkob/leetkob.db`. Khi chạy local, mặc định `./data/leetkob.db`. |
| `SANDBOX_IMAGE` | Worker | Mặc định `leetkob-cpp-sandbox:latest`. |
| `MODEL_OFF` | Worker và CLI | `1` cho chế độ offline. Demo có model thật dùng cấu hình provider đã xác minh. |
| `GEMINI_API_KEY`, `GEMINI_MODEL` | Worker và CLI chạy thật | Chỉ nạp vào tiến trình cần gọi provider. Chốt model cho deployment sau lần inference thành công có request ID. |
| `GEMINI_BILLING_TIER` | Checker khi chạy với Gemini | Dùng `free` cho project đã xác nhận Free Tier để ghi `costUsd: 0` theo bảng giá. Để trống khi chưa biết tier. Giới hạn chi phí ở cài đặt billing của provider. |
| `MAX_MODEL_CALLS_PER_LAB` | Worker ở chế độ có model | Số nguyên dương. Chốt giá trị deploy từ quota và lượt gọi đo được. Cấu hình thiếu hoặc lỗi làm phần semantic trả `unsure` trước khi gửi request. |

Chạy web và worker thành hai service riêng trên VM. Container compile/run C++ là ranh giới riêng với tiến trình worker, chỉ nhận source và dữ liệu test cần thiết. Container chạy non-root, cách ly mạng, giới hạn tài nguyên và chạy với môi trường sạch, không có secrets, host mounts hay Docker socket. Hạn mức theo lab của ứng dụng, trạng thái billing provider và cảnh báo chi phí Azure được xác nhận riêng.

## 4. HTTP, tài khoản và hàng đợi TA

API dùng JSON, IDs số nguyên dương và `Authorization: Bearer <token>`. Lỗi theo [Problem Details của Publish](publish.md#2-error-model-rfc-9457-problem-details). Thiếu hoặc sai token trả `401`. TA ngoài lớp nhận cùng `404 not-found` như lab hoặc queue không tồn tại. Student khác lớp hoặc không sở hữu bài nộp cũng nhận `404`. Student trong lớp gọi endpoint chỉ dành cho staff nhận `403`.

| Thao tác | Request và kết quả |
| --- | --- |
| Đăng nhập | `POST /api/login` nhận `{ username, password }`. `200` trả `{ token, user: { id, username, role, classId } }`. Sai thông tin trả `401` với cùng nội dung cho mọi trường hợp. |
| Tạo lab | `POST /api/labs` nhận `{ title, statement, testCases: [{ input, expectedOutput }], constraints: [{ code, text, deduction }] }`. TA tạo trong lớp của mình. `201` trả `{ id, classId, title }`. |
| Chọn hoặc đọc lab | `GET /api/labs` trả `{ items: [{ id, classId, title }] }` theo quyền. `GET /api/labs/:labId` trả `{ id, classId, title, statement }`. |
| Nộp bài | `POST /api/labs/:labId/submissions` nhận `{ code }`. Student nộp trong lớp của mình. `202` trả `{ id, status: "queued" }`. |
| Xem kết quả judge | `GET /api/submissions/:submissionId` trả `{ id, labId, status, judgeVerdict }` cho student sở hữu bài. `judgeVerdict` là `null` khi bài chưa `judged`. |
| Đọc review queue | `GET /api/labs/:labId/queue` trả `{ labId, items }` cho TA lớp sở hữu hoặc admin. Mỗi item là `{ submissionId, constraint, verdict, evidence, source, deduction, reviewStatus }`. Mỗi bài `Accepted` đã chốt xuất hiện theo từng constraint, gồm cả `pass`. |
| Duyệt một constraint | `POST /api/submissions/:submissionId/constraints/:code/review` nhận `{ decision: "confirm" \| "overturn" }`. TA lớp sở hữu hoặc admin được duyệt. `200` trả `{ submissionId, constraint, reviewStatus }`. |

Khi tạo lab, `title` và `statement` là chuỗi có nội dung, `testCases` và `constraints` có ít nhất một phần tử. `input` và `expectedOutput` có thể là chuỗi rỗng. Từ chối mã constraint trùng, nội dung constraint rỗng, mức trừ âm, code rỗng và quyết định review ngoài hai giá trị trong bảng với `400 invalid-body`. Request bị từ chối giữ nguyên dữ liệu.

Khởi tạo hai lớp rỗng và năm tài khoản `admin`, `ta_a`, `ta_b`, `student_1`, `student_2`. `ta_a` và cả hai student thuộc Class A, `ta_b` thuộc Class B. Giảng viên tự tạo lab qua UI hoặc API. Báo cho student về bước constraint review khi nộp. Phản hồi trạng thái bài nộp cho student chỉ có kết quả judge, với mục FAQ chính thức được dẫn trong hồ sơ PA3 khi xác nhận.

Verdict mới của PA3 bắt đầu ở `pending`. Quyết định của TA cập nhật thành `confirmed` hoặc `overturned`, đồng thời lưu `reviewed_by` và `reviewed_at`. Queue giữ verdict gốc để TA đối chiếu. Demo public PA3 kết thúc tại review queue. Route Publish cho lab PA3 không được mở trên deployment. Luồng demo hiện hữu vẫn dùng [contract Publish](publish.md); chính sách lấy mẫu 10% verdict `pass` gắn với human gate khi triển khai Publish cho pipeline mới.

## 5. Fixture bàn giao và CI

Ba luồng dùng cùng fixture tổng hợp cho lần ghép đầu. TA lớp A tạo lab với một test có input và output rỗng. Nội dung `C1` là “Do not call \`std::min\`.” và nội dung `C2` là “Use recursion.” Student lớp A nộp source sau.

```cpp
#include <algorithm>
int main() { return std::min(0, 1); }
```

Khi chạy với `MODEL_OFF=1`, student nhận `judged` và `Accepted`. Worker có một job `done` và hai verdict dưới đây. API ghép thêm mức trừ khai báo của TA và `reviewStatus: "pending"` trên từng dòng. Student chỉ thấy kết quả judge. TA lớp B nhận `404`.

```json
{
  "verdicts": [
    {
      "constraint": "C1",
      "verdict": "violation",
      "evidence": [{ "line": 2, "text": "int main() { return std::min(0, 1); }" }],
      "source": "hard_rule"
    },
    { "constraint": "C2", "verdict": "unsure", "evidence": [], "source": "model_off" }
  ],
  "callLogs": []
}
```

- **Queue.** Test cả nộp khi worker dừng rồi khởi động và restart sau khi worker đã claim job. Với cùng ID nộp bài, nghiệm thu đúng một bộ verdict sau khi job hoàn tất. Thêm ca bài không `Accepted` để kiểm 0 verdict và 0 call.
- **Checker.** Đặt test hard rules và guardrails dưới `test/unit/` để `npm run check` phát hiện. Test ban-list bằng cả ca thường và trap, test timeout/schema với fake model. Giữ dev set gốc và `eval.mjs` nguyên byte, đưa ít nhất 5 custom cases có nhãn và tag sang thư mục riêng, gồm trap và injection. Với Docker checker model-off, xác nhận `eval.mjs` trả `0` hoặc `1`, xử lý hết cặp ban-list và có 0 wrongful deductions. Lưu predictions, eval report và call log từ lần chạy thật. Ghi model và phép tính chi phí 80 submissions vào README và AI log.
- **CI và deploy.** Giữ `gates` và `e2e`, thêm `sandbox-tests` chạy đủ 9 kiểm chứng rubric và bật workflow cho tag `pa3`. Giữ lịch sử test trước hoặc cùng commit với hard rules và guardrails, tách commit theo từng phần. Nghiệm thu public bằng tài khoản demo, tạo `sort-merge` qua sản phẩm, nộp ba bài theo rubric và kiểm quyền khác lớp.

Trước khi khóa bản nộp, điền vào hồ sơ PA3 mục FAQ từ Classroom, model và hạn mức theo lab đã xác nhận, URL public, CI run đúng tag và bằng chứng eval thật.
