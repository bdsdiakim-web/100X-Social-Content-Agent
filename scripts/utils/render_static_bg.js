const puppeteer = require('puppeteer');
const path = require('path');

async function renderStaticBackground(htmlPath, outPath, width = 1920, height = 1080) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width, height, deviceScaleFactor: 1 });
    await page.goto('file://' + path.resolve(htmlPath), { waitUntil: 'networkidle0' });
    await new Promise(r => setTimeout(r, 800));
    await page.screenshot({ path: outPath });
    await browser.close();
    console.log('Saved: ' + outPath);
}

if (require.main === module) {
    const args = process.argv.slice(2);
    const htmlPath = args[0];
    const outPath = args[1];
    if (!htmlPath || !outPath) {
        console.log('Usage: node render_static_bg.js <input.html> <output.png>');
        process.exit(1);
    }
    renderStaticBackground(htmlPath, outPath).catch(err => { console.error(err); process.exit(1); });
}

module.exports = { renderStaticBackground };
