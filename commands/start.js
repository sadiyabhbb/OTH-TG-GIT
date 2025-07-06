const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';

    const userDB = loadDB();

    const isAdmin = (
      username === ADMIN_USERNAME ||
      userId.toString() === ADMIN_UID.toString()
    );

    // 🛑 If banned
    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.')
        .catch(err => console.error('Banned message error:', err));
    }

    // ⏳ If pending approval
    if (!userDB.approved.includes(userId) && !isAdmin) {
      if (!userDB.pending.includes(userId)) {
        userDB.pending.push(userId);
        saveDB(userDB);

        bot.sendMessage(chatId, `⏳ Request sent. Please wait for admin approval.`)
          .catch(err => console.error('Pending request error:', err));

        bot.sendMessage(chatId, `🧾 Your UID: \`${userId}\`\nSend this to the admin (@${ADMIN_USERNAME}) for approval.`, {
          parse_mode: "Markdown"
        }).catch(err => console.error('UID info error:', err));

        notifyAdmin(bot, userId, username);
      } else {
        bot.sendMessage(chatId, `⏳ You are already in pending list.\n\n🧾 Your UID: \`${userId}\``, {
          parse_mode: "Markdown"
        }).catch(err => console.error('Already pending error:', err));

        notifyAdmin(bot, userId, username, true);
      }
      return;
    }

    // ✅ Approved user or admin
    const welcomeText = isAdmin
      ? `👑 Welcome Admin @${username}!`
      : `🎉 Welcome ${username}!\nUse the buttons below:`;

    const buttons = isAdmin
      ? [
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
      : [
          [
            { text: "💳 Gen", callback_data: "gen" },
            { text: "📩 TempMail", callback_data: "tempmail" }
          ],
          [
            { text: "🔐 2FA", callback_data: "2fa" },
            { text: "🕒 Uptime", callback_data: "uptime" }
          ]
        ];

    return bot.sendMessage(chatId, welcomeText, {
      reply_markup: {
        inline_keyboard: buttons
      },
      parse_mode: "Markdown"
    }).catch(err => console.error('Start message error:', err));
  });
};
