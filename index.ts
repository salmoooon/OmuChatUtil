import bot = require('bbot');
import glob from 'glob';
import path from 'path';

process.on('uncaughtException', exception => console.log(exception));

/** Add your bot logic here. Removing the imported examples. */
// glob.sync('./src/**/*.branch.js').map((file: string) => require(path.resolve(file)));
require('./src/direct.branch.js');
require('./src/text.branch.js');

bot.start(); // 🚀
