# Nhật ký token và hiệu quả — Claude Code vs Antigravity (tuần thử)

Bắt đầu: ____/____/2026 — Kết thúc: ____/____/2026

## Cách ghi
- Mỗi việc là 1 dòng ở Bảng A. Điền ngay sau khi xong việc.
- Mỗi tối ghi 1 dòng ở Bảng B (số liệu quota xem trong từng ứng dụng).
- "Phải sửa lại" = số lần phải yêu cầu làm lại hoặc tự sửa kết quả.
- Điểm chất lượng: 1 (bỏ đi) đến 5 (dùng được ngay).

## Bảng A — Từng công việc

| Ngày | Công việc | Loại (code / nội dung / pháp lý / vận hành / git) | Bên làm (CC / AG) | Quota trước (%) | Quota sau (%) | Phút | Phải sửa lại | Chất lượng 1-5 | Ghi chú |
|---|---|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |  |  |

## Bảng B — Tổng kết ngày (khi dùng song song)

| Ngày | Quota Claude đầu ngày (%) | Quota Claude cuối ngày (%) | Quota AG đầu ngày (%) | Quota AG cuối ngày (%) | Số lần sửa trùng file / xung đột | Bật cả hai? (Y/N) | Ghi chú |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |
|  |  |  |  |  |  |  |  |

## Bảng C — So sánh cuối tuần (điền từ A và B)

Chi phí = Quota sau − Quota trước. Cộng theo từng loại việc rồi chia cho số việc.

| Loại việc | CC: số việc | CC: quota TB/việc | CC: sửa lại TB | CC: chất lượng TB | AG: số việc | AG: quota TB/việc | AG: sửa lại TB | AG: chất lượng TB | Bên nên làm |
|---|---|---|---|---|---|---|---|---|---|
| code |  |  |  |  |  |  |  |  |  |
| nội dung |  |  |  |  |  |  |  |  |  |
| pháp lý |  |  |  |  |  |  |  |  |  |
| vận hành |  |  |  |  |  |  |  |  |  |
| git |  |  |  |  |  |  |  |  |  |

## Quy tắc chọn bên
- Bên nào có chất lượng TB ≥ 4 và sửa lại TB ≤ 1 thì đủ điều kiện.
- Trong các bên đủ điều kiện, chọn bên có quota TB/việc thấp hơn.
- Nếu cả hai không đủ điều kiện, giữ bên có chất lượng cao hơn.

## Đánh giá chạy song song
- Tổng số lần sửa trùng file trong tuần: ____ (mục tiêu: 0)
- Số ngày bật cả hai: ____ / 7. Số ngày bật một bên đã đủ việc: ____
- Quota cả hai bên cộng lại so với tuần trước khi dùng song song: ____
- Kết luận (bật cả hai hằng ngày / chỉ bật bên đang có việc): ____________

## Kết quả cuối — chép sang ô "Cần chốt" của `.agents/rules/phan_cong_claude_antigravity.md`
