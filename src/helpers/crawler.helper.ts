// puppeteer-extra is a drop-in replacement for puppeteer,
// it augments the installed puppeteer with plugin functionality
// import puppeteer from 'puppeteer-extra';

// add stealth plugin and use defaults (all evasion techniques)
// import StealthPlugin from 'puppeteer-extra-plugin-stealth';
// puppeteer.use(StealthPlugin());
import puppeteer from 'puppeteer';

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

export default async function getTwitterImageUrls(url: string): Promise<string[]> {
  const debug = process.env.NODE_ENV !== 'production';
  // Viewport && Window size
  const width = 1280;
  const height = 720;

  const browser = await puppeteer.launch({
    headless: !debug,
    slowMo: 100,
    args: [
      `--window-size=${width},${height}`
    ],
    defaultViewport: {
      width,
      height
    }
  });

  const page = await browser.newPage();
  await page.setBypassCSP(true);

  try {
    await page.goto(url, {
      // less then 2 active connection
      waitUntil: 'networkidle2'
    });
  } catch (err) {
    await browser.close();
    return [];
  }

  const statusId = url.replace(/^.*\//, '');
  // const xpath = `//body//a[contains(@href, '${statusId}')]/ancestor::div[position()=1]//img`;
  const css_selector = `a[href*="/${statusId}/"] video[src], a[href*="/${statusId}/"] img[src]`;
  try {
    await page.waitForSelector(css_selector, { visible: true, timeout: 10000 });
  } catch (err) {
    // await browser.close();
    return []; // target tags not found
  }

  if (debug) {
    console.log('target element tag found');
  }

  let retry = 10;
  const valid_urls: string[] = [];
  while (retry--) {
    // Crawl src for all <img> tags
    let media_srcs: any[] = [];
    try {
      media_srcs = await page.$$eval(css_selector, imgs => imgs.map(img => img.getAttribute('src')));
    } catch (err) { }
    if (!media_srcs.length) {
      await wait(1000);
      if (debug) {
        console.log(`retry: ${10 - retry} []`);
      }
      continue;
    }

    for (const src of media_srcs) {
      if (src?.includes('pbs.twimg.com/media') ||
        src?.includes('pbs.twimg.com/tweet_video_thumb/')) {
        valid_urls.push(src.replace(/&name=.+$/, '&name=large'));
      }
    }

    if (debug) {
      console.log(`retry: ${10 - retry}`, valid_urls);
    }

    if (valid_urls.length) {
      break;
    }

    // Some extra delay to let images load
    await wait(1000);
  }

  await browser.close();

  return valid_urls;
};

if (process.env.NODE_ENV !== 'production') {
  process.on('uncaughtException', exception => console.log(exception));

  const gif_url = 'https://twitter.com/etranger_anime/status/1366765246950555652';
  // getTwitterImageUrls(gif_url);

  const video_url = 'https://twitter.com/trinityfate62/status/1375130608049954820';
  getTwitterImageUrls(video_url);

  const multi_img_url = 'https://twitter.com/sora1013siba/status/1374930115574996996';
  // getTwitterImageUrls(multi_img_url);

  const img_url = 'https://twitter.com/Machiccalition/status/1374828782620565504';
  // getTwitterImageUrls(img_url);

}
