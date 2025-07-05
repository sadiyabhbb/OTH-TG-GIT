const axios = require('axios');
const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB } = require('../utils/db');

module.exports = (bot) => {
  const userDB = loadDB();

  bot.onText(/\.mass/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';

    if (userId !== ADMIN_UID && !userDB.approved.includes(userId)) {
      return bot.sendMessage(chatId, `⛔ You are not approved to use this bot.\nAsk @${ADMIN_USERNAME} for access.`);
    }

    const replyMsg = msg.reply_to_message?.text;
    if (!replyMsg) {
      return bot.sendMessage(chatId, '❌ Reply to a message containing CCs to use `.mass`');
    }

    const cards = replyMsg
      .split('\n')
      .map(l => l.trim())
      .filter(l => /^\d{15,16}\|\d{2}\|\d{4}\|\d{3}$/.test(l));

    if (!cards.length) {
      return bot.sendMessage(chatId, '⚠️ No valid CCs found in replied message.');
    }

    bot.sendMessage(chatId, `🔁 Checking ${cards.length} cards via chkr.cc...`);

    let responseText = `👤 @${username} - .mass\n\n`;

    for (const card of cards) {
      try {
        const res = await axios.get(`https://chkr.cc/api/chk?cards=${card}`);
        const result = res.data?.result?.[0];
        const status = result?.status || 'unknown';
        const msgText = result?.msg || 'No message';

        let icon = '❓';
        if (status === 'live') icon = '✅🟢';
        else if (status === 'dead') icon = '❌🔴';
        else if (status === 'unknown') icon = '⚠️❓';

        responseText += `\`${card}\`\n${icon} *${status.toUpperCase()}* - ${msgText}\n\n`;
      } catch (err) {
        console.error('Error checking card:', err.message);
        responseText += `\`${card}\`\n⚠️ API error\n\n`;
      }
    }

    bot.sendMessage(chatId, responseText.trim(), { parse_mode: 'Markdown' });
  });
};
