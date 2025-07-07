const { generateRandomEmail, fetchInbox, fetchFullEmail } = require('../utils/mailcxHandler');

module.exports = (bot) => {
  const activeEmails = new Map(); // Keep track of session emails

  // .tempmail command
  bot.onText(/\.tempmail/, async (msg) => {
    const chatId = msg.chat.id;
    const email = generateRandomEmail();
    activeEmails.set(chatId, email);

    const message = `📥 *TempMail Ready:*\n\`${email}\`\n\n🔄 প্রতি ৩০স পর inbox auto-refresh হবে (Max 5 বার)...`;
    const refreshBtn = {
      inline_keyboard: [
        [{ text: '🔄 Refresh Now', callback_data: 'refresh_now' }]
      ]
    };

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: refreshBtn
    });
  });

  // Handle "Refresh Now" button
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data === 'refresh_now') {
      await bot.answerCallbackQuery(query.id, { text: '♻️ Refreshing...' });

      const email = activeEmails.get(chatId);
      if (!email) {
        return bot.sendMessage(chatId, '⚠️ কোনো active tempmail session পাওয়া যায়নি।');
      }

      try {
        const messages = await fetchInbox(email);

        if (!messages || messages.length === 0) {
          return bot.sendMessage(chatId, `❌ \`${email}\` এর ইনবক্সে কোনো মেইল পাওয়া যায়নি`, {
            parse_mode: 'Markdown'
          });
        }

        for (const mail of messages) {
          const full = await fetchFullEmail(email, mail.id);
          const content = full?.body || '[No content]';

          const formatted = `
📨 *নতুন মেইল পাওয়া গেছে!*
✉️ *From:* ${mail.from}
📛 *Subject:* ${mail.subject || 'No subject'}
🧾 *Body:* 
\`\`\`
${content.slice(0, 1000)}
\`\`\`
          `;
          await bot.sendMessage(chatId, formatted, { parse_mode: 'Markdown' });
        }

      } catch (err) {
        console.error('Refresh error:', err.message);
        await bot.sendMessage(chatId, '⚠️ মেইল রিফ্রেশে সমস্যা হয়েছে। দয়া করে পরে চেষ্টা করুন।');
      }
    }
  });
};
