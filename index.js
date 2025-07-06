require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// ✅ Bot start time
global.botStartTime = Date.now();

// Load token from .env
const token = process.env.BOT_TOKEN;
if (!token) {
  console.error("❌ BOT_TOKEN missing from .env");
  process.exit(1);
}

// Bot config
const config = {
  ADMIN_UID: process.env.ADMIN_UID,
  ADMIN_USERNAME: process.env.ADMIN_USERNAME
};

// Initialize bot
const bot = new TelegramBot(token, { polling: true });

// ✅ Load all command handlers (pass both bot and config)
require('./commands/start')(bot, config);
require('./commands/callback')(bot, config);
// Other commands below...
// require('./commands/gen')(bot, config);
// require('./commands/admin')(bot, config);
// etc...

// 🌐 Keep-alive for Render
http.createServer((req, res) => {
  res.writeHead(200);
  res.end('✅ Telegram bot is running!');
}).listen(process.env.PORT || 3000);

// Catch unhandled rejections
process.on('unhandledRejection', (reason) => {
  console.error('❌ Unhandled Promise:', reason);
});

console.log('✅ Bot is running...');
