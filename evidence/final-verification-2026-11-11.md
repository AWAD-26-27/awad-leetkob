# Xác minh bản tích hợp — 11/11/2026

Báo cáo bổ sung dựa trên các lệnh thực sự chạy trong lượt xác minh này. Kết quả được ghi lúc **2026-11-11 12:35:48 UTC / 19:35:48 UTC+7**. Không sử dụng kết quả của baseline cũ để thay thế lần kiểm tra này.

## 1. Phiên bản chính xác được kiểm tra

| Mục | Giá trị |
| --- | --- |
| Repository | https://github.com/AWAD-26-27/awad-leetkob |
| Branch nguồn | `main` |
| SHA được clone và kiểm tra | **`5070b6c963ee953481545a14c0cce2f77abdff8c`** |
| Nội dung tích hợp | Merge PR #7, gồm contract mở rộng và 12 contract tests |
| Đối chiếu remote | GitHub REST API `/repos/AWAD-26-27/awad-leetkob/branches/main` trả cùng SHA khi bắt đầu xác minh |
| Branch chứa báo cáo mới | `docs/pa2-verification-evidence` |
| Tag nộp bài | Chưa tạo hoặc kiểm tra `pa2` trong lượt này |

Đây là xác minh application đã tích hợp tới PR #7. Commit hồ sơ `f7c92d0` trên `docs/pa2-final-sync` chưa nằm trong main ở SHA này. Sau khi merge các PR hồ sơ cuối, Tú vẫn cần xác nhận CI trên commit/tag nộp thực tế; báo cáo này không tuyên bố đã kiểm tra một SHA chưa tồn tại.

## 2. Clean clone và cài dependencies

Lệnh đã chạy, exit code **0**:

```sh
git clone --no-local --branch main \
  /home/loriant/Projects/web-homework/PA/awad-leetkob \
  /tmp/pa2-verification-20261111-E3Pn1I/clone
```

Đây là clone độc lập qua local upload-pack, với `--no-local` để không dùng tối ưu hardlink Git objects. Source SHA được đối chiếu với GitHub API; không tuyên bố đây là một lần clone trực tiếp từ GitHub qua HTTPS.

Đã xác nhận trước khi cài đặt:

- `git rev-parse HEAD` trả đúng SHA ở mục 1.
- `git status --porcelain=v1` không có output.
- Clone không chứa `.env` hoặc `node_modules`.
- Không sao chép dependencies hay credential từ working tree gốc.

Cài dependencies trong container Node 22, thư mục làm việc là clone sạch:

```sh
docker run --rm --user 1000:1000 \
  --mount type=bind,src=/tmp/pa2-verification-20261111-E3Pn1I/clone,dst=/work \
  --workdir /work --env NODE_ENV=development \
  --env npm_config_cache=/tmp/npm-cache \
  --entrypoint npm node:22-bookworm-slim ci
```

| Lệnh | Exit code | Kết quả |
| --- | --- | --- |
| `npm ci` | **0** | Cài 90 packages, audit 91 packages, 0 vulnerabilities theo output lần chạy |

Bằng chứng: [npm-ci.log](verification-2026-11-11/npm-ci.log), [kết quả có cấu trúc](verification-2026-11-11/results.json). Sau toàn bộ checks/E2E, `git status --porcelain=v1` của clone vẫn không có output; không sửa source/tests để chạy qua.

## 3. Môi trường và kết quả npm run check đầy đủ

| Thành phần | Giá trị thực tế |
| --- | --- |
| Node.js / npm | **22.23.4 / 10.9.9** |
| Hệ điều hành container | Debian bookworm, Linux x86_64 |
| Image chạy install/check | `node:22-bookworm-slim` |
| Image ID | `sha256:4b150b48b4116e2a22f2c39cc27025fbf4f153e2078fd3b14d159fdb5c7279da` |
| Network khi chạy tests | `none`; loopback nội bộ container vẫn hoạt động |

Lệnh đã chạy:

```sh
docker run --rm --network none --user 1000:1000 \
  --mount type=bind,src=/tmp/pa2-verification-20261111-E3Pn1I/clone,dst=/work \
  --workdir /work --env CI=true \
  --entrypoint npm node:22-bookworm-slim run check
```

**Exit code của toàn bộ `npm run check`: 0.** Không chỉ chạy riêng unit/contract bằng một lệnh khác với gate.

| Bước của check | Kết quả |
| --- | --- |
| `npm run lint` | Đạt |
| `npm run format:check` | Đạt |
| `npm test` | **5/5 pass**, 0 fail, 0 skipped, 0 cancelled |
| `npm run contract` | **12/12 pass**, 0 fail, 0 skipped, 0 cancelled |

Bằng chứng: [npm-run-check.log](verification-2026-11-11/npm-run-check.log).

Log có `ExperimentalWarning` của SQLite và `Error: Simulated database failure` do fixture chủ động kích hoạt nhánh 500. Test `internal server error returns 500 problem details` vẫn pass; đây không phải lỗi bị nuốt để lấy exit code xanh.

## 4. E2E trên cùng clone/SHA

| Thành phần | Giá trị thực tế |
| --- | --- |
| Node.js / npm | **22.23.4 / 10.9.9** |
| Playwright theo lockfile | **1.64.1** |
| Browser | Chromium **155.0.8059.79**, `/usr/bin/chromium` |
| Image có sẵn browser và dependencies | `scripthammer-scripthammer:latest` |
| Image ID | `sha256:e43ef8d7ff5306e0a9566e9f5295d96758b2a434596741e4c013ff1fa644b57d` |
| Cấu hình | `CI=true`, `CHROME_PATH=/usr/bin/chromium`, shared memory 256 MiB |
| Network | `none`; frontend/API/browser dùng loopback trong container |

Lệnh tương đương đã chạy; lượt thực thi có thêm mount/log redirection để giữ transcript và trả nguyên exit code của npm:

```sh
docker run --rm --network none --user 1000:1000 --shm-size=256m \
  --mount type=bind,src=/tmp/pa2-verification-20261111-E3Pn1I/clone,dst=/work \
  --workdir /work --env CI=true --env CHROME_PATH=/usr/bin/chromium \
  --entrypoint npm scripthammer-scripthammer:latest run e2e
```

**Exit code 0; 1/1 E2E pass**, thời gian Playwright báo 3.0 giây. Hành trình TA review bài pending rồi Publish thành công. Tổng lần này: **17 unit/contract tests + 1 browser test**.

Bằng chứng: [npm-run-e2e.log](verification-2026-11-11/npm-run-e2e.log).

Host của công cụ chặn HTTP listen (`EPERM`), nên lượt xác minh này dùng container để chạy HTTP thật. `CHROME_PATH` là tùy chọn sẵn có của project; không thay Playwright config hoặc tests. Browser local verification khác browser do job GitHub tải bằng `playwright install`; không đồng nhất lượt Docker này với GitHub Actions run hoặc tag run.

## 5. Gitleaks scan mới: version, lệnh, phạm vi và exit code

### Công cụ và integrity

- Gitleaks **8.30.1**, binary Linux x64 từ [release chính thức](https://github.com/gitleaks/gitleaks/releases/tag/v8.30.1).
- Archive SHA-256: **`551f6fc83ea457d62a0d98237cbad105af8d557003051f41f3e7ca7b3f2470eb`**.
- Hash archive khớp file checksums của cùng release trước khi extract/chạy.
- Default rules, `--redact=100`; không bổ sung allowlist để bỏ qua findings.

### Scan A — Lịch sử của tất cả refs đang có

Lệnh đã chạy trên repo nguồn, với các đường dẫn thực tế được lưu trong `results.json`:

```sh
gitleaks git . --log-opts="--all --full-history" \
  --redact=100 --no-banner --report-format json \
  --report-path <evidence-directory>/gitleaks-history.json
```

Phạm vi: mọi refs local và remote-tracking có trong [scanned-refs.txt](verification-2026-11-11/scanned-refs.txt), gồm cả evidence branches và `origin/docs/pa2-final-sync`. Git có **23 commits reachable** tính cả merge; Gitleaks báo **17 commits scanned** có diff, khoảng **226,423 bytes**. Hai con số dùng cách đếm khác nhau, không phải 6 commits bị loại khỏi phạm vi.

Đã lấy danh sách branch tips qua GitHub API và xác nhận cả **8/8 remote branch tips** đều reachable từ refs được scan. Không nhận đã quét refs ẩn, refs chưa có trên máy hoặc commit tương lai.

**Exit code 0, 0 findings.** [Log](verification-2026-11-11/gitleaks-history.log), [JSON report](verification-2026-11-11/gitleaks-history.json).

### Scan B — Nội dung tracked của đúng SHA được kiểm tra

Tạo snapshot bằng `git archive HEAD` từ clone đúng SHA ở mục 1 rồi giải nén vào thư mục riêng. Snapshot có **38 files**, không `.env`, không dependencies/test outputs, không `.git`; lịch sử Git được kiểm tra riêng ở Scan A.

```sh
gitleaks dir <tracked-snapshot> \
  --redact=100 --no-banner --report-format json \
  --report-path <evidence-directory>/gitleaks-tree.json
```

**Exit code 0, 0 findings**, khoảng **115,432 bytes**. [Log](verification-2026-11-11/gitleaks-tree.log), [JSON report](verification-2026-11-11/gitleaks-tree.json).

### Scan C — Kiểm tra thêm nội dung ứng viên gồm tài liệu mới

Sau khi tạo báo cáo và logs, lấy danh sách bằng `git ls-files --cached --others --exclude-standard -z` rồi copy đúng các file đó sang snapshot riêng. Phạm vi này có **48 files**, gồm AI log/tài liệu verification chưa commit, không lấy `.env`, dependencies hoặc `.git`. Dùng cùng Gitleaks 8.30.1, default rules và flags redaction/report như Scan B.

**Exit code 0, 0 findings**, khoảng **136,240 bytes**. [Log](verification-2026-11-11/gitleaks-candidate.log), [JSON report](verification-2026-11-11/gitleaks-candidate.json). Các file kết quả của Scan C và cập nhật tóm tắt kết quả phát sinh sau snapshot; không tuyên bố chúng đã có trong chính snapshot 48 files đó.

Scanner không đọc hoặc xuất credential local để phục vụ báo cáo. Các JSON reports đều là `[]`; scan không phát hiện secret không phải bảo đảm phát hiện được mọi định dạng secret có thể có.

## 6. Kết luận và giới hạn bàn giao

- Đã kiểm tra thực tế clean clone, `npm ci`, toàn bộ `npm run check`, E2E và Gitleaks như yêu cầu.
- [results.json](verification-2026-11-11/results.json) gắn mỗi kết quả với source SHA, commands, môi trường, exit code và phạm vi.
- Không gọi model thật, không gửi code sinh viên, không cần `.env` trong clone để chạy tests.
- Không tuyên bố đã tạo ZIP, nộp bài, tạo tag pa2 hoặc xác minh CI trên một commit/tag khác SHA được ghi trong báo cáo.
- Nam Anh có thể dẫn báo cáo này từ PA2.md; Tú kiểm tra CI trên commit/tag cuối sau khi các PR hồ sơ đã merge.
