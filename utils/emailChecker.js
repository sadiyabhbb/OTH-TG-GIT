const axios = require('axios');

async function checkEmail(username, chatId, bot) {
  try {
    const domain = '@hotmail999.com';
    const email = `${username}${domain}`;
    const apiUrl = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;

    const { data } = await axios.get(apiUrl, { timeout: 15000 });

    if (data?.status && data?.data?.length > 0) {
      const mail = data.data[0];

      const msg = `
📭 *ইমেইল পাওয়া গেছে!*
✉️ *ঠিকানা:* \`${email}\`
🕒 *সময়:* ${mail.date || 'Unknown'}
📧 *প্রেরক:* ${mail.from_field || 'Unknown'}
📝 *বিষয়:* ${mail.subject || 'No Subject'}

📩 *মেসেজ বডি:* 
\`\`\`
${mail.content || 'কোনো কনটেন্ট পাওয়া যায়নি'}
\`\`\`
      `;

      await bot.sendMessage(chatId, msg.trim(), { parse_mode: 'Markdown' });
    } else {
      await bot.sendMessage(chatId, `❌ \`${email}\` এর ইনবক্সে কোনো মেইল পাওয়া যায়নি`, {
        parse_mode: 'Markdown'
      });
    }

  } catch (error) {
    console.error('❌ Mail check failed:', error.message);
    await bot.sendMessage(chatId, '⚠️ মেইল সার্ভার থেকে রেসপন্স পেতে সমস্যা হচ্ছে। দয়া করে একটু পরে চেষ্টা করুন।');
  }
}

module.exports = checkEmail;
