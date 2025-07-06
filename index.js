// index.js (Polling version)

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');

// ✅ Create bot with polling enabled
const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
  fileDownloadOptions: {
    headers: {
      'User-Agent': 'Telegram Bot'
    }
  }
});

// ⏱️ Store bot start time globally
global.botStartTime = Date.now();

// 🗃️ Load user DB and ensure structure
const { loadDB, saveDB } = require('./utils/db');
const userDB = loadDB();
if (!userDB.approved || !userDB.pending || !userDB.banned) {
  saveDB({ approved: [], pending: [], banned: [] });
}

// 🔁 Dynamically load all commands from commands folder
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const command = require(`./commands/${file}`);
    if (typeof command === 'function') {
      command(bot);
    }
  }
});

console.log("✅ Bot is running in polling mode...");
