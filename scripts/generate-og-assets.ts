import puppeteer from 'puppeteer-core';
import { writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const publicDir = resolve(__dirname, '../public');
mkdirSync(publicDir, { recursive: true });

const CHROME_PATH =
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

const FONTS = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Libre+Caslon+Display&family=Hanken+Grotesk:wght@700&display=swap" rel="stylesheet">
`;

const ogHtml = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${FONTS}
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 1200px; height: 630px; overflow: hidden; }
</style>
</head>
<body>
<div style="width:1200px;height:630px;background:#f6f1e7;position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;">
  <!-- top-left corner flourish -->
  <svg width="195" height="156" viewBox="0 0 150 120" fill="none" style="position:absolute;left:91px;top:75px;">
    <path d="M14 100C12 64 26 30 70 16" stroke="#d8b8a6" stroke-width="3.9" stroke-linecap="round"/>
    <path d="M52 12C60 16 68 17 78 16M68 30C70 24 70 18 70 14" stroke="#d8b8a6" stroke-width="3.9" stroke-linecap="round"/>
  </svg>
  <!-- top-right asterisk spark -->
  <svg width="75" height="75" viewBox="0 0 58 58" fill="none" style="position:absolute;right:195px;top:109px;transform:rotate(8deg);">
    <path d="M29 8V50M8 29H50" stroke="#b4532f" stroke-width="5" stroke-linecap="round"/>
    <path d="M14 14L44 44M44 14L14 44" stroke="#b4532f" stroke-width="3.9" stroke-linecap="round" opacity="0.75"/>
  </svg>
  <!-- right side little circle -->
  <svg width="52" height="52" viewBox="0 0 40 40" fill="none" style="position:absolute;right:125px;top:377px;">
    <path d="M20 5C10 4 4 11 5 21C6 30 14 36 24 34C32 32 36 23 31 14C28 9 23 6 17 6" stroke="#cdbfa3" stroke-width="3.9" stroke-linecap="round"/>
  </svg>
  <!-- bottom-left squiggle -->
  <svg width="156" height="34" viewBox="0 0 120 26" fill="none" style="position:absolute;left:143px;bottom:125px;">
    <path d="M5 14C20 5 32 22 47 13C62 4 74 21 89 12C100 6 108 10 115 14" stroke="#d8b8a6" stroke-width="4.4" stroke-linecap="round"/>
  </svg>
  <!-- bottom-right arrow doodle -->
  <svg width="112" height="96" viewBox="0 0 86 74" fill="none" style="position:absolute;right:161px;bottom:91px;transform:rotate(-6deg);">
    <path d="M76 8C70 36 50 58 18 64M40 56C30 60 24 62 16 64M28 46C22 53 19 59 16 64" stroke="#cdbfa3" stroke-width="3.9" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>
  <!-- bottom-left small star -->
  <svg width="44" height="44" viewBox="0 0 34 34" fill="none" style="position:absolute;left:88px;bottom:220px;transform:rotate(-10deg);">
    <path d="M17 4V30M4 17H30" stroke="#cdbfa3" stroke-width="3.6" stroke-linecap="round"/>
    <path d="M8 8L26 26M26 8L8 26" stroke="#cdbfa3" stroke-width="2.9" stroke-linecap="round"/>
  </svg>

  <!-- centered brand block -->
  <div style="position:relative;z-index:1;text-align:center;display:flex;flex-direction:column;align-items:center;">
    <div style="position:relative;display:inline-block;">
      <div style="font:400 192px/0.92 'Libre Caslon Display',serif;color:#20201c;">Fibole</div>
      <svg width="611" height="52" viewBox="0 0 420 36" fill="none" style="position:absolute;left:50%;transform:translateX(-50%);bottom:-31px;">
        <path d="M12 24C92 9 162 30 238 19C298 10 356 18 408 26" stroke="#b4532f" stroke-width="8" stroke-linecap="round"/>
        <path d="M30 32C92 22 156 33 232 27" stroke="#b4532f" stroke-width="5" stroke-linecap="round" opacity="0.5"/>
      </svg>
    </div>
    <div style="font:400 56px/1.35 'Libre Caslon Display',serif;color:#4a463d;margin-top:96px;">Four facts. Three are true.<br>Can you spot the fib?</div>
    <div style="font:700 22px/1 'Hanken Grotesk',sans-serif;letter-spacing:0.18em;text-transform:uppercase;color:#b4532f;margin-top:60px;">A new puzzle every day</div>
  </div>
</div>
</body>
</html>`;

function iconHtml(size: number, withRounding: boolean) {
  const radius = withRounding ? Math.round(size * 0.219) : 0;
  // Scale from design: 168px F in 220px icon. No padding-bottom — swash overlaps
  // the F's base (position:absolute;bottom) just like the design does.
  const fontSize = Math.round(size * 0.762);
  const swashScale = fontSize / 168;
  const swashW = Math.round(150 * swashScale);
  const swashH = Math.round(24 * swashScale);
  const swashBottom = Math.round(6 * swashScale);
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
${FONTS}
<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: ${size}px; height: ${size}px; overflow: hidden; background: transparent; }
</style>
</head>
<body>
<div style="width:${size}px;height:${size}px;border-radius:${radius}px;background:#f6f1e7;overflow:hidden;display:flex;align-items:center;justify-content:center;">
  <div style="position:relative;line-height:1;">
    <div style="font:400 ${fontSize}px/1 'Libre Caslon Display',serif;color:#20201c;">F</div>
    <svg width="${swashW}" height="${swashH}" viewBox="0 0 150 24" fill="none"
         style="position:absolute;left:50%;transform:translateX(-50%);bottom:${swashBottom}px;width:${swashW}px;height:${swashH}px;">
      <path d="M8 15C44 5 84 19 120 11C134 8 142 11 146 14" stroke="#b4532f" stroke-width="6" stroke-linecap="round"/>
    </svg>
  </div>
</div>
</body>
</html>`;
}

async function screenshot(html: string, width: number, height: number) {
  const browser = await puppeteer.launch({
    executablePath: CHROME_PATH,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const buf = await page.screenshot({
    type: 'png',
    clip: { x: 0, y: 0, width, height },
  });
  await browser.close();
  return buf as Buffer;
}

async function main() {
  console.log('Generating OG image (1200×630)…');
  const og = await screenshot(ogHtml, 1200, 630);
  writeFileSync(resolve(publicDir, 'og-image.png'), og);

  console.log('Generating apple-touch-icon (180×180)…');
  const touch = await screenshot(iconHtml(180, false), 180, 180);
  writeFileSync(resolve(publicDir, 'apple-touch-icon.png'), touch);

  console.log('Generating icon-512 (512×512)…');
  const icon512 = await screenshot(iconHtml(512, true), 512, 512);
  writeFileSync(resolve(publicDir, 'icon-512.png'), icon512);

  console.log('Done. Generated:');
  console.log('  public/og-image.png');
  console.log('  public/apple-touch-icon.png');
  console.log('  public/icon-512.png');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
