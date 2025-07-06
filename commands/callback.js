module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    await bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'gen':
        return bot.sendMessage(chatId, '💳 Use `.gen 545454xxxxxxxxxx|xx|xx` to generate cards.');

      case 'tempmail':
        return bot.sendMessage(chatId, '📩 Use `.tempmail` to get a temp email inbox.');

      case '2fa':
        return bot.sendMessage(chatId, '🔐 Use `.2fa email@example.com` to get OTP.');

      case 'uptime':
        return bot.sendMessage(chatId, '🕒 Bot is up and running!');

      case 'users':
        return bot.sendMessage(chatId, '👥 Admin user stats coming soon...');

      case 'admin_panel':
        return bot.sendMessage(chatId, '⚙️ Admin panel is under development.');

      default:
        return bot.sendMessage(chatId, '⚠️ Unknown action.');
    }
  });
};
