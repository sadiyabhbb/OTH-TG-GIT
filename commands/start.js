const { loadDB, saveDB } = require('../utils/db');
const { ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');

module.exports = (bot) => {
  bot.onText(/\/start/, async (msg) => {
    const uid = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const chatId = msg.chat.id;

    const db = loadDB();

    if (db.banned.includes(uid)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    if (db.approved.includes(uid)) {
      return bot.sendMessage(chatId, `🎉 Welcome back @${username}!\n\nUse the inline buttons below:`, {
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

    if (!db.pending.includes(uid)) {
      db.pending.push(uid);
      saveDB(db);
      notifyAdmin(bot, uid, username, false);
    } else {
      notifyAdmin(bot, uid, username, true);
    }

    bot.sendMessage(chatId,
      `👋 হ্যালো @${username}!\n\n` +
      `আপনার এক্সেস এখনও অনুমোদিত হয়নি।\n` +
      `অনুগ্রহ করে অনুমোদনের জন্য অপেক্ষা করুন অথবা যোগাযোগ করুন @${ADMIN_USERNAME} এর সাথে।\n\n` +
      `📩 স্টেটাস: Pending Approval`
    );
  });
};
