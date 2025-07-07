require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
const port = process.env.PORT || 3000;

// ✅ Root route for Render/UptimeRobot
app.get('/', (req, res) => {
  res.send('🤖 Telegram bot is live and using polling!');
});

// ⏱️ Global uptime
global.botStartTime = Date.now();

// ✅ Optional DB (safe load)
let userDB = { approved: [], pending: [], banned: [] };
try {
  const { loadDB, saveDB } = require('./utils/db');
  userDB = loadDB();
  if (!userDB.approved || !userDB.pending || !userDB.banned) {
    userDB = { approved: [], pending: [], banned: [] };
    saveDB(userDB);
  }
} catch (err) {
  console.warn('⚠️ DB module missing or error:', err.message);
}

// ✅ Load command files dynamically (if folder exists)
const commandsPath = path.join(__dirname, 'commands');
if (fs.existsSync(commandsPath)) {
  fs.readdir(commandsPath, (err, files) => {
    if (err) {
      console.error('❌ Failed to load commands:', err.message);
    } else {
      files.forEach(file => {
        if (file.endsWith('.js')) {
          try {
            const command = require(path.join(commandsPath, file));
            if (typeof command === 'function') {
              command(bot);
            }
          } catch (e) {
            console.error(`❌ Error in ${file}:`, e.message);
          }
        }
      });
    }
  });
}

// ✅ Basic fallback command (works even if commands folder is empty)
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '👋 Bot is working! You sent /start.');
});

// 🚀 Start Express server
app.listen(port, () => {
  console.log(`✅ Bot server running via polling on port ${port}`);
});
