const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  // Traditional .checkemail command
  bot.onText(/\.checkemail (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim();

    if (!username || username.length < 3) {
      return bot.sendMessage(chatId, '❌ একটি সঠিক ইউজারনেম দিন।\n\n🧪 উদাহরণ:\n`.checkemail testuser`');
    }

    await checkEmail(username, chatId, bot);
  });
};

// ✅ Inline function for callback buttons
module.exports.runCheckEmailInline = async (bot, chatId) => {
  await bot.sendMessage(chatId, '📩 দয়া করে চেক করার জন্য একটি ইউজারনেম দিন:\n\nউদাহরণ:\n`.checkemail testuser`');
};
