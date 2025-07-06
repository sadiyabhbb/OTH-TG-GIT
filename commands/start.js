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

    const adminWelcome =
`👑 *Welcome, Admin!*
You've entered the premium control panel of *PremiumBot*\\.

🔧 *Your access includes:*
📊 Monitor user activity  
🧑‍💻 Manage users \\& roles  
⚙️ Configure features \\& limits  
📈 Track system stats

🛡 *Use commands responsibly to ensure smooth performance\\.*

Need support?  
💬 Type */adminhelp* or contact the developer\\.`;

    const userWelcome =
`👤 *Welcome, ${cleanUsername}!*

We're glad to have you on *PremiumBot*\\.
Let's give you the *best experience possible*\\.

🚀 *What you get:*  
✅ Fast \\& reliable service  
💎 Premium\\-quality features  
🔒 End\\-to\\-end data privacy  
🧠 Smart \\& user\\-friendly interface

🟢 *To begin:*  
➡️ Type */start*

Thanks for joining — let's make it simple, fast \\& premium\\. 🧡🤖`;

    const userDB = loadDB();
    const isApproved = userDB.approved.includes(uid);
    const isBanned = userDB.banned.includes(uid);
    const isPending = userDB.pending.includes(uid);

    if (isBanned) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    if (isAdmin || isApproved) {
      const message = isAdmin ? adminWelcome : userWelcome;
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
        parse_mode: 'MarkdownV2',
        reply_markup: { inline_keyboard: buttons }
      });
    }

    // Not approved yet
    if (!isPending) {
      userDB.pending.push(uid);
      saveDB(userDB);
    }

    const pendingMsg = `⏳ Your access is pending approval by @${ADMIN_USERNAME.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&')}\\.\\nPlease wait\\.\\.\\.`;

    bot.sendMessage(chatId, pendingMsg, { parse_mode: 'MarkdownV2' });
    notifyAdmin(bot, uid, username, isPending);
  });
};
