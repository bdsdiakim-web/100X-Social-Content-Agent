# QUY TẮC BẮT BUỘC: XÁC MINH SỰ THẬT TRONG CASE STUDY & SỐ LIỆU
# Áp dụng cho 100% Nội dung Fanpage BĐS của Hệ Thống 100X Agent (`/vietbai`, `/research_ideas`, `/auto_mode`)

> *"Một case study bịa ra có thể viral hôm nay, nhưng chỉ cần một người biết sự thật bắt bẻ lại — mất luôn danh xưng 'chuyên gia thực chiến' đã xây nhiều năm."*

AI TUYỆT ĐỐI KHÔNG được tự bịa ra địa danh thật + số liệu cụ thể (VD: "căn mặt phố Hàng Bông mất 30% giá trị vì lộ giới") rồi trình bày như một sự thật đã xảy ra. Đây là thông tin ảnh hưởng trực tiếp đến giá trị tài sản của người khác, rủi ro bị bắt bẻ và mất uy tín thương hiệu là có thật.

---

## 1. PHÂN LOẠI NỘI DUNG — 2 NHÓM RỦI RO KHÁC NHAU

### Nhóm A — Nguyên lý pháp lý (An toàn, ưu tiên dùng)
Giải thích *cơ chế* của luật: lộ giới là gì, cách tra cứu quy hoạch, điều kiện tách thửa, điều kiện cấp/không cấp sổ đỏ, quy trình thừa kế...
- KHÔNG cần gắn địa chỉ/tuyến phố cụ thể nào.
- Phải trích đúng số Điều, khoản, điểm của văn bản luật làm căn cứ (Luật Đất đai 2024, Bộ luật Dân sự, Luật Nhà ở, Luật Kinh doanh BĐS...).
- Nguồn tham chiếu ưu tiên: `database/legal_sources/` (văn bản luật gốc đã lưu) và `database/idea_bank.json` (trường `legal_basis` đã được kiểm chứng sẵn).

### Nhóm B — Case study có địa danh/số liệu thật (Rủi ro cao nếu không xác minh)
Chỉ được dùng khi thỏa MỘT trong hai điều kiện:
1. **Founder/chuyên gia đại diện thương hiệu trực tiếp xử lý thương vụ đó** (trải nghiệm cá nhân — an toàn nhất vì là lời kể chủ quan có thật, không phải cáo buộc tài sản người khác).
2. **Thông tin đã được tra cứu và xác minh** qua nguồn chính thống (xem mục 2).

Nếu KHÔNG thỏa điều kiện nào ở trên → không nêu tên phố/địa chỉ thật. Đổi thành ví dụ tổng quát ("một căn mặt phố khu vực phố cổ", "một trường hợp tại trung tâm Hà Nội") hoặc dùng số liệu tổng hợp ngành có ghi nguồn (Savills, CBRE, Hội Môi giới BĐS Việt Nam, Bộ Xây dựng).

---

## 2. NGUỒN XÁC MINH HỢP LỆ CHO CASE STUDY THẬT
- Cổng tra cứu quy hoạch: `quyhoach.hanoi.gov.vn` (tra theo thửa đất/tuyến phố, có bản đồ chỉ giới đường đỏ chính thức).
- Sở Quy hoạch – Kiến trúc Hà Nội, cổng thông tin UBND quận (Hoàn Kiếm, Ba Đình, Đống Đa, Hai Bà Trưng).
- Văn bản pháp luật công khai: Luật Đất đai 2024, Bộ luật Dân sự, Luật Nhà ở, Luật Kinh doanh BĐS — trích dẫn đúng số Điều.
- Báo chí chính thống đã đưa tin quy hoạch/vụ việc cụ thể → phải dẫn nguồn báo trong bài hoặc lưu link làm bằng chứng nội bộ.

---

## 3. CƠ CHẾ GẮN NHÃN BẮT BUỘC KHI CHƯA XÁC MINH ĐƯỢC
Nếu trong lúc viết bài (`/vietbai`) AI cần một case study cụ thể để tăng tính thuyết phục nhưng KHÔNG tra cứu/xác minh được nguồn ngay lúc đó:
1. AI vẫn được phép soạn case như một **ví dụ minh họa** — nhưng phải nêu rõ trong bản nháp bằng cách chèn nhãn `[CẦN XÁC MINH — Ví dụ minh họa, chưa có nguồn thật]` ngay sau đoạn đó trong `master_content.md`.
2. TUYỆT ĐỐI KHÔNG được xóa nhãn này để "làm sạch" bài trước khi trình duyệt.
3. Bài viết có nhãn `[CẦN XÁC MINH]` KHÔNG được tự động chuyển sang lệnh `/publish`. Quản trị viên phải xác nhận đã kiểm tra hoặc yêu cầu AI đổi lại thành ví dụ tổng quát (Nhóm A) trước khi đăng.

## 4. KHI TRÍCH DẪN LUẬT
- Giữ nguyên số Điều, khoản, điểm — không suy diễn hoặc mở rộng phạm vi áp dụng ngoài những gì văn bản luật quy định.
- Nếu diễn giải theo ngôn ngữ đời thường để dễ hiểu, phải đảm bảo không làm sai lệch bản chất pháp lý của điều khoản gốc.
