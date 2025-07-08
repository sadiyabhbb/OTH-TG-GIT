require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');
const { loadDB, saveDB } = require('./utils/db');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Telegram bot is live and using polling!');
});

global.botStartTime = Date.now();
global.activeEmails = {};

(async () => {
  try {
    const db = await loadDB();
    global.userDB = db;
  } catch (err) {
    console.warn('⚠️ Failed to load DB:', err.message);
    global.userDB = { approved: [], pending: [], banned: [] };
  }

  const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

  // ✅ All command files
  const commandsPath = path.join(__dirname, 'commands');
  if (fs.existsSync(commandsPath)) {
    const files = fs.readdirSync(commandsPath);
    for (const file of files) {
      if (file.endsWith('.js')) {
        try {
          const command = require(path.join(commandsPath, file));
          if (typeof command === 'function') {
            command(bot);
          }
        } catch (err) {
          console.error(`❌ Error in ${file}:`, err.message);
        }
      }
    }
  }

  app.listen(port, () => {
    console.log(`✅ Bot server running via polling on port ${port}`);
  });
})();
