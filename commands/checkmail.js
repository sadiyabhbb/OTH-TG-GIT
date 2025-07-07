const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  bot.onText(/\.checkmail (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim();

    await bot.sendMessage(chatId, `📮 *Checking inbox for:* \`${username}\` (multiple domains)\n⏳ অপেক্ষা করুন...`, {
      parse_mode: 'Markdown',
    });

    await checkEmail(username, chatId, bot);
  });
};
