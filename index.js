require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// ✅ Bot start time (used for real uptime)
global.botStartTime = Date.now();

// Load token from .env
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN is missing in .env file");
  process.exit(1);
}

// ✅ Bot Configuration
const config = {
  ADMIN_UID: process.env.ADMIN_UID, // .env থেকে admin UID নাও
  ADMIN_USERNAME: process.env.ADMIN_USERNAME // .env থেকে admin username নাও
};

// Initialize bot
const bot = new TelegramBot(token, {
  polling: true
});

// ✅ Load all command handlers with config
require('./commands/start')(bot, config);
require('./commands/gen')(bot, config);
require('./commands/admin')(bot, config);
require('./commands/users')(bot, config);
require('./commands/chk')(bot, config);
require('./commands/mass')(bot, config);
require('./commands/twofa')(bot, config);
require('./commands/checkemail')(bot, config);
require('./commands/uptime')(bot, config); // Optional
require('./commands/callback')(bot, config); // ✅ Callback handler

// 🌐 Render keep-alive HTTP server
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h2>✅ Telegram Bot is Running</h2>');
}).listen(process.env.PORT || 3000);

// 🛑 Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection:', reason);
});

// ✅ Log successful start
console.log('✅ Bot is running...');
