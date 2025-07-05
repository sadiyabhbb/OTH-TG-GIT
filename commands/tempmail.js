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
  bot.onText(/\.tempmail (.+)/i, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim().toLowerCase();

    if (!username || username.length < 3) {
      return bot.sendMessage(chatId, '❌ একটি বৈধ ইউজারনেম দিন।\n\n📥 উদাহরণ: `.tempmail testuser`');
    }

    let found = false;

    for (const domain of DOMAINS) {
      const email = `${username}${domain}`;
      const inboxUrl = `https://tempmail.plus/en/receiver/${encodeURIComponent(email)}`;

      try {
        const { data: html } = await axios.get(inboxUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const $ = cheerio.load(html);
        const mailItem = $('.inbox-dataList .inbox-dataList-item').first();

        if (mailItem && mailItem.length > 0) {
          const subject = mailItem.find('.inboxSubject').text().trim() || 'No Subject';
          const from = mailItem.find('.inboxSender').text().trim() || 'Unknown';
          const time = mailItem.find('.inboxDate').text().trim() || 'Unknown';
          const preview = mailItem.find('.inboxExcerpt').text().trim();

          const otpMatch = preview.match(/\b\d{4,8}\b/);
          const otpCode = otpMatch ? `\`${otpMatch[0]}\`` : 'Not Found';

          const msgText = `
📬 *ইমেইল পাওয়া গেছে!*
✉️ *ইমেইল:* \`${email}\`
📧 *প্রেরক:* ${from}
🧠 *বিষয়:* ${subject}
🕒 *সময়:* ${time}
🔐 *OTP কোড:* ${otpCode}
          `;
          await bot.sendMessage(chatId, msgText, { parse_mode: 'Markdown' });
          found = true;
          break;
        }
      } catch (err) {
        console.error(`❌ Error fetching email for ${email}:`, err.message);
      }
    }

    if (!found) {
      await bot.sendMessage(chatId, `❌ ${username} নামে কোনো ইমেইল পাওয়া যায়নি টেম্পমেইল প্লাস-এ।`);
    }
  });
};
