# Kho Dữ Liệu Pháp Lý — Chỉ Mục

Mỗi văn bản có 1 cặp file: `.pdf` (bản gốc) + `.txt` (đã trích xuất bằng `pdftotext -layout -enc UTF-8`, dùng để Grep/tra cứu nhanh không cần đọc PDF trực tiếp). Khi viết nội dung/video hoặc trả lời khách cần trích dẫn Điều/Khoản, luôn Grep trong file `.txt` tương ứng để lấy đúng số Điều — KHÔNG suy diễn hoặc bịa số Điều.

## Trực tiếp liên quan đến BĐS (ưu tiên cao nhất cho nội dung page)
- `luat_dat_dai_2024` — Luật Đất đai số 31/2024/QH15. Nguồn chính cho hầu hết nội dung đã làm (thừa kế, tách thửa, quy hoạch, thu hồi, tranh chấp...).
- `nghi_dinh_101_2024_dat_dai` — Nghị định 101/2024/NĐ-CP (29/7/2024). **Mới thêm 2026-09-17, độ liên quan CỰC CAO.** Hướng dẫn chi tiết thi hành Luật Đất đai 2024 về: điều tra cơ bản đất đai, đo đạc bản đồ địa chính, và đặc biệt là **đăng ký đất đai + cấp Giấy chứng nhận quyền sử dụng đất/quyền sở hữu tài sản gắn liền với đất** (hồ sơ, trình tự thủ tục, đăng ký biến động, đăng ký bằng phương tiện điện tử). Có kèm mẫu đơn thực tế (đơn tách/hợp thửa, đơn đăng ký đất đai...) — dùng được cả cho nội dung hướng dẫn khách chuẩn bị hồ sơ.
- `nghi_dinh_102_2024_dat_dai` — Nghị định 102/2024/NĐ-CP (30/7/2024). **Mới thêm 2026-09-17, độ liên quan CỰC CAO.** Quy định chi tiết thi hành nhiều điều của Luật Đất đai 2024, phạm vi rất rộng: quy hoạch/kế hoạch sử dụng đất, **thu hồi đất, trưng dụng đất** (kể cả thủ tục khiếu nại quyết định thu hồi/cưỡng chế), giao đất/cho thuê đất/chuyển mục đích sử dụng đất, chế độ sử dụng đất theo từng loại, và giải quyết tranh chấp đất đai. Kèm mẫu hợp đồng thuê đất, đơn xin giao đất/thuê đất/chuyển mục đích.
- (2 nghị định trên gộp chung 1 file PDF gốc `nghi_dinh_101_102_2024_dat_dai.pdf` do người dùng cung cấp, đã tách text thành 2 file `.txt` riêng theo đúng ranh giới từng nghị định để dễ Grep.)
- `luat_nha_o_2023` — Luật Nhà ở số 27/2023/QH15. **Mới thêm 2026-09-16.** Liên quan sở hữu nhà, chuyển nhượng nhà ở, nhà chung cư, điều kiện giao dịch nhà ở — bổ sung góc nhìn "nhà ở" bên cạnh "đất đai".
- `luat_dan_su_2015` — Bộ luật Dân sự 2015. Hợp đồng, thừa kế, giám hộ, đại diện, thời hiệu khởi kiện, hợp đồng vô hiệu.
- `bo_luat_to_tung_dan_su_2015` — Bộ luật Tố tụng Dân sự 2015. **Mới thêm 2026-09-16.** Dùng khi nội dung nói đến khởi kiện, thủ tục tại tòa, thời hiệu tố tụng.
- `bang_gia_dat_nam_2025` — Bảng giá đất Hà Nội áp dụng 2025. **Mới thêm 2026-09-16.**
- `bang_gia_dat_nam_2026` — Bảng giá đất Hà Nội áp dụng 01/01/2026–31/12/2026. **Mới thêm 2026-09-16, THAY THẾ bản cũ bị lỗi (xem mục Lưu ý bên dưới).** Nguồn dữ liệu giá đất chính thức — cực kỳ hữu ích cho video pillar "định giá" (đối chiếu giá rao vs khung giá nhà nước).
- `luat_thu_do_2026` — Luật Thủ đô 2026. **Mới thêm 2026-09-16.** Quy định đặc thù riêng cho Hà Nội (quy hoạch, đất đai, xây dựng...) — ưu tiên cao vì page hoạt động tại Hà Nội.
- `nghi_dinh_103_2024_nd_cp`, `quyet_dinh_61_2024_qd_ubnd_tach_thua_hanoi`, `thoi_diem_tinh_tien_su_dung_dat` — các văn bản dưới luật đã có từ trước, chi tiết hoá luật đất đai.

## Liên quan gián tiếp / tình huống đặc thù
- `luat_bao_ve_quyen_loi_nguoi_tieu_dung_2023` — **Mới thêm 2026-09-16.** Dùng khi khách hàng là bên mua bị lừa/thông tin sai lệch trong giao dịch có yếu tố dịch vụ (môi giới, tư vấn).
- `luat_ho_tich_2026` — **Mới thêm 2026-09-16.** Liên quan xác nhận tình trạng hôn nhân, khai sinh, khai tử — hữu ích cho các tình huống thừa kế cần xác minh quan hệ nhân thân.
- `bo_luat_to_tung_hinh_su_2015` — **Mới thêm 2026-09-16.** Dùng khi cảnh báo hành vi có thể cấu thành tội phạm (lừa đảo chiếm đoạt tài sản, làm giả giấy tờ...) trong các mục "Cách 2 — CẢNH BÁO" của internal_qa_pro.md.
- `luat_doanh_nghiep_2020` — **Mới thêm 2026-09-16.** Dùng nếu nội dung liên quan đến bên bán/mua là pháp nhân/doanh nghiệp, hoặc khách hỏi về đăng ký hộ kinh doanh cho thuê mặt bằng.
- `luat_lao_dong_2019` — **Mới thêm 2026-09-16.** Ít liên quan trực tiếp đến BĐS; giữ lại phòng khi có nội dung về hợp đồng cho thuê mặt bằng kèm nhân sự, hoặc câu hỏi ngoài lề của khách.
- `luat_to_chuc_tand_2024` — **Mới thêm 2026-09-16.** Dùng khi cần giải thích đúng thẩm quyền/cấp tòa án nào xử lý tranh chấp đất đai.

## Bổ sung 2026-09-16 (đợt 2) — 21 file mới
### Trực tiếp liên quan BĐS (ưu tiên cao)
- `luat_kinh_doanh_bat_dong_san_2023` — Luật Kinh doanh bất động sản số 29/2023/QH15. **Cực kỳ liên quan** — luật gốc điều chỉnh hoạt động môi giới, sàn giao dịch, kinh doanh BĐS. Ưu tiên hàng đầu cho nội dung page.
- `luat_thue_thu_nhap_ca_nhan_2025` — Luật số 109/2025/QH15. Liên quan trực tiếp đến thuế khi chuyển nhượng BĐS — bổ sung căn cứ cho chủ đề "hợp đồng 2 giá né thuế" đã làm trước đó.
- `luat_quan_ly_thue_2025` — Luật số 108/2025/QH15. Liên quan thủ tục kê khai, nghĩa vụ thuế khi giao dịch BĐS.
- `luat_quy_hoach_2025` — Luật số 112/2025/QH15. Liên quan các chủ đề quy hoạch treo, quy hoạch dự kiến.
- `luat_sua_doi_quy_hoach_do_thi_nong_thon_2025` — Luật số 144/2025/QH15. Bổ sung/sửa đổi quy hoạch đô thị — dùng cùng với luật quy hoạch.
- `bang_gia_dat_nam_2026` — **Bản thay thế theo yêu cầu người dùng 2026-09-16**, đã xác minh đúng nội dung (QUY ĐỊNH VỀ GIÁ CÁC LOẠI ĐẤT TRÊN ĐỊA BÀN THÀNH PHỐ HÀ NỘI, áp dụng 01/01/2026–31/12/2026).
- `luat_dau_thau_2023` — Luật số 22/2023/QH15. Liên quan nếu có nội dung về đấu giá quyền sử dụng đất.

### Ít liên quan trực tiếp đến BĐS — giữ làm kho tham chiếu chung
`luat_dau_tu_2025`, `luat_duong_bo_2024`, `luat_duong_sat_2025`, `luat_giam_sat_qh_hdnd_2025`, `luat_can_bo_cong_chuc_2025`, `luat_sua_doi_doanh_nghiep_2025`, `luat_bao_ve_du_lieu_ca_nhan_2025`, `luat_thanh_tra`, `luat_bao_hiem_tien_gui_2025`, `luat_sua_doi_so_huu_tri_tue_2025`, `luat_tri_tue_nhan_tao_2025`, `luat_thi_hanh_tam_giu_tam_giam_2025`, `luat_phong_chong_ma_tuy_2025`, `luat_chuyen_doi_so_2025` — hầu như không liên quan đến nội dung fanpage BĐS hiện tại, lưu lại theo yêu cầu người dùng để phòng khi cần tra cứu ngoài phạm vi BĐS.

### Lưu ý mismatch tên file
- File người dùng đặt tên **"Bộ luật tố tụng hình sự 2015.pdf"** thực chất có nội dung là **Luật Thi hành tạm giữ, tạm giam và cấm đi khỏi nơi cư trú (Luật số 128/2025/QH15)** — ĐÃ ĐỔI TÊN lưu trữ thành `luat_thi_hanh_tam_giu_tam_giam_2025` để không gây nhầm lẫn. Bộ luật Tố tụng Hình sự 2015 thật đã có sẵn từ đợt nạp trước (`bo_luat_to_tung_hinh_su_2015`) — không bị mất, không trùng.
- `luat_thanh_tra` — không xác định được rõ số hiệu/năm ban hành trong nội dung trích xuất được (có thể do trang chứa thông tin đó bị cắt) — cần thận trọng nếu phải trích dẫn chính xác số luật, kiểm tra lại bản gốc trước khi dùng.

## Bổ sung 2026-09-16 (đợt 3) — 5 file mới
### Trực tiếp liên quan BĐS (ưu tiên cao)
- `luat_hon_nhan_va_gia_dinh_2014` — Luật số 52/2014/QH13. **Quan trọng** — trước đây từng trích dẫn Điều 77 luật này (định đoạt tài sản riêng của con chưa thành niên) trong nội dung thừa kế nhưng CHƯA có bản gốc lưu trong kho, phải trích theo trí nhớ. Từ nay PHẢI Grep trực tiếp file này để xác nhận đúng nội dung Điều 77 và các điều liên quan tài sản chung/riêng vợ chồng khi làm nội dung ly hôn/thừa kế.
- `luat_sua_doi_xay_dung_2020` — Luật số 62/2020/QH14 (sửa đổi Luật Xây dựng). Liên quan giấy phép xây dựng, nhà xây sai phép/không phép — chủ đề tiềm năng cho video mới.

### Ít liên quan trực tiếp — giữ tham chiếu chung
- `luat_khieu_nai_2011` (số 02/2011/QH13), `luat_to_cao_2018` (số 25/2018/QH14), `luat_thi_hanh_tam_giu_tam_giam_2015` (số 94/2015/QH13) — thủ tục hành chính/tố tụng, ít liên quan trực tiếp BĐS. Lưu ý: đã có 1 file khác tên gần giống `luat_thi_hanh_tam_giu_tam_giam_2025` (số 128/2025/QH15, phát hiện trong đợt 2 do bị đặt nhầm tên) — đây là 2 luật CÙNG TÊN CHỦ ĐỀ nhưng KHÁC SỐ HIỆU/NĂM (2015 vs 2025, có thể bản 2025 thay thế bản 2015) — không nhầm lẫn hai file này với nhau.

## Bổ sung 2026-09-16 (đợt 4) — 3 file mới, độ liên quan CAO
- `luat_cong_chung_2026` — nội dung bắt đầu bằng "Số: 53/2014/QH13" (Luật Công chứng gốc 2014). Tên file ghi "2026" — CHƯA XÁC MINH RÕ đây là bản hợp nhất cập nhật đến 2026 hay chỉ là bản gốc 2014 dán nhãn theo năm tải về. **Cần kiểm tra lại trước khi trích dẫn số hiệu chính xác nếu nội dung quan trọng.** Dù vậy vẫn rất hữu ích vì mọi giao dịch chuyển nhượng BĐS đều bắt buộc công chứng — liên quan trực tiếp đến hầu hết nội dung page.
- `luat_xay_dung_2025_va_van_ban_bo_sung` — văn bản HỢP NHẤT, gốc là Luật Xây dựng số 50/2014/QH13 kèm các sửa đổi bổ sung tới 2025. File rất lớn (39.463 dòng). **Đã thay bằng bản "mới nhất" 2026-09-16** (người dùng tải bản PDF sạch hơn) — trích xuất không còn lỗi (trước đó bản cũ bị lỗi "Bad block header" 3 chỗ do PDF gốc hỏng luồng nén; đã xác nhận nội dung text 2 bản giống hệt nhau, chỉ khác ở việc PDF được re-export sạch hơn). Giờ đáng tin cậy để trích dẫn.
- `luat_xu_ly_vi_pham_hanh_chinh_2026` — văn bản HỢP NHẤT xác nhận rõ ràng ("được sửa đổi, bổ sung bởi:..."), gốc Luật số 15/2012/QH13, cập nhật đến 2026. Dùng cho các mục "Cách 2 — CẢNH BÁO" khi cần chỉ rõ mức xử phạt hành chính cho hành vi vi phạm (khai gian, lấn chiếm, xây sai phép...).

## Bổ sung 2026-09-16 (đợt 5) — 12 file theo đề xuất, 11 thành công
### Trực tiếp liên quan nghề môi giới/kinh doanh BĐS (ưu tiên cao nhất)
- `nghi_dinh_chi_tiet_luat_kdbds` — Nghị định 96/2024/NĐ-CP, quy định chi tiết Luật Kinh doanh BĐS 2023 (điều kiện hành nghề môi giới, sàn giao dịch, hoa hồng...). **Đây chính là nghị định quan trọng nhất từng đề xuất** — chi tiết hơn nhiều so với bản thân Luật KD BĐS.
- `thong_tu_dao_tao_moi_gioi` — Thông tư 04/2024/TT-BXD (Bộ Xây dựng), chương trình đào tạo kiến thức hành nghề môi giới BĐS.
- `thong_tu_bao_lanh_ngan_hang_kdbds` — Thông tư 49/2024/TT-NHNN (NHNN), bảo lãnh ngân hàng trong kinh doanh BĐS (liên quan bán nhà ở hình thành trong tương lai).
- `nghi_dinh_kdbds_ve_xay_dung` — Nghị định 94/2024/NĐ-CP. **LƯU Ý tên dễ hiểu nhầm:** "về xây dựng" ở đây nghĩa là xây dựng HỆ THỐNG THÔNG TIN/cơ sở dữ liệu nhà ở-thị trường BĐS, KHÔNG PHẢI về xây dựng công trình/giấy phép xây dựng. Đừng dùng nhầm cho chủ đề "nhà xây sai phép".

### Liên quan các chủ đề đã/sắp làm
- `luat_cac_to_chuc_tin_dung_2024_phan1` + `_phan2` (Luật số 32/2024/QH15, 2 file vì bản gốc dài chia 2 phần) — liên quan thế chấp, vay mua nhà, bảo lãnh ngân hàng.
- `luat_dau_gia_tai_san_2016` (Luật số 01/2016/QH14) — đấu giá quyền sử dụng đất, tài sản.
- `luat_giao_dich_dien_tu_2023` (Luật số 20/2023/QH15) — hợp đồng điện tử, chữ ký số, công chứng số.
- `luat_phong_chay_chua_chay_2024` (Luật số 55/2024/QH15) — PCCC, liên quan nhà mặt phố kinh doanh, chung cư mini.
- `luat_phuc_hoi_pha_san_2025` (Luật số 142/2025/QH15) — mua tài sản BĐS thanh lý từ doanh nghiệp phá sản.
- `luat_quang_cao_2012` (Luật số 16/2012/QH13) — bảo vệ chính hoạt động marketing/AhaChat của page, biết ranh giới được/không được quảng cáo.

- `luat_cu_tru_2026` — Luật Cư trú số 68/2020/QH14 (bản cập nhật/công báo 2026). **Đã khắc phục thành công** — bản scan lỗi ban đầu ("luật cư trú hợp nhất 2026") đã bị xóa, thay bằng bản PDF dạng text người dùng cung cấp lại. Có Điều 10 (Quyền, nghĩa vụ của chủ hộ và thành viên hộ gia đình về cư trú) — đúng nội dung cần cho các video liên quan "sổ đỏ ghi Hộ gia đình", xác định thành viên hộ.

## Bổ sung 2026-09-17 (đợt 6) — 13 văn bản mới, độ liên quan CỰC CAO
Người dùng cung cấp 2 file PDF tên "Văn bản hợp nhất luật đất đai 2024 phần 1/2" — thực chất KHÔNG PHẢI một bản luật hợp nhất duy nhất mà là **12 văn bản hướng dẫn thi hành Luật Đất đai 2024 gộp chung** (nguồn gốc lưu tại `nguon_goc_phan1_...pdf` và `nguon_goc_phan2_...pdf`, đã tách text theo từng văn bản để dễ Grep):

### Nhóm Nghị định (từ phần 1)
- `nghi_dinh_103_2024_tien_su_dung_dat` — NĐ 103/2024/NĐ-CP, "Quy định về tiền sử dụng đất, tiền thuê đất". **THAY THẾ bản scan lỗi cũ** (file cũ gần như trống do PDF gốc là ảnh scan — đã chuyển vào `_archive_wrong_data/`). Cực kỳ quan trọng — mọi câu hỏi về tính tiền sử dụng đất khi chuyển mục đích, ghi nợ tiền sử dụng đất đều tra ở đây.
- `nghi_dinh_123_2024_xu_phat_dat_dai` — NĐ 123/2024/NĐ-CP, xử phạt vi phạm hành chính lĩnh vực đất đai. Dùng cho phần "Cách 2 — CẢNH BÁO" khi cần nêu đúng mức phạt cụ thể (lấn chiếm, sử dụng sai mục đích, chậm đăng ký biến động...).
- `nghi_dinh_88_2024_boi_thuong_tai_dinh_cu` — NĐ 88/2024/NĐ-CP, bồi thường/hỗ trợ/tái định cư khi Nhà nước thu hồi đất. **Chủ đề rất nóng, tiềm năng viral cao** — nhiều người dân thắc mắc mức bồi thường, điều kiện tái định cư.
- `nghi_dinh_71_2024_gia_dat` — NĐ 71/2024/NĐ-CP, quy định về giá đất (phương pháp định giá, bảng giá đất, giá đất cụ thể). Dùng cùng `bang_gia_dat_nam_2025/2026` cho chủ đề định giá.
- `nghi_dinh_104_2024_quy_phat_trien_dat` — NĐ 104/2024/NĐ-CP, Quỹ phát triển đất. Ít dùng trực tiếp cho nội dung khách lẻ, giữ tham chiếu.
- `nghi_dinh_112_2024_dat_trong_lua` — NĐ 112/2024/NĐ-CP, quy định chi tiết về đất trồng lúa. Dùng khi khách hỏi về chuyển mục đích đất nông nghiệp/đất lúa sang đất ở.

### Nhóm Quyết định/Thông tư (từ phần 2)
- `thong_tu_10_2024_ho_so_dia_chinh_gcn` — TT 10/2024/TT-BTNMT, hồ sơ địa chính + **mẫu Giấy chứng nhận quyền sử dụng đất mới nhất**. Dùng chung với `nghi_dinh_101_2024_dat_dai` khi nói về sổ đỏ.
- `thong_tu_08_2024_thong_ke_kiem_ke_dat_dai` — TT 08/2024/TT-BTNMT, thống kê/kiểm kê đất đai, bản đồ hiện trạng sử dụng đất.
- `thong_tu_11_2024_dieu_tra_danh_gia_dat` — TT 11/2024/TT-BTNMT, kỹ thuật điều tra/đánh giá/bảo vệ cải tạo đất. Chuyên môn kỹ thuật, ít dùng cho nội dung khách hàng phổ thông.
- `thong_tu_09_2024_csdl_quoc_gia_dat_dai` — TT 09/2024/TT-BTNMT, cấu trúc CSDL quốc gia về đất đai. Chuyên môn kỹ thuật, ít liên quan nội dung page.
- `thong_tu_12_2024_dao_tao_dinh_gia_dat` — TT 12/2024/TT-BTNMT, đào tạo tư vấn định giá đất. Ít liên quan nội dung khách hàng.
- `thong_tu_56_2024_phi_khai_thac_du_lieu_dat` — TT 56/2024/TT-BTC, phí khai thác dữ liệu đất đai từ hệ thống thông tin quốc gia. Dùng khi khách hỏi chi phí xin trích lục/tra cứu thông tin đất.
- `quyet_dinh_12_2024_dao_tao_nghe_thu_hoi_dat` — QĐ 12/2024/QĐ-TTg (Thủ tướng), cơ chế giải quyết việc làm/đào tạo nghề cho người có đất bị thu hồi. Liên quan trực tiếp chủ đề thu hồi đất — góc nhìn "quyền lợi đi kèm" ngoài tiền bồi thường.

## Bổ sung 2026-09-17 (đợt 7) — Dựng lại công thức bị vỡ khi trích xuất PDF
Người dùng phát hiện các công thức tính giá đất/tiền sử dụng đất/bồi thường (dạng bảng, phân số) trong NĐ 71, NĐ 103, NĐ 88 bị trích xuất sai/vỡ dòng khi convert PDF→text (do các công thức này là ẢNH nhúng hoặc bảng nhiều cột trong Word gốc, không phải text thuần). Đã xin bản .docx gốc, giải nén trực tiếp XML để lấy đúng ảnh công thức nhúng (`word/media/*`), đối chiếu 100% chính xác với bản gốc. Kết quả:
- `cong_thuc_tinh_gia_dat_nd71.md` — công thức đầy đủ 4 phương pháp định giá đất (so sánh, thu nhập, thặng dư, hệ số điều chỉnh) + 2 ví dụ số hoàn chỉnh. Đặc biệt khôi phục được công thức "Tổng doanh thu/chi phí phát triển" (dạng tổng chiết khấu Σ TRᵢ/(1+r)ⁱ) — công thức này bị MẤT HOÀN TOÀN kể cả khi trích bằng pdftotext lẫn mammoth (docx→text thường), chỉ lấy được bằng cách đọc trực tiếp ảnh nhúng.
- `cong_thuc_tinh_tien_su_dung_dat_nd103.md` — bảng tỷ lệ % tiền sử dụng đất theo mốc thời gian sử dụng đất không giấy tờ (20-70% tuỳ giai đoạn 1980/1993/2004/2014) + công thức điều chỉnh quy hoạch chi tiết sau đấu giá + công thức miễn/giảm tiền thuê đất.
- `cong_thuc_boi_thuong_nd88.md` — công thức tính tiền bồi thường đất có thời hạn (Tbt), giá trị nhà/công trình đã khấu hao (Tgt), chi phí đầu tư vào đất còn lại (P) — rất hữu ích để giải thích cho khách hàng tại sao mức bồi thường thực tế thường thấp hơn kỳ vọng.
- `hinh_anh_cong_thuc/` — thư mục lưu các ảnh công thức gốc (đã đối chiếu, đặt tên rõ ràng theo nghị định + nội dung) để dùng minh hoạ trực quan trong video nếu cần, và để tự kiểm chứng lại nếu nghi ngờ.
- **Nguyên tắc rút ra:** từ nay khi cần trích công thức tính toán (không phải văn bản thuần) từ bất kỳ văn bản pháp luật nào, ưu tiên xin bản .docx gốc thay vì chỉ dùng PDF — pdftotext/mammoth đều không trích được công thức dạng ảnh/OMML nhúng, cần giải nén .docx và đọc trực tiếp ảnh trong `word/media/`.

## Bổ sung 2026-09-18 — Thừa phát lại / Vi bằng
- `nghi_dinh_08_2020_thua_phat_lai` — Nghị định 08/2020/NĐ-CP, "Về tổ chức và hoạt động của Thừa phát lại". **Lấp khoảng trống quan trọng** — trước đây kho hoàn toàn chưa có nguồn cho dịch vụ "vi bằng" (1 trong 17 dịch vụ page cung cấp). Điều 36: vi bằng là nguồn chứng cứ, KHÔNG thay thế văn bản công chứng/chứng thực. Điều 37: liệt kê các trường hợp KHÔNG được lập vi bằng — quan trọng nhất là khoản 4 (không dùng vi bằng để xác nhận nội dung/ký tên trong giao dịch thuộc phạm vi công chứng) và khoản 5 (không dùng vi bằng để chuyển quyền sử dụng/sở hữu đất đai không có giấy tờ) — đây chính là căn cứ để CẢNH BÁO khách hàng về chiêu trò lừa đảo "mua bán nhà đất bằng vi bằng" khá phổ biến. Điều 38-39: thủ tục lập vi bằng (thỏa thuận văn bản → TPL trực tiếp chứng kiến → đăng ký tại Sở Tư pháp trong 3+2 ngày làm việc).

## Bổ sung 2026-09-19/20 — 3 văn bản mới (chưa được cataloge trước đó, bổ sung 2026-09-21)
- `Thông-tư-38-2026-TT-BXD_Word` — **Thông tư 38/2026/TT-BXD** (Bộ Xây dựng, 26/6/2026), "Ban hành định mức xây dựng". Dùng khi cần căn cứ về định mức chi phí đầu tư xây dựng (đơn giá nhân công, vật tư, ca máy...) — hữu ích cho chủ đề định giá nhà/công trình xây dựng.
- `Nghị định 253 và thông tư 87 về thuế thu nhập cá nhân` — chứa GỘP 2 văn bản trong 1 file: **Nghị định 253/2026/NĐ-CP** (30/6/2026, hướng dẫn chi tiết thi hành Luật Thuế TNCN 109/2025/QH15) + **Thông tư 87/2026/TT-BTC** (Bộ Tài chính, hướng dẫn thêm). Liên quan trực tiếp thuế khi chuyển nhượng BĐS. **Lưu ý kỹ thuật:** phần text bị lẫn mã XML thô của Word (`w14:paraId=...` ở đầu mỗi dòng) do trích xuất chưa sạch — Grep vẫn ra đúng nội dung nhưng nên trích lại bằng cách sạch hơn (mammoth/pandoc) nếu cần đọc liền mạch, và nên tách thành 2 file riêng theo đúng số hiệu văn bản để tránh nhầm nguồn khi trích dẫn.
- `nghi_quyet_254_2025_thao_go_dat_dai` — **Nghị quyết số 254/2025/QH15 của QUỐC HỘI** (không phải Nghị định của Chính phủ — dễ nhầm vì cùng số "254"), ký 11/12/2025, "Quy định một số cơ chế, chính sách tháo gỡ khó khăn, vướng mắc trong tổ chức thi hành Luật Đất đai". Khi trích dẫn PHẢI ghi đúng là "Nghị quyết 254/2025/QH15", không được gọi nhầm là "Nghị định 254".

## Lưu ý quan trọng
- File `bang_gia_dat_nam_2026` cũ (nguồn .docx) bị phát hiện **gắn nhầm tên** — nội dung thực tế là Quyết định 05/2006/QĐ-UBND (giá đất năm **2006**, không phải 2026). Đã chuyển vào `_archive_wrong_data/` để không bị dùng nhầm. Từ 2026-09-16, `bang_gia_dat_nam_2026.pdf/.txt` là bản ĐÚNG (trích từ PDF chính thức người dùng cung cấp).
- File `nghi_dinh_103_2024_nd_cp.txt` (117 bytes, bản scan lỗi) — **ĐÃ THAY THẾ 2026-09-17** bằng `nghi_dinh_103_2024_tien_su_dung_dat.txt` trích từ bản PDF sạch người dùng cung cấp lại (xem đợt 6). Bản cũ đã chuyển vào `_archive_wrong_data/`, không dùng nữa.
- Khi trích PDF tiếng Việt mới bằng `pdftotext`, LUÔN dùng cờ `-layout -enc UTF-8` — thiếu `-enc UTF-8` sẽ ra chữ bị lỗi font (dấu hỏi/ô vuông) dù không báo lỗi gì, rất dễ bị bỏ sót nếu không kiểm tra lại.
