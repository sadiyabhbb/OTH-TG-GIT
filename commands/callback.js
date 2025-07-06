const os = require('os');
const { ADMIN_USERNAME } = require('../config/botConfig');

module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // ✅ Always answer callback to avoid loading animation
    await bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'gen':
        return bot.editMessageText('💳 Use `.gen 545454xxxxxxxxxx|xx|xx` to generate cards.', {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
          }
        });

      case 'tempmail':
        return bot.editMessageText('📩 Use `.tempmail example@email.com` to get OTP.', {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
          }
        });

      case '2fa':
        return bot.editMessageText('🔐 Use `.2fa email@example.com` to get OTP.', {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
          }
        });

      case 'uptime':
        const totalSeconds = Math.floor(os.uptime());
        const days = Math.floor(totalSeconds / (3600 * 24));
        const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        const uptimeStr = `🕒 Bot Uptime:\n\`${days}d ${hours}h ${minutes}m ${seconds}s\``;

        return bot.editMessageText(uptimeStr, {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
          }
        });

      case 'users':
        return bot.editMessageText('👥 Admin user stats coming soon...', {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
          }
        });

      case 'admin_panel':
        return bot.editMessageText('⚙️ Admin panel is under development.', {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
          }
        });

      case 'back':
        return bot.editMessageText(`👑 Welcome Admin @${ADMIN_USERNAME}!`, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: "🧾 Users", callback_data: "users" }],
              [{ text: "⚙️ Panel", callback_data: "admin_panel" }],
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

      default:
        return bot.sendMessage(chatId, "❓ Unknown option.");
    }
  });
};
