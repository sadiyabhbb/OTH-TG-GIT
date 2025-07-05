const speakeasy = require('speakeasy');

module.exports = (bot) => {
  bot.onText(/\/2fa (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const rawKey = match[1].trim();
    const secretKey = rawKey.replace(/\s+/g, ''); // সব স্পেস বাদ

    try {
      const code = speakeasy.totp({
        secret: secretKey,
        encoding: 'base32',
        digits: 6,
        step: 30
      });

      bot.sendMessage(chatId, `🔐 *Your 2FA Code:*\n\`${code}\``, {
        parse_mode: 'Markdown',
        reply_to_message_id: msg.message_id
      });

    } catch (error) {
      bot.sendMessage(chatId, "❌ Invalid Secret Key (Base32 not detected)", {
        reply_to_message_id: msg.message_id
      });
    }
  });
};
