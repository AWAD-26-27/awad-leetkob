# PA#3 — Báo cáo tự chấm LeeTKOB

Nhóm CSC13114 · lớp 2609-AWAD-23/3

- 23120101 — Nguyễn Minh Tú
- 23120105 — Huỳnh Mạnh Tường
- 23120111 — Phạm Quốc Nam Anh

| Tiêu chí | Tự chấm | Bằng chứng |
| --- | ---: | --- |
| 1. Luồng xuyên suốt trên deployment | 15/15 | Trên Azure Korea, `ta_a` tạo `sort-merge` với 7 test và C1/C2. `student_1` nộp `s01`, `s04`, `s09`, thấy từng bài chuyển từ chờ chấm sang `Accepted`. TA lớp A thấy 6 verdict, bằng chứng và mức trừ đã đặt. TA lớp B mở lab thấy `404` và đọc queue cũng nhận `404`. [Video giao diện](evidence/pa3-deployment/korea-public-ui-demo.mp4) · [Kết quả live lab #4](evidence/pa3-deployment/korea-public-live.json) |
| 2. Queue và sandbox | 19/20 | Biên dịch và chạy trong sandbox. CI của `pa3` chạy 9 kiểm tra và test dừng/khởi động worker để kiểm đúng một bộ verdict. Nhóm đã xác minh thêm qua HTTPS và trên VM Korea. [CI sandbox](https://github.com/AWAD-26-27/awad-leetkob/actions/workflows/ci.yml?query=branch%3Apa3+event%3Apush) · [Test worker](test/worker.test.js) · [Log VM](evidence/pa3-deployment/korea-vm-sandbox.txt) |
| 3. Luật cứng trước | 15/15 | Tree-sitter phân tích C++ và áp dụng ban list. Dev set chạy `MODEL_OFF=1` quyết định đúng 55/55 cặp ban-list, 0 khấu trừ sai, log gọi model rỗng. [Mã và test](https://github.com/AWAD-26-27/awad-leetkob/commit/ee847b5) · [Kết quả offline](docs/checker.md#cli-and-docker) |
| 4. Model chấm ràng buộc ngữ nghĩa | 17/20 | Dùng `gemini-3.5-flash-lite`, làm sạch comment và thông tin định danh, kiểm các dòng bằng chứng. Lượt live lab #4 có 1 C2 thành công với request ID của provider (`s01`: `pass`), 2 lượt lỗi chuyển `unsure` (`s04`, `s09`). Dev set live có 47 lượt gọi, 30 có request ID và 17 lỗi HTTP 503. Lab `sort-merge` 80 bài Accepted × 1 lượt gọi C2 × USD 0/lượt = USD 0 trong quota Free tier. [Live lab #4](evidence/pa3-deployment/korea-public-live.json) · [Log dev set](evidence/pa3-checker/live/calls.jsonl) · [Chi phí](docs/checker.md#live-evaluation-and-budget) |
| 5. Giới hạn model và hàng đợi TA | 8/10 | Sai schema, bằng chứng không hợp lệ hoặc timeout chuyển `unsure`; có test model giả. Sinh viên thấy trạng thái và verdict chấm tổng, kết quả soát chỉ có ở TA; Publish bị chặn khi còn verdict chưa duyệt. Bản prototype còn hiện input/output của test trong trang lab, khác FAQ-02. [Test model](test/unit/checker-model.test.js) · [Test Publish](test/contract/publish.contract.test.js) · [FAQ-08](https://github.com/tkob-team/LeeTKOB-FAQ/blob/main/FAQ.md#faq-08) |
| 6. Checker CLI và eval | 10/10 | Có CLI, Docker và `MODEL_OFF=1`. `eval/dev` khớp bản đã nhập, SHA-256 của scorer và labels khớp tiền tố rubric. Có 5 ca custom được gắn nhãn, gồm bẫy và injection. Eval live cho **1 khấu trừ sai**, **75,7% recall**, **16,7% unsure**, 102/102 dự đoán, scorer exit `1`. [Hướng dẫn](docs/checker.md#cli-and-docker) · [Ca custom](eval/custom/labels.jsonl) · [Kết quả live](evidence/pa3-checker/live/eval.json) |
| 7. Tests first và tách commit | 3/5 | Luật cứng, test bẫy, kiểm schema và timeout cùng commit; sandbox và worker có commit riêng. Phần triển khai sandbox có trước commit test riêng, và commit checker chứa cả luật cứng lẫn guardrail. [Checker](https://github.com/AWAD-26-27/awad-leetkob/commit/ee847b5) · [Sandbox](https://github.com/AWAD-26-27/awad-leetkob/commit/e10e199) · [Test sandbox](https://github.com/AWAD-26-27/awad-leetkob/commit/796bcf4) · [Worker](https://github.com/AWAD-26-27/awad-leetkob/commit/e11a80e) |
| 8. AI-LOG.md | 5/5 | Có công cụ, thay đổi, quyết định loại bỏ các cách làm sai và bằng chứng kiểm chứng từ cả ba luồng. [Nhật ký](AI-LOG.md) |
| **Tổng** | **92/100** | **`23120101-23120105-23120111_92.zip`** |

## Phần chưa đạt

- Provider còn trả lỗi. Lượt eval thật có một khấu trừ sai và recall 75,7%, chưa đạt các ngưỡng dùng ở PA#4.
- Prototype chỉ hiển thị verdict chấm tổng của bài nộp và còn hiện input/output mẫu test trong trang lab. FAQ-02 yêu cầu hiển thị verdict từng test và giữ kín input/output. [FAQ-02](https://github.com/tkob-team/LeeTKOB-FAQ/blob/main/FAQ.md#faq-02)
- Video giao diện sử dụng lab #17 để chứng minh luồng. Kết quả C2 `pass`, `unsure`, `unsure` ở trên lấy từ log của lượt live lab #4.
