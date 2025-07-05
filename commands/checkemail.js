const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  bot.onText(/\.checkemail (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1]?.trim();

    if (!username) {
      return bot.sendMessage(chatId, '❌ একটি username দিন!\n\nউদাহরণ:\n.checkemail rihan200');
    }

    await checkEmail(username, chatId);
  });
};
