const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB } = require('../utils/db');

module.exports = (bot) => {
  bot.onText(/\/users/, (msg) => {
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';

    if (userId !== ADMIN_UID && username !== ADMIN_USERNAME) return;

    const userDB = loadDB();

    const format = (arr) => arr.length ? arr.map(id => `\`${id}\``).join(', ') : '_None_';
    const message = 
      `👥 *User List:*\n\n` +
      `✅ *Approved:* ${format(userDB.approved)}\n` +
      `🕓 *Pending:* ${format(userDB.pending)}\n` +
      `🚫 *Banned:* ${format(userDB.banned)}`;

    bot.sendMessage(msg.chat.id, message, { parse_mode: 'Markdown' });
  });
};
