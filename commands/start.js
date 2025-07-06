const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB, saveDB } = require('../utils/db');
const notifyAdmin = require('../utils/notifyAdmin');

module.exports = (bot) => {
  // 🟢 /start Command
  bot.onText(/\/start/, (msg) => {
    handleStart(bot, msg.chat.id, msg.from);
  });

  // 🔁 Callback query handler for "back"
  bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const from = query.from;

    if (data === 'back') {
      handleStart(bot, chatId, from, query.id, query.message.message_id);
    }
  });
};

// 🧠 Central Start Handler Function
function handleStart(bot, chatId, from, callbackId = null, messageId = null) {
  const uid = from.id;
  const username = from.username || 'NoUsername';
  const cleanUsername = username.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
  const isAdmin = uid === Number(ADMIN_UID);

  const userDB = loadDB();
  const isApproved = userDB.approved.includes(uid);
  const isBanned = userDB.banned.includes(uid);
  const isPending = userDB.pending.includes(uid);

  const adminWelcome =
`👑 *Welcome, Admin!*
You've entered the premium control panel of *PremiumBot*.

🔧 *Your access includes:*
📊 Monitor user activity
🧑‍💻 Manage users & roles
⚙️ Configure features & limits
📈 Track system stats

🛡 *Use commands responsibly to ensure smooth performance.*

Need support?  
💬 Type /adminhelp or contact the developer.`;

  const userWelcome =
`👤 *Welcome, ${cleanUsername}!*

We're glad to have you on *PremiumBot*.
Let's give you the *best experience possible*.

🚀 *What you get:*  
✅ Fast & reliable service  
💎 Premium-quality features  
🔒 End-to-end data privacy  
🧠 Smart & user-friendly interface

🟢 *To begin:*  
➡️ Type /start

Thanks for joining — let's make it simple, fast & premium. 🧡🤖`;

  // ❌ If banned
  if (isBanned) {
    return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
  }

  // ✅ If Admin or Approved
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

    if (callbackId && messageId) {
      // 🔁 Edit message on back press
      bot.answerCallbackQuery(callbackId);
      return bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons }
      });
    } else {
      // 🔰 Normal /start command
      return bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons }
      });
    }
  }

  // ⏳ If not approved, mark as pending
  if (!isPending) {
    userDB.pending.push(uid);
    saveDB(userDB);
  }

  bot.sendMessage(chatId, `⏳ Your access is pending approval by @${ADMIN_USERNAME}.\nPlease wait...`);
  notifyAdmin(bot, uid, username, isPending);
}
