const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const { loadDB } = require('../utils/db');

module.exports = (bot) => {
  function generateUserList() {
    const userDB = loadDB();

    const format = (arr) => arr.length ? arr.map(id => `\`${id}\``).join(', ') : '_None_';
    const message = 
      `👥 *User List:*\n\n` +
      `✅ *Approved:* ${format(userDB.approved)}\n` +
      `🕓 *Pending:* ${format(userDB.pending)}\n` +
      `🚫 *Banned:* ${format(userDB.banned)}`;

    return message;
  }

  // /users command
  bot.onText(/\/users/, (msg) => {
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';

    if (userId !== ADMIN_UID && username !== ADMIN_USERNAME) return;

    const message = generateUserList();

    bot.sendMessage(msg.chat.id, message, {
      parse_mode: 'Markdown'
    });
  });

  // Callback for users button
  bot.on('callback_query', (query) => {
    const data = query.data;
    const chatId = query.message.chat.id;
    const messageId = query.message.message_id;
    const userId = query.from.id;
    const username = query.from.username || 'NoUsername';

    if (data === 'users') {
      if (userId !== ADMIN_UID && username !== ADMIN_USERNAME) return;

      const message = generateUserList();

      bot.editMessageText(message, {
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
