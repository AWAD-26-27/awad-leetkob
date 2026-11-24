# LeeTKOB PA3 — Bản Phân Tích Nghiệp Vụ & Ma Trận Phân Quyền (RBAC Matrix)

Tài liệu này định nghĩa chi tiết toàn bộ nghiệp vụ, phạm vi hoạt động, quyền hạn được phép thực hiện (*Allowed*) và các ranh giới cấm kỵ (*Forbidden / Boundary Constraints*) của 3 vai trò chính trong hệ thống **LeeTKOB**: **Quản trị viên (Administrator)**, **Giảng viên / Trợ giảng (Teacher / TA)**, và **Sinh viên (Student)**.

---

## 1. Sơ Đồ Phân Cấp Kiến Trúc Vai Trò & Ranh Giới Khách Thuê (Tenancy)

```mermaid
graph TD
    subgraph SystemScope["Toàn Hệ Thống (System-wide Scope)"]
        Admin["Quản Trị Viên (Admin)<br/>class_id = NULL"]
    end

    subgraph ClassTenantA["Lớp Học A (Class A Tenant Boundary)"]
        TA_A["Giảng Viên A (ta_a)<br/>class_id = 1"]
        Stu1["Sinh viên 1 (student_1)<br/>class_id = 1"]
        Stu2["Sinh viên 2 (student_2)<br/>class_id = 1"]
        LabA["Bài Lab Lớp A (lab_id = 1, 3)"]
        QueueA["Hàng đợi duyệt Lớp A"]
    end

    subgraph ClassTenantB["Lớp Học B (Class B Tenant Boundary)"]
        TA_B["Giảng Viên B (ta_b)<br/>class_id = 2"]
        Stu3["Sinh viên 3 (student_3)<br/>class_id = 2"]
        LabB["Bài Lab Lớp B (lab_id = 2)"]
        QueueB["Hàng đợi duyệt Lớp B"]
    end

    Admin -->|Khởi tạo lớp & Phân công GV| TA_A
    Admin -->|Khởi tạo lớp & Phân công GV| TA_B
    Admin -->|Cấp phát tài khoản & Điều chuyển| Stu1
    Admin -->|Cấp phát tài khoản & Điều chuyển| Stu3

    Admin x-.-x|BỊ CẤM 403 (Không quản lý bài Lab)| LabA
    Admin x-.-x|BỊ CẤM (Không có quyền xóa sạch DB)| SystemScope

    TA_A -->|Biên soạn đề & Sửa đề Lab| LabA
    TA_A -->|Xét duyệt vi phạm AST| QueueA
    TA_A -->|Quản lý danh sách SV lớp mình| Stu1
    TA_A -->|Quản lý danh sách SV lớp mình| Stu2

    Stu1 -->|Nộp bài C++ & Xem điểm đã công bố| LabA
    Stu2 -->|Nộp bài C++ & Xem điểm đã công bố| LabA

    TA_A x-.-x|BỊ CHẶN 404 (Không thấy Lab B)| LabB
    TA_A x-.-x|BỊ CHẶN 404 (Không thấy Queue B)| QueueB
    Stu1 x-.-x|BỊ CHẶN 404 (Không thấy bài của Stu 2)| Stu2
```

---

## 2. Phân Tích Nghiệp Vụ: QUẢN TRỊ VIÊN (Administrator)

### 2.1. Phạm vi & Trách nhiệm cốt lõi
* **Phạm vi:** Toàn hệ thống (System-wide), không gắn với bất kỳ lớp học nào (`users.class_id = NULL`).
* **Trách nhiệm:** Vận hành cấu trúc tổ chức đào tạo, khởi tạo danh mục lớp học, cấp phát tài khoản ban đầu và phân công giảng viên/sinh viên vào các lớp học. Admin không can thiệp vào chuyên môn học thuật nội bộ của từng lớp.

### 2.2. Danh sách quyền hạn được phép (Allowed Actions)
1. **Quản trị Lớp học (Class Management):**
   * Khởi tạo lớp học mới (`POST /api/classes`).
   * Xem danh mục toàn bộ các lớp học trên toàn trường (`GET /api/classes`).
   * Xem chi tiết thông tin lớp học (`GET /api/classes/:classId`).
   * Chỉ định / Phân công Giảng viên phụ trách lớp học (`POST /api/classes/:classId/teachers`).
   * Gỡ bỏ Giảng viên khỏi lớp học (`DELETE /api/classes/:classId/teachers/:teacherId`).
2. **Cấp phát & Quản lý Người dùng (User Management):**
   * Cấp phát tài khoản mới cho Giảng viên (`role: 'ta'`) hoặc Sinh viên (`role: 'student'`) (`POST /api/users`).
   * Xem danh bạ toàn bộ tài khoản trong hệ thống (`GET /api/users`).
   * Gán sinh viên vào lớp học (`POST /api/classes/:classId/students`).
   * Gỡ bỏ sinh viên khỏi lớp học (`DELETE /api/classes/:classId/students/:studentId`).
3. **Quản lý Tài khoản Bản thân:**
   * Xem thông tin cá nhân (`GET /api/me`).
   * Đổi mật khẩu cá nhân (`POST /api/users/change-password`).
   * Đăng xuất hệ thống (`POST /api/logout`).

### 2.3. Ranh giới hạn chế & Quy tắc an toàn (Forbidden / Invariants)
* ❌ **Không quản lý bài thực hành (No Lab Management):** Admin KHÔNG có quyền tạo bài thực hành (`POST /api/labs` trả về **HTTP 403 Forbidden**), không có quyền chỉnh sửa bài thực hành (`PUT /api/labs/:id` trả về **HTTP 403 Forbidden**), và không quản lý hàng đợi xét duyệt hay công bố điểm. Bài thực hành hoàn toàn thuộc về từng lớp học riêng biệt do Giảng viên lớp đó chịu trách nhiệm.
* ❌ **Tuyệt đối không xóa dữ liệu (No Database Wipe / Reset):** Hệ thống đã xóa bỏ hoàn toàn endpoint `POST /api/admin/reset-database` và các chức năng xóa cơ sở dữ liệu trên giao diện. Admin không có quyền xóa sạch cơ sở dữ liệu để bảo vệ dữ liệu đào tạo.
* ❌ **Không nộp bài làm:** Admin không tham gia nộp bài tập với tư cách người học.
* ❌ **Chống leo thang đặc quyền (Anti-Mass Assignment):** Không cho phép thay đổi role hoặc classId thông qua các request đổi mật khẩu.

---

## 3. Phân Tích Nghiệp Vụ: GIẢNG VIÊN / TRỢ GIẢNG (Teacher / TA)

### 3.1. Phạm vi & Trách nhiệm cốt lõi
* **Phạm vi:** Đơn lớp (Single Tenant Boundary). Phải gắn liền với một lớp học cụ thể (`users.class_id != NULL`).
* **Trạng thái chưa gán lớp (Unassigned Teacher):** Khi tài khoản Giảng viên mới được khởi tạo và chưa được Admin phân công vào lớp (`class_id = NULL`), Giảng viên bị chặn quyền tạo bài lab (HTTP 403) và nhận thông báo yêu cầu liên hệ Quản trị viên để được chỉ định lớp.
* **Trách nhiệm khi đã có lớp:** Quản lý danh sách sinh viên lớp mình, toàn quyền biên soạn và chỉnh sửa bài tập thực hành C++, đối soát vi phạm cú pháp AST do hệ thống tự động phát hiện, và công bố điểm thi cho sinh viên.

### 3.2. Danh sách quyền hạn được phép (Allowed Actions)
1. **Quản lý Sinh viên trong Lớp (Class Roster):**
   * Tra cứu danh sách sinh viên thuộc lớp mình phụ trách (`GET /api/classes/:classId/students`).
   * Gán thêm sinh viên vào danh sách lớp của mình (`POST /api/classes/:classId/students`).
   * Xóa sinh viên ra khỏi danh sách lớp (`DELETE /api/classes/:classId/students/:studentId`).
2. **Biên soạn & Chỉnh sửa Bài thực hành (Lab Authoring & Editing):**
   * Tạo bài Lab mới cho lớp học của mình (`POST /api/labs`).
   * Chỉnh sửa tiêu đề và nội dung đề bài Markdown (`PUT /api/labs/:labId` hoặc `PATCH /api/labs/:labId`).
   * Thiết lập bộ Test cases (bộ thử nghiệm I/O) với ít nhất 1 test case.
   * Thiết lập bộ Ràng buộc cấu trúc mã nguồn (AST Constraints) kèm theo mức điểm trừ cụ thể (`deduction`).
   * Xem danh sách và chi tiết các bài Lab do lớp mình sở hữu (`GET /api/labs`, `GET /api/labs/:labId`).
3. **Thẩm định Hàng đợi Xét duyệt (Review Queue Adjudication):**
   * Xem Hàng đợi xét duyệt bài nộp của lớp mình (`GET /api/labs/:labId/queue`).
   * Đối soát chi tiết từng bài nộp của sinh viên: dòng code vi phạm, text trích xuất từ AST, nguồn phát hiện (`hard_rule` / `model`), mức điểm trừ dự kiến.
   * Đưa ra phán quyết thẩm định cuối cùng cho từng quy tắc vi phạm:
     * **Xác nhận trừ điểm (`decision: 'confirm'`):** Đồng ý vi phạm, chốt trạng thái `confirmed`.
     * **Bác bỏ vi phạm (`decision: 'overturn'`):** Đánh giá không vi phạm, chốt trạng thái `overturned`.
4. **Công bố Điểm số (Grade Publishing Gate):**
   * Sau khi thẩm định xong toàn bộ các vi phạm (hàng đợi không còn bài `pending`), Giảng viên bấm **Publish grades** (`POST /api/labs/:labId/publish`) để chính thức công khai điểm cho sinh viên.
5. **Quản lý Cá nhân:** Đổi mật khẩu, xem hồ sơ cá nhân, đăng xuất.

### 3.3. Ranh giới hạn chế & Quy tắc an toàn (Forbidden / Invariants)
* ❌ **Chặn khi chưa có lớp:** Giảng viên có `class_id = NULL` không thể tạo bài lab (`POST /api/labs` trả về **HTTP 403 Forbidden**).
* ❌ **Cách ly Đa khách thuê (Cross-Class Boundary):** Giảng viên lớp A **tuyệt đối không thể** truy cập, xem đề bài, xem hàng đợi hay sửa bài của Lớp B. Hệ thống trả về mã **HTTP 404 Not Found** (IDOR Prevention).
* ❌ **Không được công bố khi chưa duyệt xong:** Lệnh Publish trả về **HTTP 409 Conflict (reviews-pending)** nếu vẫn còn bất kỳ vi phạm nào ở trạng thái `pending`.
* ❌ **Không có quyền Quản trị hệ thống:** Giảng viên không được tạo lớp mới (HTTP 403), không được tự cấp phát tài khoản mới (HTTP 403).

---

## 4. Phân Tích Nghiệp Vụ: SINH VIÊN (Student)

### 4.1. Phạm vi & Trách nhiệm cốt lõi
* **Phạm vi:** Cá nhân sinh viên trong phạm vi lớp học được biên chế (`users.class_id != NULL`, `student_id`).
* **Trách nhiệm:** Đọc đề bài, lập trình giải quyết bài toán bằng ngôn ngữ C++20, nộp bài đúng hạn và tra cứu kết quả sau khi được công bố.

### 4.2. Danh sách quyền hạn được phép (Allowed Actions)
1. **Xem Đề bài Thực hành:**
   * Xem danh sách bài Lab của lớp mình (`GET /api/labs`).
   * Xem chi tiết đề bài Markdown của lớp mình (`GET /api/labs/:labId`).
2. **Nộp Bài Tập C++ (Code Submission):**
   * Nộp mã nguồn C++ lên hệ thống (`POST /api/labs/:labId/submissions`).
   * Nhận phản hồi tức thì HTTP 202 Queued với mã định danh bài nộp (`submissionId`).
3. **Theo dõi Tiến trình Chấm bài:**
   * Tra cứu trạng thái bài nộp của chính mình (`GET /api/submissions/:submissionId`).
   * Xem kết quả biên dịch và chạy test cases cơ bản (`Accepted`, `WA`, `TLE`, `CE`...).
4. **Xem Bảng điểm Chính thức (Sau khi Publish):**
   * Sau khi Trợ giảng chính thức Publish điểm, sinh viên được xem điểm số cuối cùng, các khoản trừ điểm vi phạm (nếu có) và nhận xét của giảng viên.
5. **Quản lý Cá nhân:** Xem hồ sơ sinh viên, đổi mật khẩu, đăng xuất.

### 4.3. Ranh giới hạn chế & Quy tắc bảo vệ bất biến (Strict Invariants)
* 🛡️ **Bảo mật Vi phạm AST Tuyệt đối (Student FAQ Privacy Invariant):**
  * Trong suốt quá trình bài nộp ở trạng thái `queued`, `judging`, hoặc `judged` **trước khi Publish**, sinh viên **KHÔNG ĐƯỢC PHÉP THẤY** bất kỳ thông tin nào về vi phạm quy tắc AST, bằng chứng dòng code vi phạm, nguồn phát hiện, hay mức trừ điểm dự kiến.
  * API `GET /api/submissions/:id` trả về cho sinh viên phải **hoàn toàn loại bỏ** các trường `verdicts`, `evidence`, `deduction`, `reviewStatus`.
* ❌ **Cách ly Ngang hàng (Peer-to-Peer Isolation):** Sinh viên không thể xem bài nộp hoặc mã nguồn của sinh viên khác trong cùng lớp (HTTP 404 Not Found).
* ❌ **Cách ly Khác lớp:** Sinh viên lớp A không thể thấy hay nộp bài vào Lab của lớp B (HTTP 404).
* ❌ **Tuyệt đối cấm các tác vụ Giảng viên & Quản trị:**
  * Sinh viên không thể xem Hàng đợi xét duyệt `queue` (HTTP 403).
  * Sinh viên không thể tự review hoặc công bố điểm Publish (HTTP 403).
  * Sinh viên không thể tạo hoặc sửa bài Lab (HTTP 403).

---

## 5. Ma Trận Phân Quyền Chi Tiết (RBAC Permission Matrix)

| Endpoint / Hành Động Nghiệp Vụ | Khách (Guest) | Sinh viên (Student) | Giảng viên (TA) | Quản trị viên (Admin) | Ghi Chú Bảo Mật / Mã Lỗi Phản Hồi |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **Đăng nhập (`POST /api/login`)** | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | ✅ Cho phép | Lỗi auth trả `401 unauthenticated` đồng nhất |
| **Đổi mật khẩu (`POST /api/users/change-password`)** | ❌ 401 | ✅ Bản thân | ✅ Bản thân | ✅ Bản thân | Lọc triệt để mass assignment (`role`, `classId`) |
| **Tạo lớp học (`POST /api/classes`)** | ❌ 401 | ❌ 403 | ❌ 403 | ✅ Cho phép | Chỉ Admin có quyền |
| **Gán giảng viên vào lớp (`POST /api/classes/:id/teachers`)** | ❌ 401 | ❌ 403 | ❌ 403 | ✅ Cho phép | Chỉ Admin có quyền |
| **Gỡ giảng viên khỏi lớp (`DELETE /api/classes/:id/teachers/:teacherId`)** | ❌ 401 | ❌ 403 | ❌ 403 | ✅ Cho phép | Chỉ Admin có quyền |
| **Xem danh sách sinh viên lớp (`GET /api/classes/:id/students`)** | ❌ 401 | ❌ 403 | ✅ Lớp mình | ✅ Mọi lớp | Khác lớp trả về `403` hoặc `404` |
| **Thêm / Gỡ sinh viên khỏi lớp (`POST/DELETE /api/classes/...`)** | ❌ 401 | ❌ 403 | ✅ Lớp mình | ✅ Mọi lớp | TA khác lớp bị chặn `403 forbidden` |
| **Xem danh sách Labs (`GET /api/labs`)** | ❌ 401 | ✅ Lớp mình | ✅ Lớp mình | ❌ Không quản lý | Tự động phân đoạn theo `user.classId` |
| **Xem chi tiết Lab (`GET /api/labs/:id`)** | ❌ 401 | ✅ Lớp mình | ✅ Lớp mình | ❌ Không quản lý | Khác lớp trả về **404 not-found** (BOLA Mitigation) |
| **Tạo bài Lab mới (`POST /api/labs`)** | ❌ 401 | ❌ 403 | ✅ Lớp mình | ❌ 403 Cấm | Chỉ Giảng viên đã có lớp mới được tạo |
| **Chỉnh sửa bài Lab (`PUT /api/labs/:id`)** | ❌ 401 | ❌ 403 | ✅ Lớp mình | ❌ 403 Cấm | Chỉ Giảng viên phụ trách lớp của bài lab |
| **Nộp bài giải C++ (`POST /api/labs/:id/submissions`)** | ❌ 401 | ✅ Lớp mình | ❌ Không nộp | ❌ Không nộp | Trả về `202 Queued`, xếp hàng chấm AST |
| **Xem tiến trình bài nộp (`GET /api/submissions/:id`)** | ❌ 401 | ✅ Bài của mình | ✅ Bài lớp mình | ❌ Không quản lý | **Privacy Invariant:** Giấu toàn bộ AST trước publish |
| **Xem Hàng đợi duyệt (`GET /api/labs/:id/queue`)** | ❌ 401 | ❌ 403 | ✅ Lớp mình | ❌ Không quản lý | TA lớp khác nhận **404 not-found** |
| **Thẩm định vi phạm AST (`POST /api/.../constraints/.../review`)** | ❌ 401 | ❌ 403 | ✅ Lớp mình | ❌ Không quản lý | Chỉ chấp nhận giá trị `confirm` hoặc `overturn` |
| **Công bố điểm số (`POST /api/labs/:id/publish`)** | ❌ 401 | ❌ 403 | ✅ Lớp mình | ❌ Không quản lý | Trả về **409 Conflict** nếu còn bài `pending` |
| **Tạo tài khoản mới (`POST /api/users`)** | ❌ 401 | ❌ 403 | ❌ 403 | ✅ Cho phép | Cấp phát tài khoản `ta` hoặc `student` |
| **Xem danh bạ người dùng (`GET /api/users`)** | ❌ 401 | ❌ 403 | ❌ 403 | ✅ Cho phép | Quản trị viên quản lý danh sách toàn trường |
| **Xóa sạch cơ sở dữ liệu (Reset Database)** | ❌ BỊ CẤM | ❌ BỊ CẤM | ❌ BỊ CẤM | ❌ ĐÃ GỠ BỎ | Chức năng bị xóa bỏ hoàn toàn khỏi hệ thống |

---

## 6. Chiến Lược Phản Hồi Mã Lỗi (RFC 7807 Problem Details)

Hệ thống tuân thủ nghiêm ngặt chuẩn bảo mật OWASP và RFC 7807 để ngăn ngừa rò rỉ dữ liệu qua mã phản hồi HTTP:

1. **`401 unauthenticated`:**
   * Sử dụng khi token Bearer không hợp lệ, hết hạn, hoặc khi đăng nhập sai thông tin.
   * Thông điệp lỗi đăng nhập sai username hoặc sai mật khẩu được **đồng nhất 100%**: `"Invalid username or password"` để triệt tiêu hoàn toàn nguy cơ **Dò quét người dùng (User Enumeration)**.
2. **`403 forbidden`:**
   * Sử dụng khi người dùng đã xác thực nhưng vai trò không có thẩm quyền thực hiện thao tác (Ví dụ: Sinh viên cố tình gọi API tạo Lab; Admin cố tình gọi API tạo Lab; Giảng viên chưa được gán lớp gọi API tạo Lab).
3. **`404 not-found` (Chiến lược Che giấu Tài nguyên - BOLA / IDOR):**
   * Được áp dụng khi một Giảng viên lớp A hoặc Sinh viên lớp A cố tình truy cập vào ID bài Lab, Hàng đợi hay Bài nộp của Lớp B.
   * Hệ thống **trả về 404 thay vì 403** để kẻ tấn công không thể suy đoán được ID đó có thực sự tồn tại trong hệ thống hay không.
4. **`409 conflict` (Bảo vệ Tính toàn vẹn Nghiệp vụ):**
   * Áp dụng khi thao tác vi phạm ràng buộc trạng thái:
     * Công bố điểm khi còn bài nộp chưa thẩm định (`slug: reviews-pending`).
     * Tạo tài khoản với username đã tồn tại.
     * Tạo lớp học với tên lớp đã tồn tại.

---

## 6. Chiến Lược Phản Hồi Mã Lỗi (RFC 7807 Problem Details)

Hệ thống tuân thủ nghiêm ngặt chuẩn bảo mật OWASP và RFC 7807 để ngăn ngừa rò rỉ dữ liệu qua mã phản hồi HTTP:

1. **`401 unauthenticated`:**
   * Sử dụng khi token Bearer không hợp lệ, hết hạn, hoặc khi đăng nhập sai thông tin.
   * Thông điệp lỗi đăng nhập sai username hoặc sai mật khẩu được **đồng nhất 100%**: `"Invalid username or password"` để triệt tiêu hoàn toàn nguy cơ **Dò quét người dùng (User Enumeration)**.
2. **`403 forbidden`:**
   * Sử dụng khi người dùng đã xác thực nhưng vai trò không có thẩm quyền thực hiện thao tác (Ví dụ: Sinh viên cố tình gọi API tạo Lab hoặc duyệt bài nộp).
3. **`404 not-found` (Chiến lược Che giấu Tài nguyên - BOLA / IDOR):**
   * Được áp dụng khi một Giảng viên lớp A hoặc Sinh viên lớp A cố tình truy cập vào ID bài Lab, Hàng đợi hay Bài nộp của Lớp B.
   * Hệ thống **trả về 404 thay vì 403** để kẻ tấn công không thể suy đoán được ID đó có thực sự tồn tại trong hệ thống hay không.
4. **`409 conflict` (Bảo vệ Tính toàn vẹn Nghiệp vụ):**
   * Áp dụng khi thao tác vi phạm ràng buộc trạng thái:
     * Công bố điểm khi còn bài nộp chưa thẩm định (`slug: reviews-pending`).
     * Tạo tài khoản với username đã tồn tại.
     * Tạo lớp học với tên lớp đã tồn tại.
