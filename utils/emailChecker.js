const axios = require('axios');

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

async function checkEmail(username) {
  for (const domain of DOMAINS) {
    const email = `${username}${domain}`;
    const url = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;

    try {
      const { data } = await axios.get(url);

      if (data?.status && data?.data?.length > 0) {
        const mail = data.data[0];
        const message = `
📭 *ইমেইল পাওয়া গেছে!*
✉️ *ঠিকানা:* \`${email}\`
🕒 *সময়:* ${mail.date || 'Unknown'}
📧 *প্রেরক:* ${mail.from_field || 'Unknown'}
📝 *বিষয়:* ${mail.subject || 'No Subject'}
🔢 *OTP কোড:* \`${mail.code || 'Not Found'}\`
        `.trim();

        return { success: true, content: message };
      }
    } catch (err) {
      console.error(`❌ ${email} চেক করতে সমস্যা:`, err.message);
    }
  }

  return { success: false };
}

module.exports = checkEmail;
