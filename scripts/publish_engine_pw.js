const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const REMOTE_DEBUG_PORT = 9333;

async function launchBrowserContext(post) {
    const channelId = post.target_channels ? post.target_channels[0] : 'default';
    const userDataDir = path.join(__dirname, '../browser_data', channelId);

    // Ưu tiên dùng lại cửa sổ trình duyệt đang mở sẵn từ lần chạy trước (nếu có),
    // thay vì mở cửa sổ mới mỗi lần — tránh lỗi "profile đang được sử dụng" khi
    // chạy lặp lại nhiều lần trong ngày (VD: tác vụ hẹn giờ 7h/12h/19h).
    try {
        const existingBrowser = await chromium.connectOverCDP(`http://localhost:${REMOTE_DEBUG_PORT}`);
        const existingContext = existingBrowser.contexts()[0];
        if (existingContext) {
            console.log("[System] Đã tìm thấy trình duyệt đang mở sẵn từ trước — dùng lại, không mở cửa sổ mới.");
            return existingContext;
        }
    } catch (e) {
        console.log("[System] Chưa có trình duyệt nào đang chạy — sẽ mở cửa sổ mới.");
    }

    console.log(`[System] Thư mục Session phân quyền: ${userDataDir}`);
    if (!fs.existsSync(userDataDir)) {
        console.log("[System] Tạo thư mục browser_data mới...");
        fs.mkdirSync(userDataDir, { recursive: true });
    }

    const coccocPath = process.env.COCCOC_EXECUTABLE_PATH || 'C:\\Program Files\\CocCoc\\Browser\\Application\\browser.exe';
    const useCoccoc = fs.existsSync(coccocPath);

    console.log(`[System] Đang khởi động ${useCoccoc ? 'Cốc Cốc' : 'Chromium'} (Headless: OFF)...`);
    return await chromium.launchPersistentContext(userDataDir, {
        headless: false,
        viewport: { width: 1280, height: 720 },
        args: ['--disable-notifications', `--remote-debugging-port=${REMOTE_DEBUG_PORT}`],
        ...(useCoccoc ? { executablePath: coccocPath } : {})
    });
}

async function handleLoginWait(page, targetUrl) {
    const isLoginNode = await page.locator('input[name="email"], button[name="login"]').first().isVisible().catch(() => false);
    if (page.url().includes('login') || page.url().includes('session_expired') || isLoginNode) {
        console.log("⚠️ [ACTION REQUIRED] Hệ thống đang Tạm Dừng. Vui lòng thả tay vào bàn phím và Đăng nhập. Đang đợi tối đa 5 phút (300s)...");

        // QUAN TRỌNG: Trước đây hàm này chỉ IN ra dòng chữ trên rồi chạy tiếp NGAY LẬP TỨC,
        // không hề thật sự đợi -> khiến bước upload phía sau luôn fail vì trang vẫn là trang login.
        // Giờ đợi thật: kiểm tra mỗi 3 giây, dừng đợi ngay khi ô nhập email/nút login biến mất.
        const maxWaitMs = 300000;
        const pollMs = 3000;
        let waited = 0;
        while (waited < maxWaitMs) {
            await new Promise(r => setTimeout(r, pollMs));
            waited += pollMs;
            const stillOnLogin = await page.locator('input[name="email"], button[name="login"]').first().isVisible().catch(() => false);
            if (!stillOnLogin && !page.url().includes('login')) {
                console.log("✅ [Đăng nhập thành công] Phát hiện đã rời trang đăng nhập, tiếp tục quy trình...");
                return;
            }
        }
        console.log("⏱️ [Hết giờ chờ] Sau 5 phút vẫn chưa đăng nhập xong, hệ thống sẽ thử tiếp tục (có thể lỗi nếu chưa đăng nhập).");
    }
}

async function markAsPublished(post, inventory, inventoryPath, page) {
    await new Promise(r => setTimeout(r, 10000));
    await page.screenshot({ path: path.join(__dirname, '..', 'media_output', 'publish_pw_success.png') });
    console.log("📸 Đã chụp ảnh xác nhận tại media_output/publish_pw_success.png");

    post.status = "published";
    if (!post.published_data) post.published_data = {};
    post.published_data.published_at = new Date().toISOString();
    post.published_data.live_url = "Chờ đồng bộ API FB";
    fs.writeFileSync(inventoryPath, JSON.stringify(inventory, null, 2));
    console.log("✅ Cập nhật Kho Inventory thành công.");
}

async function getCaption(post) {
    const captionPath = post.caption_link ? path.join(__dirname, '..', post.caption_link) : '';
    let finalCaption = '';
    if (captionPath && fs.existsSync(captionPath)) {
        finalCaption = fs.readFileSync(captionPath, 'utf8');
    } else {
        console.log(`⚠️ Không tìm thấy file caption tại: ${captionPath}`);
    }
    // Theo yêu cầu người dùng: link affiliate Shopee gắn NGAY TRONG caption lúc đăng bài
    // (Facebook tự động biến URL trong caption thành link bấm được), KHÔNG đăng riêng thành
    // bình luận nữa — đáng tin cậy hơn vì không phụ thuộc việc tự động hoá thao tác bình luận
    // (từng dính lỗi ô bình luận sai, xem project_fb_comment_edit_box_bug). Bình luận riêng chỉ
    // còn dùng để đăng NỘI DUNG ĐẦY ĐỦ (postFullContentComment).
    // NGOẠI LỆ (2026-09-16): bài "tin thời sự" (delivery_format === 'news') KHÔNG gắn link —
    // khung xem trước ảnh to của Facebook đè lên làm chữ bài tin bị lấn át, khó đọc.
    const shopeeLink = post.delivery_format === 'news' ? '' : getShopeeAffiliateLink();
    if (shopeeLink) {
        finalCaption = `${finalCaption.trim()}\n\n🛒 ${shopeeLink}`;
    }
    return finalCaption;
}

// Đọc link affiliate Shopee hiện tại từ config (rỗng cho đến khi người dùng điền vào).
function getShopeeAffiliateLink() {
    try {
        const cfgPath = path.join(__dirname, '..', 'database', 'affiliate_config.json');
        if (!fs.existsSync(cfgPath)) return '';
        const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
        return (cfg.shopee_link || '').trim();
    } catch (e) {
        return '';
    }
}

/**
 * QUAN TRỌNG: Caption trên video/ảnh bị giới hạn ~2500 ký tự (giới hạn cứng của Facebook Reels),
 * nên caption luôn phải rút ngắn. Theo yêu cầu người dùng, nội dung ĐẦY ĐỦ (master_content.md,
 * không bị cắt) được đăng riêng dưới dạng BÌNH LUẬN của chính bài viết ngay sau khi đăng — không
 * giới hạn ký tự khắt khe như caption.
 *
 * Link affiliate Shopee KHÔNG còn đăng ở đây nữa — từ 2026-09-15, link được gắn thẳng vào cuối
 * CAPTION lúc đăng bài (xem getCaption()), vì Facebook tự động biến URL trong caption thành link
 * bấm được — đáng tin cậy hơn nhiều so với việc tự động hoá đăng thêm 1 bình luận riêng cho link
 * (từng lỗi do bấm nhầm ô "sửa bình luận" ẩn của Facebook, xem project_fb_comment_edit_box_bug).
 *
 * LƯU Ý: đây là bước "best-effort" — Facebook hay thay đổi giao diện/selector của ô bình luận,
 * và trang hiện tại ngay sau khi đăng Reels đôi khi là trang quản lý/số liệu chứ không phải trang
 * bài viết công khai. Hàm này thử nhiều cách, nếu thất bại sẽ CẢNH BÁO chứ không làm hỏng cả
 * tiến trình đăng bài chính — cần theo dõi thực tế qua vài lần chạy đầu để tinh chỉnh thêm.
 */
async function postFullContentComment(post, page) {
    try {
        const captionPath = post.caption_link ? path.join(__dirname, '..', post.caption_link) : '';
        if (!captionPath) return;
        // reels/caption.txt -> lên 2 cấp là thư mục gốc của ticket, nơi master_content.md nằm sẵn.
        const ticketRoot = path.dirname(path.dirname(captionPath));
        const masterContentPath = path.join(ticketRoot, 'master_content.md');
        if (!fs.existsSync(masterContentPath)) {
            console.log(`⚠️ [Comment Full-Text] Không tìm thấy master_content.md tại ${masterContentPath}, bỏ qua bước bình luận.`);
            return;
        }

        const fullContent = fs.readFileSync(masterContentPath, 'utf8')
            .replace(/^\*\*TIÊU ĐỀ VIDEO:.*$/m, '')
            .replace(/^\*\*TIÊU ĐỀ BÀI ĐĂNG:.*$/m, '')
            .replace(/^---\s*$/m, '')
            .replace(/^##\s*/gm, '')
            .trim();

        // Hàm dùng chung để đăng 1 bình luận độc lập.
        const submitComment = async (text) => {
            const boxSelector = 'div[aria-label*="Viết bình luận"], div[aria-label*="Write a comment"], ' +
                'div[aria-label*="Bình luận với tên"], div[aria-label*="Comment as"], ' +
                'div[aria-label*="Bình luận dưới tên"]';
            // QUAN TRỌNG: sau khi đã có ít nhất 1 bình luận, Facebook giữ sẵn 1 ô "sửa bình luận"
            // ẩn cho MỖI bình luận đã đăng, với aria-label dạng "...vào X phút/giờ trước" — ô này
            // khớp CÙNG selector và thường đứng TRƯỚC ô soạn bình luận mới thật sự trong DOM, khiến
            // .first() bấm nhầm vào đây (gõ chữ vào không đâu, Enter không đăng được gì, nhưng
            // hàm vẫn tưởng thành công). Ô soạn bình luận MỚI thật sự KHÔNG có hậu tố "...trước".
            const boxes = page.locator(boxSelector);
            const count = await boxes.count().catch(() => 0);
            let targetIndex = -1;
            for (let i = 0; i < count; i++) {
                const aria = await boxes.nth(i).getAttribute('aria-label').catch(() => '');
                if (aria && !/\btrước\b/.test(aria)) {
                    targetIndex = i;
                    break;
                }
            }
            if (targetIndex === -1) return false;
            const commentBox = boxes.nth(targetIndex);
            const found = await commentBox.isVisible({ timeout: 15000 }).catch(() => false);
            if (!found) return false;
            await commentBox.click();
            await page.keyboard.insertText(text);
            await new Promise(r => setTimeout(r, 500));
            await page.keyboard.press('Enter');
            await new Promise(r => setTimeout(r, 3000));
            return true;
        };

        console.log("[Engine] Đang đăng bình luận: nội dung đầy đủ...");
        let okContent = await submitComment(fullContent);

        if (!okContent) {
            // QUAN TRỌNG: Sau khi đăng Reels, Facebook thường điều hướng tới feed Reels CHUNG
            // (video của người khác), không phải bài vừa đăng — nên không có ô bình luận đúng chỗ
            // ở đây. Thử chủ động sang tab Reels riêng của chính Page, mở video mới nhất (video vừa
            // đăng luôn nằm đầu tiên) rồi thử lại.
            console.log("[Engine] Không thấy ô bình luận ở trang hiện tại — thử điều hướng sang tab Reels của Page để tìm đúng bài vừa đăng...");
            try {
                await page.goto('https://www.facebook.com/VuaMatPho/reels', { waitUntil: 'networkidle', timeout: 30000 });
                await new Promise(r => setTimeout(r, 3000));
                // QUAN TRỌNG: lưới Reels của Page chứa cả link "/reel/?s=tab" (link điều hướng
                // tab, KHÔNG phải video cụ thể) lẫn kèm nó — nếu bấm .first() không lọc sẽ dính
                // đúng link rác này và bị đưa sang feed "Dành cho bạn" chung, không phải video
                // vừa đăng. Phải lọc chỉ lấy href có ID số dạng /reel/<digits>/.
                const validHrefs = await page.evaluate(() =>
                    Array.from(document.querySelectorAll('a[href*="/reel/"]'))
                        .map(a => a.getAttribute('href'))
                        // QUAN TRỌNG: dùng ^ để chỉ khớp link Reel dạng đường dẫn tương đối thật sự
                        // trong lưới ("/reel/123.../?s=fb_shorts_profile..."), KHÔNG khớp link
                        // tuyệt đối trong 1 thông báo/toast "video đã xử lý xong" (dạng
                        // "https://www.facebook.com/reel/123...?s=notification_..."), thứ vẫn chứa
                        // "/reel/<digits>" ở đâu đó trong chuỗi nhưng không phải ô video trong lưới
                        // và có thể không hiển thị/không bấm được -> làm .click() bị timeout.
                        .filter(h => h && /^\/reel\/\d+/.test(h))
                );
                if (validHrefs.length === 0) {
                    throw new Error('Không tìm thấy link Reel hợp lệ nào (có ID số) trong lưới Reels của Page.');
                }
                // Video mới nhất luôn là ô đầu tiên (đã lọc) trong lưới Reels của chính Page.
                const firstReel = page.locator(`a[href="${validHrefs[0]}"]`).first();
                await firstReel.click({ timeout: 15000 });
                await new Promise(r => setTimeout(r, 3000));
                okContent = await submitComment(fullContent);
            } catch (navErr) {
                console.warn("⚠️ [Comment Full-Text] Điều hướng sang tab Reels của Page cũng thất bại:", navErr.message);
            }
        }

        if (!okContent) {
            console.warn("⚠️ [Comment Full-Text] Không tìm thấy ô bình luận — có thể cần đăng thủ công. Bỏ qua bước này.");
            return;
        }
        console.log("✅ [Engine] Đã đăng bình luận nội dung đầy đủ.");
    } catch (err) {
        console.warn("⚠️ [Comment Full-Text] Lỗi khi đăng bình luận nội dung đầy đủ (không ảnh hưởng đến việc bài đã đăng thành công):", err.message);
    }
}

// 1. ENGINE CHO REELS
async function publishReelPlaywright(post, inventory, inventoryPath) {
    console.log(`🚀 [PLAYWRIGHT] KHỞI ĐỘNG TIẾN TRÌNH ĐĂNG REELS: ${post.post_id}`);
    const videoPath = path.join(__dirname, '..', post.media_link || "");
    if (!fs.existsSync(videoPath)) {
        console.error(`❌ Video không tồn tại: ${videoPath}`); return;
    }

    const context = await launchBrowserContext(post);
    const page = await context.newPage();

    try {
        console.log("[Router] Điều hướng đến: Reels Creator...");
        await page.goto('https://www.facebook.com/reels/create/', { waitUntil: 'networkidle' });
        await handleLoginWait(page, 'reels/create');

        console.log("[Engine] Bắt đầu tải video lên...");
        await page.setInputFiles('input[type="file"]', videoPath);

        const nextBtnSelector = '[aria-label="Tiếp"], [aria-label="Next"]';
        await page.waitForSelector(nextBtnSelector, { state: 'visible', timeout: 300000 });
        console.log("[Engine] Nhấn 'Tiếp' lần 1 (Chế độ chỉnh sửa)...");
        await page.click(nextBtnSelector);
        
        await new Promise(r => setTimeout(r, 2000));
        await page.waitForSelector(nextBtnSelector, { state: 'visible' });
        console.log("[Engine] Nhấn 'Tiếp' lần 2 (Chế độ cài bài)...");
        await page.click(nextBtnSelector);

        console.log("[Engine] Nhập Caption (v16.0 Playwright Fill)...");
        const captionBox = page.locator('div[role="textbox"]');
        await captionBox.first().waitFor({ state: 'visible' });
        await captionBox.first().click();
        await captionBox.first().fill(await getCaption(post));
        console.log("✅ Caption đã được điền.");

        console.log("[Engine] Chuẩn bị nhấn 'Đăng'...");
        const postBtn = page.locator('[aria-label="Đăng"], [aria-label="Publish"], [aria-label="Chia sẻ"], [aria-label="Post"]').last();
        await postBtn.waitFor({ state: 'visible' });

        // QUAN TRỌNG: Facebook giữ nút này ở trạng thái aria-disabled="true" trong lúc video
        // còn đang tải lên/xử lý ở server. Trước đây code bấm ngay -> luôn fail vì nút chưa bật.
        // Video càng dài/nặng thì xử lý càng lâu, nên đợi tối đa 3 phút, kiểm tra mỗi 2 giây.
        console.log("[Engine] Đợi Facebook xử lý xong video (nút 'Đăng' đang khóa)...");
        const maxWaitMs = 180000;
        const pollMs = 2000;
        let waited = 0;
        let isEnabled = false;
        while (waited < maxWaitMs) {
            const ariaDisabled = await postBtn.getAttribute('aria-disabled').catch(() => 'true');
            if (ariaDisabled !== 'true') { isEnabled = true; break; }
            await new Promise(r => setTimeout(r, pollMs));
            waited += pollMs;
        }
        if (!isEnabled) {
            throw new Error(`Nút 'Đăng' vẫn bị khóa sau ${maxWaitMs / 1000}s — video có thể quá nặng hoặc Facebook xử lý chậm bất thường.`);
        }

        console.log("✅ [Engine] Video đã xử lý xong, nút 'Đăng' đã bật. Đang bấm...");
        await postBtn.click();
        console.log("🚀 [LIVE] Đã nhấn nút Đăng!");

        // Xác nhận đã rời khỏi màn hình composer (điều hướng đi nơi khác) trước khi coi là thành công
        await page.waitForTimeout(4000);

        await markAsPublished(post, inventory, inventoryPath, page);
        await postFullContentComment(post, page);
    } catch (error) {
        console.error(`❌ Lỗi Playwright: ${error.message}`);
        await page.screenshot({ path: path.join(__dirname, '../media_output/publish_pw_error.png') });
    } finally {
        console.log("[Engine] Giữ nguyên cửa sổ trình duyệt đang mở (không đóng) — lần chạy tiếp theo sẽ dùng lại đúng cửa sổ này.");
    }
}

// 2. ENGINE CHO ẢNH (New Feature - Cross Format)
async function publishImagePlaywright(post, inventory, inventoryPath) {
    console.log(`🚀 [PLAYWRIGHT] KHỞI ĐỘNG TIẾN TRÌNH ĐĂNG ẢNH: ${post.post_id}`);
    const imagePath = path.join(__dirname, '..', post.media_link || "");
    if (!fs.existsSync(imagePath)) {
        console.error(`❌ Ảnh không tồn tại: ${imagePath}`); return;
    }

    const context = await launchBrowserContext(post);
    const page = await context.newPage();

    try {
        console.log("[Router] Điều hướng đến: Trang Cá Nhân (Profile)...");
        await page.goto('https://www.facebook.com/me', { waitUntil: 'load' });
        // Handle login manually
        await handleLoginWait(page, 'me');

        console.log("[Engine] Mở Box Đăng Bài (Composer)... Chờ tín hiệu (Max 5 phút).");
        const composerBtn = page.locator('div[role="button"]:has-text("mind"), div[role="button"]:has-text("nghĩ gì")').first();
        await composerBtn.waitFor({ state: 'visible', timeout: 300000 });
        await composerBtn.click();
        
        await new Promise(r => setTimeout(r, 2000)); // Chờ animation

        // Chọn "Ảnh/Video" để kích file input (Bỏ qua overlay ẩn của FB)
        console.log("[Engine] Click chọn đính kèm Ảnh...");
        const attachPhotoBtn = page.locator('div[aria-label="Ảnh/video"], div[aria-label="Photo/video"]').first();
        if (await attachPhotoBtn.isVisible()) {
            await attachPhotoBtn.click({ force: true });
            await new Promise(r => setTimeout(r, 1000));
        }

        console.log("[Engine] Trỏ file Ảnh vào UI...");
        const fileInput = page.locator('input[type="file"]').last();
        await fileInput.waitFor({ state: 'attached' });
        await fileInput.setInputFiles(imagePath);

        console.log("[Engine] Nhập Caption...");
        const captionBox = page.getByRole('dialog').locator('div[role="textbox"][contenteditable="true"]').first();
        await captionBox.waitFor({ state: 'visible', timeout: 10000 });
        await captionBox.click({ force: true });
        await page.keyboard.insertText(await getCaption(post));
        console.log("✅ Caption đã được điền.");

        console.log("[Engine] Chờ 3s tải ảnh Preview...");
        await new Promise(r => setTimeout(r, 3000));

        console.log("[Engine] Kiểm tra luồng xét duyệt hiển thị 'Tiếp' (Flow mới của Facebook)...");
        const nextBtn = page.getByRole('dialog').getByRole('button', { name: /Tiếp|Next/i }).first();
        if (await nextBtn.isVisible({ timeout: 10000 }).catch(() => false)) {
            console.log("[Engine] Đã thấy nút 'Tiếp' -> Nhấn chuyển bước!");
            await nextBtn.click({ force: true });
            await new Promise(r => setTimeout(r, 3000)); // Đợi load trang cấu hình Đăng
        } else {
            console.log("⚠️ Không tìm thấy nút Tiếp, FB có thể đã skip bước này.");
        }

        console.log("[Engine] Nhấn nút Đăng...");
        const postBtn = page.getByRole('dialog').getByRole('button', { name: /Đăng|Post/i }).last();
        await postBtn.waitFor({ state: 'visible', timeout: 15000 });
        await postBtn.click({ force: true });
        console.log("🚀 [LIVE] Đã nhấn nút Đăng xong!");

        await markAsPublished(post, inventory, inventoryPath, page);
        await postFullContentComment(post, page);
    } catch (error) {
        console.error(`❌ Lỗi Playwright Profile Image: ${error.message}`);
        await page.screenshot({ path: path.join(__dirname, '../media_output/publish_pw_error.png') });
    } finally {
        console.log("[Engine] Giữ nguyên cửa sổ trình duyệt đang mở (không đóng) — lần chạy tiếp theo sẽ dùng lại đúng cửa sổ này.");
    }
}

// 3. ENGINE CHO BÀI TEXT THUẦN (Tin tức, không ảnh/video đính kèm)
async function publishTextPlaywright(post, inventory, inventoryPath) {
    console.log(`🚀 [PLAYWRIGHT] KHỞI ĐỘNG TIẾN TRÌNH ĐĂNG BÀI TEXT: ${post.post_id}`);

    const context = await launchBrowserContext(post);
    const page = await context.newPage();

    try {
        console.log("[Router] Điều hướng đến: Trang Cá Nhân (Profile)...");
        await page.goto('https://www.facebook.com/me', { waitUntil: 'load' });
        await handleLoginWait(page, 'me');

        console.log("[Engine] Mở Box Đăng Bài (Composer)... Chờ tín hiệu (Max 5 phút).");
        const composerBtn = page.locator('div[role="button"]:has-text("mind"), div[role="button"]:has-text("nghĩ gì")').first();
        await composerBtn.waitFor({ state: 'visible', timeout: 300000 });
        await composerBtn.click();

        await new Promise(r => setTimeout(r, 2000));

        console.log("[Engine] Nhập nội dung bài viết (không đính kèm ảnh/video)...");
        const captionBox = page.getByRole('dialog').locator('div[role="textbox"][contenteditable="true"]').first();
        await captionBox.waitFor({ state: 'visible', timeout: 10000 });
        await captionBox.click({ force: true });
        await page.keyboard.insertText(await getCaption(post));
        console.log("✅ Nội dung đã được điền.");

        // Chờ dialog ổn định layout sau khi text dài làm khung mở rộng, tránh click nhầm tọa độ.
        await new Promise(r => setTimeout(r, 3000));

        console.log("[Engine] Kiểm tra bước 'Tiếp' (bài text không ảnh vẫn có bước xác nhận đối tượng)...");
        // QUAN TRỌNG: KHÔNG dùng getByRole('dialog') để khoanh vùng — trang "Quản lý trang" có
        // nhiều thẻ/nút xung quanh (vd: "Tạo video trực tiếp") mà role="dialog" ở đây match nhầm
        // sang wrapper của cả trang, khiến nút "Tiếp" bị nhấn nhầm và điều hướng mất bài đang soạn.
        // Modal composer luôn được portal vào cuối DOM nên dùng .last() trên toàn trang là an toàn hơn.
        const composerHeading = page.getByText('Tạo bài viết', { exact: true }).last();
        const nextBtn = page.locator('div[aria-label="Tiếp"], div[aria-label="Next"]').last();
        if (await nextBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
            console.log("[Engine] Đã thấy nút 'Tiếp' -> Nhấn chuyển bước...");
            await nextBtn.click();
            await new Promise(r => setTimeout(r, 2500));
            await page.screenshot({ path: path.join(__dirname, '../media_output/publish_pw_debug_after_next.png') });

            const stillInComposer = await composerHeading.isVisible({ timeout: 3000 }).catch(() => false);
            if (!stillInComposer) {
                throw new Error("Đã rời khỏi hộp soạn bài viết sau khi bấm 'Tiếp' — có thể đã bấm nhầm nút khác trên trang. Dừng lại để tránh đăng sai nội dung.");
            }
        } else {
            console.log("⚠️ Không thấy nút Tiếp, có thể FB đã bỏ qua bước này.");
        }

        console.log("[Engine] Nhấn nút Đăng...");
        const postBtn = page.locator('div[aria-label="Đăng"], div[aria-label="Post"]').last();
        await postBtn.waitFor({ state: 'visible', timeout: 15000 });
        await postBtn.click();
        console.log("🚀 [LIVE] Đã nhấn nút Đăng...");

        // QUAN TRỌNG: Sau khi bấm "Đăng", FB thường chèn thêm 1 popup upsell
        // ("Trò chuyện trực tiếp với mọi người" — gợi ý thêm nút Gọi ngay) CHẶN NGANG
        // trước khi bài thực sự được đăng. Nếu không xử lý, bài sẽ bị kẹt lại ở bước này
        // trong khi log vẫn tưởng là đã đăng xong. Cần bấm "Lúc khác" để bỏ qua.
        await new Promise(r => setTimeout(r, 3000));
        const upsellDialog = page.getByRole('dialog').filter({ hasText: 'Trò chuyện trực tiếp với mọi người' });
        if (await upsellDialog.isVisible({ timeout: 3000 }).catch(() => false)) {
            console.log("[Engine] Phát hiện popup gợi ý thêm nút 'Gọi ngay' -> Bấm 'Lúc khác' để bỏ qua...");
            await upsellDialog.getByRole('button', { name: /Lúc khác|Not now/i }).click();
            await new Promise(r => setTimeout(r, 2000));
        }

        // Xác nhận hộp soạn bài viết đã thực sự đóng lại (nghĩa là bài đã được đăng thật),
        // thay vì chỉ tin vào việc đã bấm nút. FB có thể hiện spinner "Đang đăng" một lúc
        // trước khi đóng hộp thoại, nên cần đợi/kiểm tra lại vài lần thay vì kết luận ngay.
        let composerStillOpen = true;
        for (let i = 0; i < 6; i++) {
            composerStillOpen = await page.getByText('Tạo bài viết', { exact: true }).last().isVisible({ timeout: 3000 }).catch(() => false);
            if (!composerStillOpen) break;
            await new Promise(r => setTimeout(r, 3000));
        }
        if (composerStillOpen) {
            throw new Error("Hộp soạn bài viết vẫn còn mở sau khi bấm 'Đăng' và đợi lâu — bài có thể chưa thực sự được đăng. Dừng lại để kiểm tra thủ công.");
        }
        console.log("✅ [Xác nhận] Hộp soạn bài viết đã đóng — bài đã được đăng.");

        await markAsPublished(post, inventory, inventoryPath, page);
        await postFullContentComment(post, page);
    } catch (error) {
        console.error(`❌ Lỗi Playwright Text Post: ${error.message}`);
        await page.screenshot({ path: path.join(__dirname, '../media_output/publish_pw_error.png') });
    } finally {
        console.log("[Engine] Giữ nguyên cửa sổ trình duyệt đang mở (không đóng) — lần chạy tiếp theo sẽ dùng lại đúng cửa sổ này.");
    }
}

// ==========================================
// THỰC THI (ROUTER MAIN)
// ==========================================
async function runAutoPublish() {
    const postId = process.argv[2];
    if (!postId) {
        console.log("Usage: node scripts/publish_engine_pw.js <postId>");
        return;
    }

    const inventoryPath = path.join(__dirname, '../database/post_inventory.json');
    if (!fs.existsSync(inventoryPath)) {
        console.error("❌ database/post_inventory.json không tồn tại!"); return;
    }
    const inventory = JSON.parse(fs.readFileSync(inventoryPath, 'utf8'));
    const post = inventory.find(p => p.post_id === postId);

    if (!post) {
        console.error("❌ Không tìm thấy bài đăng trong Inventory hoặc Id sai!");
        return;
    }

    const format = post.delivery_format || 'reels';
    if (format === 'reels' || format === 'broll') {
        await publishReelPlaywright(post, inventory, inventoryPath);
    } else if (format === 'image' || format === 'carousel' || format === 'infographic') {
        await publishImagePlaywright(post, inventory, inventoryPath);
    } else if (format === 'text' || format === 'news') {
        await publishTextPlaywright(post, inventory, inventoryPath);
    } else {
        console.log(`❌ Engine Publish chưa hỗ trợ định dạng: ${format}`);
    }
}

if (require.main === module) {
    runAutoPublish();
}

module.exports = { postFullContentComment, launchBrowserContext };
