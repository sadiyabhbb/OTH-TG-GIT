const speakeasy = require('speakeasy');

module.exports = (bot) => {
  // 2FA via command
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

  // 2FA via button (callback)
  bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;

    if (data === '2fa') {
      bot.editMessageText('🔐 *Use Command:*\n`/2fa YOUR_SECRET_KEY`', {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [{ text: "🔙 Back", callback_data: "admin_panel" }]
          ]
        }
      });
    }
  });
};
