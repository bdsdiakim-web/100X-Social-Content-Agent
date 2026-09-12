# QUY TẮC BẮT BUỘC: GÓI TỰ ĐỘNG HÓA AHACHAT ĐI KÈM MỖI BÀI VIẾT
# Áp dụng cho mọi bài viết fanpage "Vua Mặt Phố Hà Nội" tạo qua `/vietbai`

> Mục tiêu: Mỗi bài đăng không chỉ là nội dung — mà phải đi kèm đủ dữ liệu để Sếp cấu hình luồng auto-reply trên AhaChat ngay, khớp với `sales_funnel_model` ở `database/strategy.json` (Bước 1 MIỄN PHÍ qua comment → Bước 2 báo giá riêng trong Messenger).

Sau khi hoàn thành `master_content.md`, AI BẮT BUỘC tạo thêm file `ahachat_package.md` trong cùng thư mục Ticket, gồm đủ 3 khối sau:

## -1. NGOẠI LỆ — "TIN THỜI SỰ" KHÔNG ÁP DỤNG QUY TẮC NÀY
Bài dạng `delivery_format: "news"` (tin thời sự tổng hợp từ báo chí, đăng tự động 3 lần/ngày — sáng/trưa/tối, không có CTA, không mời nhắn tin/comment từ khóa) hoạt động HOÀN TOÀN ĐỘC LẬP với hệ thống AhaChat. KHÔNG cần tạo `ahachat_package.md` cho loại bài này.

## 0. LƯU Ý QUAN TRỌNG — KÊNH KÍCH HOẠT LÀ TIN NHẮN, KHÔNG PHẢI COMMENT
Gói AhaChat hiện tại (Free) chỉ tự động trả lời qua **tin nhắn Messenger trực tiếp** (mục "Trả lời tự động"), KHÔNG tự động trả lời khi khách chỉ **comment** dưới bài viết — tính năng "Trigger" (comment → tự động nhắn riêng) thuộc gói trả phí (từ 700k/tháng) và hiện chưa mua. Vì vậy PHẦN 7 của bài viết phải mời khách **nhắn tin (inbox)** kèm từ khóa, không chỉ mời comment. Nếu khách chỉ comment mà không nhắn tin, đội ngũ cần tự tay rep comment đó.

## 1. TỪ KHÓA KÍCH HOẠT
- Lấy đúng từ khóa đã mời gọi ở PHẦN 7 (CTA MỀM) của bài viết.
- Liệt kê thêm 1-2 biến thể viết hoa/không dấu mà AhaChat cần khai vào rule khớp từ khóa (VD: "TƯ VẤN THỪA KẾ" / "tu van thua ke" / "THỪA KẾ").

## 2. COMMENT MẪU CỦA KHÁCH (5-8 mẫu, để test rule khớp từ)
Phải bao phủ các kiểu comment thực tế, không chỉ gõ đúng từ khóa:
- Gõ đúng từ khóa, không kèm gì khác.
- Từ khóa kèm câu hỏi thêm ("TƯ VẤN THỪA KẾ ạ, nhà em 3 anh em chưa thống nhất thì sao?").
- Gõ tắt/thiếu dấu/sai chính tả nhẹ.
- Chỉ thả emoji + từ khóa.
- 1 mẫu KHÔNG chứa đúng từ khóa nhưng cùng ý định (để nhắc Sếp: AhaChat sẽ không tự bắt được câu này, cần rule riêng hoặc duyệt tay).

## 3. KỊCH BẢN TRẢ LỜI TỰ ĐỘNG (Auto-reply flow cho Messenger)
Theo đúng 2 bước của phễu — **auto-reply CHỈ được thực hiện Bước 1 (miễn phí), TUYỆT ĐỐI KHÔNG báo giá hay số tiền cụ thể trong bot**:

### Tin nhắn mở đầu (gửi ngay khi khớp từ khóa)
- Thấu cảm + xưng hô đúng tone `brand_config.json`.
- Xác nhận đã nhận yêu cầu, mời khách vào 1-2 câu hỏi định tuyến (quick-reply dạng nút bấm).

### Câu hỏi định tuyến theo dịch vụ (chọn đúng nhánh theo pillar bài viết)
- **pillar_2 (Pháp lý):** "Bạn đang cần kiểm tra: 🅰️ Quy hoạch/chỉ giới  🅱️ Tranh chấp  🅲️ Vấn đề sổ đỏ khác"
- **pillar_1 (Định giá):** "Bạn định giá để: 🅰️ Bán  🅱️ Mua  🅲️ Vay ngân hàng/thế chấp"
- **pillar_6 (Thừa kế):** "Tình trạng hiện tại: 🅰️ Đã có di chúc  🅱️ Chưa có di chúc  🅲️ Nhiều đồng thừa kế chưa đồng thuận"
- **pillar_7 (Sổ đỏ):** "Bạn cần: 🅰️ Cấp mới  🅱️ Tách thửa  🅲️ Sang tên"

### Tin nhắn chốt (sau khi khách chọn nhánh)
- Xác nhận đã ghi nhận đúng nhu cầu, mời để lại SĐT/Zalo để đội ngũ liên hệ tư vấn/thẩm định sơ bộ MIỄN PHÍ trong khung giờ cụ thể (VD: trong 24h).
- Có thể tặng kèm 1 checklist ngắn liên quan để tăng thiện cảm chờ đợi.
- **Không** đưa bất kỳ con số phí dịch vụ nào — việc báo giá trọn gói để nhân viên thật thực hiện sau khi xem hồ sơ.

### Follow-up (nếu khách không để lại SĐT/Zalo sau ~2 giờ)
- 1 tin nhắn nhắc nhẹ nhàng, không dồn ép, nhắc lại giá trị của buổi tư vấn miễn phí.

---

**Vị trí lưu:** `media_output/[YYYY-MM-DD]/[Kênh]/[Ticket_ID]/ahachat_package.md`, đi kèm `master_content.md` của cùng bài viết đó.
