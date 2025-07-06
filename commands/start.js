// commands/start.js
const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');

// Map button labels to callback data
const BUTTONS = [
  [{ text: '📨 Hotmail999', callback_data: 'hotmail' }, { text: '🔐 2FA', callback_data: '2fa' }],
  [{ text: '🧪 Gen CC', callback_data: 'gen' }, { text: '⏱️ Uptime', callback_data: 'uptime' }]
];
const ADMIN_BUTTONS = [
  ...BUTTONS,
  [{ text: '👥 Users', callback_data: 'users' }, { text: '🛠 Approve Panel', callback_data: 'panel' }]
];

module.exports = (bot) => {
  // /start handler
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const userDB = loadDB();

    const isAdmin = (username === ADMIN_USERNAME || userId.toString() === ADMIN_UID.toString());

    // Ban check
    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    // Pending approval
    if (!isAdmin && !userDB.approved.includes(userId)) {
      if (!userDB.pending.includes(userId)) {
        userDB.pending.push(userId);
        saveDB(userDB);
        await bot.sendMessage(chatId, `⏳ Request sent. Please wait for admin approval.`);
        await bot.sendMessage(chatId, `🧾 Your UID: \`${userId}\`\nSend this to the admin (@${ADMIN_USERNAME}) for approval.`, { parse_mode: 'Markdown' });
        notifyAdmin(bot, userId, username);
      } else {
        await bot.sendMessage(chatId, `⏳ You are already pending.\n\n🧾 Your UID: \`${userId}\``, { parse_mode: 'Markdown' });
        notifyAdmin(bot, userId, username, true);
      }
      return;
    }

    // Approved or Admin
    const welcomeText = isAdmin
      ? `👑 Hello Admin @${username}!\n━━━━━━━━━━━━━━━\nYou have full access.`
      : `👋 Hello @${username}!\n━━━━━━━━━━━━━━━\nSelect an option below:`;

    const keyboard = {
      reply_markup: {
        inline_keyboard: isAdmin ? ADMIN_BUTTONS : BUTTONS
      },
      parse_mode: 'Markdown'
    };

    return bot.sendMessage(chatId, welcomeText, keyboard);
  });

  // Callback handler for inline buttons
  bot.on('callback_query', async (q) => {
    const chatId = q.message.chat.id;
    const msgId = q.message.message_id;
    const userId = q.from.id;
    const data = q.data;

    const userDB = loadDB();
    const isAdmin = (q.from.username === ADMIN_USERNAME || userId.toString() === ADMIN_UID.toString());

    // If banned
    if (userDB.banned.includes(userId)) {
      return bot.answerCallbackQuery(q.id, { text: '🚫 You are banned.' });
    }

    // Handle commands based on callback_data
    try {
      await bot.answerCallbackQuery(q.id); // remove loading

      switch (data) {
        case 'hotmail':
          return bot.editMessageText('📨 Fetching Hotmail999...', { chat_id: chatId, message_id: msgId });
        case '2fa':
          return bot.editMessageText('🔐 Running 2FA check...', { chat_id: chatId, message_id: msgId });
        case 'gen':
          return bot.editMessageText('🧪 Generating CC...', { chat_id: chatId, message_id: msgId });
        case 'uptime':
          return bot.editMessageText('⏱️ Getting uptime...', { chat_id: chatId, message_id: msgId });
        case 'users':
          if (!isAdmin) return bot.answerCallbackQuery(q.id, { text: 'Unauthorized' });
          return bot.editMessageText('👥 Fetching user list...', { chat_id: chatId, message_id: msgId });
        case 'panel':
          if (!isAdmin) return bot.answerCallbackQuery(q.id, { text: 'Unauthorized' });
          return bot.editMessageText('🛠 Approve/Ban users...', { chat_id: chatId, message_id: msgId });
        default:
          return bot.answerCallbackQuery(q.id, { text: 'Unknown command.' });
      }
    } catch (err) {
      console.error('callback-handler error:', err);
      return bot.editMessageText('⚠️ Something went wrong.', { chat_id: chatId, message_id: msgId });
    }
  });
};
