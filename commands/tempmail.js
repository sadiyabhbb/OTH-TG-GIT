const { checkByAPI, checkByScraping } = require('../utils/tempmail');

module.exports = (bot) => {
    // API বেসড টেম্পমেইল চেক (সাধারণ মেইল)
    bot.onText(/\/checkmail (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const username = match[1].trim();
        
        if (!username || username.length < 3) {
            return bot.sendMessage(chatId, '⚠️ ব্যবহার: /checkmail username\n(username-এ কোন স্পেস বা @ থাকবে না)');
        }

        try {
            const mails = await checkByAPI(username);
            
            if (mails.length === 0) {
                return bot.sendMessage(chatId, `❌ "${username}" এর জন্য কোন মেইল পাওয়া যায়নি`);
            }

            const mail = mails[0]; // সর্বশেষ মেইল
            const message = `
✉️ *ইমেইল পাওয়া গেছে!*
📧 *প্রেরক:* ${mail.mail_from || 'Unknown'}
📝 *বিষয়:* ${mail.mail_subject || 'No Subject'}
🕒 *সময়:* ${mail.mail_date || 'Unknown'}
🔢 *সারাংশ:* ${mail.mail_excerpt || 'N/A'}

/checkmail ${username} - আবার চেক করতে
`.trim();

            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('API Error:', error);
            bot.sendMessage(chatId, '🚨 সিস্টেমে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন');
        }
    });

    // স্ক্র্যাপিং বেসড টেম্পমেইল চেক (OTP সহ)
    bot.onText(/\/otpmail (.+)/, async (msg, match) => {
        const chatId = msg.chat.id;
        const username = match[1].trim();
        
        if (!username || username.length < 3) {
            return bot.sendMessage(chatId, '⚠️ ব্যবহার: /otpmail username\n(OTP পেতে বিশেষভাবে উপযোগী)');
        }

        try {
            const mails = await checkByScraping(username);
            
            if (mails.length === 0) {
                return bot.sendMessage(chatId, `❌ "${username}@tempmail.plus" এ কোন OTP মেইল পাওয়া যায়নি`);
            }

            const mail = mails[0];
            const otp = mail.preview.match(/\b\d{4,8}\b/)?.[0] || 'OTP খুঁজে পাওয়া যায়নি';
            
            const message = `
💌 *OTP ইমেইল পাওয়া গেছে!*
🔢 *OTP কোড:* \`${otp}\`
📧 *প্রেরক:* ${mail.from || 'Unknown'}
📝 *বিষয়:* ${mail.subject || 'No Subject'}
🕒 *সময়:* ${mail.time || 'Unknown'}

/otpmail ${username} - আবার চেক করতে
`.trim();

            bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

        } catch (error) {
            console.error('Scraping Error:', error);
            bot.sendMessage(chatId, '🚨 ওয়েবসাইটে সমস্যা হয়েছে, পরে আবার চেষ্টা করুন');
        }
    });

    // হেল্প মেসেজ
    bot.onText(/\/mailhelp/, (msg) => {
        const helpText = `
📮 *টেম্পমেইল হেল্প*

/checkmail username - সাধারণ মেইল চেক করতে
/otpmail username  - OTP মেইল খুঁজতে (দ্রুত)
        
⚙️ *নিয়ম:*
1. username-এ শুধু ইংরেজি অক্ষর/নাম্বার
2. কোন স্পেস বা @ চিহ্ন ব্যবহার করবেন না
3. মেইল 24 ঘন্টার জন্য বৈধ
`.trim();
        
        bot.sendMessage(msg.chat.id, helpText, { parse_mode: 'Markdown' });
    });
};
