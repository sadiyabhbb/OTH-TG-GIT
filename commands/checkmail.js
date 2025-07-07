const { v4: uuidv4 } = require('uuid');
const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  // .checkmail command → generates a random email
  bot.onText(/\.checkmail/, async (msg) => {
    const chatId = msg.chat.id;
    const username = uuidv4().slice(0, 10);
    const email = `${username}@hotmail999.com`;

    await bot.sendMessage(chatId, `📮 *TempMail Ready:*\n\`${email}\`\n\n🔄 রিফ্রেশ করতে নিচের বাটনে চাপ দিন 👇`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh Now', callback_data: `refreshmail_${username}` }]
        ]
      }
    });
  });

  // Callback handler for Refresh Now button
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('refreshmail_')) {
      const username = data.split('refreshmail_')[1];

      // ✅ Acknowledge button press (always required!)
      await bot.answerCallbackQuery(query.id, { text: '♻️ Inbox refreshing...' });

      // 🔍 Re-check inbox
      await checkEmail(username, chatId, bot);
    }
  });
};
