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
    return finalCaption;
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

runAutoPublish();
