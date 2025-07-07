// 📁 commands/tempmail.js
const {
  generateRandomEmail,
  fetchInbox,
  fetchFullEmail,
} = require('../utils/mailcxHandler');

module.exports = (bot) => {
  const activeSessions = {};

  bot.onText(/\.tempmail/, async (msg) => {
    const chatId = msg.chat.id;
    const email = generateRandomEmail();
    const username = email.split('@')[0];

    activeSessions[chatId] = { email, count: 0 };

    const infoText = `📩 *TempMail Ready:*\n\`${email}\`\n\n🔄 প্রতি ৩০s পর inbox auto-refresh হবে (Max 5 বার)...`;

    const message = await bot.sendMessage(chatId, infoText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔁 Refresh Now', callback_data: `refresh_mailcx_${username}` }],
        ],
      },
    });

    // Auto refresh max 5 times
    const interval = setInterval(async () => {
      const session = activeSessions[chatId];
      if (!session || session.count >= 5) {
        clearInterval(interval);
        delete activeSessions[chatId];
        return;
      }

      session.count++;
      const inbox = await fetchInbox(email);

      if (inbox.length > 0) {
        const latest = inbox[0];
        const full = await fetchFullEmail(email, latest.id);

        if (full) {
          const mailText = `📬 *নতুন মেইল এসেছে!*\n🧾 *From:* ${full.from}\n📝 *Subject:* ${full.subject}\n📨 *Body:*\n${full.text || 'Body ফাঁকা'}`;
          bot.sendMessage(chatId, mailText, { parse_mode: 'Markdown' });
        }
      }
    }, 30000); // 30s
  });

  // 🔁 Manual refresh handler
  bot.on('callback_query', async (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;

    if (data.startsWith('refresh_mailcx_')) {
      const username = data.split('refresh_mailcx_')[1];
      const email = `${username}@mail.cx`;
      const inbox = await fetchInbox(email);

      if (inbox.length === 0) {
        return bot.answerCallbackQuery(query.id, {
          text: '📭 এখনো কোনো মেইল আসেনি!',
          show_alert: false,
        });
      }

      const latest = inbox[0];
      const full = await fetchFullEmail(email, latest.id);

      if (full) {
        const mailText = `📬 *নতুন মেইল এসেছে!*\n🧾 *From:* ${full.from}\n📝 *Subject:* ${full.subject}\n📨 *Body:*\n${full.text || 'Body ফাঁকা'}`;
        bot.sendMessage(chatId, mailText, { parse_mode: 'Markdown' });
      }

      bot.answerCallbackQuery(query.id);
    }
  });
};
