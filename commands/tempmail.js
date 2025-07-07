const axios = require('axios');

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

module.exports = (bot) => {
  bot.onText(/\.tempmail$/, async (msg) => {
    const chatId = msg.chat.id;

    const name = Math.random().toString(36).substring(2, 10);
    const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    const email = `${name}${domain}`;

    bot.sendMessage(chatId, `📩 *TempMail Ready:*\n\`${email}\`\n\n🕓 প্রতি 5s পর inbox auto-refresh হবে...`, {
      parse_mode: 'Markdown'
    });

    let lastMailId = null;

    const interval = setInterval(async () => {
      try {
        const url = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;
        const res = await axios.get(url, { timeout: 7000 });

        const mails = res.data?.data;
        if (res.data?.status && Array.isArray(mails) && mails.length > 0) {
          const mail = mails[0];

          if (mail.mail_id !== lastMailId) {
            lastMailId = mail.mail_id;

            const msgText = `📥 *নতুন মেইল এসেছে!*

✉️ *ঠিকানা:* \`${email}\`
📧 *প্রেরক:* ${mail.from_field || 'Unknown'}
📝 *বিষয়:* ${mail.subject || 'No Subject'}
🔢 *OTP কোড:* \`${mail.code || 'Not Found'}\`
🕒 *সময়:* ${mail.date || 'Unknown'}`;

            await bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
          }
        }
      } catch (err) {
        clearInterval(interval);
        bot.sendMessage(chatId, '❌ Session বন্ধ হয়ে গেছে বা মেইল লোডে সমস্যা হয়েছে।');
        console.error('Tempmail error:', err.message);
      }
    }, 5000);
  });
};
