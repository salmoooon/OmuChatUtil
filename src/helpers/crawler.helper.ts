import puppeteer from 'puppeteer';

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

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
    throw err;
  }

  let retry = 3;
  const pbs_img_urls: string[] = [];
  while (retry--) {
    // Crawl src for all <img> tags
    const img_urls = await page.$$eval('img[src]', imgs => imgs.map(img => img.getAttribute('src')));

    for (const img_url of img_urls) {
      if (img_url?.includes('pbs.twimg.com/media')) {
        pbs_img_urls.push(img_url.replace(/&name=.+$/, '&name=large'));
      }
    }
    if (debug) {
      console.log(`retry: ${3 - retry}`, pbs_img_urls);
    }

    if (pbs_img_urls.length) {
      break;
    }

    // Some extra delay to let images load
    await wait(1000);
  }

  await browser.close();

  return pbs_img_urls;
};
