const axios = require('axios');
const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB } = require('../utils/db');

module.exports = (bot) => {
  const userDB = loadDB();

  bot.onText(/\.chk (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const card = match[1].trim();

    if (userId !== ADMIN_UID && !userDB.approved.includes(userId)) {
      return bot.sendMessage(chatId, `⛔ You are not approved to use this bot.\nAsk @${ADMIN_USERNAME} for access.`);
    }

    if (!/^\d{15,16}\|\d{2}\|\d{4}\|\d{3}$/.test(card)) {
      return bot.sendMessage(chatId, '⚠️ Invalid format.\nCorrect: `xxxx|mm|yyyy|cvv`', {
        parse_mode: 'Markdown'
      });
    }

    bot.sendMessage(chatId, `🔁 Checking your card via chkr.cc...`);

    try {
      const res = await axios.get(`https://chkr.cc/api/chk?cards=${card}`);
      const result = res.data?.result?.[0];
      const status = result?.status || 'unknown';
      const msgText = result?.msg || 'No message';

      let icon = '❓';
      if (status === 'live') icon = '✅🟢';
      else if (status === 'dead') icon = '❌🔴';
      else if (status === 'unknown') icon = '⚠️❓';

      const response =
        `\`${card}\`\n` +
        `${icon} *${status.toUpperCase()}*\n` +
        `ℹ️ ${msgText}\n\n` +
        `👤 Checked by: @${username}`;

      bot.sendMessage(chatId, response, { parse_mode: 'Markdown' });
    } catch (error) {
      console.error('CHK API error:', error.message);
      bot.sendMessage(chatId, '❌ Error contacting chkr.cc API.');
    }
  });
};
