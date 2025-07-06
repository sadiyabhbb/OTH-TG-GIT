module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id; // ✅ Fix applied

    // ✅ Always answer callback to stop loading spinner
    await bot.answerCallbackQuery(query.id).catch(console.error);

    switch (data) {
      case 'gen':
        return bot.sendMessage(chatId, '💳 Use `/gen 515462` to generate cards.', {
          parse_mode: "Markdown"
        });

      case 'tempmail':
        return bot.sendMessage(chatId, '📩 Use `.tempmail` to get OTP inbox.');

      case '2fa':
        return bot.sendMessage(chatId, '🔐 Use `.2fa email@example.com` to get OTP.');

      case 'uptime':
        return bot.sendMessage(chatId, '🕒 Bot is up and running!');

      case 'users':
        return bot.sendMessage(chatId, '👥 Admin user stats coming soon...');

      case 'admin_panel':
        return bot.sendMessage(chatId, '⚙️ Admin panel is under development.');

      default:
        return bot.sendMessage(chatId, '❓ Unknown command.');
    }
  });
};
