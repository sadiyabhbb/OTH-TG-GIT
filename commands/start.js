const { ADMIN_UID, ADMIN_USERNAME } = require('../config/botConfig');
const notifyAdmin = require('../utils/notifyAdmin');
const { loadDB, saveDB } = require('../utils/db');

module.exports = (bot) => {
  const USER_BUTTONS = [
    [{ text: '📨 Hotmail999', callback_data: 'hotmail' }, { text: '🔐 2FA', callback_data: '2fa' }],
    [{ text: '🧪 Gen CC', callback_data: 'gen' }, { text: '⏱️ Uptime', callback_data: 'uptime' }]
  ];

  const ADMIN_EXTRA = [
    [{ text: '👥 Users', callback_data: 'users' }, { text: '🛠 Approve Panel', callback_data: 'panel' }]
  ];

  // START command
  bot.onText(/\/start/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';

    const userDB = loadDB();
    const isAdmin = (username === ADMIN_USERNAME || userId.toString() === ADMIN_UID.toString());

    // Banned
    if (userDB.banned.includes(userId)) {
      return bot.sendMessage(chatId, '🚫 You are banned from using this bot.');
    }

    // Pending user
    if (!isAdmin && !userDB.approved.includes(userId)) {
      if (!userDB.pending.includes(userId)) {
        userDB.pending.push(userId);
        saveDB(userDB);

        await bot.sendMessage(chatId, `⏳ Request sent. Please wait for admin approval.`);
        await bot.sendMessage(chatId, `🧾 Your UID: \`${userId}\`\nSend this to @${ADMIN_USERNAME} for approval.`, {
          parse_mode: 'Markdown'
        });

        notifyAdmin(bot, userId, username);
      } else {
        await bot.sendMessage(chatId, `⏳ You are already pending.\n\n🧾 Your UID: \`${userId}\``, {
          parse_mode: 'Markdown'
        });

        notifyAdmin(bot, userId, username, true);
      }
      return;
    }

    // Approved or admin
    const welcomeText = isAdmin
      ? `👑 Hello Admin @${username}!\n━━━━━━━━━━━━━━━\nUse the buttons below:`
      : `👋 Hello @${username}!\n━━━━━━━━━━━━━━━\nChoose an option below:`;

    const buttons = isAdmin ? [...USER_BUTTONS, ...ADMIN_EXTRA] : USER_BUTTONS;

    bot.sendMessage(chatId, welcomeText, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: buttons
      }
    });
  });

  // CALLBACK button press handler
  bot.on('callback_query', async (q) => {
    const data = q.data;
    const userId = q.from.id;
    const chatId = q.message.chat.id;
    const msgId = q.message.message_id;
    const username = q.from.username || 'NoUsername';

    const userDB = loadDB();
    const isAdmin = (username === ADMIN_USERNAME || userId.toString() === ADMIN_UID.toString());

    if (userDB.banned.includes(userId)) {
      return bot.answerCallbackQuery(q.id, { text: '🚫 You are banned.' });
    }

    await bot.answerCallbackQuery(q.id); // remove "loading" animation

    try {
      switch (data) {
        case 'hotmail':
          return bot.editMessageText('📨 Fetching Hotmail999 email...', {
            chat_id: chatId,
            message_id: msgId
          });

        case '2fa':
          return bot.editMessageText('🔐 Running 2FA verification...', {
            chat_id: chatId,
            message_id: msgId
          });

        case 'gen':
          return bot.editMessageText('🧪 Generating Credit Cards...', {
            chat_id: chatId,
            message_id: msgId
          });

        case 'uptime':
          return bot.editMessageText('⏱️ Checking bot uptime...', {
            chat_id: chatId,
            message_id: msgId
          });

        case 'users':
          if (!isAdmin) return bot.answerCallbackQuery(q.id, { text: 'Unauthorized' });
          return bot.editMessageText('👥 Loading user statistics...', {
            chat_id: chatId,
            message_id: msgId
          });

        case 'panel':
          if (!isAdmin) return bot.answerCallbackQuery(q.id, { text: 'Unauthorized' });
          return bot.editMessageText('🛠 Opening approval panel...', {
            chat_id: chatId,
            message_id: msgId
          });

        default:
          return bot.answerCallbackQuery(q.id, { text: 'Unknown action.' });
      }
    } catch (err) {
      console.error('❌ Callback error:', err);
      return bot.editMessageText('⚠️ Something went wrong.', {
        chat_id: chatId,
        message_id: msgId
      });
    }
  });
};
