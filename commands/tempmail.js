const checkTempMail = require('../utils/tempmail');

module.exports = (bot) => {
  bot.onText(/\.tempmail (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim();

    if (!username || username.length < 3) {
      return bot.sendMessage(chatId, '❌ একটি সঠিক ইউজারনেম দিন।\n\n🧪 উদাহরণ:\n`.tempmail testuser`');
    }

    await checkTempMail(username, chatId, bot);
  });
};
