const axios = require('axios');
const cheerio = require('cheerio');

const DOMAINS = [
  '@tempmail.plus',
  '@mailto.plus'
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
      const url = `https://tempmail.plus/en/#!/${username}${domain}`;

      try {
        const { data: html } = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0'
          }
        });

        const $ = cheerio.load(html);
        const mailItem = $('.mail_list .msg').first();

        if (!mailItem || !mailItem.attr('data-id')) continue;

        const subject = mailItem.find('.subject').text().trim();
        const from = mailItem.find('.from').text().trim();
        const time = mailItem.find('.time').text().trim();
        const preview = mailItem.find('.msg_body').text().trim();

        const otpMatch = preview.match(/\b\d{4,8}\b/);
        const otp = otpMatch ? otpMatch[0] : 'Not Found';

        const reply = `
📨 *ইমেইল পাওয়া গেছে!*
✉️ *ঠিকানা:* \`${email}\`
📧 *প্রেরক:* ${from || 'Unknown'}
📝 *বিষয়:* ${subject || 'No Subject'}
🕒 *সময়:* ${time || 'Unknown'}
🔐 *OTP কোড:* \`${otp}\`
        `.trim();

        await bot.sendMessage(chatId, reply, { parse_mode: 'Markdown' });
        found = true;
        break;

      } catch (err) {
        console.error(`❌ ${email} failed: ${err.message}`);
      }
    }

    if (!found) {
      bot.sendMessage(chatId, `❌ ${username} নামে কোনো ইমেইল পাওয়া যায়নি টেম্পমেইল প্লাস-এ।`);
    }
  });
};
