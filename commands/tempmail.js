const {
  generateRandomEmail,
  fetchInbox,
  fetchFullEmail
} = require('../utils/mailcxHandler');

module.exports = (bot) => {
  const activeEmails = {};

  bot.onText(/\.tempmail/, async (msg) => {
    const chatId = msg.chat.id;
    const email = generateRandomEmail();
    activeEmails[chatId] = email;

    await bot.sendMessage(chatId, `📬 আপনার টেম্পমেইল তৈরি হয়েছে:\n\`${email}\``, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🔄 Refresh', callback_data: 'refresh_inbox' }]]
      }
    });
  });

  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const email = activeEmails[chatId];

    if (!email) {
      return bot.answerCallbackQuery(query.id, { text: '❌ প্রথমে .tempmail দিন' });
    }

    const inbox = await fetchInbox(email);

    if (inbox.length === 0) {
      return bot.editMessageText(`📭 মেইল নেই এখনো\n\`${email}\``, {
        chat_id: chatId,
        message_id: query.message.message_id,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[{ text: '🔄 Refresh', callback_data: 'refresh_inbox' }]]
        }
      });
    }

    const latest = inbox[0];
    const full = await fetchFullEmail(email, latest.id);

    let body = full?.body || 'বডি পাওয়া যায়নি';

    if (body.length > 4000) body = body.slice(0, 4000) + '...';

    const msg = `📥 নতুন মেইল পাওয়া গেছে!\n\n✉️ Email: \`${email}\`\n🕒 Time: ${latest.date}\n📧 From: ${latest.from}\n📌 Subject: ${latest.subject}\n\n📝 Message:\n${body}`;

    await bot.editMessageText(msg, {
      chat_id: chatId,
      message_id: query.message.message_id,
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🔄 Refresh', callback_data: 'refresh_inbox' }]]
      }
    });

    await bot.answerCallbackQuery(query.id);
  });
};
