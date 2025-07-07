const { v4: uuidv4 } = require('uuid');
const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  // .checkmail command
  bot.onText(/\.checkmail/, async (msg) => {
    const chatId = msg.chat.id;
    const username = uuidv4().slice(0, 10);
    const email = `${username}@hotmail999.com`;

    await bot.sendMessage(chatId, `📮 *TempMail Ready:*\n\`${email}\`\n\n🔄 ইনবক্স রিফ্রেশ করতে নিচের বাটনে চাপ দিন 👇`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh Now', callback_data: `refresh_${username}` }]
        ]
      }
    });
  });

  // Refresh button handler
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('refresh_')) {
      const username = data.split('refresh_')[1];
      await bot.answerCallbackQuery(query.id, { text: '♻️ Checking inbox...' });
      await checkEmail(username, chatId, bot);
    }
  });
};
