const { v4: uuidv4 } = require('uuid');
const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  // .checkmail command
  bot.onText(/\.checkmail/, async (msg) => {
    const chatId = msg.chat.id;
    const username = uuidv4().slice(0, 10);
    const email = `${username}@hotmail999.com`;

    await bot.sendMessage(chatId, `📮 *TempMail Ready:*\n\`${email}\`\n\n🔄 প্রতি 30s পর inbox auto-refresh হবে (Max 5 বার)...`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh Now', callback_data: `refresh_${username}` }]
        ]
      }
    });

    // Auto-refresh every 30s (max 5 times)
    let refreshCount = 0;
    const interval = setInterval(async () => {
      if (refreshCount >= 5) {
        clearInterval(interval);
        return;
      }
      await checkEmail(username, chatId, bot);
      refreshCount++;
    }, 30000);
  });

  // Refresh Now button handler
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('refresh_')) {
      const username = data.split('refresh_')[1];
      await bot.answerCallbackQuery(query.id);
      await checkEmail(username, chatId, bot);
    }
  });
};
