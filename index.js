require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('🤖 Telegram bot is live and using polling!');
});

global.botStartTime = Date.now();
global.activeEmails = {}; // For OTP command

// ✅ Wrap everything inside an async IIFE
(async () => {
  const { loadDB, saveDB } = require('./utils/db');

  // ✅ Load DB properly
  try {
    const db = await loadDB();
    global.userDB = db; // Optional: save globally if needed
  } catch (err) {
    console.warn('⚠️ Failed to load DB:', err.message);
    global.userDB = { approved: [], pending: [], banned: [] };
  }

  // ✅ Create bot after DB is ready
  const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

  // ✅ Load all command files
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
                command(bot); // Pass bot to command
              }
            } catch (e) {
              console.error(`❌ Error in ${file}:`, e.message);
            }
          }
        });
      }
    });
  }

  // ✅ Start Express server
  app.listen(port, () => {
    console.log(`✅ Bot server running via polling on port ${port}`);
  });
})();
