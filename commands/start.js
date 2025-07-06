const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB, saveDB } = require('../utils/db');
const notifyAdmin = require('../utils/notifyAdmin');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const uid = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const cleanUsername = username.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
    const isAdmin = uid === Number(ADMIN_UID);

    const userDB = loadDB();
    const isApproved = userDB.approved.includes(uid);
    const isBanned = userDB.banned.includes(uid);
    const isPending = userDB.pending.includes(uid);

    // ❌ যদি banned হয়
    if (isBanned) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    // 👑 Admin বা ✅ Approved হলে
    if (isAdmin || isApproved) {
      const message = isAdmin
        ? `👑 *Welcome, Admin!*\nYou've entered the premium control panel of *PremiumBot*.\n\n🔧 *Your access includes:*\n📊 Monitor user activity\n🧑‍💻 Manage users \\& roles\n⚙️ Configure features \\& limits\n📈 Track system stats\n\n🛡 *Use commands responsibly to ensure smooth performance.*\n\nNeed support?\n💬 Type /adminhelp or contact the developer.`
        : `👤 *Welcome, ${cleanUsername}!*\n\nWe're glad to have you on *PremiumBot*.\nLet's give you the *best experience possible*.\n\n🚀 *What you get:*\n✅ Fast & reliable service\n💎 Premium-quality features\n🔒 End-to-end data privacy\n🧠 Smart & user-friendly interface\n\n🟢 *To begin:*\n➡️ Type /start\n\nThanks for joining — let's make it simple, fast & premium. 🧡🤖`;

      const buttons = isAdmin
        ? [
            [{ text: "📄 Users", callback_data: "users" }],
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

      return bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: buttons
        }
      });
    }

    // ⏳ Pending user হলে
    if (!isPending) {
      userDB.pending.push(uid);
      saveDB(userDB);
    }

    bot.sendMessage(chatId, `⏳ Your access is pending approval by @${ADMIN_USERNAME}.\nPlease wait...`);
    notifyAdmin(bot, uid, username, isPending);
  });
};
