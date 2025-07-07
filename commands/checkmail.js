const checkEmail = require('../utils/emailChecker');

module.exports = (bot) => {
  bot.onText(/\.checkmail (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const username = match[1].trim();

    const sent = await bot.sendMessage(chatId, `📮 *Checking inbox for:* \`${username}\`\n⏳ অপেক্ষা করুন...`, {
      parse_mode: 'Markdown'
    });

    try {
      const { success, content } = await checkEmail(username);
      if (success) {
        await bot.editMessageText(content, {
          chat_id: chatId,
          message_id: sent.message_id,
          parse_mode: 'Markdown'
        });
      } else {
        await bot.editMessageText(`❌ \`${username}\` নামে কোনো ইমেইল পাওয়া যায়নি`, {
          chat_id: chatId,
          message_id: sent.message_id,
          parse_mode: 'Markdown'
        });
      }
    } catch (err) {
      console.error('❌ Email check error:', err.message);
      await bot.editMessageText('⚠️ ইমেইল চেক করতে সমস্যা হয়েছে', {
        chat_id: chatId,
        message_id: sent.message_id
      });
    }
  });
};
