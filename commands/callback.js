const os = require('os');

module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    await bot.answerCallbackQuery(query.id);

    const mainMenu = {
      chat_id: chatId,
      message_id: messageId,
      text: `🎉 Welcome! Use the buttons below:`,
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
      },
      parse_mode: "Markdown"
    };

    switch (data) {
      case 'gen':
        return bot.editMessageText('💳 Use `.gen 545454xxxxxxxxxx|xx|xx` to generate cards.', {
          chat_id: chatId,
          message_id: messageId,
          parse_mode: "Markdown",
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ Back', callback_data: 'back' }]
            ]
          }
        });

      case 'tempmail':
        return bot.editMessageText('📩 Use `.tempmail` to get a temp email inbox.', {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ Back', callback_data: 'back' }]
            ]
          }
        });

      case '2fa':
        return bot.editMessageText('🔐 Use `.2fa email@example.com` to get OTP.', {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ Back', callback_data: 'back' }]
            ]
          }
        });

      case 'uptime':
        const uptimeSec = os.uptime();
        const hours = Math.floor(uptimeSec / 3600);
        const minutes = Math.floor((uptimeSec % 3600) / 60);
        const seconds = uptimeSec % 60;

        return bot.editMessageText(
          `🕒 Bot Uptime:\n\`${hours}h ${minutes}m ${seconds}s\``,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown",
            reply_markup: {
              inline_keyboard: [
                [{ text: '⬅️ Back', callback_data: 'back' }]
              ]
            }
          }
        );

      case 'users':
        return bot.editMessageText('👥 Admin user stats coming soon...', {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ Back', callback_data: 'back' }]
            ]
          }
        });

      case 'admin_panel':
        return bot.editMessageText('⚙️ Admin panel is under development.', {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: {
            inline_keyboard: [
              [{ text: '⬅️ Back', callback_data: 'back' }]
            ]
          }
        });

      case 'back':
        return bot.editMessageText(mainMenu.text, {
          chat_id: chatId,
          message_id: messageId,
          reply_markup: mainMenu.reply_markup,
          parse_mode: mainMenu.parse_mode
        });

      default:
        return bot.editMessageText('❌ Unknown action.', {
          chat_id: chatId,
          message_id: messageId
        });
    }
  });
};
