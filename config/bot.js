require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');

const bot = new TelegramBot(process.env.BOT_TOKEN, {
  polling: true,
  fileDownloadOptions: {
    headers: {
      'User-Agent': 'Telegram Bot'
    }
  }
});

module.exports = bot;
