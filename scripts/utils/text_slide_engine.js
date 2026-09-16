const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

/**
 * Tạo ảnh "chữ to" (1080x1080) cho tin ngắn — theo yêu cầu người dùng (2026-09-16): khách lớn tuổi
 * khó đọc bài đăng dạng text bé, nên tin ngắn chuyển thành 2-4 ảnh chữ to, rõ, dễ đọc thay vì đăng
 * text thuần. Thiết kế tối giản (nền navy thương hiệu + chữ trắng cỡ lớn + thanh vàng nhấn), KHÔNG
 * dùng bộ carousel minh hoạ AI phức tạp (html_carousel_engine.js) vì tin thời sự không có ảnh nền
 * theo chủ đề cụ thể — chỉ cần chữ to, rõ, đọc nhanh.
 *
 * @param {string[]} texts - mảng nội dung từng slide (đã chia sẵn, xem splitIntoSlideTexts).
 * @param {string} outputDir - thư mục lưu ảnh (slide_01.png, slide_02.png, ...).
 * @returns {Promise<string[]>} danh sách đường dẫn ảnh đã tạo, theo đúng thứ tự.
 */
async function renderTextSlides(texts, outputDir) {
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

    const brandConfigPath = path.join(__dirname, '..', '..', 'database', 'brand_config.json');
    const brandConfig = fs.existsSync(brandConfigPath)
        ? JSON.parse(fs.readFileSync(brandConfigPath, 'utf8'))
        : {};
    const colors = brandConfig.brand_identity?.colors || {};
    const primary = colors.primary || '#0F2C59';
    const accent = colors.accent || '#D4AF37';
    const brandName = brandConfig.brand_identity?.brand_name || '';
    const fontPrimary = brandConfig.brand_identity?.fonts?.primary || 'Inter';
    const fontPrimarySafe = fontPrimary.replace(/\s+/g, '+');

    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080, deviceScaleFactor: 2 });

    const outputPaths = [];
    for (let i = 0; i < texts.length; i++) {
        const text = texts[i];
        // Chữ càng dài thì cỡ chữ càng nhỏ lại 1 chút để vẫn vừa khung — nhưng luôn ưu tiên TO,
        // vì mục tiêu chính là dễ đọc cho khách lớn tuổi (không thu nhỏ xuống dưới 44px).
        const fontSize = text.length > 220 ? 44 : text.length > 140 ? 52 : text.length > 80 ? 64 : 76;

        const html = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <link href="https://fonts.googleapis.com/css2?family=${fontPrimarySafe}:wght@700;800;900&display=swap" rel="stylesheet">
            <style>
                * { box-sizing: border-box; }
                body {
                    margin: 0; width: 1080px; height: 1080px;
                    background: ${primary};
                    display: flex; flex-direction: column; justify-content: center; align-items: center;
                    font-family: '${fontPrimary}', sans-serif;
                    position: relative;
                }
                .accent-bar { width: 120px; height: 10px; background: ${accent}; border-radius: 6px; margin-bottom: 48px; }
                .text {
                    color: #FFFFFF; font-weight: 800; text-align: center;
                    font-size: ${fontSize}px; line-height: 1.35;
                    padding: 0 80px; max-width: 920px;
                }
                .footer {
                    position: absolute; bottom: 56px; left: 0; width: 100%;
                    text-align: center; color: ${accent}; font-weight: 700; font-size: 26px;
                    letter-spacing: 1px;
                }
                .page-num {
                    position: absolute; top: 48px; right: 56px;
                    color: rgba(255,255,255,0.6); font-weight: 700; font-size: 24px;
                }
            </style>
        </head>
        <body>
            <div class="page-num">${i + 1}/${texts.length}</div>
            <div class="accent-bar"></div>
            <div class="text">${text}</div>
            <div class="footer">${brandName}</div>
        </body>
        </html>`;

        await page.setContent(html, { waitUntil: 'load' });
        await new Promise(r => setTimeout(r, 400)); // đợi font Google load xong

        const outputPath = path.join(outputDir, `slide_${(i + 1).toString().padStart(2, '0')}.png`);
        await page.screenshot({ path: outputPath });
        outputPaths.push(outputPath);
        console.log(`✅ [Text Slide] Đã tạo: slide_${(i + 1).toString().padStart(2, '0')}.png`);
    }

    await browser.close();
    return outputPaths;
}

module.exports = { renderTextSlides };
