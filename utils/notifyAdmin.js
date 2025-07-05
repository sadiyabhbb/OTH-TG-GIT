const { ADMIN_UID } = require('../config/botConfig');

/**
 * Notify admin when a user requests access
 * @param {TelegramBot} bot - Telegram bot instance
 * @param {number} uid - User's Telegram ID
 * @param {string} username - User's Telegram username
 * @param {boolean} isRepeat - Whether the user is already pending
 */
function notifyAdmin(bot, uid, username, isRepeat = false) {
  const status = isRepeat ? "⏳ Already Pending" : "📩 Pending Approval";
  const cleanUsername = username.replace(/[_*[\]()~`>#+=|{}.!-]/g, "\\$&");

  const message =
    `👤 *New Access Request*\n\n` +
    `🆔 UID: \`${uid}\`\n` +
    `🔗 Username: @${cleanUsername}\n` +
    `📩 Status: ${status}\n\n` +
    `🛂 *Action Needed:*\n` +
    `✅ /approve \`${uid}\`\n` +
    `🗑️ /remove \`${uid}\`\n` +
    `🚫 /ban \`${uid}\``;

  bot.sendMessage(ADMIN_UID, message, {
    parse_mode: 'MarkdownV2'
  }).catch(err => console.error('❌ Failed to notify admin:', err.message || err));
}

module.exports = notifyAdmin;
