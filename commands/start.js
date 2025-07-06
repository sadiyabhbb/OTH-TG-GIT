const { ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const saveDB = require('../utils/db').saveDB;
const checkAccess = require('../utils/checkAccess');

module.exports = (bot) => {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
    const BOT_NAME = process.env.BOT_NAME || 'PremiumBot';

    const { isAdmin, isApproved, isBanned, isPending } = checkAccess(msg.from);

    if (isAdmin) {
      return bot.sendMessage(chatId, `👑 *Welcome, Admin!*\nYou’ve entered the premium control panel of *${BOT_NAME}*.\n\n🔧 *Your access includes:*\n📊 Monitor user activity\n🧑‍💻 Manage users & roles\n⚙️ Configure features & limits\n📈 Track system stats\n\n🛡 Use commands responsibly to ensure smooth performance.\n\nNeed support?\n💬 Type */adminhelp* or contact the developer.`, {
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
      });
    }

    if (isBanned) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    if (!isApproved) {
      const db = require('../utils/db').loadDB();

      if (!isPending) {
        db.pending.push(userId);
        saveDB(db);
        notifyAdmin(bot, userId, username);
      } else {
        notifyAdmin(bot, userId, username, true);
      }

      return bot.sendMessage(chatId, `⛔ *Access Restricted*

👋 *Hello ${fullName}!*
Thank you for your interest in using *${BOT_NAME}*.

To ensure a secure and high-quality experience, access is limited to *authorized users only*.

🆔 *Your Telegram User ID:* \`${userId}\`
📬 *Please contact the administrator to request access:* @${ADMIN_USERNAME}

Upon approval, you will gain full access to:
✨ *Premium features*
🚀 *Fast and reliable service*
📥 *Data privacy and security*

🙏 We appreciate your understanding and cooperation.
– *The ${BOT_NAME} Team* 🤖`, {
        parse_mode: 'Markdown'
      });
    }

    // ✅ Approved user
    return bot.sendMessage(chatId, `👋 *Welcome ${fullName}!*
We’re glad to have you here. Let’s give you the *best experience* possible.

✅ Fast & reliable service  
💎 Premium-quality features  
🔐 End-to-end privacy  
🧠 User-friendly interface

👇 Choose an option below to get started:`, {
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
    });
  });
};
