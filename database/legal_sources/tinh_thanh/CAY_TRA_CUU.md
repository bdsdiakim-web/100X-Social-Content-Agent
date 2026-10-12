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
| Bac Ninh (anh) | `van_ban_txt/Bac Ninh (anh)/nghi-quyet-128-2025-nq-hdnd_OCR.txt` (17 KB) | `quy_dinh_vi_tri/Bac Ninh (anh).txt` | `bang_gia_json/Bac Ninh (anh).jsonl` (10477 KB) | có |
| Ca Mau | `van_ban_txt/Ca Mau/Ca Mau.txt` (962 KB) | `quy_dinh_vi_tri/Ca Mau.txt` | `bang_gia_json/Ca Mau.jsonl` (3389 KB) | có |
| Can tho | `van_ban_txt/Can tho/Cantho nghi-quyet-41-pl1.txt` (4 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl2.txt` (4 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl3.txt` (1 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl4.txt` (218 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl5.txt` (191 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl6.txt` (4 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl7.txt` (408 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl8.txt` (408 KB)<br>`van_ban_txt/Can tho/Cantho nghi-quyet-41-pl9.txt` (2 KB) | `quy_dinh_vi_tri/Can tho.txt` | `bang_gia_json/Can tho.jsonl` (3259 KB) | có |
| Cao Bang | `van_ban_txt/Cao Bang/nq-34-cao-bang-phu-lucpdf.txt` (427 KB)<br>`van_ban_txt/Cao Bang/nq-34-cao-bang.txt` (18 KB) | `quy_dinh_vi_tri/Cao Bang.txt` | `bang_gia_json/Cao Bang.jsonl` (777 KB) | có |
| Da Nang | `van_ban_txt/Da Nang/Da nang 07_2021_QD-UBND_470106.txt` (7 KB)<br>`van_ban_txt/Da Nang/Da nang 09_2020_QD-UBND_440454.txt` (29 KB)<br>`van_ban_txt/Da Nang/Da nang 12_2022_QD-UBND_519866.txt` (40 KB)<br>`van_ban_txt/Da Nang/Da nang 30_2022_QD-UBND_548042.txt` (27 KB)<br>`van_ban_txt/Da Nang/Da nang 45_2025_QD-UBND_663242.txt` (415 KB)<br>`van_ban_txt/Da Nang/Da nang 57_2023_QD-UBND_591876.txt` (229 KB)<br>`van_ban_txt/Da Nang/Da nang 59_2024_QD-UBND_638652.txt` (9 KB)<br>`van_ban_txt/Da Nang/QuangNam 23_2025_QD-UBND_649802.txt` (412 KB)<br>`van_ban_txt/Da Nang/QuangNam 24_2019_QD-UBND_434612.txt` (31 KB)<br>`van_ban_txt/Da Nang/QuangNam 35_2023_QD-UBND_592516.txt` (6 KB)<br>`van_ban_txt/Da Nang/QuangNam 43_2021_QD-UBND_502786.txt` (5 KB) | `quy_dinh_vi_tri/Da Nang.txt` | `bang_gia_json/Da Nang.jsonl` (3670 KB) | có |
| Daklak | — | `quy_dinh_vi_tri/Daklak.txt` | `bang_gia_json/Daklak.jsonl` (8619 KB) | có |
| Dien Bien | — | `quy_dinh_vi_tri/Dien Bien.txt` | `bang_gia_json/Dien Bien.jsonl` (4616 KB) | có |
| Dong Nai (anh) | `van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Mục lục_0001_OCR.txt` (2 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 1-205_OCR.txt` (1193 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 1109-1332_OCR.txt` (1000 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 1333-1488_OCR.txt` (622 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 206-387_OCR.txt` (1039 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 388-501_OCR.txt` (653 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 502-704_OCR.txt` (1176 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 705-901_OCR.txt` (1115 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục I - 902-1108_OCR.txt` (1146 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III -1490-1671_OCR.txt` (1001 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III -2217-2404_OCR.txt` (1025 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III -2598-2775_OCR.txt` (969 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III -2776-3080_OCR.txt` (1201 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III- 1672-1859_OCR.txt` (1042 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III- 1860-2021_OCR.txt` (874 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III- 2022-2216_OCR.txt` (1055 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục III- 2405-2597_OCR.txt` (1050 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục II_0001_OCR.txt` (1 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục IV_0001_OCR.txt` (3 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục VII-sl1_0001_OCR.txt` (291 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục VIII_0001_OCR.txt` (3 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục VI_0001_OCR.txt` (33 KB)<br>`van_ban_txt/Dong Nai (anh)/NQ Số  28-2025-HĐND- Kèm Phụ lục V_0001_OCR.txt` (1 KB) | `quy_dinh_vi_tri/Dong Nai (anh).txt` | `bang_gia_json/Dong Nai (anh).jsonl` (21354 KB) | có |
| Dong Thap | — | `quy_dinh_vi_tri/Dong Thap.txt` | `bang_gia_json/Dong Thap.jsonl` (1522 KB) | có |
| Gia lai | — | `quy_dinh_vi_tri/Gia lai.txt` | `bang_gia_json/Gia lai.jsonl` (5038 KB) | có |
| Ha Tinh | — | `quy_dinh_vi_tri/Ha Tinh.txt` | `bang_gia_json/Ha Tinh.jsonl` (1924 KB) | có |
| Hai Phong | `van_ban_txt/Hai Phong/Hai Phong NQ85_PL1234.txt` (924 KB) | `quy_dinh_vi_tri/Hai Phong.txt` | `bang_gia_json/Hai Phong.jsonl` (1735 KB) | có |
| Ho Chi Minh | `van_ban_txt/Ho Chi Minh/Bảng giá đất 2026 Bà Rịa Vũng Tàu nay thuộc HCM.txt` (230 KB)<br>`van_ban_txt/Ho Chi Minh/HCM 9.1. NQ Bang gia dat nam 2026.txt` (31 KB)<br>`van_ban_txt/Ho Chi Minh/HCM phu-luc-bang-gia-dat-tp-hcm.txt` (1777 KB) | `quy_dinh_vi_tri/Ho Chi Minh.txt` | `bang_gia_json/Ho Chi Minh.jsonl` (3916 KB) | có |
| Hung Yen | `van_ban_txt/Hung Yen/Nghị-quyết-812-2025-NQ-HĐND_OCR.txt` (786 KB) | `quy_dinh_vi_tri/Hung Yen.txt` | `bang_gia_json/Hung Yen.jsonl` (6149 KB) | có |
| Khanh Hoa | `van_ban_txt/Khanh Hoa/Nghị quyết 15.2025 quy định giá đất Tỉnh Khánh Hòa_OCR.txt` (42 KB) | `quy_dinh_vi_tri/Khanh Hoa.txt` | `bang_gia_json/Khanh Hoa.jsonl` (2187 KB) | có |
| Lai chau | `van_ban_txt/Lai chau/Bang gia dat Lai Chau 2026.txt` (316 KB) | — | `bang_gia_json/Lai chau (da co txt).jsonl` (802 KB) | — |
| Lai chau (da co txt) | — | `quy_dinh_vi_tri/Lai chau (da co txt).txt` | — | có |
| Lam Dong | — | `quy_dinh_vi_tri/Lam Dong.txt` | `bang_gia_json/Lam Dong.jsonl` (7378 KB) | có |
| Lang Son | — | `quy_dinh_vi_tri/Lang Son.txt` | `bang_gia_json/Lang Son.jsonl` (4688 KB) | có |
| Lao Cai | — | `quy_dinh_vi_tri/Lao Cai.txt` | `bang_gia_json/Lao Cai.jsonl` (1442 KB) | có |
| Nghe An | — | `quy_dinh_vi_tri/Nghe An.txt` | `bang_gia_json/Nghe An.jsonl` (825 KB) | có |
| Ninh Binh | — | `quy_dinh_vi_tri/Ninh Binh.txt` | `bang_gia_json/Ninh Binh.jsonl` (4823 KB) | có |
| Phu Tho | — | `quy_dinh_vi_tri/Phu Tho.txt` | `bang_gia_json/Phu Tho.jsonl` (3339 KB) | có |
| Quang Ngai | — | `quy_dinh_vi_tri/Quang Ngai.txt` | `bang_gia_json/Quang Ngai.jsonl` (1593 KB) | có |
| Quang Ninh (anh) | `van_ban_txt/Quang Ninh (anh)/NQ100.2025-phu-luc-1_OCR.txt` (149 KB)<br>`van_ban_txt/Quang Ninh (anh)/NQ100.2025-phu-luc-2-tu-trang-1-70_OCR.txt` (364 KB)<br>`van_ban_txt/Quang Ninh (anh)/NQ100.2025-phu-luc-2-tu-trang-71-141_OCR.txt` (389 KB)<br>`van_ban_txt/Quang Ninh (anh)/NQ100.2025-phu-luc-3-4_OCR.txt` (3 KB)<br>`van_ban_txt/Quang Ninh (anh)/Quyết-định-88-2026-QĐ-UBND_OCR.txt` (52 KB) | `quy_dinh_vi_tri/Quang Ninh (anh).txt` | `bang_gia_json/Quang Ninh (anh).jsonl` (4814 KB) | có |
| Quang tri | `van_ban_txt/Quang tri/Nghi quyet 12 về bảng giá đất 2026 Quảng Trị_OCR.txt` (22 KB) | `quy_dinh_vi_tri/Quang tri.txt` | `bang_gia_json/Quang tri.jsonl` (6880 KB) | có |
| Son La | `van_ban_txt/Son La/bang-5_OCR.txt` (1 KB)<br>`van_ban_txt/Son La/bang-7_OCR.txt` (1 KB) | `quy_dinh_vi_tri/Son La.txt` | `bang_gia_json/Son La.jsonl` (1479 KB) | có |
| TP Hue | `van_ban_txt/TP Hue/du-thao-qd.txt` (46 KB) | `quy_dinh_vi_tri/TP Hue.txt` | `bang_gia_json/TP Hue.jsonl` (3521 KB) | có |
| Tay Ninh | `van_ban_txt/Tay Ninh/TN1_OCR.txt` (1 KB)<br>`van_ban_txt/Tay Ninh/TN2_OCR.txt` (1 KB) | `quy_dinh_vi_tri/Tay Ninh.txt` | `bang_gia_json/Tay Ninh.jsonl` (2896 KB) | có |
| Thai Nguyen | — | `quy_dinh_vi_tri/Thai Nguyen.txt` | `bang_gia_json/Thai Nguyen.jsonl` (3698 KB) | có |
| Thanh Hoa | — | `quy_dinh_vi_tri/Thanh Hoa.txt` | `bang_gia_json/Thanh Hoa.jsonl` (14632 KB) | có |
| Tuyen Quang | `van_ban_txt/Tuyen Quang/41-2025-NQ-HDND.txt` (22 KB)<br>`van_ban_txt/Tuyen Quang/TQ1.txt` (7 KB)<br>`van_ban_txt/Tuyen Quang/TQ2.txt` (8 KB)<br>`van_ban_txt/Tuyen Quang/TQ3.txt` (9 KB)<br>`van_ban_txt/Tuyen Quang/TQ4.txt` (8 KB)<br>`van_ban_txt/Tuyen Quang/TQ5.txt` (650 KB)<br>`van_ban_txt/Tuyen Quang/TQ6.txt` (2 KB) | `quy_dinh_vi_tri/Tuyen Quang.txt` | `bang_gia_json/Tuyen Quang.jsonl` (1248 KB) | có |
| Vinh Long (anh QD) | `van_ban_txt/Vinh Long (anh QD)/Vinh Long 39_2025 NQ HĐND_OCR.txt` (33 KB) | `quy_dinh_vi_tri/Vinh Long (anh QD).txt` | `bang_gia_json/Vinh Long (anh QD).jsonl` (1252 KB) | có |
