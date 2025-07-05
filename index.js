const http = require('http');
const bot = require('./config/bot');

// Command loader
require('./commands/start')(bot);
require('./commands/gen')(bot);
require('./commands/admin')(bot);
require('./commands/users')(bot);
require('./commands/chk')(bot);
require('./commands/mass')(bot);
require('./commands/twofa')(bot);
require('./commands/checkemail')(bot); // ✅ checkemail command
require('./commands/uptime')(bot); // ⏱️ uptime command
require('./commands/tempmail')(bot); // 📬 tempmail.plus checker

// Keep-alive for Render
http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/html' });
  res.end('<h2>✅ Telegram Bot Running</h2>');
}).listen(process.env.PORT || 3000);

console.log('✅ Bot is running...');
