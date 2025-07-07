const axios = require('axios');

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

async function checkEmail(username, chatId, bot) {
  try {
    for (const domain of DOMAINS) {
      const email = `${username}${domain}`;
      const apiUrl = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;

      const { data } = await axios.get(apiUrl);

      if (data?.status && data?.data?.length > 0) {
        const mail = data.data[0];

        const msg = `
🔔 *𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 OTP Received Successfully*

🕒 *Time:* ${mail.date || 'Unknown'}
⚙️ *Service:* Facebook
✉️ *Mail:* \`${mail.from_field || 'Unknown' }\`

🔑 *Your OTP:* \`${mail.code || 'Not Found'}\`

💌 *Full Message:*
${mail.subject || 'No Subject'}

📖 حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ — *Allah is sufficient for us, and He is the best disposer.* (3:173)

🚀 *Be Active  New OTP Coming...*
        `;

        await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
        return;
      }
    }

    await bot.sendMessage(chatId, `❌ কোনো ইমেইল পাওয়া যায়নি ${username} এর জন্য`, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('❌ Email check error:', error.message);
    bot.sendMessage(chatId, '⚠️ সার্ভারে সমস্যা হচ্ছে, পরে আবার চেষ্টা করুন।');
  }
}

module.exports = checkEmail;
