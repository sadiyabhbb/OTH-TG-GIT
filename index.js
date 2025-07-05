require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Bot Initialization
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
  fileDownloadOptions: {
    headers: {
      'User-Agent': 'Telegram Bot'
    }
  }
});
module.exports = bot;

// Keep-alive for Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end(`<h2>✅ Telegram Bot Running</h2>`);
}).listen(process.env.PORT || 3000);

console.log('✅ Bot is running...');

// Commands
require('./commands/start');
require('./commands/gen');
require('./commands/admin');
require('./commands/users');
require('./commands/chk');
require('./commands/mass');
require('./commands/twofa');
require('./commands/checkemail');
