const axios = require('axios');

const DOMAINS = [
  '@tempmail.plus',
  '@mailto.plus',
  '@maildim.com',
  '@lavaboxy.com'
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
      const encodedEmail = encodeURIComponent(email);
      const inboxApi = `https://api.tempmail.plus/v1/mails?email=${encodedEmail}&limit=1`;

      try {
        const response = await axios.get(inboxApi);
        const mails = response.data.mail_list;

        if (mails && mails.length > 0) {
          const mail = mails[0];

          // Fetch full content of email (for accurate OTP)
          const fullMailUrl = `https://api.tempmail.plus/v1/mail/${mail.mail_id}`;
          const fullMailRes = await axios.get(fullMailUrl);
          const fullMail = fullMailRes.data;

          const htmlContent = fullMail.mail_html || fullMail.mail_text || '';
          const otpMatch = htmlContent.match(/\b\d{4,8}\b/);
          const otp = otpMatch ? otpMatch[0] : 'Not Found';

          const message = `
📨 *ইমেইল পাওয়া গেছে!*
✉️ *ঠিকানা:* \`${email}\`
📧 *প্রেরক:* ${fullMail.from || 'Unknown'}
📝 *বিষয়:* ${fullMail.subject || 'No Subject'}
🕒 *সময়:* ${fullMail.send_time || 'Unknown'}
🔐 *OTP কোড:* \`${otp}\`
          `;
          await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
          found = true;
          break;
        }

      } catch (err) {
        console.error(`Error checking ${email}:`, err.message);
      }
    }

    if (!found) {
      bot.sendMessage(chatId, `❌ ${username} নামে কোনো ইমেইল পাওয়া যায়নি টেম্পমেইল প্লাস-এ।`);
    }
  });
};
