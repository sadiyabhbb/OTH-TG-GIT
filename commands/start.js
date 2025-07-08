const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB, saveDB } = require('../utils/db');
const notifyAdmin = require('../utils/notifyAdmin');

module.exports = (bot) => {
  // /start command
  bot.onText(/\/start/, async (msg) => {
    await handleStart(bot, msg.chat.id, msg.from);
  });

  // back button handler
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const from = query.from;

    if (data === 'back') {
      await handleStart(bot, chatId, from, query.id, query.message.message_id);
    }
  });
};

async function handleStart(bot, chatId, from, callbackId = null, messageId = null) {
  const uid = from.id;
  const username = from.username || 'NoUsername';
  const cleanUsername = username.replace(/[_*[\]()~`>#+=|{}.!-]/g, '\\$&');
  const isAdmin = uid === Number(ADMIN_UID);

  let userDB = await loadDB();
  const isApproved = userDB.approved.includes(uid);
  const isBanned = userDB.banned.includes(uid);
  const isPending = userDB.pending.includes(uid);

  // 🚫 Banned user
  if (isBanned) {
    return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
  }

  // 👑 Admin or ✅ Approved User
  if (isAdmin || isApproved) {
    const message = isAdmin
      ? `👑 *Welcome, Admin!*
You've entered the premium control panel of *PremiumBot*.

🔧 *Your access includes:*
📊 Monitor user activity  
🧑‍💻 Manage users & roles  
⚙️ Configure features & limits  
📈 Track system stats

🛡 *Use commands responsibly to ensure smooth performance.*

Need support?  
💬 Type /adminhelp or contact the developer.`
      : `👤 *Welcome, ${cleanUsername}!*

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
      await bot.answerCallbackQuery(callbackId);
      return bot.editMessageText(message, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons }
      });
    } else {
      return bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: buttons }
      });
    }
  }

  // ⏳ Not approved user → show styled message & notify admin
  const restrictedMsg =
`🚫 *Access Restricted*

👋 *Hello, ${cleanUsername}!*
Thanks for your interest in using *PremiumBot*.

🔐 *Access is limited to authorized users only.*
This ensures a secure, premium-quality experience for everyone.

📮 *To request access:*  
Message [@${ADMIN_USERNAME}](https://t.me/${ADMIN_USERNAME}) with your Telegram details.

🆔 *Your Telegram ID:* \`${uid}\`  
🔗 *Username:* @${username || 'NoUsername'}

📢 Once approved, you'll enjoy:  
✨ Full premium features  
🚀 Fast & secure service  
🧠 Easy-to-use interface

🙏 We appreciate your patience and understanding.  
— *The PremiumBot Team 🤖*`;

  await bot.sendMessage(chatId, restrictedMsg, { parse_mode: 'Markdown' });

  if (!isPending) {
    userDB.pending.push(uid);
    await saveDB(userDB);
    await notifyAdmin(bot, uid, username); // ✅ moved here properly
  }
}
