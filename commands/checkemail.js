const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  bot.onText(/\.checkemail (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim();

    if (!username || username.length < 3) {
      return bot.sendMessage(chatId, '❌ একটি সঠিক ইউজারনেম দিন।\n\n🧪 উদাহরণ:\n`.checkemail testuser`');
    }

    await checkEmail(username, chatId, bot); // 🟢 bot পাঠানো বাধ্যতামূলক
  });
};
