const checkAccess = require('../utils/checkAccess');
const { ADMIN_USERNAME } = require('../config/botConfig');

module.exports = (bot) => {
  bot.on('message', (msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
    const BOT_NAME = process.env.BOT_NAME || 'PremiumBot';

    const { isAdmin, isApproved } = checkAccess(msg.from);

    // ✅ Allow /start (already handled separately)
    if (msg.text && msg.text.startsWith('/start')) return;

    // ❌ Block unknown messages from non-approved users
    if (!isAdmin && !isApproved) {
      return bot.sendMessage(chatId, `⛔ *Access Restricted*

👋 *Hello ${fullName}!*
Thank you for your interest in using *${BOT_NAME}*.

To ensure a secure and high-quality experience, access is limited to *authorized users only*.

🆔 *Your Telegram User ID:* \`${userId}\`
📬 *Please contact the administrator to request access:* @${ADMIN_USERNAME}

Upon approval, you will gain full access to:
✨ *Premium features*
🚀 *Fast and reliable service*
📥 *Data privacy and security*

🙏 We appreciate your understanding and cooperation.
– *The ${BOT_NAME} Team* 🤖`, {
        parse_mode: 'Markdown'
      });
    }
  });
};
