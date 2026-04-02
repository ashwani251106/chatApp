const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('http://localhost:5174/chat');
  await page.waitForSelector('.theme-trigger-btn');
  console.log('Clicking trigger...');
  await page.click('.theme-trigger-btn');
  await page.waitForSelector('.theme-option.theme-option-horizon');
  console.log('Clicking horizon...');
  await page.click('.theme-option.theme-option-horizon');
  await new Promise(r => setTimeout(r, 500));
  const themeText = await page.$eval('.theme-trigger-label', el => el.textContent);
  console.log('Theme trigger label is now: ' + themeText);
  await browser.close();
})();
