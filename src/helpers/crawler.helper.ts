import puppeteer from 'puppeteer';

function wait(ms: number) {
  return new Promise<void>(resolve => setTimeout(() => resolve(), ms));
}

export default async function getTwitterImageUrls(url: string): Promise<string[]> {
  const debug = process.env.NODE_ENV !== 'production';
  let browser = await puppeteer.launch({
    headless: !debug,
    slowMo: 100,
  });

  let page = await browser.newPage();

  try {
    await page.goto(url, {
      // less then 2 active connection
      waitUntil: 'networkidle2'
    });
  } catch (err) {
    return [];
  }

  const statusId = url.replace(/^.*\//, '');
  // const xpath = `//body//a[contains(@href, '${statusId}')]/ancestor::div[position()=1]//img`;
  const css_selector = `a[href*="/${statusId}/"] img[src]`;
  try {
    await page.waitForSelector(css_selector, { visible: true, timeout: 10000 });
  } catch (err) {
    await browser.close();
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
      if (src?.includes('pbs.twimg.com/media')) {
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

  const video_url = 'https://twitter.com/trinityfate62/status/1375130608049954820';
  // getTwitterImageUrls(video_url);

  const multi_img_url = 'https://twitter.com/sora1013siba/status/1374930115574996996';
  (async () => {
    try { await getTwitterImageUrls(multi_img_url); }
    catch (err) { console.log(err); }
  })();

  const img_url = 'https://twitter.com/Machiccalition/status/1374828782620565504';
  getTwitterImageUrls(img_url);

}
