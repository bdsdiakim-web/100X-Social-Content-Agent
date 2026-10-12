# CÂY TRA CỨU DỮ LIỆU TỈNH/THÀNH (bảng giá đất + quy định vị trí)

> File này TỰ SINH bởi `node scripts/build_cay_tinh.js` — đừng sửa tay, chạy lại script khi thêm file.
> Nguồn: bản copy từ D:\KHO_PHAP_LUAT_DAT_DAI (bản gốc giữ nguyên). Hà Nội nằm ở INDEX.md, không ở đây.
> Cách dùng: tìm tỉnh → mở file .txt → Grep trực tiếp trước khi trích (cùng nguyên tắc với INDEX.md).
> Tên tỉnh theo tên thư mục gốc (không dấu). "(anh)" = nguồn là ảnh, đã OCR, có thể sai chữ/số → đối chiếu bản gốc.

## Cấu trúc
```
database/legal_sources/tinh_thanh/
├── van_ban_txt/<Tinh>/*.txt     văn bản bảng giá đất từng tỉnh (chuyển từ PDF/Word)
├── quy_dinh_vi_tri/<Tinh>.txt   quy định xác định vị trí/khu vực của tỉnh
└── bang_gia_json/<Tinh>.jsonl   dòng giá trích TỰ ĐỘNG (khu, đường, từ-đến, giá): chỉ để lọc nhanh,
                                 PHẢI đối chiếu .txt/bản gốc trước khi trích số cho khách
```
Bản gốc PDF/Word (không có trên GitHub): D:\KHO_PHAP_LUAT_DAT_DAI\VAN_BAN_GOC\<Tinh>\

## Danh mục (34 tỉnh/thành)

| Tỉnh/thành | Văn bản txt | Quy định vị trí | Dữ liệu giá (jsonl) | Bản gốc trên D: |
|---|---|---|---|---|
| An Giang | `van_ban_txt/An Giang/Bang gia dat tinh AG 2026.txt` (763 KB)<br>`van_ban_txt/An Giang/Quyết định 16 tỉnh An Giang về giá đất 2026.txt` (26 KB) | `quy_dinh_vi_tri/An Giang.txt` | `bang_gia_json/An Giang.jsonl` (2070 KB) | có |
| Bac Ninh (anh) | `van_ban_txt/Bac Ninh (anh)/` (9 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Bac Ninh (anh).txt` | `bang_gia_json/Bac Ninh (anh).jsonl` (10477 KB) | có |
| Ca Mau | `van_ban_txt/Ca Mau/bang-gia-dat.txt` (939 KB)<br>`van_ban_txt/Ca Mau/Ca Mau.txt` (962 KB)<br>`van_ban_txt/Ca Mau/Nghi quyet 16 của Ca Mau ve bang gia dat 2026.txt` (22 KB) | `quy_dinh_vi_tri/Ca Mau.txt` | `bang_gia_json/Ca Mau.jsonl` (3389 KB) | có |
| Can tho | `van_ban_txt/Can tho/` (9 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Can tho.txt` | `bang_gia_json/Can tho.jsonl` (3259 KB) | có |
| Cao Bang | `van_ban_txt/Cao Bang/nq-34-cao-bang-phu-lucpdf.txt` (427 KB)<br>`van_ban_txt/Cao Bang/nq-34-cao-bang.txt` (18 KB) | `quy_dinh_vi_tri/Cao Bang.txt` | `bang_gia_json/Cao Bang.jsonl` (777 KB) | có |
| Da Nang | `van_ban_txt/Da Nang/` (11 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Da Nang.txt` | `bang_gia_json/Da Nang.jsonl` (3670 KB) | có |
| Daklak | `van_ban_txt/Daklak/` (14 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Daklak.txt` | `bang_gia_json/Daklak.jsonl` (8619 KB) | có |
| Dien Bien | `van_ban_txt/Dien Bien/28_2025_NQ-HDND_686976 (1).txt` (849 KB)<br>`van_ban_txt/Dien Bien/dat-nong-nghiep.txt` (207 KB)<br>`van_ban_txt/Dien Bien/dat-o-do-thi.txt` (287 KB)<br>`van_ban_txt/Dien Bien/dat-o-nong-thon.txt` (368 KB)<br>`van_ban_txt/Dien Bien/dat-san-xuat-kinh-doanh-tai-do-thi.txt` (206 KB)<br>`van_ban_txt/Dien Bien/dat-san-xuat-kinh-doanh-tai-nong-thon.txt` (336 KB)<br>`van_ban_txt/Dien Bien/dat-thuong-mai-dich-vu-tai-do-thi.txt` (215 KB)<br>`van_ban_txt/Dien Bien/dat-thuong-mai-dich-vu-tai-nong-thon.txt` (350 KB) | `quy_dinh_vi_tri/Dien Bien.txt` | `bang_gia_json/Dien Bien.jsonl` (4616 KB) | có |
| Dong Nai (anh) | `van_ban_txt/Dong Nai (anh)/` (51 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Dong Nai (anh).txt` | `bang_gia_json/Dong Nai (anh).jsonl` (21354 KB) | có |
| Dong Thap | `van_ban_txt/Dong Thap/2_Phu_luc_1_at_Nong_nghiep (1).txt` (21 KB)<br>`van_ban_txt/Dong Thap/3__Phu_luc_2a_at_o_vi_tri_cac_tuyen_uong_tai_xa.txt` (284 KB)<br>`van_ban_txt/Dong Thap/4_Phu_luc_2b_at_o_Nong_thon (1).txt` (8 KB)<br>`van_ban_txt/Dong Thap/5__Phu_luc_3_Bang_gia_at_o_tai_o_thi.txt` (126 KB)<br>`van_ban_txt/Dong Thap/6_Phu_luc_4_at_khu_kinh_te__cong_nghiep.txt` (3 KB)<br>`van_ban_txt/Dong Thap/Nghi quyet 01 cua Dong Thap ve bang gia dat 2026.txt` (35 KB) | `quy_dinh_vi_tri/Dong Thap.txt` | `bang_gia_json/Dong Thap.jsonl` (1522 KB) | có |
| Gia lai | `van_ban_txt/Gia lai/BGD-tinh-Gia-Lai-nam-2026.txt` (2388 KB)<br>`van_ban_txt/Gia lai/Nghị quyết 23 về giá đất Gia Lai 2026.txt` (23 KB) | `quy_dinh_vi_tri/Gia lai.txt` | `bang_gia_json/Gia lai.jsonl` (5038 KB) | có |
| Ha Tinh | `van_ban_txt/Ha Tinh/bang-gia-dat-o-do-thi-ha-tinh.txt` (178 KB)<br>`van_ban_txt/Ha Tinh/bang-gia-dat-o-nong-thong-ha-tinh.txt` (579 KB) | `quy_dinh_vi_tri/Ha Tinh.txt` | `bang_gia_json/Ha Tinh.jsonl` (1924 KB) | có |
| Hai Phong | `van_ban_txt/Hai Phong/Hai Phong NQ85_PL1234.txt` (924 KB) | `quy_dinh_vi_tri/Hai Phong.txt` | `bang_gia_json/Hai Phong.jsonl` (1735 KB) | có |
| Ho Chi Minh | `van_ban_txt/Ho Chi Minh/Bảng giá đất 2026 Bà Rịa Vũng Tàu nay thuộc HCM.txt` (230 KB)<br>`van_ban_txt/Ho Chi Minh/HCM 9.1. NQ Bang gia dat nam 2026.txt` (31 KB)<br>`van_ban_txt/Ho Chi Minh/HCM phu-luc-bang-gia-dat-tp-hcm.txt` (1777 KB) | `quy_dinh_vi_tri/Ho Chi Minh.txt` | `bang_gia_json/Ho Chi Minh.jsonl` (3916 KB) | có |
| Hung Yen | `van_ban_txt/Hung Yen/Bang gia dat Hung Yen 2026 . P1.txt` (890 KB)<br>`van_ban_txt/Hung Yen/Bang gia dat Hung Yen 2026 . P2.txt` (754 KB)<br>`van_ban_txt/Hung Yen/Bang gia dat Hung Yen 2026 . P3.txt` (1072 KB)<br>`van_ban_txt/Hung Yen/Bang gia dat Hung Yen 2026 . P4.txt` (867 KB)<br>`van_ban_txt/Hung Yen/Nghị quyết 812 quy định bảng giá đất Hưng Yên.txt` (24 KB)<br>`van_ban_txt/Hung Yen/Nghị-quyết-812-2025-NQ-HĐND_OCR.txt` (786 KB) | `quy_dinh_vi_tri/Hung Yen.txt` | `bang_gia_json/Hung Yen.jsonl` (6149 KB) | có |
| Khanh Hoa | `van_ban_txt/Khanh Hoa/bang-gia-dat-khanh-hoa-2026-1.txt` (921 KB)<br>`van_ban_txt/Khanh Hoa/bang-gia-dat-khanh-hoa-2026-2.txt` (240 KB)<br>`van_ban_txt/Khanh Hoa/Nghị quyết 15.2025 quy định giá đất Tỉnh Khánh Hòa.txt` (1 KB)<br>`van_ban_txt/Khanh Hoa/Nghị quyết 15.2025 quy định giá đất Tỉnh Khánh Hòa_OCR.txt` (42 KB) | `quy_dinh_vi_tri/Khanh Hoa.txt` | `bang_gia_json/Khanh Hoa.jsonl` (2187 KB) | có |
| Lai chau | `van_ban_txt/Lai chau/Bang gia dat Lai Chau 2026.txt` (316 KB) | — | `bang_gia_json/Lai chau (da co txt).jsonl` (802 KB) | — |
| Lai chau (da co txt) | `van_ban_txt/Lai chau (da co txt)/Bang gia dat Lai Chau 2026.txt` (348 KB) | `quy_dinh_vi_tri/Lai chau (da co txt).txt` | — | có |
| Lam Dong | `van_ban_txt/Lam Dong/VanBanGoc_PHU LUC KEM THEO 82.2025.NQ-HĐND.txt` (4022 KB) | `quy_dinh_vi_tri/Lam Dong.txt` | `bang_gia_json/Lam Dong.jsonl` (7378 KB) | có |
| Lang Son | `van_ban_txt/Lang Son/` (68 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Lang Son.txt` | `bang_gia_json/Lang Son.jsonl` (4688 KB) | có |
| Lao Cai | `van_ban_txt/Lao Cai/19-PL2.txt` (326 KB)<br>`van_ban_txt/Lao Cai/19-PL3.txt` (571 KB)<br>`van_ban_txt/Lao Cai/Bang gia dat Lao cai 2026.txt` (22 KB)<br>`van_ban_txt/Lao Cai/PL1-NQ-19.txt` (1 KB) | `quy_dinh_vi_tri/Lao Cai.txt` | `bang_gia_json/Lao Cai.jsonl` (1442 KB) | có |
| Nghe An | `van_ban_txt/Nghe An/Bang gia dat nghe an 2026.txt` (462 KB) | `quy_dinh_vi_tri/Nghe An.txt` | `bang_gia_json/Nghe An.jsonl` (825 KB) | có |
| Ninh Binh | `van_ban_txt/Ninh Binh/Phụ lục 1_Đất ở tại đô thị_Kèm NQ 38-2025.txt` (412 KB)<br>`van_ban_txt/Ninh Binh/Phụ lục 2_Đất ở tại nông thôn_Kèm NQ 38-2025.txt` (562 KB)<br>`van_ban_txt/Ninh Binh/Phụ lục 3_ Đất SKC+TMDV đô thị_Kèm NQ 38-2025.txt` (546 KB)<br>`van_ban_txt/Ninh Binh/Phụ lục 4_Đất SKC+TMDV Nông thôn_Kèm NQ 38-2025.txt` (676 KB)<br>`van_ban_txt/Ninh Binh/Phụ lục 5_ Đất khu cụm công nghiệp kem NQ 38-2025.txt` (11 KB)<br>`van_ban_txt/Ninh Binh/Phụ lục 6_Đất sử dụng cho hoạt động khoáng sản kem theo NQ 38-2025.txt` (2 KB)<br>`van_ban_txt/Ninh Binh/Quyet dinh 38 gia dat 2026 tinh Ninh bình.txt` (22 KB) | `quy_dinh_vi_tri/Ninh Binh.txt` | `bang_gia_json/Ninh Binh.jsonl` (4823 KB) | có |
| Phu Tho | `van_ban_txt/Phu Tho/` (153 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Phu Tho.txt` | `bang_gia_json/Phu Tho.jsonl` (3339 KB) | có |
| Quang Ngai | `van_ban_txt/Quang Ngai/Bang gia chi tiết Quang Ngai.txt` (894 KB)<br>`van_ban_txt/Quang Ngai/NQ-40-2025 Quảng Ngãi ban hành giá đất 2026.txt` (12 KB) | `quy_dinh_vi_tri/Quang Ngai.txt` | `bang_gia_json/Quang Ngai.jsonl` (1593 KB) | có |
| Quang Ninh (anh) | `van_ban_txt/Quang Ninh (anh)/` (14 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Quang Ninh (anh).txt` | `bang_gia_json/Quang Ninh (anh).jsonl` (4814 KB) | có |
| Quang tri | `van_ban_txt/Quang tri/Bang-gia-dat-Quang-Tri-2026.txt` (9749 KB)<br>`van_ban_txt/Quang tri/Nghi quyet 12 về bảng giá đất 2026 Quảng Trị.txt` (1 KB)<br>`van_ban_txt/Quang tri/Nghi quyet 12 về bảng giá đất 2026 Quảng Trị_OCR.txt` (22 KB) | `quy_dinh_vi_tri/Quang tri.txt` | `bang_gia_json/Quang tri.jsonl` (6880 KB) | có |
| Son La | `van_ban_txt/Son La/bang-1.txt` (9 KB)<br>`van_ban_txt/Son La/bang-5.txt` (300 KB)<br>`van_ban_txt/Son La/bang-5_OCR.txt` (1 KB)<br>`van_ban_txt/Son La/bang-6.txt` (293 KB)<br>`van_ban_txt/Son La/bang-7.txt` (293 KB)<br>`van_ban_txt/Son La/bang-7_OCR.txt` (1 KB)<br>`van_ban_txt/Son La/bang-8.txt` (1 KB) | `quy_dinh_vi_tri/Son La.txt` | `bang_gia_json/Son La.jsonl` (1479 KB) | có |
| TP Hue | `van_ban_txt/TP Hue/du-thao-qd.txt` (46 KB) | `quy_dinh_vi_tri/TP Hue.txt` | `bang_gia_json/TP Hue.jsonl` (3521 KB) | có |
| Tay Ninh | `van_ban_txt/Tay Ninh/TN1.txt` (843 KB)<br>`van_ban_txt/Tay Ninh/TN1_OCR.txt` (1 KB)<br>`van_ban_txt/Tay Ninh/TN2.txt` (692 KB)<br>`van_ban_txt/Tay Ninh/TN2_OCR.txt` (1 KB)<br>`van_ban_txt/Tay Ninh/TN3.txt` (34 KB) | `quy_dinh_vi_tri/Tay Ninh.txt` | `bang_gia_json/Tay Ninh.jsonl` (2896 KB) | có |
| Thai Nguyen | `van_ban_txt/Thai Nguyen/Bang gia dat tinh Thai Nguyen 2026.txt` (860 KB)<br>`van_ban_txt/Thai Nguyen/phu-luc-ii-tinh-thai-nguyen.txt` (815 KB) | `quy_dinh_vi_tri/Thai Nguyen.txt` | `bang_gia_json/Thai Nguyen.jsonl` (3698 KB) | có |
| Thanh Hoa | `van_ban_txt/Thanh Hoa/` (9 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Thanh Hoa.txt` | `bang_gia_json/Thanh Hoa.jsonl` (14632 KB) | có |
| Tuyen Quang | `van_ban_txt/Tuyen Quang/41-2025-NQ-HDND.txt` (22 KB)<br>`van_ban_txt/Tuyen Quang/TQ1.txt` (7 KB)<br>`van_ban_txt/Tuyen Quang/TQ2.txt` (8 KB)<br>`van_ban_txt/Tuyen Quang/TQ3.txt` (9 KB)<br>`van_ban_txt/Tuyen Quang/TQ4.txt` (8 KB)<br>`van_ban_txt/Tuyen Quang/TQ5.txt` (650 KB)<br>`van_ban_txt/Tuyen Quang/TQ6.txt` (2 KB) | `quy_dinh_vi_tri/Tuyen Quang.txt` | `bang_gia_json/Tuyen Quang.jsonl` (1248 KB) | có |
| Vinh Long (anh QD) | `van_ban_txt/Vinh Long (anh QD)/` (9 file, mỗi file 1 xã/phụ lục — dùng Grep theo tên xã/đường) | `quy_dinh_vi_tri/Vinh Long (anh QD).txt` | `bang_gia_json/Vinh Long (anh QD).jsonl` (1252 KB) | có |
