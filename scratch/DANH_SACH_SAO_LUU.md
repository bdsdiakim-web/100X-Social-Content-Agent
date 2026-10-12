# Danh sách sao lưu thủ công (không có trên GitHub) — lập 2026-10-12

Chép các mục dưới đây vào ổ ngoài hoặc ổ đám mây RIÊNG TƯ. KHÔNG đưa lên GitHub công khai (có khóa và phiên đăng nhập).

## A. BẮT BUỘC (nhỏ, mất là rất khó làm lại)
| Đường dẫn | Dung lượng | Là gì |
|---|---|---|
| `D:\100X Agent\.env` | nhỏ | Khóa API: Gemini, Vbee, TikTok... |
| `D:\100X Agent\credentials\` | ~13 KB | Thông tin xác thực |
| `D:\100X Agent\database\*.json` (bị git bỏ qua) | < 1 MB | affiliate_config, comment_reply_log, quickpost_groups, target_pages, share_groups, idea_bank, strategy, post_inventory... |
| `D:\100X Agent\.claude\settings.local.json` | nhỏ | Cài đặt Claude cục bộ |
| `C:\Users\Admin\.claude\projects\D--100X-Agent\memory\` | nhỏ | Bộ nhớ của Claude (~60 file ghi chú) |
| `C:\Users\Admin\.claude\settings.json` | nhỏ | Cài đặt toàn cục (auto-compact 20%...) |

## B. NÊN CÓ (phiên đăng nhập, mất thì phải đăng nhập lại)
| Đường dẫn | Dung lượng | Ghi chú |
|---|---|---|
| `D:\100X Agent\browser_data\` | ~2,5 GB | Phiên Facebook/YouTube. Có thể bỏ (đăng nhập lại được); nếu chép thì nén lại |
| `D:\100X Agent\backup\` | 0,7 MB | Đã nằm trong gói tổng |
| `D:\100X Agent\landing_page_backend\` | 8,9 MB (78 file) | Đã nằm trong gói tổng |

## C. DỮ LIỆU LỚN
| Đường dẫn | Dung lượng | Ghi chú |
|---|---|---|
| `D:\KHO_PHAP_LUAT_DAT_DAI\` | ~1,5 GB | VAN_BAN_GOC 1,3 GB (PDF/Word gốc theo tỉnh), BANG_GIA_JSON 143 MB, TXT_DA_CHUYEN 28 MB, tessdata 37 MB, 8 script .py |
| `D:\100X Agent\media_output\` | ~1,4 GB | Video, ảnh đã làm (git bỏ qua phần lớn). Chỉ cần nếu muốn giữ video cũ |
| `D:\100X Agent\media-input\` | ~42 MB | Đã theo dõi bởi git nhưng nhiều file mới chưa commit |

## D. CHƯA COMMIT NHƯNG KHÔNG BỊ BỎ QUA (187 file)
Nằm trong `git status` dưới dạng chưa theo dõi: `sales_system/`, `tu_van_luat/`, `scratch/`, `database/content_drafts/`, `database/group_config/`, `database/docx_extract/`, các file bộ câu hỏi 90/144, `landing_page/baomat.html`, `hoso.html`, `form_*.js`, `scripts/scheduled/*.ps1`... Cách an toàn: commit và push (trừ `credentials/` và `.claude/`, cần xem trước), thay vì chép tay.

## E. KHÔNG cần sao lưu (tải lại được)
`node_modules/`, `.venv_pdf/`, `__pycache__/`, `netlify_upload/` (sinh lại), `faster-whisper` và model Whisper (tải lại từ mạng).

## Cách kiểm tra nhanh sau khi chép
Chép xong, mở thử `.env` và thư mục memory ở bản sao để chắc đọc được.

## GÓI TỔNG ĐÃ TẠO (2026-10-12)
`D:\SAO_LUU\sao_luu_tong_2026-10-12.zip` (9,5 MB) = .env + credentials + database/*.json bị bỏ qua + settings.local.json + memory Claude + settings Claude + backup/ + landing_page_backend/. Có `HUONG_DAN_KHOI_PHUC.txt` bên trong. CHỨA KHÓA BÍ MẬT: chép vào ổ ngoài/đám mây riêng tư, không đưa lên GitHub. Không gồm browser_data, media_output, PDF gốc.
