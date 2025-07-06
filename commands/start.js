const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');
const checkAccess = require('../utils/checkAccess');

module.exports = (bot) => {

  // Handle all non-command messages first
  bot.on('message', (ctx) => {
    const msg = ctx.update.message;
    if (!msg.text || msg.text.startsWith('/')) return;
    
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const { isAdmin, isApproved } = checkAccess(userId, username);

    if (!isAdmin && !isApproved) {
      const deniedMsg = `⛔ *Access Denied*\n\nPlease send /start to request access`;
      return bot.sendMessage(msg.chat.id, deniedMsg, { parse_mode: "Markdown" });
    }
  });

  // Handle /start command separately
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const fullName = `${msg.from.first_name || ''} ${msg.from.last_name || ''}`.trim();
    const BOT_NAME = process.env.BOT_NAME || "MyBot";

    const userDB = loadDB();
    const { isAdmin, isApproved } = checkAccess(userId, username);

    // Add new users to database
    if (!userDB.users.includes(userId)) {
      userDB.users.push(userId);
      saveDB(userDB);
    }

    // Banned user check
    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    // Admin welcome message
    if (isAdmin) {
      return bot.sendMessage(chatId,
        `👑 *Welcome Admin ${fullName}!*\n\nYour admin controls are ready.`,
        { parse_mode: "Markdown" }
      );
    }

    // Approved user welcome
    if (isApproved) {
      return bot.sendMessage(chatId,
        `👋 Welcome ${fullName}!\n\nYour premium access is active.`,
        { parse_mode: "Markdown" }
      );
    }

    // New user request
    if (!userDB.pending.includes(userId)) {
      userDB.pending.push(userId);
      saveDB(userDB);
      notifyAdmin(bot, userId, username);
    }

    // Default access denied message
    const accessMsg = `⛔ *Access Restricted*\n\nHello ${fullName}, please contact @${ADMIN_USERNAME} for access.`;
    return bot.sendMessage(chatId, accessMsg, { parse_mode: "Markdown" });
  });
};
