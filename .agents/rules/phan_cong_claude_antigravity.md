# Phân công Claude Code và Antigravity (ĐÃ CHỐT 2026-10-12)

> Trạng thái: quản trị viên đã chốt ngày 2026-10-12. Tuần thử số liệu: xem `scratch/nhat_ky_token.md`; có thể đổi lại sau khi có số liệu.

## 1. Ai làm gì

| Việc | Bên làm chính | Lý do |
|---|---|---|
| Sửa code, debug script, lỗi render/đăng bài | Claude Code | Đọc được cả repo, chạy lệnh, kiểm tra kết quả |
| Git: merge, push, dọn nhánh | Claude Code | Cần xử lý xung đột cẩn thận |
| Sửa công cụ (livestream→shorts, reels_engine, landing page) | Claude Code | Là code |
| Viết nội dung, ý tưởng, kịch bản, bài đăng | Antigravity | Việc hằng ngày, khối lượng lớn |
| Trả lời câu hỏi pháp lý theo `database/legal_sources/` (lệnh `cc`) | Antigravity | Đã có sẵn quy tắc trong `.agents/` |
| Vận hành hằng ngày theo `.agents/workflows/` | Antigravity | Workflow nằm sẵn ở đó |

## 2. Quy tắc tránh đụng nhau

1. Mỗi lúc chỉ MỘT bên sửa một file. Muốn bên kia sửa thì bên này dừng trước.
2. File dữ liệu đang được script ghi (`database/post_inventory.json`, `database/my_accounts.json`): không bên nào sửa tay khi có tác vụ khác đang chạy.
3. Trước khi sửa script tự động, chạy `git status` và `git diff` để chắc không có thay đổi chưa commit của bên kia.
4. Remote thật là `fork`, không phải `origin`.

## 3. Quy tắc chung cho cả hai

- Mọi thứ hiển thị cho quản trị viên viết bằng tiếng Việt (xem `language_and_interaction.md`).
- Không tự bật lịch chạy ngầm. Không tự đăng bài khi chưa có lệnh.
- Remote Control luôn bật ở mọi cửa sổ.

## 4. Đã chốt

- [x] Bên mặc định cho việc hằng ngày: Antigravity.
- [x] Chế độ mở ứng dụng: chỉ bật bên đang có việc, không bật cả hai cùng lúc.
- [x] Khi gặp lỗi code (script .js/.py): chuyển cho Claude Code qua `scratch/handover.md`.

## 5. Cầu nối bàn giao: scratch/handover.md (Lệnh tắt: `tta`)

Bên nào gặp việc của bên kia thì ghi vào `scratch/handover.md` (ghi thêm vào cuối, không xóa mục cũ). 

> **⚡ LỆNH TẮT BẮT BUỘC (`tta`):**
> Quản trị viên chỉ cần gõ đúng 3 chữ: **`tta`** (hoặc `TTA`).
> Cả Claude Code và Antigravity khi nhận được lệnh `tta` lập tức hiểu là: *"Mở file `scratch/handover.md`, đọc mục mới nhất ở cuối và tiếp tục xử lý ngay lập tức!"*, tuyệt đối không hỏi lại.

Mỗi mục gồm:
1. Đang làm việc gì?
2. File nào lỗi (đường dẫn + dòng/lệnh gây lỗi nếu có)?
3. Cần bên kia làm gì?

Bên nhận làm xong thì ghi thêm một dòng "ĐÃ XONG: ..." dưới mục đó, rồi quản trị viên quay lại bên kia gõ `tta` để bảo chạy tiếp. Không dán khóa, mật khẩu, token vào file này.

## 6. Nơi lưu file
- Sản phẩm hoàn chỉnh: `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/`
- Dữ liệu gốc, kho tri thức: `database/`
- Nháp, thử nghiệm, bàn giao: `scratch/`
