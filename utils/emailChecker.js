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

        const content = `*🔔 𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 OTP Received Successfully*

🕒 *Time:* ${mail.date || 'Unknown'}
⚙️ *Service:* FACEBOOK
✉️ *Mail From:* ${mail.from_field || 'Unknown'}

🔑 *Your OTP:* \`${mail.code || 'Not Found'}\`

\`\`\`
✉️ Full Message:
${mail.subject || 'No Subject'}
\`\`\`

📖 So remember Me; I* — ﴾فَاذْكُرُونِي أَذْكُرْكُمْ﴿📖  
*I will remember you.* (2:152)

🚀 *Be Active  New OTP Coming*`;

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
