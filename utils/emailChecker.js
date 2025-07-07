const axios = require('axios');

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

async function checkEmail(username) {
  try {
    for (const domain of DOMAINS) {
      const email = `${username}${domain}`;
      const url = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;

      const { data } = await axios.get(url);

      if (data?.status && data?.data?.length > 0) {
        const mail = data.data[0];

        const content = `🔔 *𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 OTP Received Successfully*\n\n🕒 *Time:* ${mail.date || 'Unknown'}\n⚙️ *Service:* Facebook\n✉️ *From:* ${mail.from_field || 'Unknown'}\n📧 *Mail:* \`${email}\`\n\n🔑 *Your OTP:* \`${mail.code || 'Not Found'}\`\n\n💌 *Full Message:* ${mail.subject || 'No Subject'}\n\n📖 حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ — *Allah is sufficient for us, and He is the best disposer.* (3:173)\n\n🚀 *Be Active  New OTP Coming*`;

        return { success: true, content };
      }
    }

    return { success: false, content: null };

  } catch (error) {
    console.error('❌ Email check failed:', error.message);
    return { success: false, content: null };
  }
}

module.exports = checkEmail;
