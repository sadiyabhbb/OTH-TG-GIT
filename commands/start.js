const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';

    const userDB = loadDB();

    if (username === ADMIN_USERNAME || userId.toString() === ADMIN_UID.toString()) {
      return bot.sendMessage(chatId, `🎉 Welcome Admin!\nBot is ready to use!\n\n💳 Try /gen 515462`)
        .catch(err => console.error('Admin welcome error:', err.message || err));
    }

    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.')
        .catch(err => console.error('Banned message error:', err.message || err));
    }

    if (!userDB.approved.includes(userId)) {
      if (!userDB.pending.includes(userId)) {
        userDB.pending.push(userId);
        saveDB(userDB);

        bot.sendMessage(chatId, `⏳ Request sent. Please wait for admin approval.`)
          .catch(err => console.error('Pending request error:', err.message || err));

        bot.sendMessage(chatId, `🧾 Your UID: \`${userId}\`\nSend this to the admin (@${ADMIN_USERNAME}) for approval.`, {
          parse_mode: "Markdown"
        }).catch(err => console.error('UID info send error:', err.message || err));

        notifyAdmin(bot, userId, username);
      } else {
        bot.sendMessage(chatId, `⏳ You are already in pending list.\n\n🧾 Your UID: \`${userId}\``, {
          parse_mode: "Markdown"
        }).catch(err => console.error('Already pending error:', err.message || err));

        notifyAdmin(bot, userId, username, true);
      }
      return;
    }

    bot.sendMessage(chatId, `🎉 Bot is ready to use!\n\n💳 Generate CCs with:\n/gen 515462`)
      .catch(err => console.error('Approved user message error:', err.message || err));
  });
};
