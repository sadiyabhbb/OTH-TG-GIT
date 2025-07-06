// index.js

const bot = require('./config/bot');
const fs = require('fs');
const path = require('path');

// ⏱️ Store bot start time globally (for uptime feature)
global.botStartTime = Date.now();

// 🧠 Load & verify user DB on startup
const { loadDB, saveDB } = require('./utils/db');
const userDB = loadDB();

// Create user DB file if missing or malformed
if (!userDB.approved || !userDB.pending || !userDB.banned) {
  saveDB({ approved: [], pending: [], banned: [] });
}

// 🚀 Auto-load all command files from commands/ folder
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const command = require(`./commands/${file}`);
    if (typeof command === 'function') {
      command(bot); // Inject bot instance
    }
  }
});

// ✅ Bot started
console.log('🤖 Telegram bot started successfully!');
