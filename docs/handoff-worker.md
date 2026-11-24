# Tài liệu Bàn Giao Kỹ Thuật (Handoff) cho Worker — Nhánh `feat/e2e-app`

Tài liệu này dùng để bàn giao cho **Tú (Luồng 2 - Worker)** để tích hợp worker (`src/worker.js`) với SQLite Database chung và Backend API.

---

## 1. Kết Nối Database Chung (SQLite WAL)

Hàm mở database chung được cung cấp tại cả `src/db.js` và `src/backend/db.js`:

```javascript
import { open } from './db.js';
// Hoặc: import { open } from './backend/db.js';

const db = open(); // Trả về DatabaseSync (SQLite in-memory, bật Foreign Keys & WAL)
```

Nếu chạy worker với tệp database vật lý trên đĩa (disk file):
```javascript
import { openQueueDatabase } from './worker.js';
// Hoặc:
import { open } from './db.js';
const db = open(process.env.DB_PATH || './data/leetkob.db');
```

---

## 2. Danh Sách Tài Khoản Demo

| ID | Username | Role | Class ID | Auth Token | Ghi chú |
|:---|:---|:---|:---|:---|:---|
| 1 | `admin` | `admin` | `NULL` | `tok-admin` | Toàn quyền tất cả các lớp |
| 2 | `ta_a` | `ta` | 1 | `tok-ta-a` | Trợ giảng Lớp 1 (Alice) |
| 3 | `ta_b` | `ta` | 2 | `tok-ta-b` | Trợ giảng Lớp 2 (Bob) |
| 4 | `student_1` | `student` | 1 | `tok-student-1` | Sinh viên Lớp 1 |
| 5 | `student_2` | `student` | 1 | `tok-student-2` | Sinh viên Lớp 1 |
| 6 | `stu1` | `student` | 1 | `tok-stu1` | Sinh viên Lớp 1 (dữ liệu tương thích ngược) |
| 7 | `stu2` | `student` | 1 | `tok-stu2` | Sinh viên Lớp 1 (dữ liệu tương thích ngược) |
| 8 | `stu3` | `student` | 2 | `tok-stu3` | Sinh viên Lớp 2 (dữ liệu tương thích ngược) |

---

## 3. Schema Dữ Liệu Chung (Canonical Schema Chuẩn Hóa Khớp 100% `src/worker.js`)

### Bảng `submissions`
Lưu thông tin bài nộp của sinh viên:
```sql
CREATE TABLE submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  student_id INTEGER NOT NULL REFERENCES users(id),
  source_code TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'judging', 'judged')),
  judge_verdict TEXT CHECK (judge_verdict IN ('Accepted', 'WA', 'TLE', 'MLE', 'CE', 'RE', 'OLE', 'SystemError') OR judge_verdict IS NULL),
  judge_detail TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  judged_at TEXT,
  verdict TEXT CHECK (verdict IN ('pass', 'violation', 'unsure') OR verdict IS NULL),
  decision TEXT CHECK (decision IN ('confirm', 'overturn') OR decision IS NULL)
);
```

### Bảng `jobs`
Lưu hàng đợi công việc để Worker lấy và khóa:
```sql
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL UNIQUE REFERENCES submissions(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('queued', 'processing', 'done', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 0,
  locked_at TEXT,
  finished_at TEXT,
  error TEXT
);
```

### Bảng `test_cases`
Lưu các bộ kiểm thử tự động của Lab:
```sql
CREATE TABLE test_cases (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  ordinal INTEGER NOT NULL CHECK (ordinal >= 1),
  input_text TEXT NOT NULL,
  expected_output TEXT NOT NULL,
  UNIQUE(lab_id, ordinal)
);
```

### Bảng `constraints`
Lưu các ràng buộc kỹ thuật của đề bài (ví dụ: không dùng thư viện `vector`, không rò rỉ bộ nhớ):
```sql
CREATE TABLE constraints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  lab_id INTEGER NOT NULL REFERENCES labs(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  text TEXT NOT NULL,
  deduction NUMERIC NOT NULL DEFAULT 1 CHECK (deduction >= 0),
  UNIQUE(lab_id, code)
);
```

### Bảng `constraint_verdicts`
Lưu phán quyết từng ràng buộc sau khi Checker / LLM đánh giá:
```sql
CREATE TABLE constraint_verdicts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  constraint_id INTEGER NOT NULL REFERENCES constraints(id) ON DELETE CASCADE,
  verdict TEXT NOT NULL CHECK (verdict IN ('pass', 'violation', 'unsure')),
  evidence_json TEXT NOT NULL DEFAULT '[]',
  source TEXT NOT NULL CHECK (source IN ('hard_rule', 'model', 'model_off', 'guardrail_fallback')),
  review_status TEXT NOT NULL CHECK (review_status IN ('pending', 'confirmed', 'overturned')),
  reviewed_by INTEGER REFERENCES users(id),
  reviewed_at TEXT,
  UNIQUE(submission_id, constraint_id)
);
```

### Bảng `llm_call_logs`
Lưu nhật ký gọi mô hình AI (nếu kích hoạt LLM):
```sql
CREATE TABLE llm_call_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  submission_id INTEGER NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  constraint_id INTEGER NOT NULL REFERENCES constraints(id) ON DELETE CASCADE,
  attempt INTEGER NOT NULL,
  provider_request_id TEXT,
  model TEXT,
  status TEXT NOT NULL CHECK (status IN ('ok', 'timeout', 'error')),
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  latency_ms INTEGER,
  cost_usd REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
```

---

## 4. Request Mẫu Tạo Submission (HTTP 202 Queued)

Sinh viên nộp bài qua API:
```bash
curl -X POST http://localhost:3007/api/labs/1/submissions \
  -H "Authorization: Bearer tok-student-1" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "#include <iostream>\nusing namespace std;\nint main() { cout << 1 << endl; return 0; }"
  }'
```

**Phản hồi (HTTP 202 Accepted):**
```json
{
  "id": 4,
  "status": "queued"
}
```

> **Kiểm điểm nối:** Backend thực hiện ghi đồng thời trong **1 transaction nguyên tử** (`createSubmissionTransaction`):
> 1. Ghi 1 bản ghi vào bảng `submissions` với `status = 'queued'`.
> 2. Ghi 1 bản ghi vào bảng `jobs` với `status = 'queued'` và `attempts = 0`.

---

## 5. Quy Trình Khớp Nối Của Worker (`src/worker.js`)

Khi Worker chạy hàm `runOnce()`:
1. **Lấy việc (Claim Job):**
   ```sql
   SELECT j.id AS jobId, j.attempts, s.id AS submissionId, s.lab_id AS labId,
          s.source_code AS code, l.statement_md AS statement
   FROM jobs j
   JOIN submissions s ON s.id = j.submission_id
   JOIN labs l ON l.id = s.lab_id
   WHERE j.status = 'queued'
      OR (j.status = 'processing' AND (j.locked_at IS NULL OR julianday(j.locked_at) <= julianday(?)))
   ORDER BY j.id
   LIMIT 1;
   ```
2. **Khóa job (Claim lease):**
   ```sql
   UPDATE jobs
   SET status = 'processing', attempts = attempts + 1, locked_at = ?, error = NULL
   WHERE id = ?;

   UPDATE submissions SET status = 'judging' WHERE id = ?;
   ```
3. **Thực thi Sandbox & Checker:**
   * Chạy test cases qua `runSandbox({ code, testCases })`.
   * Nếu verdict là `Accepted`, chạy `evaluateSubmission` kiểm tra constraints.
4. **Ghi nhận phán quyết & Hoàn tất (Finish):**
   * Ghi từng vi phạm vào `constraint_verdicts`:
     ```sql
     INSERT INTO constraint_verdicts (submission_id, constraint_id, verdict, evidence_json, source, review_status)
     VALUES (?, ?, 'violation', ?, 'hard_rule', 'pending');
     ```
   * Cập nhật trạng thái `submissions` thành `judged`:
     ```sql
     UPDATE submissions
     SET status = 'judged', judge_verdict = 'Accepted', judge_detail = ?, judged_at = ?
     WHERE id = ?;
     ```
   * Đánh dấu job hoàn tất trong `jobs`:
     ```sql
     UPDATE jobs
     SET status = 'done', locked_at = NULL, finished_at = ?, error = NULL
     WHERE id = ?;
     ```

---

## 6. Chính Sách Bảo Mật FAQ (Student Privacy Policy)

* **Trước khi TA Publish:** 
  Sinh viên gọi `GET /api/submissions/:id` chỉ thấy `id`, `status: "judged"`, `judgeVerdict: "Accepted"` và số lượng test pass. Cột đánh giá vi phạm hiển thị `🔒 Hidden until TA publishes`. Toàn bộ dữ liệu trong `constraint_verdicts` (bằng chứng AST, tên luật, điểm trừ) đều bị ẩn.
* **Sau khi TA Publish:** 
  Sinh viên được xem phán quyết và các vi phạm đã được TA xác nhận (`confirm`).
