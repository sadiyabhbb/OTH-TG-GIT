require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
const port = process.env.PORT || 3000;

// ✅ Bot status route (for Render health check)
app.get('/', (req, res) => {
  res.send('🤖 Telegram bot is live and using polling!');
});

// ⏱️ Global uptime
global.botStartTime = Date.now();

// 🗃️ Load user DB
const { loadDB, saveDB } = require('./utils/db');
const userDB = loadDB();
if (!userDB.approved || !userDB.pending || !userDB.banned) {
  saveDB({ approved: [], pending: [], banned: [] });
}

// 🔁 Load all command files dynamically
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const command = require(`./commands/${file}`);
    if (typeof command === 'function') {
      command(bot);
    }
  }
});

// 🚀 Start express server (needed for Render to keep service alive)
app.listen(port, () => {
  console.log(`✅ Bot server running via polling on port ${port}`);
});
