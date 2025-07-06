// index.js (Webhook + PORT)

require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const fs = require('fs');
const path = require('path');

const bot = new TelegramBot(process.env.BOT_TOKEN, { webHook: true });
const app = express();
const port = process.env.PORT || 3000;

// 📍 Set webhook URL
const url = process.env.RENDER_EXTERNAL_URL || 'https://your-render-url.onrender.com';
bot.setWebHook(`${url}/bot${process.env.BOT_TOKEN}`);

// ⏱️ Store bot start time globally
global.botStartTime = Date.now();

// Load user DB
const { loadDB, saveDB } = require('./utils/db');
const userDB = loadDB();
if (!userDB.approved || !userDB.pending || !userDB.banned) {
  saveDB({ approved: [], pending: [], banned: [] });
}

// 🔁 Load all command modules from commands/
const commandsPath = path.join(__dirname, 'commands');
fs.readdirSync(commandsPath).forEach(file => {
  if (file.endsWith('.js')) {
    const command = require(`./commands/${file}`);
    if (typeof command === 'function') {
      command(bot);
    }
  }
});

// 📡 Express endpoint to receive webhook updates
app.use(express.json());
app.post(`/bot${process.env.BOT_TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// 🚀 Start server
app.listen(port, () => {
  console.log(`✅ Bot server running on port ${port}`);
});
