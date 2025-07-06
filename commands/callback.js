module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    // 🔔 Always answer callback to prevent "loading" spinner
    await bot.answerCallbackQuery(query.id).catch(console.error);

    switch (data) {
      case 'gen':
        return bot.sendMessage(chatId, '💳 Use `/gen 515462` to generate cards.', {
          parse_mode: "Markdown"
        });

      case 'tempmail':
        return bot.sendMessage(chatId, '📩 Use `.tempmail` to get OTP code from your temp inbox.');

      case '2fa':
        return bot.sendMessage(chatId, '🔐 Use `.2fa email@example.com` to get 2FA code.');

      case 'uptime':
        return bot.sendMessage(chatId, '🕒 Bot is online and running smoothly!');

      case 'users':
        return bot.sendMessage(chatId, '👥 Admin: Total Users, Pending, Banned stats loading...');

      case 'admin_panel':
        return bot.sendMessage(chatId, '⚙️ Admin Panel: Coming soon or custom features...');

      default:
        return bot.sendMessage(chatId, '❓ Unknown command.');
    }
  });
};
