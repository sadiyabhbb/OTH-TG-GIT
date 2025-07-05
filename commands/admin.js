const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { saveDB, userDB } = require('../utils/db');

module.exports = (bot) => {
  // /approve command
  bot.onText(/\/approve (\d+)/, (msg, match) => {
    if (msg.from.username !== ADMIN_USERNAME && msg.from.id !== ADMIN_UID) return;

    const uid = parseInt(match[1]);
    if (!userDB.approved.includes(uid)) {
      userDB.approved.push(uid);
      userDB.pending = userDB.pending.filter(id => id !== uid);
      saveDB();
      bot.sendMessage(uid, '✅ Your access has been approved by admin!');
      bot.sendMessage(msg.chat.id, `✅ Approved UID: \`${uid}\``, { parse_mode: 'Markdown' });
    } else {
      bot.sendMessage(msg.chat.id, `⚠️ UID \`${uid}\` is already approved.`, { parse_mode: 'Markdown' });
    }
  });

  // /ban command
  bot.onText(/\/ban (\d+)/, (msg, match) => {
    if (msg.from.username !== ADMIN_USERNAME && msg.from.id !== ADMIN_UID) return;

    const uid = parseInt(match[1]);
    userDB.banned.push(uid);
    userDB.approved = userDB.approved.filter(id => id !== uid);
    userDB.pending = userDB.pending.filter(id => id !== uid);
    saveDB();
    bot.sendMessage(uid, '🚫 You have been banned by admin.');
    bot.sendMessage(msg.chat.id, `🚫 Banned UID: \`${uid}\``, { parse_mode: 'Markdown' });
  });

  // /remove command
  bot.onText(/\/remove (\d+)/, (msg, match) => {
    if (msg.from.username !== ADMIN_USERNAME && msg.from.id !== ADMIN_UID) return;

    const uid = parseInt(match[1]);
    userDB.pending = userDB.pending.filter(id => id !== uid);
    userDB.approved = userDB.approved.filter(id => id !== uid);
    saveDB();
    bot.sendMessage(msg.chat.id, `🗑️ Removed UID: \`${uid}\``, { parse_mode: 'Markdown' });
  });
};
