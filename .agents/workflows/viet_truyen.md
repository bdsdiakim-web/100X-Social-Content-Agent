---
description: Lệnh kích hoạt Trợ lý Kể Chuyện (Storyteller) - Chuyên gia sáng tác Truyện dài / Kịch bản Audio Tu Tiên - Xuyên Không theo Khung SB7, làm cơ sở cho Video/Audio kể chuyện.
---

# Lệnh: /viet_truyen

> [!IMPORTANT]
> **ANTI-PLANNING DIRECTIVE:** Đây là một chuỗi hành động Tự Động (Automation) tuyến tính. AI bắt buộc thực thi ngay lập tức qua Run Command / Viết File, tuyệt đối KHÔNG ĐƯỢC vào chế độ Planning Mode và KHÔNG TẠO/SỬA file Implementation Plan. Không yêu cầu người dùng xác nhận kế hoạch.

**Mục tiêu (Storyteller Specialist):** Kích hoạt hệ sinh thái làm việc của Trợ lý Kể Chuyện nhằm phát triển **Master Content** dạng Truyện dài / Kịch bản Audio (Tu Tiên, Huyền Huyễn, Xuyên Không). Đầu ra này là Lõi Dữ Liệu Tối Cao cho toàn bộ mảng Audio/Video kể chuyện của hệ sinh thái (lồng tiếng ElevenLabs, dựng B-Roll minh họa qua `/tao_video_broll`).

> ⚠️ **LUẬT THÉP KHÔNG GIA TĂNG TỆP RÁC (ZERO-GARBAGE):**
Tuyệt đối KHÔNG sử dụng phân bổ file lưu trữ nháp tại đường dẫn `/tmp/`. Mọi hồ sơ liên kết đều yêu cầu lưu trữ cấu trúc ổn định bên trong Thư mục Nguồn: `media_output/[YYYY-MM-DD]/Truyen/[Ticket_ID]/`.

---

## 🔀 Quy trình Thực thi

### Bước 1: Khởi tạo Dữ liệu Nền tảng (Pre-requisite)
- Khảo sát đầu vào từ Quản trị viên: Thể loại (mặc định Tu Tiên × Xuyên Không), Nhân vật chính, Bối cảnh, Mục tiêu sống còn của tập này.
- Nếu Quản trị viên chỉ đưa chủ đề mơ hồ (VD: "viết truyện tu tiên báo thù"), AI tự suy luận và điền các mảnh còn thiếu (tên nhân vật, mục tiêu cụ thể) theo tinh thần SB7 — KHÔNG hỏi lại quá 3 câu.
- Nếu là tập tiếp theo của một truyện đang chạy, đọc lại `master_content.md` của Ticket liền trước (cùng series) để nối mạch, giữ nhất quán nhân vật/thế giới quan.
- Truy xuất chuỗi giá trị Cột mốc Thời gian (`YYYY-MM-DD`) và phát sinh mã ID danh mục quy định tiêu chuẩn (`truyen_...`).
- Tham chiếu giọng văn thương hiệu từ `database/brand_config.json` (đại từ xưng hô, từ cấm) nếu kênh xuất bản có gắn nhãn brand.

### Bước 2: Hiệu lệnh Triệu tập Trợ Lý Kể Chuyện (Master Content)
- Tải ngay bộ Kỹ năng tại tệp: `skills/storyteller/SKILL.md`.
- Đối chiếu bắt buộc với quy tắc nền `.agents/rules/storybrand_sb7_mandate.md`.
- Phát triển MỘT TẬP TRUYỆN hoàn chỉnh (Dung lượng 1500–3000 từ, phù hợp kịch bản audio 8–15 phút), tuân thủ NGHIÊM NGẶT **7 Mắt Xích SB7 × Tu Tiên**:
  1. A Character — Nhân vật với mục tiêu sống còn cụ thể.
  2. Has a Problem — Đủ 3 tầng (External / Internal / Philosophical).
  3. Meets a Guide — Hệ Thống / Khí Linh / Kỳ Trân xuất hiện đúng lúc.
  4. Gives Them a Plan — Kế hoạch hành động rõ ràng (2–3 bước).
  5. Calls Them to Action — Tình thế buộc phải lựa chọn, không đường lùi.
  6. Helps Them Avoid Failure — Cái giá của thất bại được nêu rõ, mức cược cao.
  7. Ends in a Success & Transformation — Chiến thắng sảng khoái + nhân vật lột xác.
  - Áp dụng **Nguyên Tắc Bút Pháp Vàng**: Zero Fluff (không tả cảnh quá 3 câu), chiêu thức sống động có hình/tiếng, và BẮT BUỘC kết tập bằng một **Cliffhanger**.
  - Văn bản chảy tự nhiên, KHÔNG chèn tiêu đề công thức máy móc (cấm dùng `## Mắt xích 1`...). Chỉ dùng Markdown Heading cho tiêu đề Tập truyện thật sự.

- 🚨 **KHỞI TẠO TIỀN TRẠM (MANDATORY):** Để đảm bảo không bao giờ lỗi "File not found", hệ thống thực hiện tạo sẵn rễ thư mục:
  ```bash
  mkdir -p "media_output/[YYYY-MM-DD]/Truyen/[Ticket_ID]" && touch "media_output/[YYYY-MM-DD]/Truyen/[Ticket_ID]/master_content.md"
  ```
- **Thực thi:** AI xả Master Content trực tiếp vào file Đích vừa được khởi tạo rỗng. Không dùng file nháp.

### Bước 3: Tạo Ticket Lưu Khay Chờ (Pending Format)
Cấu trúc khởi tạo phiên chờ của Ticket, ĐẶC BIỆT KHÔNG KHAI BÁO biến tham số nội tại `media_payload`, phục vụ cơ chế nhãn đánh dấu chờ tiến trình tái định dạng hiển thị (Audio/Video):
```json
{
  "id": "[Ticket_ID]",
  "target_page": "Truyen",
  "bundle_path": "media_output/[YYYY-MM-DD]/Truyen/[Ticket_ID]",
  "format": "WAITING_FOR_COMMAND",
  "status": "pending"
}
```

### Bước 4: Đồng bộ Master Content lên Cloud
// turbo
- Thực thi: `node scripts/google_sync_engine.js --up`
- Mục tiêu: Cập nhật Tập truyện mới soạn thảo vào Tab `💡 IDEA HUB` với trạng thái `Ready` để Sếp kiểm duyệt trước khi lồng tiếng.

## 📤 Báo cáo Kết quả

Đưa ra thông báo sau khi hoàn thiện với cấu trúc hiển thị đường dẫn rõ ràng để người dùng click:

*Nội dung Tập truyện: [master_content.md](đường/dẫn/tuyệt/đối)

Xin mời bạn khởi động lệnh `/tao_video_broll` để hệ thống lồng tiếng AI (ElevenLabs) và dựng B-Roll minh họa cho tập truyện này!*

// turbo-all
