const axios = require('axios');
const cheerio = require('cheerio');

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
      const encodedEmail = encodeURIComponent(email);

      try {
        const url = `https://tempmail.plus/inbox/${encodedEmail}`;
        const { data: html } = await axios.get(url);

        const $ = cheerio.load(html);
        const mail = $('.mail-item').first(); // প্রথম মেইল
        const subject = mail.find('.subject').text().trim();
        const from = mail.find('.from').text().trim();
        const time = mail.find('.time').text().trim();

        // OTP code extract (assuming number like 6 digits)
        const bodyPreview = mail.find('.preview').text();
        const otpMatch = bodyPreview.match(/\b\d{4,8}\b/);
        const otpCode = otpMatch ? otpMatch[0] : 'Not Found';

        if (subject) {
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
