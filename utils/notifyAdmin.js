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

  bot.sendMessage(process.env.ADMIN_UID, message, { parse_mode: 'MarkdownV2' });
}

module.exports = { notifyAdmin };
