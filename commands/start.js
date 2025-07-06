const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
    const username = msg.from.username || 'NoUsername';
    const BOT_NAME = process.env.BOT_NAME || "PremiumBot";

    const userDB = loadDB();

    const isAdmin = (
      username?.toLowerCase() === ADMIN_USERNAME?.toLowerCase() ||
      userId.toString() === ADMIN_UID.toString()
    );

    // 🛑 Banned check
    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.')
        .catch(err => console.error('Banned message error:', err));
    }

    // 👑 Admin Welcome
    if (isAdmin) {
      return bot.sendMessage(chatId, `👑 *Welcome, Admin!* ...`, {
        parse_mode: "Markdown",
        reply_markup: {
          inline_keyboard: [
            [{ text: "🧾 Users", callback_data: "users" }],
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
      }).catch(err => console.error('Admin welcome error:', err));
    }

    // ⏳ Not approved yet
    if (!userDB.approved.includes(userId)) {
      if (!userDB.pending.includes(userId)) {
        userDB.pending.push(userId);
        saveDB(userDB);
        notifyAdmin(bot, userId, username);
      } else {
        notifyAdmin(bot, userId, username, true);
      }

      return bot.sendMessage(chatId, `⛔ *Access Restricted* ...`, {
        parse_mode: "Markdown"
      }).catch(err => console.error('Pending request error:', err));
    }

    // ✅ Approved user welcome
    return bot.sendMessage(chatId, `👋 *Welcome ${fullName}! ...`, {
      parse_mode: "Markdown",
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
    }).catch(err => console.error('Approved user message error:', err));
  });
};
