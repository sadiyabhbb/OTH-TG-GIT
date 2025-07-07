const {
  generateRandomEmail,
  fetchInbox,
  fetchFullEmail,
} = require('../utils/mailcxHandler');

module.exports = (bot) => {
  const activeEmails = {};

  // MarkdownV2 escape function
  const escapeMd = (text) => text.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, '\\$1');

  // .tempmail command
  bot.onText(/\.tempmail/, async (msg) => {
    const chatId = msg.chat.id;
    const email = generateRandomEmail();
    activeEmails[chatId] = email;

    await bot.sendMessage(chatId, `📬 আপনার টেম্পমেইল তৈরি হয়েছে:\n\`${escapeMd(email)}\``, {
      parse_mode: 'MarkdownV2',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh', callback_data: 'refresh_inbox' }]
        ]
      }
    });
  });

  // 🔄 Refresh callback
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const email = activeEmails[chatId];

    if (!email) {
      return bot.answerCallbackQuery(query.id, {
        text: '❌ প্রথমে .tempmail দিন',
        show_alert: true
      });
    }

    try {
      const inbox = await fetchInbox(email);

      if (inbox.length === 0) {
        return bot.editMessageText(
          `📭 এখনও কোনো মেইল নেই\n\`${escapeMd(email)}\``,
          {
            chat_id: chatId,
            message_id: messageId,
            parse_mode: 'MarkdownV2',
            reply_markup: {
              inline_keyboard: [
                [{ text: '🔄 Refresh', callback_data: 'refresh_inbox' }]
              ]
            }
          }
        );
      }

      const latest = inbox[0];
      const full = await fetchFullEmail(email, latest.id);

      let body = full?.body || '❌ বডি পাওয়া যায়নি';

      if (body.length > 4000) {
        body = body.slice(0, 4000) + '\n\n...🔚';
      }

      const msg = `📥 *নতুন মেইল পাওয়া গেছে!*\n\n` +
        `✉️ *Email:* \`${escapeMd(email)}\`\n` +
        `🕒 *Time:* \`${escapeMd(latest.date)}\`\n` +
        `📧 *From:* \`${escapeMd(latest.from)}\`\n` +
        `📌 *Subject:* \`${escapeMd(latest.subject)}\`\n\n` +
        `📝 *Message:*\n${escapeMd(body)}`;

      await bot.editMessageText(msg, {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'MarkdownV2',
        reply_markup: {
          inline_keyboard: [
            [{ text: '🔄 Refresh', callback_data: 'refresh_inbox' }]
          ]
        }
      });

      await bot.answerCallbackQuery(query.id);
    } catch (err) {
      console.error('❌ Callback error:', err.message);
      await bot.answerCallbackQuery(query.id, {
        text: '❌ ত্রুটি ঘটেছে। পরে আবার চেষ্টা করুন।',
        show_alert: true
      });
    }
  });
};
