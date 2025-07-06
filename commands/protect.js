const { loadDB } = require('../utils/db');
const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');

module.exports = (bot) => {
  bot.on('message', (msg) => {
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
    const text = msg.text || '';

    const db = loadDB();
    const isAdmin =
      username?.toLowerCase() === ADMIN_USERNAME?.toLowerCase() ||
      userId.toString() === ADMIN_UID.toString();
    const isApproved = db.approved.includes(userId);
    const isBanned = db.banned.includes(userId);

    // ⛔ If banned, reply ban notice and stop
    if (isBanned) {
      return bot.sendMessage(msg.chat.id, '🚫 You are banned from using this bot.');
    }

    // ✅ If admin or approved, do nothing here
    if (isAdmin || isApproved) {
      return;
    }

    // ❗ For non-approved users — always show Access Restricted message
    const BOT_NAME = process.env.BOT_NAME || 'this bot';
    const accessMsg = 
`⛔ *Access Restricted*

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
— *The ${BOT_NAME} Team* 🤖`;

    return bot.sendMessage(msg.chat.id, accessMsg, { parse_mode: 'Markdown' });
  });
};
