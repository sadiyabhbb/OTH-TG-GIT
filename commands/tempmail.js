const axios = require('axios');

const DOMAINS = [
  '@mailto.plus',
  '@temp-mail.io',
  '@tempmail.plus',
  '@maildim.com',
  '@lavaboxy.com',
  '@sharklasers.com',
  '@guerrillamail.com',
  '@spamavert.com',
];

module.exports = (bot) => {
  bot.onText(/\.tempmail (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim();

    if (!username || username.length < 3) {
      return bot.sendMessage(chatId, '❌ একটি বৈধ ইউজারনেম দিন।\nউদাহরণ: `.tempmail testuser`');
    }

    let found = false;

    for (const domain of DOMAINS) {
      const email = `${username}${domain}`;
      const apiUrl = `https://tempmail.plus/api/mails?email=${encodeURIComponent(email)}`;

      try {
        const res = await axios.get(apiUrl);
        const mails = res.data?.mails || [];

        if (mails.length > 0) {
          const mail = mails[0];
          const subject = mail.subject || 'No Subject';
          const from = mail.from || 'Unknown';
          const time = mail.date || 'Unknown';
          const body = mail.body || '';

          const otpMatch = body.match(/\b\d{4,8}\b/);
          const otpCode = otpMatch ? otpMatch[0] : 'Not Found';

          const msgText = `
📨 *ইমেইল পাওয়া গেছে!*
✉️ *ঠিকানা:* \`${email}\`
🧠 *বিষয়:* ${subject}
📧 *প্রেরক:* ${from}
🕒 *সময়:* ${time}
🔐 *OTP কোড:* \`${otpCode}\`
          `;
          await bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
          found = true;
          break;
        }

      } catch (err) {
        console.error(`❌ ${email} check error:`, err.message);
      }
    }

    if (!found) {
      bot.sendMessage(chatId, `❌ ${username} নামে কোনো ইমেইল পাওয়া যায়নি টেম্পমেইল প্লাস-এ।`);
    }
  });
};
