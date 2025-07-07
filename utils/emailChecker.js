const axios = require('axios');

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

function extractCodeFromText(text) {
  const match = text.match(/\\b\\d{4,8}\\b/); // 4-8 digit code
  return match ? match[0] : 'Not Found';
}

async function checkEmail(username, chatId, bot) {
  try {
    let found = false;

    for (const domain of DOMAINS) {
      const email = `${username}${domain}`;
      const apiUrl = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;

      try {
        const { data } = await axios.get(apiUrl);

        if (data?.status && data?.data?.length > 0) {
          const mail = data.data[0];

          const otpCode = extractCodeFromText(mail.subject || '') || extractCodeFromText(mail.content || '');

          const msg = `
📭 *ইমেইল পাওয়া গেছে!*
✉️ *ঠিকানা:* \`${email}\`
🕒 *সময়:* ${mail.date || 'Unknown'}
📧 *প্রেরক:* ${mail.from_field || 'Unknown'}
📝 *বিষয়:* ${mail.subject || 'No Subject'}
🔢 *OTP কোড:* \`${otpCode}\`
          `;
          await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
          found = true;
          break;
        }
      } catch (err) {
        console.error(`❌ Error checking ${email}:`, err.message);
      }
    }

    if (!found) {
      await bot.sendMessage(chatId, `❌ ${username} নামে কোনো ইমেইল পাওয়া যায়নি`);
    }

  } catch (error) {
    console.error('General error:', error.message);
    await bot.sendMessage(chatId, '⚠️ সার্ভারে সমস্যা হচ্ছে, পরে চেষ্টা করুন');
  }
}

module.exports = checkEmail;
