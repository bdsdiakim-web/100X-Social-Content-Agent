# Công thức tính tiền sử dụng đất, tiền thuê đất — Nghị định 103/2024/NĐ-CP

> Đối chiếu trực tiếp từ ảnh công thức nhúng trong file .docx gốc. Bản `nghi_dinh_103_2024_tien_su_dung_dat.txt` (trích từ PDF) có công thức bảng nhân 3 cột bị vỡ dòng — dùng file này để trích dẫn thay vì đọc trực tiếp từ .txt.

## A. Bảng % tiền sử dụng đất khi cấp Giấy chứng nhận cho đất không giấy tờ (Điều 9-11)

Công thức chung, áp dụng lặp lại cho từng mốc thời gian sử dụng đất và loại đất (đất trong hạn mức/vượt hạn mức/đất nông nghiệp chuyển mục đích):

```
Tiền sử dụng đất = Diện tích đất được công nhận × Giá đất tại Bảng giá đất × Tỷ lệ %
```

### Bảng tỷ lệ % theo mốc thời gian sử dụng đất (Điều 10 — đất không giấy tờ, không vi phạm pháp luật đất đai)

| Thời điểm sử dụng đất | Trong hạn mức đất ở | Vượt hạn mức đất ở | Đất SXKD phi NN/TM-DV | Đất NN chuyển MĐ sang phi NN |
|---|---|---|---|---|
| Trước 18/12/1980 | — | 20% | — | 30% |
| 18/12/1980 – trước 15/10/1993 | — | 40% | — | 50% |
| 15/10/1993 – trước 01/7/2004 | 20% | 50% | 60% | 60% |
| 01/7/2004 – trước 01/7/2014 | 40% | 70% | 70% | 70% |

> Căn cứ chính xác từng dòng: Điều 10 khoản 1 (trước 1980), khoản 2 (1980-1993), khoản 3 (1993-2004), khoản 4 (2004-2014) Nghị định 103/2024/NĐ-CP. Giá đất áp dụng là giá đất tại Bảng giá đất tại **thời điểm nộp đủ hồ sơ hợp lệ** (khoản 5 Điều 9).

**Điều 11** áp dụng bảng tỷ lệ tương tự nhưng cho trường hợp đất có VI PHẠM pháp luật đất đai trước 01/7/2014 (theo khoản 1,2,3 Điều 139 Luật Đất đai) — có công thức riêng theo từng mốc, cần tra trực tiếp `nghi_dinh_103_2024_tien_su_dung_dat.txt` (từ dòng 723 trở đi) nếu cần chi tiết đầy đủ, vì bảng phức tạp hơn (nhiều trường hợp con).

## B. Tiền sử dụng đất / tiền thuê đất khi điều chỉnh quy hoạch chi tiết sau đấu giá

**Trường hợp điều chỉnh toàn bộ dự án** (ảnh: `hinh_anh_cong_thuc/nd103_tien_sd_dat_dieu_chinh_qh_toan_bo.gif`):
```
Tiền sử dụng đất = [Số tiền SDĐ tính đối với toàn bộ dự án theo QH chi tiết SAU điều chỉnh
                     − Số tiền SDĐ tính đối với toàn bộ dự án theo QH chi tiết TRƯỚC điều chỉnh]
                    × (Giá trúng đấu giá / Giá khởi điểm)
```

**Trường hợp điều chỉnh cục bộ** (ảnh: `hinh_anh_cong_thuc/nd103_tien_sd_dat_dieu_chinh_qh_cuc_bo.gif`) — công thức tương tự nhưng tính trên **phần diện tích được điều chỉnh cục bộ**, không phải toàn bộ dự án.

Tương tự với **tiền thuê đất** (ảnh `nd103_tien_thue_dat_dieu_chinh_qh_toan_bo.gif` và `..._cuc_bo.gif`) — thay "Tiền sử dụng đất" bằng "Tiền thuê đất" trong công thức trên.

## C. Số tiền thuê đất phải nộp khi được giảm tiền thuê đất

Ảnh gốc: `hinh_anh_cong_thuc/nd103_tien_thue_dat_phai_nop_khi_duoc_giam.png`
```
Tiền thuê đất phải nộp của năm    Tiền thuê đất của năm    Giá trị thiệt hại được ghi tại      Giá trị các khoản hỗ trợ
được giảm tiền thuê đất theo   = được giảm tiền thuê đất − Biên bản xác định mức độ, giá trị  − của Nhà nước theo quy định
khoản này                                                  thiệt hại theo pháp luật về quản lý   của pháp luật
                                                            thuế
```

## D. Tỷ lệ (%) sử dụng lao động là người dân tộc thiểu số — căn cứ miễn/giảm tiền thuê đất

Ảnh gốc: `hinh_anh_cong_thuc/nd103_ty_le_lao_dong_dan_toc_thieu_so_mien_giam_thue_dat.png`
```
                                          Số lao động là người dân tộc thiểu số bình quân năm
Tỷ lệ (%) sử dụng lao động là người DTTS = ─────────────────────────────────────────────────── × 100
                                          Số lao động có mặt làm việc thường xuyên bình quân năm
```
- Miễn tiền thuê đất nếu tỷ lệ này ≥ 50%.
- Giảm tiền thuê đất nếu tỷ lệ này từ 30% đến dưới 50%.
