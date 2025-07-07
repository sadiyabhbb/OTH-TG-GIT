const axios = require('axios');

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

// To store email state per user
const tempmailSessions = {};

module.exports = (bot) => {
  bot.onText(/\.tempmail$/, async (msg) => {
    const chatId = msg.chat.id;

    const name = Math.random().toString(36).substring(2, 10);
    const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    const email = `${name}${domain}`;

    await bot.sendMessage(chatId, `📩 *TempMail Ready:*\n\`${email}\`\n\n🔄 প্রতি 30s পর inbox auto-refresh হবে (Max 5 বার)...`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [{ text: '🔄 Refresh Now', callback_data: `refresh:${email}` }]
        ]
      }
    });

    // Store session
    tempmailSessions[chatId] = {
      email,
      lastMailId: null,
      count: 0,
      startTime: Date.now()
    };

    // Auto refresh every 30s
    const interval = setInterval(() => {
      const session = tempmailSessions[chatId];
      if (!session) return clearInterval(interval);

      const now = Date.now();
      if (now - session.startTime > 3 * 60 * 1000 || session.count >= 5) {
        clearInterval(interval);
        delete tempmailSessions[chatId];
        bot.sendMessage(chatId, '✅ TempMail session ended automatically.');
        return;
      }

      checkAndSendMail(bot, chatId, session);
    }, 30000);
  });

  // 🔄 Handle Refresh button
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;
    const data = query.data;

    if (data.startsWith('refresh:')) {
      const email = data.split(':')[1];
      const session = tempmailSessions[chatId];
      if (session && session.email === email) {
        await bot.answerCallbackQuery(query.id, { text: '♻️ Refreshing inbox...' });
        checkAndSendMail(bot, chatId, session);
      } else {
        await bot.answerCallbackQuery(query.id, { text: '⚠️ Session expired or email not found!' });
      }
    }
  });
};

// 🔍 Mail Checker Function
async function checkAndSendMail(bot, chatId, session) {
  try {
    const url = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(session.email)}`;
    const res = await axios.get(url, { timeout: 7000 });

    if (!res.data || !res.data.status || !Array.isArray(res.data.data)) return;

    const mails = res.data.data;
    if (mails.length > 0) {
      const mail = mails[0];

      if (mail.mail_id !== session.lastMailId) {
        session.lastMailId = mail.mail_id;
        session.count++;

        const msgText = `📥 *নতুন মেইল এসেছে!*

✉️ *ঠিকানা:* \`${session.email}\`
📧 *প্রেরক:* ${mail.from_field || 'Unknown'}
📝 *বিষয়:* ${mail.subject || 'No Subject'}
🔢 *OTP কোড:* \`${mail.code || 'Not Found'}\`
🕒 *সময়:* ${mail.date || 'Unknown'}`;

        await bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
      }
    }
  } catch (err) {
    console.error('🔥 Tempmail error:', err.response?.data || err.message);
  }
}
