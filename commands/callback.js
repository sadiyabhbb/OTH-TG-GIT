const { loadDB } = require('../utils/db');

module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const data = query.data;
    const username = query.from.username || "NoUsername";
    const userId = query.from.id;

    try {
      switch (data) {
        case 'gen':
          return bot.editMessageText(`💳 Use /gen <bin> to generate credit cards.\n\nExample:\n/gen 515462`, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
            }
          });

        case 'tempmail':
          return bot.editMessageText(`📩 Use .tempmail <username>\n\nExample:\n.tempmail rihad123`, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
            }
          });

        case '2fa':
          return bot.editMessageText(`🔐 Use .2fa <secret_key>\n\nExample:\n.2fa JBSWY3DPEHPK3PXP`, {
            chat_id: chatId,
            message_id: messageId,
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
            }
          });

        case 'uptime':
          const uptimeMs = Date.now() - global.botStartTime;
          const totalSeconds = Math.floor(uptimeMs / 1000);
          const days = Math.floor(totalSeconds / (3600 * 24));
          const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const seconds = totalSeconds % 60;

          const uptimeStr = `⏱️ *Bot Uptime:*\n\`${days}d ${hours}h ${minutes}m ${seconds}s\``;

          return bot.editMessageText(uptimeStr, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'back' }]]
            }
          });

        case 'users':
          const db = loadDB();
          const format = (arr) => arr.length ? arr.map(id => `\`${id}\``).join(', ') : '_None_';
          const usersText =
            `👥 *User List:*\n\n` +
            `✅ *Approved:* ${format(db.approved)}\n` +
            `🕓 *Pending:* ${format(db.pending)}\n` +
            `🚫 *Banned:* ${format(db.banned)}`;

          return bot.editMessageText(usersText, {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[{ text: '⬅️ Back', callback_data: 'admin_panel' }]]
            }
          });

        case 'admin_panel':
          return bot.editMessageText(`👑 Admin Panel for @${username}`, {
            chat_id: chatId,
            message_id: messageId,
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

        case 'back':
          return bot.editMessageText(`🎉 Welcome ${username}!\nUse the buttons below:`, {
            chat_id: chatId,
            message_id: messageId,
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

        default:
          return bot.answerCallbackQuery(query.id, {
            text: "❗ Unknown button clicked.",
            show_alert: true
          });
      }
    } catch (err) {
      console.error("❌ Callback error:", err);
      bot.sendMessage(chatId, '❌ An error occurred while processing your request.');
    }
  });
};
