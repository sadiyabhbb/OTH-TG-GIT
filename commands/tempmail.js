// 📁 commands/tempmail.js

const {
  generateRandomEmail,
  fetchInbox,
  fetchFullEmail
} = require('../utils/mailHandler');

const activeEmails = new Map();

module.exports = (bot) => {
  bot.onText(/\.tempmail/, async (msg) => {
    const chatId = msg.chat.id;
    const email = generateRandomEmail();
    activeEmails.set(chatId, email);

    await sendInbox(bot, chatId, email);
  });

  // 🔁 Refresh button
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const email = activeEmails.get(chatId);

    if (query.data === 'refresh_inbox' && email) {
      await bot.answerCallbackQuery(query.id, { text: '🔄 রিফ্রেশ হচ্ছে...' });
      await sendInbox(bot, chatId, email, true);
    }
  });
};

async function sendInbox(bot, chatId, email, isRefresh = false) {
  const inbox = await fetchInbox(email);
  const mailList = inbox.slice(0, 5); // সর্বোচ্চ ৫টি দেখাবে

  if (!mailList.length) {
    const msg = `📭 *টেম্পমেইল:* \`${email}\`\n\n❌ কোন মেইল পাওয়া যায়নি!`;
    return bot.sendMessage(chatId, msg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[{ text: '🔄 রিফ্রেশ', callback_data: 'refresh_inbox' }]]
      }
    });
  }

  let msg = `📬 *টেম্পমেইল:* \`${email}\`\n\n`;

  for (const mail of mailList) {
    const full = await fetchFullEmail(email, mail.id);
    msg += `🕒 ${mail.date || 'N/A'}\n`;
    msg += `📧 *From:* ${mail.from || 'Unknown'}\n`;
    msg += `📌 *Subject:* ${mail.subject || 'No Subject'}\n`;
    msg += `📩 *Message:* \`${(full?.text || '').slice(0, 100).replace(/`/g, '') || 'N/A'}\`\n`;
    msg += `────────────────────\n`;
  }

  return bot.sendMessage(chatId, msg, {
    parse_mode: 'Markdown',
    reply_markup: {
      inline_keyboard: [[{ text: '🔄 রিফ্রেশ', callback_data: 'refresh_inbox' }]]
    }
  });
}
