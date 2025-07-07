require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
const port = process.env.PORT || 3000;

// ✅ Express root route (for Render health check or UptimeRobot ping)
app.get('/', (req, res) => {
  res.send('🤖 Telegram bot is live and using polling!');
});

// ⏱️ Global uptime (optional use)
global.botStartTime = Date.now();

// 🗃️ Load user DB safely
const { loadDB, saveDB } = require('./utils/db');
let userDB;
try {
  userDB = loadDB();
  if (!userDB.approved || !userDB.pending || !userDB.banned) {
    userDB = { approved: [], pending: [], banned: [] };
    saveDB(userDB);
  }
} catch (err) {
  console.error('❌ Failed to load user DB:', err);
  userDB = { approved: [], pending: [], banned: [] };
  saveDB(userDB);
}

// 🔁 Dynamically load all command files
const commandsPath = path.join(__dirname, 'commands');
fs.readdir(commandsPath, (err, files) => {
  if (err) {
    console.error('❌ Failed to load command files:', err);
    return;
  }

  files.forEach(file => {
    if (file.endsWith('.js')) {
      try {
        const command = require(path.join(commandsPath, file));
        if (typeof command === 'function') {
          command(bot);
        }
      } catch (error) {
        console.error(`❌ Error loading command ${file}:`, error);
      }
    }
  });
});

// 🚀 Start express server (Render requires this to keep service alive)
app.listen(port, () => {
  console.log(`✅ Bot server running via polling on port ${port}`);
});
