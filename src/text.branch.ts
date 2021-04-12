import bot = require('bbot');
import getTwitterImageUrls from './helpers/crawler.helper';


bot.global.text(/(hi|hello).*bots?/, (b) => b.respond('Hello :wave:'), {
  id: 'hello-bots'
});

bot.global.text(/twitter.com\/.+\/status\/(\d+)/, async (b) => {
  const url = b.message.toString().replace('omubot ', '');
  const img_urls = await getTwitterImageUrls(url);
  if (img_urls.length) {
    const message = img_urls.join('\n');
    b.reply(message);
  }
}, {
  id: 'twitch-img-text'
});

bot.global.text({
  contains: ['hi', 'hello']
}, (b) => b.respondVia('react', ':wave:'), {
  id: 'hello-react'
});
