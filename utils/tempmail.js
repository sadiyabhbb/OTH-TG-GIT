const axios = require('axios');

const TEMPMAIL_DOMAINS = [
  '@mailto.plus',
  '@fexpost.com',
  '@fexbox.org',
  '@mailbox.in.ua',
  '@rover.info',
  '@chitthi.in',
  '@fextemp.com',
  '@any.pink',
  '@merepost.com'
];

async function checkTempMail(username, chatId, bot) {
  try {
    let found = false;

    for (const domain of TEMPMAIL_DOMAINS) {
      const email = `${username}${domain}`;
      const apiUrl = `https://api.tempmail.plus/v1/mails?email=${encodeURIComponent(email)}`;

      try {
        const response = await axios.get(apiUrl);
        const mails = response.data?.mail_list;

        if (Array.isArray(mails) && mails.length > 0) {
          const mail = mails[0]; // সর্বশেষ মেইল

          const msg = `
📩 *ইমেইল পাওয়া গেছে!*
✉️ *ঠিকানা:* \`${email}\`
🕒 *সময়:* ${mail.mail_date || 'Unknown'}
📧 *প্রেরক:* ${mail.mail_from || 'Unknown'}
📝 *বিষয়:* ${mail.mail_subject || 'No Subject'}
🔢 *সারাংশ:* ${mail.mail_excerpt || 'Not Available'}
          `;
          await bot.sendMessage(chatId, msg, { parse_mode: 'Markdown' });
          found = true;
          break;
        }
      } catch (err) {
        console.error(`Tempmail check failed for ${email}:`, err.message);
      }
    }

    if (!found) {
      await bot.sendMessage(chatId, `❌ *${username}* নামে কোনো ইমেইল পাওয়া যায়নি।`, {
        parse_mode: 'Markdown'
      });
    }
  } catch (err) {
    console.error('Tempmail general error:', err.message);
    await bot.sendMessage(chatId, '⚠️ সার্ভারে সমস্যা হচ্ছে, পরে চেষ্টা করুন।');
  }
}

module.exports = checkTempMail;
