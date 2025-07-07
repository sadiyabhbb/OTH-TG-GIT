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
    let found = false;

    for (const domain of DOMAINS) {
      const email = `${username}${domain}`;
      const apiUrl = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;

      try {
        const { data } = await axios.get(apiUrl);

        if (data?.status && data?.data?.length > 0) {
          const mail = data.data[0];

          const msg = `
🔔 *𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 OTP Received Successfully*

🕒 *Time:* ${mail.date || 'Unknown'}
⚙️ *Service:* Facebook
✉️ *From:* ${mail.from_field || 'Unknown'}
📧 *Mail:* \`${email}\`

🔑 *Your OTP:* \`${mail.code || 'Not Found'}\`

💌 *Full Message:*
${mail.subject || 'No Subject'}

📖حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ — *Allah is sufficient for us, and He is the best disposer.* (3:173)

🚀 *Be Active  New OTP Coming*
          `;

          await bot.sendMessage(chatId, msg.trim(), { parse_mode: 'Markdown' });
          found = true;
          break;
        }
      } catch (error) {
        console.error(`❌ Error checking ${email}:`, error?.response?.data || error.message);
      }
    }

    if (!found) {
      await bot.sendMessage(chatId, `❌ \`${username}\` নামে কোনো ইমেইল পাওয়া যায়নি`, { parse_mode: 'Markdown' });
    }

  } catch (error) {
    console.error('❌ Email check error:', error?.response?.data || error.message);
    await bot.sendMessage(chatId, '⚠️ ইমেইল চেক করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।');
  }
}

module.exports = checkEmail;
