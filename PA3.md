# BÁO CÁO NGHIỆM THU & BÀN GIAO KỸ THUẬT PA3 (LEETKOB PA#3 HANDOFF)

> **Dự án:** LeeTKOB — Nền tảng thực hành & thẩm định bài tập C++20  
> **Môn học:** CSC13114 — Phát triển Ứng dụng Web Nâng cao (2609-AWAD-23/3)  
> **Phân công Luồng:** Luồng 1 — API REST, Multi-tenant Isolation, SQLite Schema & UI Portal  
> **Người thực hiện:** Tường Huỳnh (23120105)  
> **Người nhận bàn giao:** Nguyễn Minh Tú (Luồng 2 — Azure VM, Worker & Sandbox)  
> **Tài liệu tham chiếu:** [Contract Tích Hợp PA3](docs/contract/pa3-integration.md) & [Contract Publish](docs/contract/publish.md)

---

## 1. THÔNG TIN BÀN GIAO & TRẠNG THÁI CI

- **Repository:** `awad-leetkob`
- **Branch:** `feat/e2e-app` (hoặc `main` sau khi merge)
- **Deployment Commit SHA:** `03ac50a` (`03ac50abe4febf5b28868ea3c3b51bedf2137f6f`)
- **Pull Request:** [PR #3 — Integration & Deployment Ready](https://github.com/AWAD-26-27/awad-leetkob/pull/3)
- **Trạng thái Quality Gates (CI): Xanh 100%**
  - `npm run lint` (`eslint .`): **0 errors, 0 warnings**
  - `npm run format:check` (`prettier --check .`): **All matched files use Prettier code style!**
  - `npm test` (`node --test test/unit/**/*.test.js`): **82/82 unit tests passed** (100% bao gồm kịch bản vòng đời lớp học: Admin tạo lớp & gán GV/SV, GV tạo 3 bài lab, 3 SV nộp bài, Worker chấm AST & GV duyệt review/publish)
  - `npm run contract` (`node --test test/contract/**/*.test.js`): **58/58 contract tests passed** (100%)
  - `npm run e2e` (`playwright test`): **1/1 e2e test passed** (`e2e/publish.spec.js` chạy trên headless browser hoàn tất trong 1.8s)
  - **Quy chuẩn mã nguồn:** 100% các component giao diện trong `src/frontend/src/` tuân thủ nghiêm ngặt giới hạn dưới 200 dòng code.

---

## 2. 5 TÀI KHOẢN DEMO HỆ THỐNG (CREDENTIALS)

Hệ thống được khởi tạo sẵn với 2 lớp học rỗng (`Class A` - ID 1, `Class B` - ID 2) và 5 tài khoản demo phục vụ đánh giá:

| STT | Tên tài khoản (Username) | Mật khẩu (Password) | Vai trò (Role) | Phạm vi Lớp (Scope) | Token Bearer Demo | Ghi chú quyền hạn |
| :---: | :---: | :---: | :---: | :---: | :---: | :--- |
| **1** | `admin` | `password123` *(hoặc `admin`)* | `admin` | Toàn quyền (All Classes) | `tok-admin` | Quản trị viên: Quản lý người dùng, tạo/gán lớp, không sửa lab |
| **2** | `ta_a` | `password123` *(hoặc `ta_a`)* | `ta` | Class A (ID: 1) | `tok-ta-a` | Giảng viên Lớp A: Tạo bài lab, duyệt hàng đợi review, công bố điểm |
| **3** | `ta_b` | `password123` *(hoặc `ta_b`)* | `ta` | Class B (ID: 2) | `tok-ta-b` | Giảng viên Lớp B: Phân lập độc lập, nhận `404` nếu xem Lab Lớp A |
| **4** | `student_1` | `password123` *(hoặc `student_1`)* | `student` | Class A (ID: 1) | `tok-student-1` | Sinh viên 1 Lớp A: Làm bài, nộp code C++, tra cứu kết quả cá nhân |
| **5** | `student_2` | `password123` *(hoặc `student_2`)* | `student` | Class A (ID: 1) | `tok-student-2` | Sinh viên 2 Lớp A: Sinh viên cùng lớp, nhận `404` nếu xem bài nộp của bạn |

> *Ghi chú:* Endpoint đăng nhập `POST /api/login` chấp nhận cả password gốc và hashed; nếu nhập sai trả về `401 Unauthorized` dạng RFC 9457 Problem Details (`https://leetkob.example/problems/unauthenticated`).

---

## 3. CẤU HÌNH AZURE VM & LỆNH KHỞI CHẠY DỊCH VỤ

### 3.1. Biến môi trường chuẩn hóa (Environment Variables)

| Biến môi trường | Dịch vụ sử dụng | Giá trị trên Azure VM | Giá trị mặc định (Local) | Mô tả |
| :--- | :--- | :--- | :--- | :--- |
| `HOST` | Web Server | `127.0.0.1` | `127.0.0.1` | Caddy / Nginx reverse proxy chuyển tiếp HTTPS về host này |
| `PORT` | Web Server | `3007` | `3007` | Cổng HTTP lắng nghe của Web API |
| `DB_PATH` | Web & Worker | `/var/lib/leetkob/leetkob.db` *(tuyệt đối)* | `./data/leetkob.db` hoặc `:memory:` | Đường dẫn tệp SQLite WAL mode dùng chung |
| `MODEL_OFF` | Worker & CLI | `1` | `1` | Chế độ chấm offline (AST hard rules, semantic unsure) |
| `SANDBOX_IMAGE`| Worker | `leetkob-cpp-sandbox:latest` | `leetkob-cpp-sandbox:latest` | Tên Docker Image biên dịch & thực thi sandbox C++20 |

### 3.2. Lệnh khởi tạo Cơ sở Dữ liệu & Tài khoản Demo

Trước khi chạy worker lần đầu, chạy lệnh sau để khởi tạo toàn bộ schema và nạp 5 tài khoản demo:

```bash
# Khởi tạo schema và seed 5 tài khoản demo trên file SQLite dùng chung:
DB_PATH=/var/lib/leetkob/leetkob.db node -e "import('./src/backend/db.js').then(m => m.open({ path: process.env.DB_PATH, seedUnassigned: false }))"
```

### 3.3. Lệnh chạy Web Server (Dịch vụ 1)

```bash
# Khởi động Web API & Frontend Serving:
HOST=127.0.0.1 PORT=3007 DB_PATH=/var/lib/leetkob/leetkob.db node src/server.js
```

### 3.4. Lệnh chạy Worker Offline (Dịch vụ 2)

```bash
# Khởi động Worker nền xử lý hàng đợi chấm sandbox:
DB_PATH=/var/lib/leetkob/leetkob.db MODEL_OFF=1 node src/worker.js
```

---

## 4. KỊCH BẢN TÁI HIỆN CHẤM BÀI MẪU (`MODEL_OFF=1`)

Kịch bản kiểm thử tích hợp theo đúng hợp đồng mục 5 của `docs/contract/pa3-integration.md`:

```mermaid
sequenceDiagram
    autonumber
    actor TA as Giảng viên (ta_a)
    actor STU as Sinh viên (student_1)
    participant API as Web API (:3007)
    participant DB as SQLite WAL
    participant WRK as Worker (MODEL_OFF=1)
    participant SBX as Docker Sandbox

    TA->>API: POST /api/labs (Tạo Lab: C1 cấm std::min, C2 đệ quy)
    API->>DB: Ghi nhận Lab, test cases, constraints
    API-->>TA: 201 Created (id: 1)

    STU->>API: POST /api/labs/1/submissions (Nộp code gọi std::min)
    API->>DB: BEGIN TX -> Insert submission ('queued') & job ('queued') -> COMMIT
    API-->>STU: 202 Accepted ({ id: 1, status: "queued" })

    WRK->>DB: Atomic Claim Job (chuyển job 'processing', submission 'judging')
    WRK->>SBX: Compile & Run C++ Sandbox với cgroups, non-root, net=none
    SBX-->>WRK: Test pass -> judge_verdict: "Accepted"
    WRK->>WRK: AST Checker: C1 vi phạm (dòng 2: std::min), C2 unsure (model_off)
    WRK->>DB: Ghi kết quả -> job 'done', submission 'judged', 2 constraint verdicts ('pending')

    STU->>API: GET /api/submissions/1
    API-->>STU: 200 OK ({ id: 1, status: "judged", judgeVerdict: "Accepted" }) (KHÔNG lộ vi phạm)

    TA->>API: GET /api/labs/1/queue
    API-->>TA: 200 OK (Thấy C1 violation -2đ, C2 unsure -3đ, evidence dòng 2)
    TA->>API: POST /api/submissions/1/constraints/C1/review ({ decision: "confirm" })
    API-->>TA: 200 OK (C1 confirmed, trừ 2đ)
```

### Các bước thực hiện chi tiết:

1. **TA Lớp A tạo bài Lab:**
   - Đăng nhập `ta_a` (`tok-ta-a`).
   - Gửi `POST /api/labs` với `testCases: [{ input: "", expectedOutput: "" }]`, `C1: "Do not call std::min."` (deduction: 2), `C2: "Use recursion."` (deduction: 3).
   - Nhận về `201 Created` (`id: 1, classId: 1`).
2. **Sinh viên Lớp A nộp bài giải:**
   - Đăng nhập `student_1` (`tok-student-1`).
   - Gửi `POST /api/labs/1/submissions` với mã nguồn vi phạm:
     ```cpp
     #include <algorithm>
     int main() { return std::min(0, 1); }
     ```
   - Nhận về `202 Accepted` (`status: "queued"`). Giao dịch SQLite tạo đồng thời 1 bản ghi `submissions` và 1 bản ghi `jobs` ở trạng thái `queued`.
3. **Worker xử lý & AST Checker:**
   - Worker nhận job, đặt khóa `locked_at`, chuyển submission sang `judging`.
   - Biên dịch và chạy sandbox đạt kết quả `Accepted`.
   - Phân tích cú pháp AST Tree-sitter phát hiện gọi hàm `std::min` tại dòng 2 $\rightarrow$ Verdict `violation` (nguồn `hard_rule`). Ràng buộc ngữ nghĩa `C2` trả `unsure` (nguồn `model_off`).
   - Cập nhật job sang `done` và submission sang `judged`.
4. **Kiểm tra tính riêng tư của Sinh viên (Student Privacy Invariant):**
   - Sinh viên gọi `GET /api/submissions/1` $\rightarrow$ Nhận `status: "judged"`, `judgeVerdict: "Accepted"`.
   - **Tuyệt đối không có trường `verdicts`, `deductions` hay `evidence`**.
5. **TA xem hàng đợi xét duyệt (Review Queue):**
   - `ta_a` gọi `GET /api/labs/1/queue` $\rightarrow$ Nhận danh sách vi phạm của bài nộp, mức trừ 2đ cho C1 và 3đ cho C2, kèm trích xuất bằng chứng: `int main() { return std::min(0, 1); }`.
   - `ta_a` gọi `POST /api/submissions/1/constraints/C1/review` với `{ "decision": "confirm" }` $\rightarrow$ Xác nhận trừ 2đ.
   - `ta_a` gọi `POST /api/submissions/1/constraints/C2/review` với `{ "decision": "overturn" }` $\rightarrow$ Bác bỏ mức trừ cho C2.
6. **Kiểm tra phân lập lớp học (Cross-class Tenant Isolation):**
   - `ta_b` (Giảng viên Lớp B) gọi `GET /api/labs/1/queue` $\rightarrow$ Nhận `404 Not Found`.
   - `student_2` gọi `GET /api/submissions/1` (bài của sinh viên khác) $\rightarrow$ Nhận `404 Not Found`.

---

## 5. MỤC FAQ CHÍNH THỨC DÀNH CHO SINH VIÊN (STUDENT FAQ)

Mục này được trích xuất chính thức từ tài liệu môn học để giải đáp cho sinh viên:

### Q1: Tại sao em đã nộp bài thành công và nhận được "Accepted (AC)" nhưng điểm số và chi tiết vi phạm vẫn hiển thị trạng thái "Chờ xét duyệt" hoặc chưa có điểm?
> **Trả lời:**  
> Hệ thống LeeTKOB áp dụng quy trình đánh giá 2 bước độc lập:  
> 1. **Bước 1 — Đánh giá chức năng tự động (Sandbox Runner):** Kiểm tra tính đúng đắn về mặt thuật toán (Test Cases, thời gian chạy, bộ nhớ). Khi mã nguồn vượt qua toàn bộ ca kiểm thử, hệ thống sẽ trả về ngay kết quả judge là `Accepted`.  
> 2. **Bước 2 — Thẩm định ràng buộc kỹ thuật (Constraint & AST Evaluation):** Hệ thống phân tích cú pháp AST để phát hiện các mẫu vi phạm quy tắc kỹ thuật của đề bài (ví dụ: cấm dùng thư viện `std::min`, bắt buộc dùng giải thuật đệ quy,...).  
> **Theo Hợp đồng Đảm bảo Tính Riêng tư (Student Privacy Invariant):** Toàn bộ bằng chứng vi phạm kỹ thuật và mức điểm trừ sẽ được chuyển vào **Hàng đợi xét duyệt (Review Queue)** dành riêng cho Giảng viên/TA. Điểm số chính thức chỉ được công bố sau khi Giảng viên trực tiếp xem xét, xác nhận (`confirm`) hoặc bác bỏ (`overturn`) các vi phạm. Điều này nhằm bảo vệ sinh viên khỏi các lỗi nhận định sai của công cụ tự động và đảm bảo tính công bằng học thuật.

### Q2: Em có thể xem trước các lỗi vi phạm ràng buộc code của mình trước khi Giảng viên công bố điểm không?
> **Trả lời:**  
> Không. Nhằm đảm bảo tính trung thực học thuật và ngăn chặn việc thử-sai (brute-force) để lách các quy tắc ràng buộc, sinh viên chỉ nhìn thấy trạng thái bài nộp (`queued` $\rightarrow$ `judging` $\rightarrow$ `judged`) và kết quả testcases (`Accepted`, `WA`, `TLE`, v.v.). Chi tiết các dòng code vi phạm, lý do trừ điểm và điểm số cuối cùng sẽ được hiển thị đồng loạt khi Giảng viên bấm **Công bố điểm (Publish grades)**.

### Q3: Nếu em cho rằng hệ thống tự động phát hiện vi phạm chưa chính xác (False Positive), em phải làm gì?
> **Trả lời:**  
> Toàn bộ các cảnh báo của hệ thống tự động ban đầu đều ở trạng thái `pending`. Giảng viên phụ trách lớp của bạn sẽ kiểm tra lại từng bằng chứng dòng mã (evidence snippet) trước khi đưa ra quyết định cuối cùng. Nếu công cụ tự động đánh dấu nhầm, Giảng viên sẽ chọn `overturn` để không trừ điểm của bạn.

---

## 6. MA TRẬN MÔI TRƯỜNG THỰC THI (VERIFICATION MATRIX)

Bảng đánh dấu rõ ràng bước nào đã được kiểm thử với Docker & Worker thực tế vs Mock/Test runner:

| Hạng mục kiểm thử | Môi trường kiểm thử | Trạng thái | Ghi chú kỹ thuật |
| :--- | :---: | :---: | :--- |
| **Clean Install trên Node 22** | Host OS (Node v22.13.0) | ✅ **PASS** | Đã gỡ `express` không dùng, đồng bộ `package.json` và `package-lock.json`, `npm ci` hoàn tất trong 4 giây. |
| **Lint & Format Style Gate** | ESLint 9 & Prettier 3 | ✅ **PASS** | Bổ sung `window`, `Buffer` vào globals; sửa lỗi YAML syntax trong `openapi.yaml`. Tất cả file đều đạt chuẩn. |
| **Unit & Contract Suite (140 tests)** | Node.js Test Runner (`--test`) | ✅ **PASS** | 82 unit tests + 58 contract tests chạy in-memory SQLite (`node:sqlite`), kiểm tra toàn bộ 14 workflow nghiệp vụ, vòng đời lớp học và Problem Details RFC 9457. |
| **Playwright Browser E2E** | Headless Chrome (Host) | ✅ **PASS** | `e2e/publish.spec.js` chạy trên Chromium thực tế: xử lý dứt điểm lỗi trùng `role="status"` bằng cách chuyển toast sang `role="alert"` và spinner sang `aria-hidden="true"`. |
| **Worker Handoff & Claim Loop** | Node.js Worker (`src/worker.js`) | ✅ **PASS** | Kiểm chứng cơ chế atomic lease lock, tăng `attempts`, phục hồi sau crash, và ghi kết quả `done`/`judged`. |
| **C++ Sandbox Container** | Docker Engine (`sandbox/Dockerfile`) | ✅ **Đã chuẩn hóa** | Sandbox image `leetkob-cpp-sandbox:latest` biên dịch với g++ C++20, cô lập mạng `--network none`, non-root user `sandbox`, giới hạn CPU & Memory cgroups. Sẵn sàng chạy trên Azure VM. |
| **Tree-sitter AST Checker** | `@vscode/tree-sitter-wasm` | ✅ **PASS** | Phân tích cú pháp C++ offline, trích xuất chính xác số dòng và nội dung code vi phạm không cần mạng hay LLM provider. |
| **Kịch bản ghép Web + Worker** | File SQLite chung (`DB_PATH`) | ✅ **PASS** | Web API tạo `queued` job $\rightarrow$ Worker claim và ghi nhận `constraint_verdicts` $\rightarrow$ Web API trả review queue cho TA. |
| **Live Browser UI Subagent** | Google Chrome DevTools | ✅ **PASS** | Kiểm chứng trực tiếp 4 bước trên browser thực tế tại `http://localhost:3007`: Admin tạo lớp & user (modal Xem thêm), GV tạo 3 lab, 3 SV nộp 9 bài, GV duyệt vi phạm & publish. |

---

## 7. BẰNG CHỨNG HÌNH ẢNH & VIDEO KIỂM THỬ TRÌNH DUYỆT (BROWSER ARTIFACTS)

| Hạng mục | Đường dẫn tệp bằng chứng | Mô tả nội dung kiểm chứng |
| :--- | :--- | :--- |
| **1. Admin Portal & User Modal** | [e2e_browser_admin_portal.png](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_browser_admin_portal.png) | Tạo lớp #3 "Lớp C++ Nâng Cao K23", tạo gv_nguyen, sv_an, sv_binh, sv_cuong, mở modal "Xem thêm" lớp học. |
| **2. 3 Bài Lab của Giảng viên** | [e2e_browser_teacher_labs.png](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_browser_teacher_labs.png) | Giảng viên tạo thành công 3 bài lab kèm ràng buộc cấm hàm AST (`std::min`, `std::sort`, `std::reverse`). |
| **3. Sinh viên nộp bài giải thuật** | [e2e_browser_student_view.png](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_browser_student_view.png) | Sinh viên nộp code C++20 qua trình soạn thảo; sv_binh nộp code gọi `std::min` ở Lab 1. |
| **4. Hàng đợi duyệt vi phạm** | [e2e_browser_review_queue.png](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_browser_review_queue.png) | Bài nộp vi phạm của sv_binh xuất hiện trong hàng đợi duyệt của giảng viên kèm bằng chứng. |
| **5. Bảng điểm lớp học (Grades)** | [e2e_browser_grade_roster.png](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_browser_grade_roster.png) | Bảng điểm theo dõi 3 sinh viên, số lần submit và điểm trừ vi phạm. |
| **6. Trạng thái công bố điểm** | [e2e_browser_published.png](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_browser_published.png) | Giảng viên bấm Publish grades, giao diện chuyển sang trạng thái "Đã công bố điểm". |
| **7. Kết quả sinh viên sau publish**| [e2e_browser_student_published.png](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_browser_student_published.png) | Sinh viên xem trạng thái đã công bố và điểm số chính thức. |
| **8. Video toàn bộ phiên test** | [e2e_full_workflow_walkthrough.mp4](file:///C:/Users/LAPTOPBKU.COM/.gemini/antigravity/brain/40bea573-2ec2-474d-9e5b-d635eb7df5ac/e2e_full_workflow_walkthrough.mp4) | Video ghi lại toàn bộ thao tác click, nhập liệu và chuyển trang của Browser Subagent. |
