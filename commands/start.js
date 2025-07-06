const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '../users.json');

const loadDB = () => {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch {
    return {
      users: [],
      pending: [],
      approved: [],
      banned: [],
    };
  }
};

const saveDB = (data) => {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
};

module.exports = (bot, config) => {
  // ✅ /start command
  bot.onText(/^\/start$/, (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const username = msg.from.username || 'NoUsername';
    const fullName = [msg.from.first_name, msg.from.last_name].filter(Boolean).join(' ');

    const userDB = loadDB();

    const isAdmin =
      userId.toString() === config.ADMIN_UID ||
      (username && username.toLowerCase() === config.ADMIN_USERNAME?.toLowerCase());

    const isApproved = userDB.approved.includes(userId);
    const isPending = userDB.pending.includes(userId);
    const isBanned = userDB.banned.includes(userId);

    // Add to user list
    if (!userDB.users.includes(userId)) {
      userDB.users.push(userId);
    }

    // ❌ Banned user
    if (isBanned) {
      return bot.sendMessage(chatId, '🚫 আপনি এই বট ব্যবহার করতে নিষিদ্ধ!');
    }

    // 👑 Admin panel
    if (isAdmin) {
      return bot.sendMessage(chatId, `👑 Admin Panel for @${username}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '🧾 Users', callback_data: 'admin_users' }],
            [
              { text: '💳 Gen', callback_data: 'user_gen' },
              { text: '📩 TempMail', callback_data: 'user_tempmail' }
            ],
            [
              { text: '🔐 2FA', callback_data: 'user_2fa' },
              { text: '🕒 Uptime', callback_data: 'user_uptime' }
            ]
          ]
        }
      });
    }

    // ✅ Approved user
    if (isApproved) {
      return bot.sendMessage(chatId, `👋 স্বাগতম ${fullName}!`, {
        reply_markup: {
          inline_keyboard: [
            [
              { text: '💳 Gen', callback_data: 'user_gen' },
              { text: '📩 TempMail', callback_data: 'user_tempmail' }
            ],
            [
              { text: '🔐 2FA', callback_data: 'user_2fa' },
              { text: '🕒 Uptime', callback_data: 'user_uptime' }
            ]
          ]
        }
      });
    }

    // ⏳ Pending user
    if (!isPending) {
      userDB.pending.push(userId);
      saveDB(userDB);

      bot.sendMessage(chatId, '📩 অনুরোধ পাঠানো হয়েছে! অনুগ্রহ করে অ্যাডমিনের অনুমতি অপেক্ষা করুন।');

      bot.sendMessage(config.ADMIN_UID, `🆕 *নতুন অ্যাক্সেস অনুরোধ*\n\n` +
        `👤 নাম: ${fullName}\n` +
        `🔗 ইউজারনেম: @${username}\n` +
        `🆔 UID: \`${userId}\``, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [
            [
              { text: '✅ Approve', callback_data: `approve_${userId}` },
              { text: '❌ Ban', callback_data: `ban_${userId}` }
            ]
          ]
        }
      });

      return;
    } else {
      bot.sendMessage(chatId, '⏳ আপনার অনুরোধ প্রক্রিয়াধীন রয়েছে...');
    }

    saveDB(userDB);
  });
};
