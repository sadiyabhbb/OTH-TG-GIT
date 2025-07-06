const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

    const userDB = loadDB();
    const BOT_NAME = process.env.BOT_NAME || "PremiumBot";

    const isAdmin = (
      username.toLowerCase() === ADMIN_USERNAME.toLowerCase() ||
      userId.toString() === ADMIN_UID.toString()
    );

    // 👑 Admin Welcome
    if (isAdmin) {
      return bot.sendMessage(chatId, `🛠️ *Admin Panel Access:*

👑 *Welcome, Admin ${fullName}!*  
You’ve entered the *premium control panel* of *${BOT_NAME}*.

🛠️ *Your access includes:*  
📊 *Monitor user activity*  
🧑‍💻 *Manage users & roles*  
⚙️ *Configure features & limits*  
📈 *Track system stats*

🛡️ *Use commands responsibly* to ensure smooth performance.

💬 Need support?  
💭 Type */adminhelp* or contact the developer.
`, {
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

    // 🚫 Banned User
    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.')
        .catch(err => console.error('Banned message error:', err));
    }

    // ⏳ Not Approved
    if (!userDB.approved.includes(userId)) {
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

    // ✅ Approved User Welcome
    return bot.sendMessage(chatId, `👤 *Welcome, ${fullName}!*

We’re glad to have you on *${BOT_NAME}*.  
Let’s give you the *best experience* possible.

🚀 *What you get:*  
✅ *Fast & reliable service*  
💎 *Premium-quality features*  
🔒 *End-to-end data privacy*  
🧠 *Smart & user-friendly interface*

🟢 *To begin:*  
➡️ Type */start*  
📘 For commands, type */help*

*Thanks for joining — let’s make it simple, fast & premium.* 🧡🤖
`, {
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
