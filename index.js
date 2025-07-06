require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const http = require('http');

// Load token from .env
const token = process.env.BOT_TOKEN;

if (!token) {
  console.error("❌ BOT_TOKEN is missing in .env file");
  process.exit(1);
}

// Initialize bot
const bot = new TelegramBot(token, {
  polling: true
});

// Load all commands
require('./commands/start')(bot);
require('./commands/gen')(bot);
require('./commands/admin')(bot);
require('./commands/users')(bot);
require('./commands/chk')(bot);
require('./commands/mass')(bot);
require('./commands/twofa')(bot);
require('./commands/checkemail')(bot);
require('./commands/uptime')(bot);

// Render keep-alive HTTP server
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h2>✅ Telegram Bot is Running</h2>');
}).listen(process.env.PORT || 3000);

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('🔴 Unhandled Rejection:', reason);
});

// Log successful start
console.log('✅ Bot is running...');
