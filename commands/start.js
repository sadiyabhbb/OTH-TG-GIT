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

    // ✅ Admin Welcome Panel
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
      }).catch(err => console.error('Admin welcome error:', err));
    }

    // 🛑 If banned
    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.')
        .catch(err => console.error('Banned message error:', err));
    }

    // ⏳ If pending approval
    if (!userDB.approved.includes(userId)) {
      if (!userDB.pending.includes(userId)) {
        userDB.pending.push(userId);
        saveDB(userDB);

        notifyAdmin(bot, userId, username);

        return bot.sendMessage(chatId, `🚫 *Access Restricted*

👋 *Hello!*  
Thank you for your interest in using *${BOT_NAME}*.

To ensure a secure and high-quality experience, access is limited to *authorized users only*.

🆔 *Your Telegram User ID:* \`${userId}\`  
📩 *Please contact the administrator to request access:* @${ADMIN_USERNAME}

Upon approval, you will gain full access to:  
✨ *Premium features*  
🚀 *Fast and reliable service*  
📜 *Data privacy and security*

🙏 *We appreciate your understanding and cooperation.*  
— *The ${BOT_NAME} Team* 🤖`, {
          parse_mode: "Markdown"
        }).catch(err => console.error('Pending request error:', err));
      } else {
        notifyAdmin(bot, userId, username, true);
        return bot.sendMessage(chatId, `🚫 *Access Restricted*

👋 *Hello!*  
Thank you for your interest in using *${BOT_NAME}*.

To ensure a secure and high-quality experience, access is limited to *authorized users only*.

🆔 *Your Telegram User ID:* \`${userId}\`  
📩 *Please contact the administrator to request access:* @${ADMIN_USERNAME}

Upon approval, you will gain full access to:  
✨ *Premium features*  
🚀 *Fast and reliable service*  
📜 *Data privacy and security*

🙏 *We appreciate your understanding and cooperation.*  
— *The ${BOT_NAME} Team* 🤖`, {
          parse_mode: "Markdown"
        }).catch(err => console.error('Already pending error:', err));
      }
    }

    // ✅ Approved User Welcome Panel
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
    }).catch(err => console.error('Approved user message error:', err));
  });
};
