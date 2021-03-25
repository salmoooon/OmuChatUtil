import bot = require('bbot');
import glob from 'glob';
import path from 'path';

/** This is a workaround for Heroku to confirm web binding. */
// @todo Remove this when bBot includes Express (next release)
import http from 'http';

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

const handle = (req, res) => res.end('hit');
const server = http.createServer(handle);
server.listen(process.env.PORT || 5000);

/** Add your bot logic here. Removing the imported examples. */
// glob.sync('./src/**/*.branch.js').map((file: string) => require(path.resolve(file)));
require('./src/direct.branch.js');
require('./src/text.branch.js');

bot.start(); // 🚀
