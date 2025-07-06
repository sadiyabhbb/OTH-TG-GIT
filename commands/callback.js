const genCommand = require('./gen');
const tempmailCommand = require('./checkemail');
const twofaCommand = require('./twofa');
const uptimeCommand = require('./uptime');
const usersCommand = require('./users');
const adminCommand = require('./admin');

module.exports = (bot) => {
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    // Prevent Telegram's loading spinner
    await bot.answerCallbackQuery(query.id);

    switch (data) {
      case 'gen':
        return genCommand(bot, query.message);

      case 'tempmail':
        return tempmailCommand(bot, query.message);

      case '2fa':
        return twofaCommand(bot, query.message);

      case 'uptime':
        return uptimeCommand(bot, query.message);

      case 'users':
        return usersCommand(bot, query.message);

      case 'admin_panel':
        return adminCommand(bot, query.message);

      default:
        return bot.sendMessage(chatId, '⚠️ Unknown command!');
    }
  });
};
