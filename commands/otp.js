const {
  fetchInbox,
  fetchFullEmail,
} = require('../utils/mailcxHandler');

module.exports = (bot) => {
  const escapeMd = (text) => text.replace(/([_*[\]()~`>#+=|{}.!\\-])/g, '\\$1');

  bot.onText(/\.otp/, async (msg) => {
    const chatId = msg.chat.id;

    // tempmail ইমেইল আগে তৈরি করা হয়েছে কিনা চেক
    const activeEmails = global.activeEmails || {};
    const email = activeEmails[chatId];

    if (!email) {
      return bot.sendMessage(chatId, '❌ আগে .tempmail দিয়ে একটি ইমেইল তৈরি করুন।');
    }

    try {
      const inbox = await fetchInbox(email);

      if (inbox.length === 0) {
        return bot.sendMessage(chatId, `📭 এখনও কোনো মেইল আসেনি\n\`${escapeMd(email)}\``, {
          parse_mode: 'MarkdownV2'
        });
      }

      const latest = inbox[0];
      const full = await fetchFullEmail(email, latest.id);
      const body = full?.body || '';

      // OTP কোড match: যেকোনো 4-8 digit
      const code = body.match(/\b\d{4,8}\b/)?.[0];

      if (!code) {
        return bot.sendMessage(chatId, `📬 মেইল এসেছে, কিন্তু কোনো কোড পাওয়া যায়নি:\n\n✉️ Subject: *${escapeMd(latest.subject)}*`, {
          parse_mode: 'MarkdownV2'
        });
      }

      await bot.sendMessage(chatId, `✅ কোড পাওয়া গেছে:\n\n🔐 *${escapeMd(code)}*`, {
        parse_mode: 'MarkdownV2'
      });
    } catch (err) {
      console.error('❌ OTP fetch error:', err.message);
      return bot.sendMessage(chatId, '❌ OTP আনতে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন।');
    }
  });
};
