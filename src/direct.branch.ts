import bot = require('bbot');
import getTwitterImageUrls from './helpers/crawler.helper';


bot.global.direct(/hi|hello/i, (b) => b.reply('Hey there.' + b.conditions.matched), {
  id: 'hello-direct'
});

bot.global.direct(/twitter.com\/.+\/status\/(\d+)/, async (b) => {
  const url = b.message.toString().replace('omubot ', '');
  const img_urls = await getTwitterImageUrls(url);
  if (img_urls.length) {
    const message = img_urls.join('\n');
    b.reply(message);
  }
}, {
  id: 'twitch-img-direct'
});

bot.global.direct(/ping back in (\d*)/i, async (b) => {
  const ms = parseInt(b.match[1]) * 1000;
  await new Promise((resolve) => setTimeout(resolve, ms));
  return b.respond('Ping :ping_pong:');
}, {
  id: 'ping-delay'
});
