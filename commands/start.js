const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB, saveDB } = require('../utils/db');
const notifyAdmin = require('../utils/notifyAdmin');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const uid = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const userDB = loadDB();

    const isApproved = userDB.approved.includes(uid);
    const isBanned = userDB.banned.includes(uid);
    const isPending = userDB.pending.includes(uid);

    if (isBanned) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    if (isApproved) {
      return bot.sendMessage(chatId, `🎉 Welcome @${username}!\nUse the buttons below:`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: "💳 Gen", callback_data: "gen" },
              { text: "📩 TempMail", callback_data: "tempmail" }
            ],
            [
              { text: "🔐 2FA", callback_data: "2fa" },
              { text: "🕒 Uptime", callback_data: "uptime" }
            ]
          ]
        }
      });
    }

    // ⏳ If not approved, add to pending (if not already)
    if (!isPending) {
      userDB.pending.push(uid);
      saveDB(userDB);
    }

    bot.sendMessage(chatId, `⏳ Your access is pending approval by @${ADMIN_USERNAME}.\nPlease wait...`);

    notifyAdmin(bot, uid, username, isPending); // Notify admin only if new or re-pending
  });
};
