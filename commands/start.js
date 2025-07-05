const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { notifyAdmin } = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';

    const userDB = loadDB();

    if (username === ADMIN_USERNAME || userId === ADMIN_UID) {
      return bot.sendMessage(chatId, `🎉 Welcome Admin!\nBot is ready to use!\n\n💳 Try /gen 515462`);
    }

    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    if (!userDB.approved.includes(userId)) {
      if (!userDB.pending.includes(userId)) {
        userDB.pending.push(userId);
        saveDB(userDB);

        bot.sendMessage(chatId, `⏳ Request sent. Please wait for admin approval.`);
        bot.sendMessage(chatId, `🧾 Your UID: \`${userId}\`\nSend this to the admin (@${ADMIN_USERNAME}) for approval.`, {
          parse_mode: "MarkdownV2"
        });

        notifyAdmin(bot, userId, username);
      } else {
        bot.sendMessage(chatId, `⏳ You are already in pending list.\n\n🧾 Your UID: \`${userId}\``, {
          parse_mode: "MarkdownV2"
        });

        notifyAdmin(bot, userId, username, true);
      }
      return;
    }

    bot.sendMessage(chatId, `🎉 Bot is ready to use!\n\n💳 Generate CCs with:\n/gen 515462`);
  });
};
