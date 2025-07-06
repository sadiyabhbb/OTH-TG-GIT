module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    await bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'gen':
        return bot.editMessageText(
          '💳 Use `.gen 545454xxxxxxxxxx|xx|xx` to generate cards.',
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: "Markdown"
          }
        );

      case 'tempmail':
        return bot.editMessageText(
          '📩 Use `.tempmail` to get a temp email inbox.',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );

      case '2fa':
        return bot.editMessageText(
          '🔐 Use `.2fa email@example.com` to get OTP.',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );

      case 'uptime':
        return bot.editMessageText(
          '🕒 Bot is up and running!',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );

      case 'users':
        return bot.editMessageText(
          '👥 Admin user stats coming soon...',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );

      case 'admin_panel':
        return bot.editMessageText(
          '⚙️ Admin panel is under development.',
          {
            chat_id: chatId,
            message_id: messageId
          }
        );

      default:
        return bot.editMessageText('❌ Unknown action.', {
          chat_id: chatId,
          message_id: messageId
        });
    }
  });
};
