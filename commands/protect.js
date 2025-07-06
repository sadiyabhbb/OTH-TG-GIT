const checkAccess = require('../utils/checkAccess');

module.exports = (bot) => {
  bot.on('message', (msg) => {
    const userId = msg.from.id;
    const chatId = msg.chat.id;
    const username = msg.from.username || 'NoUsername';
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();

    const { isAdmin, isApproved } = checkAccess(userId, username);

    // যদি approve না থাকে বা admin না হয় = Block everything
    if (!isAdmin && !isApproved) {
      const accessMsg = 
`⛔ *Access Restricted*

👋 *Hello ${fullName}!*
Thank you for your interest in using *${process.env.BOT_NAME || 'this bot'}*.

To ensure a secure and high-quality experience, access is limited to *authorized users only*.

🆔 *Your Telegram User ID:* \`${userId}\`
📬 *Please contact the administrator to request access:*
@${process.env.ADMIN_USERNAME || 'Admin'}

Upon approval, you will gain full access to:
✨ *Premium features*
🚀 *Fast and reliable service*
📥 *Data privacy and security*

🙏 We appreciate your understanding and cooperation.
– *The ${process.env.BOT_NAME || 'Bot'} Team* 🤖`;

      return bot.sendMessage(chatId, accessMsg, {
        parse_mode: 'Markdown'
      });
    }
  });
};
